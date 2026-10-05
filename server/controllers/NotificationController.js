const mongoose = require('mongoose');
const notificationAPI = require('../services/api/notificationAPI');

const normalizeRole = (role) => String(role || '').trim().toLowerCase();
const isAdminUser = (req) => {
    const role = normalizeRole(req.authUser?.role || req.user?.role);
    return role === 'admin' || role === 'super admin' || role === 'superadmin' || role === 'subadmin';
};

const getAuthUserId = (req) => req.authUser?._id || req.user?.id || null;

exports.createNotification = async (req, res) => {
    try {
        const authUserId = getAuthUserId(req);
        if (!authUserId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const payload = { ...req.body };
        // Non-admin callers can only create notifications for themselves.
        if (!isAdminUser(req)) {
            payload.user = authUserId;
        } else if (!payload.user) {
            payload.user = authUserId;
        }

        if (!payload.title || !payload.message) {
            return res.status(400).json({ success: false, error: 'title and message are required' });
        }
        const notification = await notificationAPI.create(payload);
        res.status(201).json({
            success: true,
            data: notification,
            message: 'Notification created successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 400).json({ success: false, error: err.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const authUserId = getAuthUserId(req);
        if (!authUserId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        // Admin may optionally query other users. Everyone else gets their own notifications only.
        const requestedUserId = req.query.userId;
        const resolvedUserId = isAdminUser(req) && requestedUserId ? requestedUserId : authUserId;

        let filter = {};
        try {
            filter = { user: new mongoose.Types.ObjectId(String(resolvedUserId).trim()) };
        } catch {
            filter = { user: resolvedUserId };
        }
        const notifications = await notificationAPI.getAll(filter);
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications,
            message: 'Notifications retrieved successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const authUserId = getAuthUserId(req);
        if (!authUserId) return res.status(401).json({ success: false, error: 'Unauthorized' });
        const notification = await notificationAPI.getById(req.params.id);
        if (!isAdminUser(req) && String(notification.user || '') !== String(authUserId)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        res.status(200).json({
            success: true,
            data: notification,
            message: 'Notification retrieved successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const authUserId = getAuthUserId(req);
        if (!authUserId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const existing = await notificationAPI.getById(req.params.id);
        if (!isAdminUser(req) && String(existing.user || '') !== String(authUserId)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        // Non-admin: only isRead can be updated.
        const updates = isAdminUser(req) ? { ...req.body } : { isRead: Boolean(req.body?.isRead) };
        const notification = await notificationAPI.update(req.params.id, updates);
        res.status(200).json({
            success: true,
            data: notification,
            message: 'Notification updated successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 400).json({ success: false, error: err.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const authUserId = getAuthUserId(req);
        if (!authUserId) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const existing = await notificationAPI.getById(req.params.id);
        if (!isAdminUser(req) && String(existing.user || '') !== String(authUserId)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        await notificationAPI.remove(req.params.id);
        res.status(200).json({
            success: true,
            data: {},
            message: 'Notification deleted successfully'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, error: err.message });
    }
};
