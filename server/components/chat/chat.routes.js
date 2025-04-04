const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { authenticateToken } = require('../../middleware/authenticateToken');

// All chat routes require authentication
router.use(authenticateToken);

// Get messages between current user and recipient
router.get('/:recipientId', chatController.getMessages);

// Send a new message
router.post('/', chatController.sendMessage);

// Mark message as read
router.put('/:messageId/read', chatController.markAsRead);

module.exports = router;
