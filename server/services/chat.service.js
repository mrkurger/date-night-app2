const ChatMessage = require('../models/chat-message.model');
const ChatRoom = require('../models/chat-room.model');
const User = require('../models/user.model');
const Ad = require('../models/ad.model');
const socketService = require('./socket.service');
const { AppError } = require('../middleware/errorHandler');

class ChatService {
  // TODO: Add message queue for reliable delivery
  // TODO: Implement presence detection system
  // TODO: Add offline support with message storage
  // TODO: Add group chat support with roles
  // TODO: Implement end-to-end encryption
  /**
   * Get messages for a chat room
   * @param {string} roomId - Chat room ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of messages
   */
  async getMessages(roomId, options = {}) {
    try {
      const {
        limit = 50,
        before = null,
        after = null,
        includeSystem = true
      } = options;

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
      console.error('Error fetching messages:', error);
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
        metadata = {}
      } = options;

      // Get chat room
      const room = await ChatRoom.findById(roomId);

      if (!room) {
        throw new AppError('Chat room not found', 404);
      }

      // Check if sender is a participant
      const isParticipant = room.participants.some(p =>
        p.user.toString() === senderId
      );

      if (!isParticipant) {
        throw new AppError('You are not a participant in this chat room', 403);
      }

      // Create message
      const chatMessage = new ChatMessage({
        sender: senderId,
        recipient: recipientId,
        roomId,
        message,
        attachments,
        type,
        metadata
      });

      await chatMessage.save();

      // Update room last activity and last message
      await room.updateLastMessage(chatMessage._id);

      // Get populated message for response
      const populatedMessage = await ChatMessage.findById(chatMessage._id)
        .populate('sender', 'username profileImage')
        .populate('recipient', 'username profileImage');

      // Notify room participants via WebSocket
      socketService.sendToRoom(`chat:${roomId}`, 'chat:message', {
        id: populatedMessage._id,
        roomId,
        sender: {
          id: populatedMessage.sender._id,
          username: populatedMessage.sender.username,
          profileImage: populatedMessage.sender.profileImage
        },
        message: populatedMessage.message,
        type: populatedMessage.type,
        attachments: populatedMessage.attachments,
        createdAt: populatedMessage.createdAt
      });

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
              senderName: populatedMessage.sender.username
            }
          });
        }
      }

      return populatedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new AppError(error.message || 'Failed to send message', 500);
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
      const [user1, user2] = await Promise.all([
        User.findById(user1Id),
        User.findById(user2Id)
      ]);

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
      console.error('Error creating direct room:', error);
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
        Ad.findById(adId).populate('advertiser')
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
      const room = await ChatRoom.findOrCreateAdRoom(
        userId,
        adId,
        ad.advertiser._id
      );

      // Get populated room
      const populatedRoom = await ChatRoom.findById(room._id)
        .populate('participants.user', 'username profileImage online lastActive')
        .populate('lastMessage')
        .populate('ad', 'title profileImage');

      return populatedRoom;
    } catch (error) {
      console.error('Error creating ad room:', error);
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
        _id: { $in: participantIds }
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
          role: id === creatorId ? 'admin' : 'member'
        })),
        createdBy: creatorId
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
            createdBy: creatorId
          }
        }
      );

      return populatedRoom;
    } catch (error) {
      console.error('Error creating group room:', error);
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
        rooms.map(async (room) => {
          const unreadCount = await ChatMessage.getUnreadCountByRoom(userId, room._id);

          // Format room data
          const roomData = room.toObject();

          // Add unread count
          roomData.unreadCount = unreadCount;

          // Format participants
          roomData.participants = roomData.participants.map(p => ({
            ...p,
            isCurrentUser: p.user._id.toString() === userId
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
      console.error('Error getting rooms for user:', error);
      throw new AppError(error.message || 'Failed to get chat rooms', 500);
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
          read: false
        },
        {
          $set: {
            read: true,
            readAt: new Date()
          }
        }
      );

      return {
        success: true,
        count: result.modifiedCount
      };
    } catch (error) {
      console.error('Error marking messages as read:', error);
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
        isActive: true
      });

      // Get unread counts by room
      const roomCounts = await Promise.all(
        rooms.map(async (room) => {
          const count = await ChatMessage.getUnreadCountByRoom(userId, room._id);
          return {
            roomId: room._id,
            count
          };
        })
      );

      // Filter out rooms with no unread messages
      const roomsWithUnread = roomCounts.filter(r => r.count > 0);

      return {
        total: totalUnread,
        rooms: roomsWithUnread
      };
    } catch (error) {
      console.error('Error getting unread counts:', error);
      throw new AppError(error.message || 'Failed to get unread counts', 500);
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
      const isParticipant = room.participants.some(p =>
        p.user.toString() === userId
      );

      if (!isParticipant) {
        throw new AppError('You are not a participant in this chat room', 403);
      }

      // Get user info for system message
      const user = await User.findById(userId);

      // Remove user from participants
      await room.removeParticipant(userId);

      // Send system message
      await this.sendMessage(
        roomId,
        userId,
        `${user.username} left the group`,
        {
          type: 'system',
          metadata: {
            event: 'user_left',
            userId
          }
        }
      );

      return {
        success: true,
        message: 'You have left the group chat'
      };
    } catch (error) {
      console.error('Error leaving room:', error);
      throw new AppError(error.message || 'Failed to leave chat room', 500);
    }
  }
}

module.exports = new ChatService();
