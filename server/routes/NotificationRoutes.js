const express = require('express');
const router = express.Router();
const {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification
} = require('../controllers/NotificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

// /api/notifications
router.route('/').get(authenticateToken, getNotifications).post(authenticateToken, createNotification);

// /api/notifications/:id
router.route('/:id').get(authenticateToken, getNotificationById).put(authenticateToken, updateNotification).delete(authenticateToken, deleteNotification);

module.exports = router;
