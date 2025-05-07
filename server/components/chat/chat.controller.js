// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat.controller)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import ChatService from '../../services/chat.service.js';
import ChatAttachment from '../../models/chat-attachment.schema.js';
import { asyncHandler } from '../../middleware/asyncHandler.js';

class ChatController {
  // TODO: Implement file upload functionality
  // TODO: Add message persistence for offline users
  // TODO: Add user presence tracking

  constructor() {
    // No need to bind methods when using regular function declarations
  }

  /**
   * Get chat rooms for current user
   */
  getRooms(req, res) {
    return asyncHandler(async (req, res) => {
      const rooms = await ChatService.getRoomsForUser(req.user.id);
      res.status(200).json(rooms);
    })(req, res);
  }

  /**
   * Get a specific chat room
   */
  getRoom(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const room = await ChatService.getRoomById(roomId, req.user.id);
      res.status(200).json(room);
    })(req, res);
  }

  /**
   * Get messages for a chat room
   */
  getMessages(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        before: req.query.before || null,
        after: req.query.after || null,
        includeSystem: req.query.includeSystem !== 'false',
      };

      const messages = await ChatService.getMessages(roomId, options);
      res.status(200).json(messages);
    })(req, res);
  }

  /**
   * Send a message to a chat room
   */
  sendMessage(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const { message, recipientId, attachments, type, metadata, isEncrypted, encryptionData } =
        req.body;

      const sentMessage = await ChatService.sendMessage(roomId, req.user.id, message, {
        recipientId,
        attachments,
        type,
        metadata,
        isEncrypted,
        encryptionData,
      });

      res.status(201).json(sentMessage);
    })(req, res);
  }

  /**
   * Create or get a direct message room
   */
  createDirectRoom(req, res) {
    return asyncHandler(async (req, res) => {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const room = await ChatService.createDirectRoom(req.user.id, userId);
      res.status(200).json(room);
    })(req, res);
  }

  /**
   * Create or get a chat room for an ad
   */
  createAdRoom(req, res) {
    return asyncHandler(async (req, res) => {
      const { adId } = req.body;

      if (!adId) {
        return res.status(400).json({
          success: false,
          message: 'Ad ID is required',
        });
      }

      const room = await ChatService.createAdRoom(req.user.id, adId);
      res.status(200).json(room);
    })(req, res);
  }

  /**
   * Create a group chat room
   */
  createGroupRoom(req, res) {
    return asyncHandler(async (req, res) => {
      const { name, participantIds } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Group name is required',
        });
      }

      const room = await ChatService.createGroupRoom(req.user.id, name, participantIds);
      res.status(201).json(room);
    })(req, res);
  }

  /**
   * Mark messages as read in a room
   */
  markMessagesAsRead(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const result = await ChatService.markMessagesAsRead(roomId, req.user.id);
      res.status(200).json(result);
    })(req, res);
  }

  /**
   * Get unread message counts
   */
  getUnreadCounts(req, res) {
    return asyncHandler(async (req, res) => {
      const counts = await ChatService.getUnreadCounts(req.user.id);
      res.status(200).json(counts);
    })(req, res);
  }

  /**
   * Leave a group chat room
   */
  leaveRoom(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const result = await ChatService.leaveRoom(roomId, req.user.id);
      res.status(200).json(result);
    })(req, res);
  }

  /**
   * Setup room encryption
   */
  setupRoomEncryption(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const userId = req.user.id;
      const result = await ChatService.setupRoomEncryption(roomId, userId);
      res.status(200).json(result);
    })(req, res);
  }

  /**
   * Update message expiry settings
   */
  updateMessageExpiry(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const { enabled, expiryTime } = req.body;

      if (enabled === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Enabled flag is required',
        });
      }

      const room = await ChatService.updateMessageExpiry(roomId, enabled, expiryTime, req.user.id);

      res.status(200).json(room);
    })(req, res);
  }

  /**
   * Handle file upload for chat messages
   */
  uploadAttachment(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const files = req.files;
      const fileMetadata = req.body.fileMetadata ? JSON.parse(req.body.fileMetadata) : [];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files were uploaded',
        });
      }

      const attachments = await Promise.all(
        files.map(async (file, index) => {
          // Get corresponding metadata if available
          const metadata = Array.isArray(fileMetadata) ? fileMetadata[index] : fileMetadata;

          // Store file and get URL (implement your storage logic here)
          const url = await ChatService.storeFile(file);

          return {
            name: metadata?.originalName || file.originalname,
            type: metadata?.originalType || file.mimetype,
            size: file.size,
            url,
            uploadedBy: req.user.id,
            roomId,
            isEncrypted: metadata?.isEncrypted || false,
            encryptionData: metadata?.isEncrypted
              ? {
                  iv: metadata.iv,
                  authTag: metadata.authTag,
                }
              : undefined,
          };
        })
      );

      // Create attachments in database
      const savedAttachments = await ChatAttachment.insertMany(attachments);

      res.status(201).json(savedAttachments);
    })(req, res);
  }

  /**
   * Send a message with attachments to a chat room
   */
  sendMessageWithAttachments(req, res) {
    return asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const { content, replyTo, isEncrypted, encryptionData, expiresAt } = req.body;
      const files = req.files;
      const fileMetadata = req.body.fileMetadata ? JSON.parse(req.body.fileMetadata) : [];

      // Upload and process attachments
      const attachments = await Promise.all(
        files.map(async (file, index) => {
          const metadata = Array.isArray(fileMetadata) ? fileMetadata[index] : fileMetadata;
          const url = await ChatService.storeFile(file);

          return {
            name: metadata?.originalName || file.originalname,
            type: metadata?.originalType || file.mimetype,
            size: file.size,
            url,
            uploadedBy: req.user.id,
            roomId,
            isEncrypted: metadata?.isEncrypted || false,
            encryptionData: metadata?.isEncrypted
              ? {
                  iv: metadata.iv,
                  authTag: metadata.authTag,
                }
              : undefined,
          };
        })
      );

      // Save attachments
      const savedAttachments = await ChatAttachment.insertMany(attachments);

      // Create message with attachments
      const message = await ChatService.sendMessage(roomId, req.user.id, content, {
        attachments: savedAttachments.map(att => att._id),
        isEncrypted,
        encryptionData,
        expiresAt: expiresAt ? new Date(parseInt(expiresAt)) : undefined,
        replyTo,
      });

      res.status(201).json(message);
    })(req, res);
  }

  /**
   * Download an attachment
   */
  downloadAttachment(req, res) {
    return asyncHandler(async (req, res) => {
      const { attachmentId } = req.params;

      const attachment = await ChatAttachment.findById(attachmentId);
      if (!attachment) {
        return res.status(404).json({
          success: false,
          message: 'Attachment not found',
        });
      }

      // Verify user has access to this room
      const canAccess = await ChatService.verifyRoomAccess(attachment.roomId, req.user.id);
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      // Stream the file to the response
      await ChatService.streamFile(attachment.url, res);
    })(req, res);
  }
}

export default new ChatController();
