// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (chat.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import ChatMessage from '../models/chat-message.model.js';
import ChatRoom from '../models/chat-room.model.js';
import User from '../models/user.model.js';
import Ad from '../models/ad.model.js';
import socketService from './socket.service.js';
import { cryptoHelpers } from '../utils/cryptoHelpers.js';
import { AppError } from '../middleware/errorHandler.js';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

class MessageQueue {
  constructor() {
    this.queue = new Map(); // messageId -> { message, attempts, timestamp }
    this.processingInterval = null; // Initialize as null
    this.startProcessing(); // Start processing in a separate method
  }

  startProcessing() {
    if (!this.processingInterval) {
      this.processingInterval = setInterval(() => this.processQueue(), RETRY_DELAY);
    }
  }

  add(messageId, message) {
    this.queue.set(messageId, {
      message,
      attempts: 0,
      timestamp: Date.now(),
    });
  }

  async processQueue() {
    for (const [messageId, entry] of this.queue.entries()) {
      if (entry.attempts >= MAX_RETRY_ATTEMPTS) {
        // Move to dead letter queue or handle failure
        await this.handleFailedMessage(messageId, entry.message);
        this.queue.delete(messageId);
        continue;
      }

      try {
        await this.deliverMessage(messageId, entry.message);
        this.queue.delete(messageId);
      } catch (error) {
        entry.attempts++;
        console.error(`Failed to deliver message ${messageId}, attempt ${entry.attempts}:`, error);
      }
    }
  }

  async deliverMessage(messageId, message) {
    // Implement actual message delivery logic
    const recipient = message.recipientId;
    if (socketService.isUserOnline(recipient)) {
      await socketService.sendToUser(recipient, 'chat:message', message);
      return true;
    }
    throw new Error('Recipient offline');
  }

  async handleFailedMessage(messageId, message) {
    // Store failed message for offline delivery
    await ChatMessage.findByIdAndUpdate(messageId, {
      deliveryStatus: 'failed',
      lastDeliveryAttempt: Date.now(),
    });

    // Notify sender about failed delivery
    if (socketService.isUserOnline(message.senderId)) {
      socketService.sendToUser(message.senderId, 'chat:delivery-failed', {
        messageId,
        error: 'Message delivery failed after maximum retries',
      });
    }
  }

  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.queue.clear();
  }
}

// Initialize message queue
const messageQueue = new MessageQueue();

class ChatService {
  constructor() {
    this.messageQueue = messageQueue;
  }

  // TODO: Add message queue for reliable delivery
  // TODO: Implement presence detection system
  // TODO: Add offline support with message storage
  // TODO: Add group chat support with roles
  /**
   * Get messages for a chat room
   * @param {string} roomId - Chat room ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of messages
   */
  async getMessages(roomId, options = {}) {
    try {
      const { limit = 50, before = null, after = null, includeSystem = true } = options;

      // Build query
      const query = { roomId };

      // Filter by message type if needed
      if (!includeSystem) {
        query.type = { $ne: 'system' };
      }

      // Pagination using message ID
      if (before) {
        const beforeMessage = await ChatMessage.findById(before);
        if (beforeMessage) {
          query.createdAt = { $lt: beforeMessage.createdAt };
        }
      } else if (after) {
        const afterMessage = await ChatMessage.findById(after);
        if (afterMessage) {
          query.createdAt = { $gt: afterMessage.createdAt };
        }
      }

      // Get messages
      const messages = await ChatMessage.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('sender', 'username profileImage')
        .populate('recipient', 'username profileImage');

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      logger.error('Error fetching messages:', error);
      throw new AppError('Failed to fetch messages', 500);
    }
  }

