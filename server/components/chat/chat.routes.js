const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { authenticateToken } = require('../../middleware/authenticateToken');

// All routes require authentication
router.use(authenticateToken);

// Chat message routes
router.get('/:recipientId', chatController.getMessages);
router.post('/', chatController.sendMessage);
router.put('/:messageId/read', chatController.markAsRead);

module.exports = router;
