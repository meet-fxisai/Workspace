const express = require('express');
const router = express.Router();
const { createWorkspaceChats, getChatsById } = require('../controllers/chatController');
const authMiddleware = require('../services/authMiddleware');

// Route to create chats for all users in a workspace
router.post('/workspace/create-chats', createWorkspaceChats);

// Route to get messages by chat ID
router.get('/:chatId', authMiddleware('') ,getChatsById);

module.exports = router;