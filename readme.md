# Node.js OTP and Daily Weather Email Service

## Overview
This Node.js application provides OTP verification via email and a daily weather email service. It uses Express.js for the backend, Nodemailer for email sending, and a scheduled job to send weather updates to subscribed users.

## Features
- Send OTP codes via email.
- Verify OTP with email and location.
- Subscribe to daily weather emails.
- Unsubscribe from the weather email service.
- Automatically send daily weather updates at 8 AM.

## Technologies Used
- Node.js
- Express.js
- Nodemailer
- MongoDB (via `otpCollection` model)
- Crypto (for OTP generation)
- Node-Schedule (for scheduling tasks)
- Axios (for fetching weather data)
- CORS & Body-Parser

## Installation

1. Clone this repository:
   ```sh
   git clone https://github.com/ystt1/Demo_GO_Be.git
   cd Demo_GO_Be
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```env
   PORT=3000
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   WEATHER_API_KEY=your-weather-api-key
   MONGO_URI=your-mongo-uri
   ```
   - [How to set up Gmail SMTP credentials](https://support.google.com/mail/answer/7126229?hl=en)
   - [Get a WeatherAPI key](https://www.weatherapi.com/signup.aspx)
   - [Set up MongoDB and get a connection URI](https://www.mongodb.com/docs/manual/reference/connection-string/)

4. Start the server:
   ```sh
   npm start
   ```

## API Endpoints

### 1. Send OTP
- **Endpoint:** `POST /send-otp`
- **Description:** Sends an OTP to the provided email.
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "message": "OTP sent successfully"
  }
  ```

### 2. Verify OTP
- **Endpoint:** `POST /verify-otp`
- **Description:** Verifies the OTP and saves the user's location.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "12345",
    "location": "New York"
  }
  ```
- **Response:**
  ```json
  {
    "message": "OTP verified successfully"
  }
  ```

### 3. Unsubscribe from Emails
- **Endpoint:** `GET /unsubscribe`
- **Description:** Removes the user from the daily weather email list.
- **Query Parameters:** `?email=user@example.com`
- **Response:**
  ```text
  You have successfully unsubscribed from daily weather emails.
  ```

## Scheduled Job
- The system sends daily weather emails to subscribed users at **8 AM**.
- Uses [WeatherAPI](https://www.weatherapi.com/) to fetch weather data.
- Email includes temperature, condition, and an unsubscribe link.

## License
This project is licensed under the MIT License.

