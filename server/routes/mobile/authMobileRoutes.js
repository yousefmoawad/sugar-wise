const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
} = require('../../controllers/userController');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Mobile auth endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticateToken, logoutUser);

module.exports = router;
