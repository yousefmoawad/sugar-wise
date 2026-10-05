const express = require('express');
const router = express.Router();
const { optionalAuthenticateToken } = require('../middleware/authMiddleware');
const {
  getChats,
  getMessages,
  sendMessage,
  markChatRead,
  deleteMessage,
  deleteChat,
} = require('../controllers/MessagesController');

router.use(optionalAuthenticateToken);

// /api/messages/chats/:chatId/read — mark incoming messages read (before /:id delete)
router.put('/chats/:chatId/read', markChatRead);

// /api/messages/chats - Get all chats for current user
router.get('/chats', getChats);

// /api/messages/chats/:chatId - Get messages in a specific chat
router.get('/chats/:chatId', getMessages);

// /api/messages/chats/:chatId - Hide chat for current user
router.delete('/chats/:chatId', deleteChat);

// /api/messages - Send a new message
router.post('/', sendMessage);

// /api/messages/:id - Delete a message
router.delete('/:id', deleteMessage);

module.exports = router;
