const express = require('express');
const { chatWithMedicalAssistant } = require('../controllers/AIChatController');
const { optionalAuthenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', optionalAuthenticateToken, chatWithMedicalAssistant);

module.exports = router;
