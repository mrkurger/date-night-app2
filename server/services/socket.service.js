// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (socket.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ChatMessage = require('../models/chat-message.model');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map of userId -> socketId
    this.userSockets = new Map(); // Map of socketId -> userId
  }

  /**
   * Initialize Socket.IO server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    const socketIo = require('socket.io');
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Middleware for authentication
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication error: Token missing'));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findById(decoded.id);

        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        // Attach user to socket
        socket.user = {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
        };

        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    // Handle connections
    this.io.on('connection', socket => {
      this.handleConnection(socket);
    });

    console.log('Socket.IO server initialized');
  }

  /**
   * Handle new socket connection
   * @param {Object} socket - Socket.IO socket
   */
  handleConnection(socket) {
    const userId = socket.user.id;

    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    // Update user online status
    this.updateUserStatus(userId, true);

    // Join user to their own room for private messages
    socket.join(`user:${userId}`);

    // Emit user connected event to all clients
    this.io.emit('user:status', { userId, online: true });

    // Handle events
    socket.on('chat:join', roomId => this.handleJoinChat(socket, roomId));
    socket.on('chat:leave', roomId => this.handleLeaveChat(socket, roomId));
    socket.on('chat:message', data => this.handleChatMessage(socket, data));
    socket.on('chat:typing', data => this.handleTyping(socket, data));
    socket.on('notification:read', notificationId =>
      this.handleNotificationRead(socket, notificationId)
    );

    // Handle disconnection
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  /**
   * Handle user disconnection
   * @param {Object} socket - Socket.IO socket
   */
  async handleDisconnect(socket) {
    const userId = this.userSockets.get(socket.id);

    if (userId) {
      console.log(`User disconnected: ${userId}`);

      // Remove user connection
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);

      // Update user online status
      this.updateUserStatus(userId, false);

      // Emit user disconnected event to all clients
      this.io.emit('user:status', { userId, online: false });
    }
  }

  /**
   * Update user online status in database
   * @param {string} userId - User ID
   * @param {boolean} online - Online status
   */
  async updateUserStatus(userId, online) {
    try {
      await User.findByIdAndUpdate(userId, {
        online,
        lastActive: new Date(),
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  /**
   * Handle joining a chat room
   * @param {Object} socket - Socket.IO socket
   * @param {string} roomId - Chat room ID
   */
  handleJoinChat(socket, roomId) {
    console.log(`User ${socket.user.id} joined chat room: ${roomId}`);
    socket.join(`chat:${roomId}`);

    // Notify other users in the room
    socket.to(`chat:${roomId}`).emit('chat:user-joined', {
      roomId,
      user: {
        id: socket.user.id,
        username: socket.user.username,
      },
    });
  }

  /**
   * Handle leaving a chat room
   * @param {Object} socket - Socket.IO socket
   * @param {string} roomId - Chat room ID
   */
  handleLeaveChat(socket, roomId) {
    console.log(`User ${socket.user.id} left chat room: ${roomId}`);
    socket.leave(`chat:${roomId}`);

    // Notify other users in the room
    socket.to(`chat:${roomId}`).emit('chat:user-left', {
      roomId,
      user: {
        id: socket.user.id,
        username: socket.user.username,
      },
    });
  }

  /**
   * Handle chat message
   * @param {Object} socket - Socket.IO socket
   * @param {Object} data - Message data
   */
  async handleChatMessage(socket, data) {
    try {
      const { roomId, message, recipientId } = data;

      if (!roomId || !message) {
        return;
      }

      // Create message in database
      const chatMessage = new ChatMessage({
        sender: socket.user.id,
        recipient: recipientId,
        roomId,
        message,
        read: false,
      });

      await chatMessage.save();

      // Emit message to room
      this.io.to(`chat:${roomId}`).emit('chat:message', {
        id: chatMessage._id,
        roomId,
        sender: {
          id: socket.user.id,
          username: socket.user.username,
        },
        message,
        createdAt: chatMessage.createdAt,
      });

      // Send notification to recipient if not in the room
      if (recipientId) {
        const recipientSocketId = this.connectedUsers.get(recipientId);

        if (recipientSocketId) {
          this.io.to(`user:${recipientId}`).emit('notification:new', {
            type: 'chat',
            message: `New message from ${socket.user.username}`,
            data: {
              roomId,
              senderId: socket.user.id,
              senderName: socket.user.username,
              messageId: chatMessage._id,
            },
            createdAt: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle typing indicator
   * @param {Object} socket - Socket.IO socket
   * @param {Object} data - Typing data
   */
  handleTyping(socket, data) {
    const { roomId, isTyping } = data;

    if (!roomId) {
      return;
    }

    // Emit typing status to room
    socket.to(`chat:${roomId}`).emit('chat:typing', {
      roomId,
      user: {
        id: socket.user.id,
        username: socket.user.username,
      },
      isTyping,
    });
  }

  /**
   * Handle notification read
   * @param {Object} socket - Socket.IO socket
   * @param {string} notificationId - Notification ID
   */
  async handleNotificationRead(socket, notificationId) {
    try {
      if (notificationId.startsWith('msg_')) {
        // Handle chat message read
        const messageId = notificationId.substring(4);
        await ChatMessage.findByIdAndUpdate(messageId, { read: true });
      }

      // Emit notification read event to user
      socket.emit('notification:read-confirmed', { id: notificationId });
    } catch (error) {
      console.error('Error handling notification read:', error);
    }
  }

  /**
   * Send notification to user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification data
   */
  sendNotification(userId, notification) {
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.io.to(`user:${userId}`).emit('notification:new', {
        ...notification,
        createdAt: new Date(),
      });
    }
  }

  /**
   * Broadcast message to all connected clients
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Send message to specific room
   * @param {string} roomId - Room ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  sendToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  /**
   * Send message to specific user
   * @param {string} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  /**
   * Get online users
   * @returns {Array} Array of online user IDs
   */
  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Check if user is online
   * @param {string} userId - User ID
   * @returns {boolean} True if user is online
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();
