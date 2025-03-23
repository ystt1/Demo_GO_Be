const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
    try {
        await client.connect();
        db = client.db("otp_db");
        console.log("✅ Connected to MongoDB!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
    }
}
connectDB();

const otpCollection = () => db.collection("user_locations");

module.exports = { otpCollection };
