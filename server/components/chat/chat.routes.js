// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat.routes)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
import multer from 'multer';
const router = express.Router();
import chatController from './chat.controller.js';
import encryptionRoutes from './encryption.routes.js';
import { protect } from '../../middleware/auth.js';

// Apply authentication middleware to all chat routes
router.use(protect);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

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

// Attachment routes
router.post(
  '/rooms/:roomId/attachments',
  upload.array('attachments', 10), // Allow up to 10 files
  chatController.uploadAttachment
);

router.post(
  '/rooms/:roomId/messages/attachments',
  upload.array('attachments', 10),
  chatController.sendMessageWithAttachments
);

router.get('/attachments/:attachmentId', chatController.downloadAttachment);

// Mount encryption routes
router.use('/encryption', encryptionRoutes);

export default router;
