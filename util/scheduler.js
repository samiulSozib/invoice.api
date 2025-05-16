const cron = require('node-cron');
const db = require('../database/database');
const sequelize = require('sequelize');

const cleanupExpiredOtps = async () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
        await db.otp.destroy({
            where: {
                createdAt: {
                    [sequelize.Op.lt]: twentyFourHoursAgo,
                },
            },
        });
        console.log('Expired OTPs cleaned up successfully');
    } catch (error) {
        console.error('Error cleaning up expired OTPs:', error);
    }
};

// Schedule the cleanup job to run at midnight every day
cron.schedule('0 0 * * *', cleanupExpiredOtps);
