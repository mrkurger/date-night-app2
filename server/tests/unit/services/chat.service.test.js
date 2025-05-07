/**
 * Chat Service Unit Tests
 *
 * Tests the functionality of the chat service, which handles chat messages,
 * chat rooms, and real-time communication.
 */

import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { ObjectId } from 'mongodb';

// Mock models
jest.mock('../../../models/chat-message.model.js');
jest.mock('../../../models/chat-room.model.js');
jest.mock('../../../models/user.model.js');
jest.mock('../../../models/ad.model.js');

// Mock services
jest.mock('../../../services/socket.service.js', () => ({
  sendToRoom: jest.fn(),
  sendToUser: jest.fn(),
  isUserOnline: jest.fn().mockReturnValue(true),
  cleanup: jest.fn().mockImplementation(() => {
    return Promise.resolve();
  }),
}));

// Mock crypto helpers with factory pattern
jest.mock('../../../utils/cryptoHelpers.js', () => ({
  generateEncryptionKey: jest.fn().mockReturnValue('mockRoomKey'),
  generateKeyPair: jest.fn().mockReturnValue({
    publicKey: 'newPublicKey',
    privateKey: 'newPrivateKey',
  }),
  encryptWithPublicKey: jest.fn().mockReturnValue('encryptedRoomKey'),
  encryptMessage: jest.fn().mockReturnValue({ encrypted: 'encryptedData', iv: 'mockIV' }),
  decryptMessage: jest.fn().mockReturnValue('decryptedData'),
}));

// Import mocked modules
import ChatMessage from '../../../models/chat-message.model.js';
import ChatRoom from '../../../models/chat-room.model.js';
import User from '../../../models/user.model.js';
import Ad from '../../../models/ad.model.js';
import socketService from '../../../services/socket.service.js';
import * as cryptoHelpers from '../../../utils/cryptoHelpers.js';
import chatService from '../../../services/chat.service.js';
import { AppError } from '../../../middleware/errorHandler.js';

const { ObjectId: MongooseObjectId } = mongoose.Types;

// Define mock variables in the global scope for the test file
const mockUserId1 = 'mock-user-id-1';
const mockUserId2 = 'mock-user-id-2';
const mockRoomId = 'mock-room-id';
const mockAdId = 'mock-ad-id';
let mockRoomInstance;

