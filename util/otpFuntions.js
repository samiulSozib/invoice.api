// utils/otp.js
const crypto = require('crypto');

function generateOtp() {
    return crypto.randomInt(100000, 999999); // Generate a 6-digit OTP
}

function isOtpExpired(createdAt) {
    const expiryTimeInMinutes = 5;
    const now = new Date();
    const diffMinutes = (now - new Date(createdAt)) / 1000 / 60;
    return diffMinutes > expiryTimeInMinutes;
}

module.exports = { generateOtp, isOtpExpired };
