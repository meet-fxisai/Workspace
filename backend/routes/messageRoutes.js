const express = require('express');
const router = express.Router();

const { sendMessage , getMessages} = require('../controllers/messageController');
const authMiddleware = require('../services/authMiddleware');

router.post('/sendMessage', authMiddleware(), sendMessage);
router.get('/:chatId', authMiddleware(), getMessages);

module.exports = router;