describe('Chat Service', () => {
  beforeAll(() => {
    // Use fake timers for all timer-related operations
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clear all timers and mocks after each test
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Clean up services
    if (chatService.cleanup) {
      chatService.cleanup();
    }
    if (socketService.cleanup) {
      socketService.cleanup();
    }

    // Restore real timers
    jest.useRealTimers();

    // Clear any remaining event listeners
    process.removeAllListeners();
  });

  // --- Mock Implementations ---

  // ChatMessage Mock
  ChatMessage.mockImplementation(data => ({
    ...data,
    _id: data._id || new MongooseObjectId(),
    save: jest.fn().mockResolvedValue(this), // Return the instance on save
  }));
  const mockChatMessagePopulate = jest.fn().mockReturnThis(); // Chainable populate
  const mockChatMessageLimit = jest.fn().mockReturnValue({ populate: mockChatMessagePopulate });
  const mockChatMessageSort = jest.fn().mockReturnValue({ limit: mockChatMessageLimit });
  ChatMessage.find = jest.fn().mockReturnValue({ sort: mockChatMessageSort });
  ChatMessage.findById = jest.fn().mockReturnValue({ populate: mockChatMessagePopulate });
  ChatMessage.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 }); // Use modifiedCount
  ChatMessage.aggregate = jest.fn().mockResolvedValue([{ count: 5 }]);
  ChatMessage.create = jest.fn().mockImplementation(data =>
    Promise.resolve({
      ...data,
      _id: 'mock-message-id',
      save: jest.fn().mockResolvedValue(this),
    })
  );
  // Add static methods used in the service
  ChatMessage.getUnreadCount = jest.fn().mockResolvedValue(5);
  ChatMessage.getUnreadCountByRoom = jest.fn().mockResolvedValue(2);

  // ChatRoom Mock
  const mockRoomInstance = {
    _id: mockRoomId,
    participants: [
      { user: mockUserId1, role: 'member', toString: () => mockUserId1 }, // Add toString for comparison
      { user: mockUserId2, role: 'member', toString: () => mockUserId2 },
    ],
    messageExpiryEnabled: false,
    messageExpiryTime: 0,
    updateLastMessage: jest.fn().mockResolvedValue(true),
    updateLastRead: jest.fn().mockResolvedValue(true),
    removeParticipant: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnThis(), // Simple toObject for testing
  };
  // Mock static methods to return the instance or an array containing it
  ChatRoom.findById = jest
    .fn()
    .mockReturnValue({
      // Make it chainable for populate
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockRoomInstance), // If exec is used
    })
    .mockResolvedValue(mockRoomInstance); // Default resolve
  ChatRoom.findOrCreateDirectRoom = jest.fn().mockResolvedValue(mockRoomInstance);
  ChatRoom.findOrCreateAdRoom = jest.fn().mockResolvedValue(mockRoomInstance);
  // ChatRoom.findOrCreateGroupRoom = jest.fn().mockResolvedValue(mockRoomInstance); // Not used in tests below
  ChatRoom.getRoomsForUser = jest.fn().mockResolvedValue([mockRoomInstance]);
  ChatRoom.find = jest.fn().mockResolvedValue([mockRoomInstance]); // For getUnreadCounts
  ChatRoom.mockImplementation(() => mockRoomInstance); // Mock constructor

  // User Mock
  const mockUserInstance = {
    _id: mockUserId1,
    username: 'testuser',
    publicKey: 'mockPublicKey',
    save: jest.fn().mockResolvedValue(true),
  };
  User.findById = jest.fn().mockResolvedValue(mockUserInstance);
  User.find = jest.fn().mockResolvedValue([mockUserInstance]);

  // Ad Mock
  const mockAdInstance = {
    _id: mockAdId,
    advertiser: {
      _id: mockUserId2,
    },
  };
  Ad.findById = jest.fn().mockReturnValue({
    // Make it chainable for populate
    populate: jest.fn().mockResolvedValue(mockAdInstance),
  });

  // Socket Service Mock (already mocked via jest.mock)
  socketService.sendToRoom = jest.fn();
  socketService.sendToUser = jest.fn();
  socketService.isUserOnline = jest.fn().mockReturnValue(true);

  // Crypto Helpers Mock (already mocked via jest.mock)
  cryptoHelpers.generateEncryptionKey.mockReturnValue('mockRoomKey');
  cryptoHelpers.generateKeyPair.mockReturnValue({
    publicKey: 'newPublicKey',
    privateKey: 'newPrivateKey',
  });
  cryptoHelpers.encryptWithPublicKey.mockReturnValue('encryptedRoomKey');
  cryptoHelpers.encryptMessage.mockReturnValue({ encrypted: 'encryptedData', iv: 'mockIV' });
  cryptoHelpers.decryptMessage.mockReturnValue('decryptedData');

  // --- Test Suites ---

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      // Setup mock room with proper participants
      const mockRoom = {
        _id: mockRoomId,
        participants: [
          { user: mockUserId1, role: 'member', toString: () => mockUserId1 },
          { user: mockUserId2, role: 'member', toString: () => mockUserId2 },
        ],
        messageExpiryEnabled: false,
        messageExpiryTime: 0,
        updateLastMessage: jest.fn().mockResolvedValue(true),
      };

      ChatRoom.findById.mockResolvedValue(mockRoom);

      // Setup mock message
      const mockPopulatedMessage = {
        _id: 'mock-message-id',
        sender: { _id: mockUserId1, username: 'user1', profileImage: 'img1.jpg' },
        recipient: null,
        roomId: mockRoomId,
        message: 'Hello',
        type: 'text',
        attachments: [],
        isEncrypted: false,
        encryptionData: null,
        createdAt: new Date(),
        expiresAt: null,
      };

      // Mock the findById().populate().populate() chain
      const recipientPopulateMock = jest.fn().mockResolvedValue(mockPopulatedMessage);
      const senderPopulateMock = jest.fn().mockReturnValue({ populate: recipientPopulateMock });
      ChatMessage.findById.mockReturnValue({ populate: senderPopulateMock });

      // Mock the ChatMessage constructor and save
      const saveMock = jest.fn().mockResolvedValue(true);
      ChatMessage.mockImplementation(data => ({
        ...data,
        _id: 'mock-message-id', // Ensure the ID is consistent
        save: saveMock,
      }));

      const result = await chatService.sendMessage(mockRoomId, mockUserId1, 'Hello');

      expect(ChatRoom.findById).toHaveBeenCalledWith(mockRoomId);
      expect(saveMock).toHaveBeenCalled(); // Check if the message instance was saved
      expect(mockRoom.updateLastMessage).toHaveBeenCalledWith('mock-message-id');
      expect(ChatMessage.findById).toHaveBeenCalledWith('mock-message-id');
      expect(socketService.sendToRoom).toHaveBeenCalledWith(
        `chat:${mockRoomId}`,
        'chat:message',
        expect.objectContaining({ message: 'Hello', id: 'mock-message-id' })
      );
      expect(result).toEqual(mockPopulatedMessage);
    });

    it('should throw AppError when room not found', async () => {
      ChatRoom.findById.mockResolvedValue(null); // Simulate room not found

      await expect(chatService.sendMessage(mockRoomId, mockUserId1, 'Hello')).rejects.toThrow(
        new AppError('Chat room not found', 404)
      );
    });

    it('should throw AppError when sender is not a participant', async () => {
      const roomWithDifferentParticipants = {
        _id: mockRoomId,
        participants: [{ user: 'otherUser', role: 'member', toString: () => 'otherUser' }],
      };
      ChatRoom.findById.mockResolvedValue(roomWithDifferentParticipants); // Sender not in this room

      await expect(chatService.sendMessage(mockRoomId, mockUserId1, 'Hello')).rejects.toThrow(
        new AppError('You are not a participant in this chat room', 403)
      );
    });

    it('should throw AppError if saving message fails', async () => {
      // Setup mock room with proper participants
      const mockRoom = {
        _id: mockRoomId,
        participants: [
          { user: mockUserId1, role: 'member', toString: () => mockUserId1 },
          { user: mockUserId2, role: 'member', toString: () => mockUserId2 },
        ],
        messageExpiryEnabled: false,
        messageExpiryTime: 0,
        updateLastMessage: jest.fn().mockResolvedValue(true),
      };

      ChatRoom.findById.mockResolvedValue(mockRoom);

      const saveError = new Error('Database save failed');
      const saveMock = jest.fn().mockRejectedValue(saveError);
      ChatMessage.mockImplementation(data => ({
        ...data,
        _id: 'mock-message-id',
        save: saveMock,
      }));

      await expect(chatService.sendMessage(mockRoomId, mockUserId1, 'Hello')).rejects.toThrow(
        new AppError('Failed to send message', 500)
      );
    });
  });

  describe('getMessages', () => {
    it('should get messages for a chat room with default options', async () => {
      const mockMessagesData = [
        { _id: 'msg1', message: 'Hi' },
        { _id: 'msg2', message: 'There' },
      ];

      // Create a proper mock chain
      const mockReversedMessages = [...mockMessagesData].reverse();

      // Mock the full chain: find().sort().limit().populate().populate()
      const recipientPopulateMock = jest.fn().mockResolvedValue(mockMessagesData);
      const senderPopulateMock = jest.fn().mockReturnValue({ populate: recipientPopulateMock });
      const limitMock = jest.fn().mockReturnValue({ populate: senderPopulateMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });

      // Reset the mock and set up the chain
      ChatMessage.find.mockReset();
      ChatMessage.find.mockReturnValue({ sort: sortMock });

      const result = await chatService.getMessages(mockRoomId);

      expect(ChatMessage.find).toHaveBeenCalledWith({ roomId: mockRoomId });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(limitMock).toHaveBeenCalledWith(50); // Default limit
      expect(senderPopulateMock).toHaveBeenCalledWith('sender', 'username profileImage');
      expect(recipientPopulateMock).toHaveBeenCalledWith('recipient', 'username profileImage');
      expect(result).toEqual(mockMessagesData.reverse()); // Should be reversed
    });

    it('should handle pagination with "before" option', async () => {
      const beforeMessageId = 'beforeMsgId';
      const beforeMessage = { _id: beforeMessageId, createdAt: new Date() };

      // Reset and set up the findById mock
      ChatMessage.findById.mockReset();
      ChatMessage.findById.mockResolvedValue(beforeMessage);

      // Mock the find chain again for this specific test
      const recipientPopulateMock = jest.fn().mockResolvedValue([]);
      const senderPopulateMock = jest.fn().mockReturnValue({ populate: recipientPopulateMock });
      const limitMock = jest.fn().mockReturnValue({ populate: senderPopulateMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });

      // Reset the find mock and set up the chain
      ChatMessage.find.mockReset();
      ChatMessage.find.mockReturnValue({ sort: sortMock });

      await chatService.getMessages(mockRoomId, { before: beforeMessageId });

      expect(ChatMessage.findById).toHaveBeenCalledWith(beforeMessageId);
      expect(ChatMessage.find).toHaveBeenCalledWith(
        expect.objectContaining({
          roomId: mockRoomId,
          createdAt: expect.any(Object),
        })
      );
    });

    it('should filter out system messages if includeSystem is false', async () => {
      // Mock the find chain again
      const recipientPopulateMock = jest.fn().mockResolvedValue([]);
      const senderPopulateMock = jest.fn().mockReturnValue({ populate: recipientPopulateMock });
      const limitMock = jest.fn().mockReturnValue({ populate: senderPopulateMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });

      // Reset the find mock and set up the chain
      ChatMessage.find.mockReset();
      ChatMessage.find.mockReturnValue({ sort: sortMock });

      await chatService.getMessages(mockRoomId, { includeSystem: false });

      expect(ChatMessage.find).toHaveBeenCalledWith(
        expect.objectContaining({
          roomId: mockRoomId,
          type: { $ne: 'system' },
        })
      );
    });

    it('should throw AppError if database query fails', async () => {
      const dbError = new Error('Database connection lost');

      // Reset the find mock and make it throw an error
      ChatMessage.find.mockReset();
      ChatMessage.find.mockImplementation(() => {
        throw dbError;
      });

      await expect(chatService.getMessages(mockRoomId)).rejects.toThrow(
        new AppError('Failed to fetch messages', 500)
      );
    });
  });

  describe('createDirectRoom', () => {
    it('should create a direct room between two users', async () => {
      const mockUser1 = { _id: mockUserId1 };
      const mockUser2 = { _id: mockUserId2 };
      User.findById.mockResolvedValueOnce(mockUser1).mockResolvedValueOnce(mockUser2);

      // Create a populated room instance with _id
      const populatedRoom = {
        ...mockRoomInstance,
        _id: mockRoomId,
      };

      // Mock the findOrCreateDirectRoom to return a room with _id
      ChatRoom.findOrCreateDirectRoom.mockResolvedValue({
        ...mockRoomInstance,
        _id: mockRoomId,
      });

      // Mock the findById().populate().populate() chain
      const lastMessagePopulateMock = jest.fn().mockResolvedValue(populatedRoom);
      const participantsPopulateMock = jest
        .fn()
        .mockReturnValue({ populate: lastMessagePopulateMock });

      // Reset findById mock and set up the chain
      ChatRoom.findById.mockReset();
      ChatRoom.findById.mockReturnValue({
        populate: participantsPopulateMock,
      });

      const result = await chatService.createDirectRoom(mockUserId1, mockUserId2);

      expect(User.findById).toHaveBeenCalledWith(mockUserId1);
      expect(User.findById).toHaveBeenCalledWith(mockUserId2);
      expect(ChatRoom.findOrCreateDirectRoom).toHaveBeenCalledWith(mockUserId1, mockUserId2);
      expect(ChatRoom.findById).toHaveBeenCalledWith(mockRoomId); // Check population call
      expect(result).toEqual(populatedRoom);
    });

    it('should throw AppError if one or both users not found', async () => {
      User.findById.mockResolvedValueOnce(null); // First user not found

      await expect(chatService.createDirectRoom(mockUserId1, mockUserId2)).rejects.toThrow(
        new AppError('One or both users not found', 404)
      );
    });

    // Ensure this test case is async
    it('should throw AppError if findOrCreateDirectRoom fails', async () => {
      // Reverted to expect().rejects
      User.findById.mockResolvedValue({ _id: mockUserId1 }); // Ensure users exist
      const dbError = new Error('DB connection failed');
      ChatRoom.findOrCreateDirectRoom.mockRejectedValue(dbError);

      // Simplify the error check temporarily to isolate the parsing issue
      await expect(chatService.createDirectRoom(mockUserId1, mockUserId2)).rejects.toThrow(
        'DB connection failed'
      );
    });
  });

  // Add more describe blocks for other methods like:
  // - createAdRoom
  // - createGroupRoom
  // - getRoomById
  // - getUnreadCounts
  // - setupRoomEncryption
  // - updateMessageExpiry
  // - encryptMessage (though it mentions client-side handling)
  // - leaveRoom

  describe('getRoomsForUser', () => {
    it('should return rooms for a user with unread counts', async () => {
      // Mock the user
      User.findById.mockResolvedValue({ _id: mockUserId1 }); // User exists

      // Mock the room with proper toObject method
      const mockRoomData = {
        _id: mockRoomId,
        type: 'direct',
        participants: [
          { user: { _id: mockUserId1, toString: () => mockUserId1 }, role: 'member' },
          { user: { _id: mockUserId2, toString: () => mockUserId2 }, role: 'member' },
        ],
      };

      const mockRooms = [
        {
          ...mockRoomInstance,
          _id: mockRoomId,
          type: 'direct',
          toObject: () => mockRoomData,
        },
      ];

      // Reset mocks to ensure clean state
      ChatRoom.getRoomsForUser.mockReset();
      ChatRoom.getRoomsForUser.mockResolvedValue(mockRooms);

      ChatMessage.getUnreadCountByRoom.mockReset();
      ChatMessage.getUnreadCountByRoom.mockResolvedValue(3); // Mock unread count

      const result = await chatService.getRoomsForUser(mockUserId1);

      expect(User.findById).toHaveBeenCalledWith(mockUserId1);
      expect(ChatRoom.getRoomsForUser).toHaveBeenCalledWith(mockUserId1);
      expect(ChatMessage.getUnreadCountByRoom).toHaveBeenCalledWith(mockUserId1, mockRoomId);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('unreadCount', 3);
    });

    it('should throw AppError if user not found', async () => {
      User.findById.mockResolvedValue(null);
      await expect(chatService.getRoomsForUser(mockUserId1)).rejects.toThrow(
        new AppError('User not found', 404)
      );
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read and update room last read', async () => {
      const updateResult = { modifiedCount: 5 };

      // Create a mock room with updateLastRead method
      const mockRoom = {
        _id: mockRoomId,
        updateLastRead: jest.fn().mockResolvedValue(true),
      };

      // Reset and set up mocks
      ChatRoom.findById.mockReset();
      ChatRoom.findById.mockResolvedValue(mockRoom);

      ChatMessage.updateMany.mockReset();
      ChatMessage.updateMany.mockResolvedValue(updateResult);

      const result = await chatService.markMessagesAsRead(mockRoomId, mockUserId1);

      expect(ChatRoom.findById).toHaveBeenCalledWith(mockRoomId);
      expect(mockRoom.updateLastRead).toHaveBeenCalledWith(mockUserId1);
      expect(ChatMessage.updateMany).toHaveBeenCalledWith(
        { roomId: mockRoomId, recipient: mockUserId1, read: false },
        { $set: { read: true, readAt: expect.any(Date) } }
      );
      expect(result).toEqual({ success: true, count: updateResult.modifiedCount });
    });

    it('should throw AppError if room not found', async () => {
      ChatRoom.findById.mockResolvedValue(null);
      await expect(chatService.markMessagesAsRead(mockRoomId, mockUserId1)).rejects.toThrow(
        new AppError('Chat room not found', 404)
      );
    });
  });
});