  /**
   * Send a message to a chat room
   * @param {string} roomId - Chat room ID
   * @param {string} senderId - Sender user ID
   * @param {string} message - Message content
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(roomId, senderId, message, options = {}) {
    try {
      const {
        recipientId = null,
        attachments = [],
        type = 'text',
        metadata = {},
        isEncrypted = false,
        encryptionData = null,
      } = options;

      // Get chat room
      const room = await ChatRoom.findById(roomId);

      if (!room) {
        throw new AppError('Chat room not found', 404);
      }

      // Check if sender is a participant
      const isParticipant = room.participants.some(p => p.user.toString() === senderId);

      if (!isParticipant) {
        throw new AppError('You are not a participant in this chat room', 403);
      }

      // Handle message expiry if enabled
      let expiresAt = null;
      if (room.messageExpiryEnabled && room.messageExpiryTime > 0 && type !== 'system') {
        expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + room.messageExpiryTime);
      }

      // Create message
      const chatMessage = new ChatMessage({
        sender: senderId,
        recipient: recipientId,
        roomId,
        message,
        attachments,
        type,
        metadata,
        isEncrypted,
        encryptionData,
        expiresAt,
      });

      await chatMessage.save();

      // Update room last activity and last message
      await room.updateLastMessage(chatMessage._id);

      // Get populated message for response
      const populatedMessage = await ChatMessage.findById(chatMessage._id)
        .populate('sender', 'username profileImage')
        .populate('recipient', 'username profileImage');

      // Prepare message data for WebSocket
      // Note: We send the encrypted message as is - decryption happens client-side
      const messageData = {
        id: populatedMessage._id,
        roomId,
        sender: {
          id: populatedMessage.sender._id,
          username: populatedMessage.sender.username,
          profileImage: populatedMessage.sender.profileImage,
        },
        message: populatedMessage.message,
        type: populatedMessage.type,
        attachments: populatedMessage.attachments,
        isEncrypted: populatedMessage.isEncrypted,
        encryptionData: populatedMessage.encryptionData,
        createdAt: populatedMessage.createdAt,
        expiresAt: populatedMessage.expiresAt,
      };

      // Notify room participants via WebSocket
      socketService.sendToRoom(`chat:${roomId}`, 'chat:message', messageData);

      // Send notification to recipient if specified
      if (recipientId) {
        // Check if recipient is online and in the room
        const isRecipientOnline = socketService.isUserOnline(recipientId);

        if (isRecipientOnline) {
          socketService.sendToUser(recipientId, 'notification:new', {
            type: 'chat',
            message: `New message from ${populatedMessage.sender.username}`,
            data: {
              roomId,
              messageId: populatedMessage._id,
              senderId: populatedMessage.sender._id,
              senderName: populatedMessage.sender.username,
            },
          });
        }
      }

      // Add message to queue for reliable delivery
      messageQueue.add(chatMessage._id.toString(), {
        id: chatMessage._id,
        roomId,
        senderId,
        recipientId,
        message,
        type,
        metadata,
        isEncrypted,
        encryptionData,
        timestamp: chatMessage.createdAt,
      });

      return populatedMessage;
    } catch (error) {
      logger.error('Error sending message:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to send message', 500);
    }
  }

  /**
   * Create or get a direct message room between two users
   * @param {string} user1Id - First user ID
   * @param {string} user2Id - Second user ID
   * @returns {Promise<Object>} Chat room
   */
  async createDirectRoom(user1Id, user2Id) {
    try {
      // Check if users exist
      const [user1, user2] = await Promise.all([User.findById(user1Id), User.findById(user2Id)]);

      if (!user1 || !user2) {
        throw new AppError('One or both users not found', 404);
      }

      // Find or create direct room
      const room = await ChatRoom.findOrCreateDirectRoom(user1Id, user2Id);

      // Get populated room
      const populatedRoom = await ChatRoom.findById(room._id)
        .populate('participants.user', 'username profileImage online lastActive')
        .populate('lastMessage');

      return populatedRoom;
    } catch (error) {
      logger.error('Error creating direct room:', error);
      throw new AppError(error.message || 'Failed to create direct room', 500);
    }
  }

  /**
   * Create or get a chat room for an ad
   * @param {string} userId - User ID
   * @param {string} adId - Ad ID
   * @returns {Promise<Object>} Chat room
   */
  async createAdRoom(userId, adId) {
    try {
      // Check if user and ad exist
      const [user, ad] = await Promise.all([
        User.findById(userId),
        Ad.findById(adId).populate('advertiser'),
      ]);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      // Check if user is trying to chat with their own ad
      if (ad.advertiser._id.toString() === userId) {
        throw new AppError('You cannot chat with your own ad', 400);
      }

      // Find or create ad room
      const room = await ChatRoom.findOrCreateAdRoom(userId, adId, ad.advertiser._id);

      // Get populated room
      const populatedRoom = await ChatRoom.findById(room._id)
        .populate('participants.user', 'username profileImage online lastActive')
        .populate('lastMessage')
        .populate('ad', 'title profileImage');

      return populatedRoom;
    } catch (error) {
      logger.error('Error creating ad room:', error);
      throw new AppError(error.message || 'Failed to create ad room', 500);
    }
  }

