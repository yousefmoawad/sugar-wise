const Message = require('../models/Message');

const MESSAGE_RETENTION_DAYS = 60;
const EXPIRED_TEXT = 'Message removed after 60 days.';

const expireOldMessages = async () => {
    try {
        const cutoff = new Date(Date.now() - MESSAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
        const result = await Message.updateMany(
            {
                createdAt: { $lt: cutoff },
                isExpired: { $ne: true },
            },
            {
                $set: {
                    messageText: EXPIRED_TEXT,
                    isExpired: true,
                    expiredAt: new Date(),
                    fileUrl: null,
                },
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`Message retention cleanup updated ${result.modifiedCount} messages`);
        }

        return result;
    } catch (error) {
        console.error('Error in message retention cleanup:', error);
        return null;
    }
};

const startMessageRetentionScheduler = (intervalMs = 24 * 60 * 60 * 1000) => {
    expireOldMessages();
    const intervalId = setInterval(expireOldMessages, intervalMs);
    console.log(`Message retention scheduler started (runs every ${intervalMs / 1000 / 60} minutes)`);
    return intervalId;
};

module.exports = {
    expireOldMessages,
    startMessageRetentionScheduler,
};
