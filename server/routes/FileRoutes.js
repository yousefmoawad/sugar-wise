const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getProtectedFile } = require('../controllers/FileController');

router.get(/.*/, authenticateToken, getProtectedFile);

module.exports = router;
