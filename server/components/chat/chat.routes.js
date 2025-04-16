// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { protect } = require('../../middleware/auth');

// Apply authentication middleware to all chat routes
router.use(protect);

// Get rooms for current user
router.get('/rooms', chatController.getRooms);

// Get messages for a room
router.get('/rooms/:roomId/messages', chatController.getMessages);

// Send a message to a room
router.post('/rooms/:roomId/messages', chatController.sendMessage);

// Create or get a direct message room
router.post('/rooms/direct', chatController.createDirectRoom);

// Create or get an ad chat room
router.post('/rooms/ad', chatController.createAdRoom);

// Create a group chat room
router.post('/rooms/group', chatController.createGroupRoom);

// Mark messages as read in a room
router.post('/rooms/:roomId/read', chatController.markMessagesAsRead);

// Get unread message counts
router.get('/unread', chatController.getUnreadCounts);

// Leave a chat room
router.post('/rooms/:roomId/leave', chatController.leaveRoom);

// Get a specific room
router.get('/rooms/:roomId', chatController.getRoom);

// Setup room encryption
router.post('/rooms/:roomId/encryption', chatController.setupRoomEncryption);

// Update message expiry settings
router.post('/rooms/:roomId/expiry', chatController.updateMessageExpiry);

module.exports = router;