  /**
   * Create a group chat room
   * @param {string} creatorId - Creator user ID
   * @param {string} name - Group name
   * @param {Array} participantIds - Array of participant user IDs
   * @returns {Promise<Object>} Chat room
   */
  async createGroupRoom(creatorId, name, participantIds = []) {
    try {
      // Check if creator exists
      const creator = await User.findById(creatorId);

      if (!creator) {
        throw new AppError('Creator user not found', 404);
      }

      // Ensure creator is included in participants
      if (!participantIds.includes(creatorId)) {
        participantIds.push(creatorId);
      }

      // Check if all participants exist
      const participants = await User.find({
        _id: { $in: participantIds },
      });

      if (participants.length !== participantIds.length) {
        throw new AppError('One or more participants not found', 404);
      }

      // Create group room
      const room = new ChatRoom({
        name,
        type: 'group',
        participants: participantIds.map(id => ({
          user: id,
          role: id === creatorId ? 'admin' : 'member',
        })),
        createdBy: creatorId,
      });

      await room.save();

      // Get populated room
      const populatedRoom = await ChatRoom.findById(room._id)
        .populate('participants.user', 'username profileImage online lastActive')
        .populate('createdBy', 'username');

      // Create system message for group creation
      await this.sendMessage(
        room._id,
        creatorId,
        `${creator.username} created the group "${name}"`,
        {
          type: 'system',
          metadata: {
            event: 'group_created',
            createdBy: creatorId,
          },
        }
      );

      return populatedRoom;
    } catch (error) {
      logger.error('Error creating group room:', error);
      throw new AppError(error.message || 'Failed to create group room', 500);
    }
  }

  /**
   * Get chat rooms for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of chat rooms
   */
  async getRoomsForUser(userId) {
    try {
      // Check if user exists
      const user = await User.findById(userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Get rooms
      const rooms = await ChatRoom.getRoomsForUser(userId);

      // Get unread counts for each room
      const roomsWithUnreadCounts = await Promise.all(
        rooms.map(async room => {
          const unreadCount = await ChatMessage.getUnreadCountByRoom(userId, room._id);

          // Format room data
          const roomData = room.toObject();

          // Add unread count
          roomData.unreadCount = unreadCount;

          // Format participants
          roomData.participants = roomData.participants.map(p => ({
            ...p,
            isCurrentUser: p.user._id.toString() === userId,
          }));

          // Get other participant for direct chats
          if (room.type === 'direct') {
            roomData.otherParticipant = roomData.participants.find(
              p => p.user._id.toString() !== userId
            )?.user;
          }

          return roomData;
        })
      );

      return roomsWithUnreadCounts;
    } catch (error) {
      logger.error('Error getting rooms for user:', error);
      throw new AppError(error.message || 'Failed to get chat rooms', 500);
    }
  }

  /**
   * Get a specific chat room by ID
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Chat room
   */
  async getRoomById(roomId, userId) {
    try {
      // Check if room exists
      const room = await ChatRoom.findById(roomId)
        .populate('participants.user', 'username profileImage online lastActive')
        .populate('lastMessage')
        .populate('ad', 'title profileImage');

      if (!room) {
        throw new AppError('Chat room not found', 404);
      }

      // Check if user is a participant
      const isParticipant = room.participants.some(p => p.user._id.toString() === userId);

      if (!isParticipant) {
        throw new AppError('You are not a participant in this chat room', 403);
      }

      // Format room data
      const roomData = room.toObject();

      // Get unread count
      const unreadCount = await ChatMessage.getUnreadCountByRoom(userId, roomId);
      roomData.unreadCount = unreadCount;

      // Format participants
      roomData.participants = roomData.participants.map(p => ({
        ...p,
        isCurrentUser: p.user._id.toString() === userId,
      }));

      // Get other participant for direct chats
      if (room.type === 'direct') {
        roomData.otherParticipant = roomData.participants.find(
          p => p.user._id.toString() !== userId
        )?.user;
      }

      return roomData;
    } catch (error) {
      logger.error('Error getting room by ID:', error);
      throw new AppError(error.message || 'Failed to get chat room', 500);
    }
  }

  /**
   * Mark messages as read in a room
   * @param {string} roomId - Chat room ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result with count of marked messages
   */
  async markMessagesAsRead(roomId, userId) {
    try {
      // Update room last read timestamp
      const room = await ChatRoom.findById(roomId);

      if (!room) {
        throw new AppError('Chat room not found', 404);
      }

      await room.updateLastRead(userId);

      // Mark messages as read
      const result = await ChatMessage.updateMany(
        {
          roomId,
          recipient: userId,
          read: false,
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
          },
        }
      );

      return {
        success: true,
        count: result.modifiedCount,
      };
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw new AppError(error.message || 'Failed to mark messages as read', 500);
    }
  }

