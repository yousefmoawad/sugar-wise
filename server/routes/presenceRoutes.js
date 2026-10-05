const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { pingPresence } = require('../controllers/PresenceController');

// POST /api/presence/ping - heartbeat to keep presence fresh
router.post('/ping', authenticateToken, pingPresence);

module.exports = router;

