// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the socket service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_SOCKET_DATA: Mock socket data for testing
//   Related to: server/services/socket.service.js
// ===================================================

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import User from '../../../models/user.model.js';
import ChatMessage from '../../../models/chat-message.model.js';
import socketService from '../../../services/socket.service.js';
import { AppError } from '../../../middleware/errorHandler.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';

// Mock dependencies
jest.mock('socket.io', () => {
  const mockSocket = {
    id: 'mock-socket-id',
    join: jest.fn(),
    leave: jest.fn(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
  };

  const mockIO = {
    use: jest.fn(),
    on: jest.fn(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
    close: jest.fn(),
    sockets: {
      sockets: new Map([['mock-socket-id', mockSocket]]),
    },
  };

  return {
    Server: jest.fn().mockImplementation(() => mockIO),
  };
});

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('../../../models/user.model.js', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../../models/chat-message.model.js', () => {
  const mockChatMessageInstance = {
    save: jest.fn().mockResolvedValue({
      _id: 'mock-message-id',
      sender: 'mock-user-id',
      recipient: 'mock-recipient-id',
      roomId: 'mock-room-id',
      message: 'Hello world',
      read: false,
      createdAt: new Date(),
    }),
  };

  const MockChatMessage = jest.fn().mockImplementation(() => mockChatMessageInstance);

  // Add static methods
  MockChatMessage.find = jest.fn();
  MockChatMessage.findOne = jest.fn();
  MockChatMessage.findById = jest.fn();
  MockChatMessage.findByIdAndUpdate = jest.fn();

  return MockChatMessage;
});

jest.mock('../../../middleware/errorHandler.js', () => ({
  AppError: class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

jest.mock('../../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('Socket Service', () => {
  // Setup test data
  const testUserId = 'mock-user-id';
  const testUsername = 'testuser';
  const testSocketId = 'mock-socket-id';

  // Mock socket object
  const mockSocket = {
    id: testSocketId,
    user: {
      id: testUserId,
      username: testUsername,
      role: 'user',
    },
    join: jest.fn(),
    leave: jest.fn(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
  };

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Reset mocks and service state between tests
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset socket service state
    socketService.connectedUsers = new Map();
    socketService.userSockets = new Map();

    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(async () => {
    await clearDatabase();
    console.log.mockRestore();
  });

  describe('initialize', () => {
    it('should initialize Socket.IO server', () => {
      const mockServer = {};
      socketService.initialize(mockServer);

      // Verify Server constructor was called with the server
      expect(Server).toHaveBeenCalledWith(mockServer, expect.any(Object));

      // Verify middleware and event handlers were set up
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.use).toHaveBeenCalled();
      expect(mockIO.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('handleConnection', () => {
    it('should handle new socket connection', () => {
      // Call the method
      socketService.handleConnection(mockSocket);

      // Verify user connection was stored
      expect(socketService.connectedUsers.get(testUserId)).toBe(testSocketId);
      expect(socketService.userSockets.get(testSocketId)).toBe(testUserId);

      // Verify user joined their own room
      expect(mockSocket.join).toHaveBeenCalledWith(`user:${testUserId}`);

      // Verify event handlers were set up
      expect(mockSocket.on).toHaveBeenCalledWith('chat:join', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('chat:leave', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('chat:message', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('chat:typing', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('notification:read', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));

      // Verify user status was updated
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(testUserId, {
        online: true,
        lastActive: expect.any(Date),
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should handle user disconnection', () => {
      // Setup: Add user to connected users
      socketService.connectedUsers.set(testUserId, testSocketId);
      socketService.userSockets.set(testSocketId, testUserId);

      // Call the method
      socketService.handleDisconnect(mockSocket);

      // Verify user connection was removed
      expect(socketService.connectedUsers.has(testUserId)).toBe(false);
      expect(socketService.userSockets.has(testSocketId)).toBe(false);

      // Verify user status was updated
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(testUserId, {
        online: false,
        lastActive: expect.any(Date),
      });
    });

    it('should handle disconnection for unknown socket', () => {
      // Call the method with a socket that isn't in the userSockets map
      socketService.handleDisconnect({ id: 'unknown-socket-id' });

      // Verify user status was not updated
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    it('should update user online status in database', async () => {
      // Call the method
      await socketService.updateUserStatus(testUserId, true);

      // Verify user status was updated
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(testUserId, {
        online: true,
        lastActive: expect.any(Date),
      });
    });

    it('should throw error if database update fails', async () => {
      // Mock findByIdAndUpdate to throw an error
      User.findByIdAndUpdate.mockRejectedValueOnce(new Error('Database error'));

      // Call the method and expect it to throw
      await expect(socketService.updateUserStatus(testUserId, true)).rejects.toThrow(
        new AppError('Failed to update user status', 500)
      );
    });
  });

  describe('handleJoinChat', () => {
    it('should handle joining a chat room', () => {
      const roomId = 'mock-room-id';

      // Call the method
      socketService.handleJoinChat(mockSocket, roomId);

      // Verify socket joined the room
      expect(mockSocket.join).toHaveBeenCalledWith(`chat:${roomId}`);

      // Verify notification was sent to other users in the room
      expect(mockSocket.to).toHaveBeenCalledWith(`chat:${roomId}`);
      expect(mockSocket.emit).toHaveBeenCalledWith('chat:user-joined', {
        roomId,
        user: {
          id: testUserId,
          username: testUsername,
        },
      });
    });
  });

  describe('handleLeaveChat', () => {
    it('should handle leaving a chat room', () => {
      const roomId = 'mock-room-id';

      // Call the method
      socketService.handleLeaveChat(mockSocket, roomId);

      // Verify socket left the room
      expect(mockSocket.leave).toHaveBeenCalledWith(`chat:${roomId}`);

      // Verify notification was sent to other users in the room
      expect(mockSocket.to).toHaveBeenCalledWith(`chat:${roomId}`);
      expect(mockSocket.emit).toHaveBeenCalledWith('chat:user-left', {
        roomId,
        user: {
          id: testUserId,
          username: testUsername,
        },
      });
    });
  });

  describe('handleChatMessage', () => {
    it('should handle chat message', async () => {
      // Setup
      const roomId = 'mock-room-id';
      const message = 'Hello world';
      const recipientId = 'mock-recipient-id';

      // Initialize IO
      const mockServer = {};
      socketService.initialize(mockServer);

      // Call the method
      await socketService.handleChatMessage(mockSocket, { roomId, message, recipientId });

      // Verify message was saved to database
      expect(ChatMessage).toHaveBeenCalledWith({
        sender: testUserId,
        recipient: recipientId,
        roomId,
        message,
        read: false,
      });

      // Verify message was sent to room
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.to).toHaveBeenCalledWith(`chat:${roomId}`);
      expect(mockIO.emit).toHaveBeenCalledWith(
        'chat:message',
        expect.objectContaining({
          roomId,
          sender: {
            id: testUserId,
            username: testUsername,
          },
          message,
        })
      );
    });

    it('should send notification to recipient if they are connected', async () => {
      // Setup
      const roomId = 'mock-room-id';
      const message = 'Hello world';
      const recipientId = 'mock-recipient-id';

      // Initialize IO
      const mockServer = {};
      socketService.initialize(mockServer);

      // Add recipient to connected users
      socketService.connectedUsers.set(recipientId, 'recipient-socket-id');

      // Call the method
      await socketService.handleChatMessage(mockSocket, { roomId, message, recipientId });

      // Verify notification was sent to recipient
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.to).toHaveBeenCalledWith(`user:${recipientId}`);
      expect(mockIO.emit).toHaveBeenCalledWith(
        'notification:new',
        expect.objectContaining({
          type: 'chat',
          message: `New message from ${testUsername}`,
          data: expect.objectContaining({
            roomId,
            senderId: testUserId,
            senderName: testUsername,
          }),
        })
      );
    });

    it('should not process message if roomId or message is missing', async () => {
      // Call the method with missing data
      await socketService.handleChatMessage(mockSocket, { roomId: null, message: 'Hello' });

      // Verify message was not saved or sent
      expect(ChatMessage).not.toHaveBeenCalled();
    });
  });

  describe('handleTyping', () => {
    it('should handle typing indicator', () => {
      const roomId = 'mock-room-id';
      const isTyping = true;

      // Call the method
      socketService.handleTyping(mockSocket, { roomId, isTyping });

      // Verify typing status was sent to room
      expect(mockSocket.to).toHaveBeenCalledWith(`chat:${roomId}`);
      expect(mockSocket.emit).toHaveBeenCalledWith('chat:typing', {
        roomId,
        user: {
          id: testUserId,
          username: testUsername,
        },
        isTyping,
      });
    });

    it('should not process typing if roomId is missing', () => {
      // Call the method with missing roomId
      socketService.handleTyping(mockSocket, { roomId: null, isTyping: true });

      // Verify typing status was not sent
      expect(mockSocket.to).not.toHaveBeenCalled();
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleNotificationRead', () => {
    it('should handle chat message read notification', async () => {
      // Setup
      const messageId = 'mock-message-id';
      const notificationId = `msg_${messageId}`;

      // Mock findByIdAndUpdate
      ChatMessage.findByIdAndUpdate = jest.fn().mockResolvedValue({});

      // Call the method
      await socketService.handleNotificationRead(mockSocket, notificationId);

      // Verify message was marked as read
      expect(ChatMessage.findByIdAndUpdate).toHaveBeenCalledWith(messageId, { read: true });

      // Verify confirmation was sent to user
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:read-confirmed', {
        id: notificationId,
      });
    });

    it('should handle non-chat notification', async () => {
      // Call the method with a non-chat notification
      await socketService.handleNotificationRead(mockSocket, 'other-notification-id');

      // Verify message was not marked as read
      expect(ChatMessage.findByIdAndUpdate).not.toHaveBeenCalled();

      // Verify confirmation was sent to user
      expect(mockSocket.emit).toHaveBeenCalledWith('notification:read-confirmed', {
        id: 'other-notification-id',
      });
    });
  });

  describe('sendNotification', () => {
    it('should send notification to connected user', () => {
      // Setup
      const userId = 'mock-user-id';
      const notification = { type: 'test', message: 'Test notification' };

      // Initialize IO
      const mockServer = {};
      socketService.initialize(mockServer);

      // Add user to connected users
      socketService.connectedUsers.set(userId, 'user-socket-id');

      // Call the method
      socketService.sendNotification(userId, notification);

      // Verify notification was sent to user
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIO.emit).toHaveBeenCalledWith(
        'notification:new',
        expect.objectContaining({
          type: 'test',
          message: 'Test notification',
          createdAt: expect.any(Date),
        })
      );
    });

    it('should not send notification if user is not connected', () => {
      // Setup
      const userId = 'offline-user-id';
      const notification = { type: 'test', message: 'Test notification' };

      // Initialize IO
      const mockServer = {};
      socketService.initialize(mockServer);

      // Call the method
      socketService.sendNotification(userId, notification);

      // Verify notification was not sent
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.to).not.toHaveBeenCalled();
      expect(mockIO.emit).not.toHaveBeenCalled();
    });
  });

  describe('broadcast', () => {
    it('should broadcast message to all connected clients', () => {
      // Setup
      const event = 'test-event';
      const data = { message: 'Test broadcast' };

      // Initialize IO
      const mockServer = {};
      socketService.initialize(mockServer);

      // Call the method
      socketService.broadcast(event, data);

      // Verify message was broadcast
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe('sendToRoom', () => {
    it('should send message to specific room', () => {
      // Setup
      const roomId = 'mock-room-id';
      const event = 'test-event';
      const data = { message: 'Test room message' };

      // Initialize IO
      const mockServer = {};
      socketService.initialize(mockServer);

      // Call the method
      socketService.sendToRoom(roomId, event, data);

      // Verify message was sent to room
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.to).toHaveBeenCalledWith(roomId);
      expect(mockIO.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe('sendToUser', () => {
    it('should send message to specific user', () => {
      // Setup
      const userId = 'mock-user-id';
      const event = 'test-event';
      const data = { message: 'Test user message' };

      // Initialize IO
      const mockServer = {};
      socketService.initialize(mockServer);

      // Add user to connected users
      socketService.connectedUsers.set(userId, 'user-socket-id');

      // Call the method
      socketService.sendToUser(userId, event, data);

      // Verify message was sent to user
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIO.emit).toHaveBeenCalledWith(event, data);
    });

    it('should not send message if user is not connected', () => {
      // Setup
      const userId = 'offline-user-id';
      const event = 'test-event';
      const data = { message: 'Test user message' };

      // Initialize IO
      const mockServer = {};
      socketService.initialize(mockServer);

      // Call the method
      socketService.sendToUser(userId, event, data);

      // Verify message was not sent
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.to).not.toHaveBeenCalled();
      expect(mockIO.emit).not.toHaveBeenCalled();
    });
  });

  describe('getOnlineUsers', () => {
    it('should return array of online user IDs', () => {
      // Setup
      socketService.connectedUsers.set('user1', 'socket1');
      socketService.connectedUsers.set('user2', 'socket2');

      // Call the method
      const result = socketService.getOnlineUsers();

      // Verify result
      expect(result).toEqual(['user1', 'user2']);
    });

    it('should return empty array if no users are online', () => {
      // Call the method
      const result = socketService.getOnlineUsers();

      // Verify result
      expect(result).toEqual([]);
    });
  });

  describe('isUserOnline', () => {
    it('should return true if user is online', () => {
      // Setup
      socketService.connectedUsers.set('user1', 'socket1');

      // Call the method
      const result = socketService.isUserOnline('user1');

      // Verify result
      expect(result).toBe(true);
    });

    it('should return false if user is not online', () => {
      // Call the method
      const result = socketService.isUserOnline('offline-user');

      // Verify result
      expect(result).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should clean up socket connections and event listeners', () => {
      // Setup
      const mockServer = {};
      socketService.initialize(mockServer);

      // Add some connected users
      socketService.connectedUsers.set('user1', 'socket1');
      socketService.userSockets.set('socket1', 'user1');

      // Call the method
      socketService.cleanup();

      // Verify IO was cleaned up
      const mockIO = Server.mock.results[0].value;
      expect(mockIO.removeAllListeners).toHaveBeenCalled();
      expect(mockIO.close).toHaveBeenCalled();

      // Verify socket was cleaned up
      const mockSocket = mockIO.sockets.sockets.get('mock-socket-id');
      expect(mockSocket.removeAllListeners).toHaveBeenCalled();
      expect(mockSocket.disconnect).toHaveBeenCalledWith(true);

      // Verify maps were cleared
      expect(socketService.connectedUsers.size).toBe(0);
      expect(socketService.userSockets.size).toBe(0);

      // Verify io was reset
      expect(socketService.io).toBeNull();
    });

    it('should do nothing if io is not initialized', () => {
      // Setup
      socketService.io = null;

      // Call the method
      socketService.cleanup();

      // Verify nothing happened
      expect(Server).not.toHaveBeenCalled();
    });
  });
});