  /**
   * Get unread message count for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Unread counts
   */
  async getUnreadCounts(userId) {
    try {
      // Get total unread count
      const totalUnread = await ChatMessage.getUnreadCount(userId);

      // Get rooms with unread messages
      const rooms = await ChatRoom.find({
        'participants.user': userId,
        isActive: true,
      });

      // Get unread counts by room
      const roomCounts = await Promise.all(
        rooms.map(async room => {
          const count = await ChatMessage.getUnreadCountByRoom(userId, room._id);
          return {
            roomId: room._id,
            count,
          };
        })
      );

      // Filter out rooms with no unread messages
      const roomsWithUnread = roomCounts.filter(r => r.count > 0);

      return {
        total: totalUnread,
        rooms: roomsWithUnread,
      };
    } catch (error) {
      logger.error('Error getting unread counts:', error);
      throw new AppError(error.message || 'Failed to get unread counts', 500);
    }
  }

  /**
   * Generate and distribute encryption keys for a chat room
   * @param {string} roomId - Chat room ID
   * @returns {Promise<Object>} Result
   */
  async setupRoomEncryption(roomId) {
    try {
      const room = await ChatRoom.findById(roomId);

      if (!room) {
        throw new AppError('Chat room not found', 404);
      }

      // Generate a symmetric key for the room
      const roomKey = cryptoHelpers.generateEncryptionKey();

      // For each participant, encrypt the room key with their public key
      for (const participant of room.participants) {
        // Get user's public key
        const user = await User.findById(participant.user);

        if (!user || !user.publicKey) {
          // Generate a key pair for the user if they don't have one
          const keyPair = cryptoHelpers.generateKeyPair();

          if (!user) continue;

          // Save public key to user
          user.publicKey = keyPair.publicKey;
          await user.save();

          // Encrypt room key with user's public key
          const encryptedRoomKey = cryptoHelpers.encryptWithPublicKey(roomKey, keyPair.publicKey);

          // Save encrypted room key to participant
          participant.publicKey = keyPair.publicKey;
          participant.encryptedRoomKey = encryptedRoomKey;

          // Send private key to user via secure channel (WebSocket)
          socketService.sendToUser(user._id.toString(), 'chat:keys', {
            type: 'private_key',
            roomId: room._id,
            privateKey: keyPair.privateKey,
          });
        } else {
          // User already has a public key
          // Encrypt room key with user's public key
          const encryptedRoomKey = cryptoHelpers.encryptWithPublicKey(roomKey, user.publicKey);

          // Save encrypted room key to participant
          participant.publicKey = user.publicKey;
          participant.encryptedRoomKey = encryptedRoomKey;
        }
      }

      // Enable encryption for the room
      room.encryptionEnabled = true;
      await room.save();

      return {
        success: true,
        message: 'Room encryption set up successfully',
      };
    } catch (error) {
      logger.error('Error setting up room encryption:', error);
      throw new AppError(error.message || 'Failed to set up room encryption', 500);
    }
  }

  /**
   * Update message expiry settings for a room
   * @param {string} roomId - Chat room ID
   * @param {boolean} enabled - Whether message expiry is enabled
   * @param {number} expiryTime - Expiry time in hours
   * @param {string} userId - User ID (must be admin)
   * @returns {Promise<Object>} Updated room
   */
  async updateMessageExpiry(roomId, enabled, expiryTime, userId) {
    try {
      const room = await ChatRoom.findById(roomId);

      if (!room) {
        throw new AppError('Chat room not found', 404);
      }

      // Check if user is an admin
      const participant = room.participants.find(
        p => p.user.toString() === userId && p.role === 'admin'
      );

      if (!participant) {
        throw new AppError('Only admins can update message expiry settings', 403);
      }

      // Update settings
      room.messageExpiryEnabled = enabled;

      if (expiryTime !== undefined && expiryTime > 0) {
        room.messageExpiryTime = expiryTime;
      }

      await room.save();

      // Send system message
      await this.sendMessage(
        roomId,
        userId,
        `Message expiry ${enabled ? 'enabled' : 'disabled'}${enabled ? ` (${expiryTime} hours)` : ''}`,
        {
          type: 'system',
          metadata: {
            event: 'message_expiry_updated',
            enabled,
            expiryTime,
          },
        }
      );

      return room;
    } catch (error) {
      logger.error('Error updating message expiry:', error);
      throw new AppError(error.message || 'Failed to update message expiry', 500);
    }
  }

