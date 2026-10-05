const Notification = require('../models/Notification');

/**
 * Cleanup notifications that are older than 24 hours
 * This function is designed to be called periodically
 */
const cleanupOldNotifications = async () => {
    try {
        // Calculate the date 24 hours ago
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Delete notifications older than 24 hours
        const result = await Notification.deleteMany({
            createdAt: { $lt: twentyFourHoursAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`✅ Cleanup job: Deleted ${result.deletedCount} old notifications`);
        }

        return result;
    } catch (error) {
        console.error('❌ Error in notification cleanup job:', error);
    }
};

/**
 * Start the notification cleanup scheduler
 * Runs every 60 minutes by default
 * @param {number} intervalMs - Interval in milliseconds (default: 3600000 = 1 hour)
 */
const startNotificationCleanupScheduler = (intervalMs = 3600000) => {
    // Run cleanup immediately on startup
    cleanupOldNotifications();

    // Then run it periodically
    const intervalId = setInterval(cleanupOldNotifications, intervalMs);

    console.log(`✅ Notification cleanup scheduler started (runs every ${intervalMs / 1000 / 60} minutes)`);

    return intervalId;
};

module.exports = {
    cleanupOldNotifications,
    startNotificationCleanupScheduler
};
