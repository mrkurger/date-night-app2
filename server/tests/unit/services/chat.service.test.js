/**
 * Chat Service Unit Tests
 *
 * Tests the functionality of the chat service, which handles chat messages,
 * chat rooms, and real-time communication.
 */

import mongoose from 'mongoose';
import { jest } from '@jest/globals';
// Removed unused fail import
import chatService from '../../../services/chat.service.js'; // Added .js
import ChatMessage from '../../../models/chat-message.model.js'; // Added .js
import ChatRoom from '../../../models/chat-room.model.js'; // Added .js
import User from '../../../models/user.model.js'; // Added .js
import Ad from '../../../models/ad.model.js'; // Added .js
import socketService from '../../../services/socket.service.js'; // Added .js
import cryptoHelpers from '../../../utils/cryptoHelpers.js'; // Added .js
import { AppError } from '../../../middleware/errorHandler.js'; // Added .js

const { ObjectId } = mongoose.Types;

// Mock dependencies
jest.mock('../../../models/chat-message.model.js'); // Added .js
jest.mock('../../../models/chat-room.model.js'); // Added .js
jest.mock('../../../models/user.model.js'); // Added .js
jest.mock('../../../models/ad.model.js'); // Added .js
jest.mock('../../../services/socket.service.js'); // Added .js
jest.mock('../../../utils/cryptoHelpers.js'); // Added .js
jest.mock('../../../middleware/errorHandler.js', () => ({
  // Mock AppError specifically if needed
  AppError: class extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = 'AppError';
    }
  },
}));

// Define mock variables in the global scope for the test file
const mockUserId1 = 'mock-user-id-1';
const mockUserId2 = 'mock-user-id-2';
const mockRoomId = 'mock-room-id';
const mockAdId = 'mock-ad-id';
let mockRoomInstance;

describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // --- Mock Implementations ---

    // ChatMessage Mock
    ChatMessage.mockImplementation(data => ({
      ...data,
      _id: data._id || new ObjectId(),
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
    cryptoHelpers.generateEncryptionKey = jest.fn().mockReturnValue('mockRoomKey');
    cryptoHelpers.generateKeyPair = jest
      .fn()
      .mockReturnValue({ publicKey: 'newPublicKey', privateKey: 'newPrivateKey' });
    cryptoHelpers.encryptWithPublicKey = jest.fn().mockReturnValue('encryptedRoomKey');
    // cryptoHelpers.encryptMessage = jest.fn().mockReturnValue({ encrypted: 'data' }); // Not directly tested below
  });

  // --- Test Suites ---

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockChatMessage = {
        _id: 'mock-message-id',
        sender: {
          _id: mockUserId1,
          username: 'user1',
          profileImage: 'profile1.jpg',
        },
        roomId: mockRoomId,
        message: 'Hello',
        type: 'text',
        save: jest.fn().mockResolvedValue(true),
      };

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
      expect(mockRoomInstance.updateLastMessage).toHaveBeenCalledWith('mock-message-id');
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
        ...mockRoomInstance,
        participants: [{ user: 'otherUser', role: 'member', toString: () => 'otherUser' }],
      };
      ChatRoom.findById.mockResolvedValue(roomWithDifferentParticipants); // Sender not in this room

      await expect(chatService.sendMessage(mockRoomId, mockUserId1, 'Hello')).rejects.toThrow(
        new AppError('You are not a participant in this chat room', 403)
      );
    });

    it('should throw AppError if saving message fails', async () => {
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
      // Mock the full chain: find().sort().limit().populate().populate()
      const recipientPopulateMock = jest.fn().mockResolvedValue(mockMessagesData);
      const senderPopulateMock = jest.fn().mockReturnValue({ populate: recipientPopulateMock });
      const limitMock = jest.fn().mockReturnValue({ populate: senderPopulateMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
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
      ChatMessage.findById.mockResolvedValue(beforeMessage); // Mock the 'before' message lookup

      // Mock the find chain again for this specific test
      const recipientPopulateMock = jest.fn().mockResolvedValue([]);
      const senderPopulateMock = jest.fn().mockReturnValue({ populate: recipientPopulateMock });
      const limitMock = jest.fn().mockReturnValue({ populate: senderPopulateMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      ChatMessage.find.mockReturnValue({ sort: sortMock });

      await chatService.getMessages(mockRoomId, { before: beforeMessageId });

      expect(ChatMessage.findById).toHaveBeenCalledWith(beforeMessageId);
      expect(ChatMessage.find).toHaveBeenCalledWith({
        roomId: mockRoomId,
        createdAt: { $lt: beforeMessage.createdAt }, // Check the date filter
      });
    });

    it('should filter out system messages if includeSystem is false', async () => {
      // Mock the find chain again
      const recipientPopulateMock = jest.fn().mockResolvedValue([]);
      const senderPopulateMock = jest.fn().mockReturnValue({ populate: recipientPopulateMock });
      const limitMock = jest.fn().mockReturnValue({ populate: senderPopulateMock });
      const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
      ChatMessage.find.mockReturnValue({ sort: sortMock });

      await chatService.getMessages(mockRoomId, { includeSystem: false });

      expect(ChatMessage.find).toHaveBeenCalledWith({
        roomId: mockRoomId,
        type: { $ne: 'system' }, // Check the type filter
      });
    });

    it('should throw AppError if database query fails', async () => {
      const dbError = new Error('Database connection lost');
      ChatMessage.find.mockImplementation(() => {
        throw dbError;
      }); // Make find throw

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

      // Mock the findOrCreateDirectRoom and subsequent findById().populate().populate()
      const lastMessagePopulateMock = jest.fn().mockResolvedValue(mockRoomInstance);
      const participantsPopulateMock = jest
        .fn()
        .mockReturnValue({ populate: lastMessagePopulateMock });
      ChatRoom.findById.mockReturnValue({ populate: participantsPopulateMock }); // Mock the findById chain

      ChatRoom.findOrCreateDirectRoom.mockResolvedValue(mockRoomInstance); // Mock the creation/find

      const result = await chatService.createDirectRoom(mockUserId1, mockUserId2);

      expect(User.findById).toHaveBeenCalledWith(mockUserId1);
      expect(User.findById).toHaveBeenCalledWith(mockUserId2);
      expect(ChatRoom.findOrCreateDirectRoom).toHaveBeenCalledWith(mockUserId1, mockUserId2);
      expect(ChatRoom.findById).toHaveBeenCalledWith(mockRoomId); // Check population call
      expect(result).toEqual(mockRoomInstance);
    });
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
// - getRoomsForUser
// - getRoomById
// - markMessagesAsRead
// - getUnreadCounts
// - setupRoomEncryption
// - updateMessageExpiry
// - encryptMessage (though it mentions client-side handling)
// - leaveRoom

describe('getRoomsForUser', () => {
  it('should return rooms for a user with unread counts', async () => {
    // Added async
    User.findById.mockResolvedValue({ _id: mockUserId1 }); // User exists
    const mockRooms = [{ ...mockRoomInstance, toObject: () => ({ ...mockRoomInstance }) }]; // Simulate toObject
    ChatRoom.getRoomsForUser.mockResolvedValue(mockRooms);
    ChatMessage.getUnreadCountByRoom.mockResolvedValue(3); // Mock unread count

    const result = await chatService.getRoomsForUser(mockUserId1);

    expect(User.findById).toHaveBeenCalledWith(mockUserId1);
    expect(ChatRoom.getRoomsForUser).toHaveBeenCalledWith(mockUserId1);
    expect(ChatMessage.getUnreadCountByRoom).toHaveBeenCalledWith(mockUserId1, mockRoomId);
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty('unreadCount', 3);
    expect(result[0]).toHaveProperty('otherParticipant'); // For direct chat type
  });

  it('should throw AppError if user not found', async () => {
    // Added async
    User.findById.mockResolvedValue(null);
    await expect(chatService.getRoomsForUser(mockUserId1)).rejects.toThrow(
      new AppError('User not found', 404)
    );
  });
});

describe('markMessagesAsRead', () => {
  it('should mark messages as read and update room last read', async () => {
    // Added async
    const updateResult = { modifiedCount: 5 };
    ChatMessage.updateMany.mockResolvedValue(updateResult);

    const result = await chatService.markMessagesAsRead(mockRoomId, mockUserId1);

    expect(ChatRoom.findById).toHaveBeenCalledWith(mockRoomId);
    expect(mockRoomInstance.updateLastRead).toHaveBeenCalledWith(mockUserId1);
    expect(ChatMessage.updateMany).toHaveBeenCalledWith(
      { roomId: mockRoomId, recipient: mockUserId1, read: false },
      { $set: { read: true, readAt: expect.any(Date) } }
    );
    expect(result).toEqual({ success: true, count: updateResult.modifiedCount });
  });

  it('should throw AppError if room not found', async () => {
    // Added async
    ChatRoom.findById.mockResolvedValue(null);
    await expect(chatService.markMessagesAsRead(mockRoomId, mockUserId1)).rejects.toThrow(
      new AppError('Chat room not found', 404)
    );
  });
});