  /**
   * Encrypt a message with the room key
   * @param {string} message - Message to encrypt
   * @param {string} roomId - Chat room ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Encrypted message data
   */
  async encryptMessage(message, roomId, userId) {
    try {
      const room = await ChatRoom.findById(roomId);

      if (!room) {
        throw new AppError('Chat room not found', 404);
      }

      if (!room.encryptionEnabled) {
        throw new AppError('Encryption is not enabled for this room', 400);
      }

      // Find participant
      const participant = room.participants.find(p => p.user.toString() === userId);

      if (!participant || !participant.encryptedRoomKey) {
        throw new AppError('You do not have encryption keys for this room', 403);
      }

      // Client should decrypt the room key with their private key and use it to encrypt the message
      // This is just a placeholder for the server-side implementation
      return {
        success: true,
        message: 'Message encryption should be handled by the client',
      };
    } catch (error) {
      logger.error('Error encrypting message:', error);
      throw new AppError(error.message || 'Failed to encrypt message', 500);
    }
  }

  /**
   * Leave a group chat room
   * @param {string} roomId - Chat room ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async leaveRoom(roomId, userId) {
    try {
      const room = await ChatRoom.findById(roomId);

      if (!room) {
        throw new AppError('Chat room not found', 404);
      }

      // Check if room is a group
      if (room.type !== 'group') {
        throw new AppError('You can only leave group chats', 400);
      }

      // Check if user is a participant
      const isParticipant = room.participants.some(p => p.user.toString() === userId);

      if (!isParticipant) {
        throw new AppError('You are not a participant in this chat room', 403);
      }

      // Get user info for system message
      const user = await User.findById(userId);

      // Remove user from participants
      await room.removeParticipant(userId);

      // Send system message
      await this.sendMessage(roomId, userId, `${user.username} left the group`, {
        type: 'system',
        metadata: {
          event: 'user_left',
          userId,
        },
      });

      return {
        success: true,
        message: 'You have left the group chat',
      };
    } catch (error) {
      logger.error('Error leaving room:', error);
      throw new AppError(error.message || 'Failed to leave chat room', 500);
    }
  }

  /**
   * Store an uploaded file and return its URL
   * @param {Object} file The uploaded file object
   * @returns {Promise<string>} The URL of the stored file
   */
  async storeFile(file) {
    try {
      // Generate unique filename
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileExt = file.originalname.split('.').pop();
      const fullFileName = `${fileName}.${fileExt}`;
      const uploadDir = path.join(process.cwd(), 'uploads', 'chat');

      // Ensure upload directory exists
      await fs.promises.mkdir(uploadDir, { recursive: true });

      // Write file to disk
      const filePath = path.join(uploadDir, fullFileName);
      await fs.promises.writeFile(filePath, file.buffer);

      // Return relative URL
      return `/uploads/chat/${fullFileName}`;
    } catch (error) {
      logger.error('Error storing file:', error);
      throw new AppError('Failed to store file', 500);
    }
  }

  /**
   * Stream a file to the response
   * @param {string} fileUrl The URL of the file to stream
   * @param {Object} res The response object
   */
  async streamFile(fileUrl, res) {
    try {
      // Convert URL to file path
      const filePath = path.join(process.cwd(), fileUrl);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new AppError('File not found', 404);
      }

      // Set appropriate headers
      const stat = fs.statSync(filePath);
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size,
      });

      // Stream file
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      logger.error('Error streaming file:', error);
      throw new AppError('Failed to stream file', 500);
    }
  }

  /**
   * Verify if a user has access to a chat room
   * @param {string} roomId The room ID
   * @param {string} userId The user ID
   * @returns {Promise<boolean>} Whether the user has access
   */
  async verifyRoomAccess(roomId, userId) {
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return false;
    }

    return room.participants.some(p => p.user.toString() === userId);
  }

  /**
   * Clean up resources used by the service
   */
  cleanup() {
    // Stop message queue
    if (this.messageQueue) {
      this.messageQueue.stop();
    }
  }
}

const chatService = new ChatService();
export default chatService;
