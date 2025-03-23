require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const { otpCollection } = require("./models/otpModel");
const { log } = require("console");
const schedule = require("node-schedule");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

let otpStorage = {};

function generateOTP() {
    return crypto.randomInt(10000, 99999).toString();
}

app.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = generateOTP();
    otpStorage[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}. It will expire in 5 minutes.`,
        });

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to send OTP" });
    }
});

app.post("/verify-otp", async (req, res) => {
    const { email, otp, location } = req.body;
    if (!email || !otp || !location) return res.status(400).json({ error: "Email, OTP, and location are required" });
    const storedOtp = otpStorage[email];
    log(otp);
    log(storedOtp);
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    try {
        await otpCollection().updateOne(
            { email },
            { $set: { location, timestamp: new Date() } },
            { upsert: true }
        );

        delete otpStorage[email];
        res.json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save data" });
    }
});

app.get("/unsubscribe", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).send("Email is required");

    try {
        await otpCollection().deleteOne({ email });


        res.send("You have successfully unsubscribed from daily weather emails.");
    } catch (error) {
        res.status(500).send("Failed to unsubscribe.");
    }
});



async function sendDailyWeatherEmails() {
    try {
        const users = await otpCollection().find({}).toArray();
        for (const user of users) {
            const { email, location } = user;
            if (!location) continue;

            const weatherResponse = await axios.get(`https://api.weatherapi.com/v1/forecast.json?q=${location}&key=fb9abbeb84ed42a5b31104645252103`);
            const weatherData = weatherResponse.data;

            const unsubscribeLink = `http://localhost:3000/unsubscribe?email=${encodeURIComponent(email)}`;

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Daily Weather Update",
                text: `Hello, here is your weather update for today: \nTemperature: ${weatherData.current.temp_c}°C \nCondition: ${weatherData.current.condition.text}\n\nIf you want to unsubscribe, click here: ${unsubscribeLink}`
            });
        }
    } catch (error) {
        console.error("Failed to send daily weather emails", error);
    }
}

schedule.scheduleJob("00 08 * * *", sendDailyWeatherEmails);


const PORT = process.env.PORT||3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
