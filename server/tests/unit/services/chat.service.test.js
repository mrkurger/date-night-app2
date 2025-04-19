/**
 * Chat Service Unit Tests
 *
 * Tests the functionality of the chat service, which handles chat messages,
 * chat rooms, and real-time communication.
 */

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const chatService = require('../../../services/chat.service');
const ChatMessage = require('../../../models/chat-message.model');
const ChatRoom = require('../../../models/chat-room.model');
const User = require('../../../models/user.model');
const Ad = require('../../../models/ad.model');
const socketService = require('../../../services/socket.service');
const cryptoHelpers = require('../../../utils/cryptoHelpers');
const { AppError } = require('../../../middleware/errorHandler');

// Mock dependencies
jest.mock('../../../models/chat-message.model');
jest.mock('../../../models/chat-room.model');
jest.mock('../../../models/user.model');
jest.mock('../../../models/ad.model');
jest.mock('../../../services/socket.service');
jest.mock('../../../utils/cryptoHelpers');

describe('Chat Service', () => {
  // Setup common test variables
  const mockUserId1 = new ObjectId();
  const mockUserId2 = new ObjectId();
  const mockRoomId = new ObjectId();
  const mockMessageId = new ObjectId();
  const mockAdId = new ObjectId();

  // Sample message data for testing
  const mockMessageData = {
    text: 'Hello, this is a test message',
    attachments: [],
    encrypted: false,
  };

  // Sample message object returned from database
  const mockMessage = {
    _id: mockMessageId,
    sender: mockUserId1,
    roomId: mockRoomId,
    message: 'Hello, this is a test message',
    attachments: [],
    type: 'text',
    encrypted: false,
    createdAt: new Date(),
    readAt: null,
    toObject: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
  };

  // Sample chat room object
  const mockRoom = {
    _id: mockRoomId,
    type: 'direct',
    participants: [
      { user: mockUserId1, role: 'member' },
      { user: mockUserId2, role: 'member' },
    ],
    lastMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue(true),
    updateLastMessage: jest.fn().mockResolvedValue(true),
    updateLastActivity: jest.fn().mockResolvedValue(true),
    updateLastReadTimestamp: jest.fn().mockResolvedValue(true),
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should get messages for a chat room with default options', async () => {
      // Mock the ChatMessage.find method
      const mockMessages = [mockMessage];
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockResolvedValue(mockMessages);

      ChatMessage.find.mockReturnValue({
        sort: sortMock,
        limit: limitMock,
        populate: populateMock,
      });

      // Call the service method
      const result = await chatService.getMessages(mockRoomId.toString());

      // Assertions
      expect(ChatMessage.find).toHaveBeenCalledWith({
        roomId: mockRoomId.toString(),
      });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(limitMock).toHaveBeenCalledWith(50);
      expect(populateMock).toHaveBeenCalledWith('sender', 'username profilePicture');
      expect(result).toEqual(mockMessages);
    });

    it('should get messages with pagination using before parameter', async () => {
      // Mock the ChatMessage.findById method
      const beforeDate = new Date();
      ChatMessage.findById.mockResolvedValue({
        createdAt: beforeDate,
      });

      // Mock the ChatMessage.find method
      const mockMessages = [mockMessage];
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockResolvedValue(mockMessages);

      ChatMessage.find.mockReturnValue({
        sort: sortMock,
        limit: limitMock,
        populate: populateMock,
      });

      // Call the service method
      const options = {
        limit: 20,
        before: mockMessageId.toString(),
      };
      const result = await chatService.getMessages(mockRoomId.toString(), options);

      // Assertions
      expect(ChatMessage.findById).toHaveBeenCalledWith(mockMessageId.toString());
      expect(ChatMessage.find).toHaveBeenCalledWith({
        roomId: mockRoomId.toString(),
        createdAt: { $lt: beforeDate },
      });
      expect(limitMock).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockMessages);
    });

    it('should get messages with pagination using after parameter', async () => {
      // Mock the ChatMessage.findById method
      const afterDate = new Date();
      ChatMessage.findById.mockResolvedValue({
        createdAt: afterDate,
      });

      // Mock the ChatMessage.find method
      const mockMessages = [mockMessage];
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockResolvedValue(mockMessages);

      ChatMessage.find.mockReturnValue({
        sort: sortMock,
        limit: limitMock,
        populate: populateMock,
      });

      // Call the service method
      const options = {
        limit: 20,
        after: mockMessageId.toString(),
      };
      const result = await chatService.getMessages(mockRoomId.toString(), options);

      // Assertions
      expect(ChatMessage.findById).toHaveBeenCalledWith(mockMessageId.toString());
      expect(ChatMessage.find).toHaveBeenCalledWith({
        roomId: mockRoomId.toString(),
        createdAt: { $gt: afterDate },
      });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(limitMock).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockMessages);
    });

    it('should exclude system messages when includeSystem is false', async () => {
      // Mock the ChatMessage.find method
      const mockMessages = [mockMessage];
      const sortMock = jest.fn().mockReturnThis();
      const limitMock = jest.fn().mockReturnThis();
      const populateMock = jest.fn().mockResolvedValue(mockMessages);

      ChatMessage.find.mockReturnValue({
        sort: sortMock,
        limit: limitMock,
        populate: populateMock,
      });

      // Call the service method
      const options = { includeSystem: false };
      const result = await chatService.getMessages(mockRoomId.toString(), options);

      // Assertions
      expect(ChatMessage.find).toHaveBeenCalledWith({
        roomId: mockRoomId.toString(),
        type: { $ne: 'system' },
      });
      expect(result).toEqual(mockMessages);
    });

    it('should throw an error if database query fails', async () => {
      // Mock the ChatMessage.find method to throw an error
      const errorMessage = 'Database error';
      ChatMessage.find.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Call the service method and expect it to throw
      await expect(chatService.getMessages(mockRoomId.toString())).rejects.toThrow(
        'Error fetching messages: ' + errorMessage
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      // Mock the ChatRoom.findById method
      ChatRoom.findById.mockResolvedValue(mockRoom);

      // Mock the ChatMessage.create method
      const createdMessage = { ...mockMessage };
      ChatMessage.create.mockResolvedValue(createdMessage);

      // Mock the socketService.emitToRoom method
      socketService.emitToRoom.mockReturnValue(true);

      // Call the service method
      const result = await chatService.sendMessage(
        mockRoomId.toString(),
        mockUserId1.toString(),
        mockMessageData
      );

      // Assertions
      expect(ChatRoom.findById).toHaveBeenCalledWith(mockRoomId.toString());
      expect(ChatMessage.create).toHaveBeenCalledWith({
        roomId: mockRoomId.toString(),
        sender: mockUserId1.toString(),
        message: mockMessageData.text,
        attachments: mockMessageData.attachments,
        encrypted: mockMessageData.encrypted,
        type: 'text',
      });
      expect(mockRoom.updateLastMessage).toHaveBeenCalledWith(createdMessage);
      expect(mockRoom.updateLastActivity).toHaveBeenCalled();
      expect(socketService.emitToRoom).toHaveBeenCalledWith(
        mockRoomId.toString(),
        'new_message',
        expect.any(Object)
      );
      expect(result).toEqual(createdMessage);
    });

    it('should throw an error if room is not found', async () => {
      // Mock the ChatRoom.findById method to return null
      ChatRoom.findById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(
        chatService.sendMessage(mockRoomId.toString(), mockUserId1.toString(), mockMessageData)
      ).rejects.toThrow('Chat room not found');
    });

    it('should throw an error if user is not a participant in the room', async () => {
      // Mock the ChatRoom.findById method
      const roomWithoutUser = {
        ...mockRoom,
        participants: [{ user: mockUserId2, role: 'member' }],
      };
      ChatRoom.findById.mockResolvedValue(roomWithoutUser);

      // Call the service method and expect it to throw
      await expect(
        chatService.sendMessage(mockRoomId.toString(), mockUserId1.toString(), mockMessageData)
      ).rejects.toThrow('User is not a participant in this chat room');
    });

    it('should encrypt message if encryption is enabled', async () => {
      // Mock the ChatRoom.findById method
      ChatRoom.findById.mockResolvedValue(mockRoom);

      // Mock the cryptoHelpers.encryptMessage method
      const encryptedText = 'encrypted-message';
      cryptoHelpers.encryptMessage.mockReturnValue(encryptedText);

      // Mock the ChatMessage.create method
      const createdMessage = {
        ...mockMessage,
        message: encryptedText,
        encrypted: true,
      };
      ChatMessage.create.mockResolvedValue(createdMessage);

      // Call the service method
      const messageData = {
        ...mockMessageData,
        encrypted: true,
      };
      const result = await chatService.sendMessage(
        mockRoomId.toString(),
        mockUserId1.toString(),
        messageData
      );

      // Assertions
      expect(cryptoHelpers.encryptMessage).toHaveBeenCalledWith(messageData.text);
      expect(ChatMessage.create).toHaveBeenCalledWith({
        roomId: mockRoomId.toString(),
        sender: mockUserId1.toString(),
        message: encryptedText,
        attachments: messageData.attachments,
        encrypted: true,
        type: 'text',
      });
      expect(result).toEqual(createdMessage);
    });

    it('should throw an error if message creation fails', async () => {
      // Mock the ChatRoom.findById method
      ChatRoom.findById.mockResolvedValue(mockRoom);

      // Mock the ChatMessage.create method to throw an error
      const errorMessage = 'Failed to create message';
      ChatMessage.create.mockRejectedValue(new Error(errorMessage));

      // Call the service method and expect it to throw
      await expect(
        chatService.sendMessage(mockRoomId.toString(), mockUserId1.toString(), mockMessageData)
      ).rejects.toThrow('Error sending message: ' + errorMessage);
    });
  });

  describe('createDirectRoom', () => {
    it('should create a direct chat room between two users', async () => {
      // Mock the User.findById method
      User.findById.mockImplementation(id => {
        if (id.toString() === mockUserId1.toString()) {
          return Promise.resolve({ _id: mockUserId1, username: 'user1' });
        } else if (id.toString() === mockUserId2.toString()) {
          return Promise.resolve({ _id: mockUserId2, username: 'user2' });
        }
        return Promise.resolve(null);
      });

      // Mock the ChatRoom.findOne method to return null (no existing room)
      ChatRoom.findOne.mockResolvedValue(null);

      // Mock the ChatRoom.create method
      ChatRoom.create.mockResolvedValue(mockRoom);

      // Call the service method
      const result = await chatService.createDirectRoom(
        mockUserId1.toString(),
        mockUserId2.toString()
      );

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(mockUserId1.toString());
      expect(User.findById).toHaveBeenCalledWith(mockUserId2.toString());
      expect(ChatRoom.findOne).toHaveBeenCalled();
      expect(ChatRoom.create).toHaveBeenCalledWith({
        type: 'direct',
        participants: [
          { user: mockUserId1.toString(), role: 'member' },
          { user: mockUserId2.toString(), role: 'member' },
        ],
      });
      expect(result).toEqual(mockRoom);
    });

    it('should return existing room if one already exists', async () => {
      // Mock the User.findById method
      User.findById.mockImplementation(id => {
        if (id.toString() === mockUserId1.toString()) {
          return Promise.resolve({ _id: mockUserId1, username: 'user1' });
        } else if (id.toString() === mockUserId2.toString()) {
          return Promise.resolve({ _id: mockUserId2, username: 'user2' });
        }
        return Promise.resolve(null);
      });

      // Mock the ChatRoom.findOne method to return an existing room
      ChatRoom.findOne.mockResolvedValue(mockRoom);

      // Call the service method
      const result = await chatService.createDirectRoom(
        mockUserId1.toString(),
        mockUserId2.toString()
      );

      // Assertions
      expect(User.findById).toHaveBeenCalledWith(mockUserId1.toString());
      expect(User.findById).toHaveBeenCalledWith(mockUserId2.toString());
      expect(ChatRoom.findOne).toHaveBeenCalled();
      expect(ChatRoom.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockRoom);
    });

    it('should throw an error if user1 is not found', async () => {
      // Mock the User.findById method
      User.findById.mockImplementation(id => {
        if (id.toString() === mockUserId1.toString()) {
          return Promise.resolve(null);
        } else if (id.toString() === mockUserId2.toString()) {
          return Promise.resolve({ _id: mockUserId2, username: 'user2' });
        }
        return Promise.resolve(null);
      });

      // Call the service method and expect it to throw
      await expect(
        chatService.createDirectRoom(mockUserId1.toString(), mockUserId2.toString())
      ).rejects.toThrow('User not found');
    });

    it('should throw an error if user2 is not found', async () => {
      // Mock the User.findById method
      User.findById.mockImplementation(id => {
        if (id.toString() === mockUserId1.toString()) {
          return Promise.resolve({ _id: mockUserId1, username: 'user1' });
        } else if (id.toString() === mockUserId2.toString()) {
          return Promise.resolve(null);
        }
        return Promise.resolve(null);
      });

      // Call the service method and expect it to throw
      await expect(
        chatService.createDirectRoom(mockUserId1.toString(), mockUserId2.toString())
      ).rejects.toThrow('User not found');
    });

    it('should throw an error if room creation fails', async () => {
      // Mock the User.findById method
      User.findById.mockImplementation(id => {
        if (id.toString() === mockUserId1.toString()) {
          return Promise.resolve({ _id: mockUserId1, username: 'user1' });
        } else if (id.toString() === mockUserId2.toString()) {
          return Promise.resolve({ _id: mockUserId2, username: 'user2' });
        }
        return Promise.resolve(null);
      });

      // Mock the ChatRoom.findOne method to return null (no existing room)
      ChatRoom.findOne.mockResolvedValue(null);

      // Mock the ChatRoom.create method to throw an error
      const errorMessage = 'Failed to create room';
      ChatRoom.create.mockRejectedValue(new Error(errorMessage));

      // Call the service method and expect it to throw
      await expect(
        chatService.createDirectRoom(mockUserId1.toString(), mockUserId2.toString())
      ).rejects.toThrow('Error creating chat room: ' + errorMessage);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read for a user in a room', async () => {
      // Mock the ChatRoom.findById method
      ChatRoom.findById.mockResolvedValue(mockRoom);

      // Mock the ChatMessage.updateMany method
      const updateResult = { nModified: 5 };
      ChatMessage.updateMany.mockResolvedValue(updateResult);

      // Call the service method
      const result = await chatService.markMessagesAsRead(
        mockRoomId.toString(),
        mockUserId1.toString()
      );

      // Assertions
      expect(ChatRoom.findById).toHaveBeenCalledWith(mockRoomId.toString());
      expect(ChatMessage.updateMany).toHaveBeenCalledWith(
        {
          roomId: mockRoomId.toString(),
          sender: { $ne: mockUserId1.toString() },
          readAt: null,
        },
        {
          $set: { readAt: expect.any(Date) },
        }
      );
      expect(mockRoom.updateLastReadTimestamp).toHaveBeenCalledWith(
        mockUserId1.toString(),
        expect.any(Date)
      );
      expect(result).toEqual({ count: updateResult.nModified });
    });

    it('should throw an error if room is not found', async () => {
      // Mock the ChatRoom.findById method to return null
      ChatRoom.findById.mockResolvedValue(null);

      // Call the service method and expect it to throw
      await expect(
        chatService.markMessagesAsRead(mockRoomId.toString(), mockUserId1.toString())
      ).rejects.toThrow('Chat room not found');
    });

    it('should throw an error if user is not a participant in the room', async () => {
      // Mock the ChatRoom.findById method
      const roomWithoutUser = {
        ...mockRoom,
        participants: [{ user: mockUserId2, role: 'member' }],
      };
      ChatRoom.findById.mockResolvedValue(roomWithoutUser);

      // Call the service method and expect it to throw
      await expect(
        chatService.markMessagesAsRead(mockRoomId.toString(), mockUserId1.toString())
      ).rejects.toThrow('User is not a participant in this chat room');
    });

    it('should throw an error if message update fails', async () => {
      // Mock the ChatRoom.findById method
      ChatRoom.findById.mockResolvedValue(mockRoom);

      // Mock the ChatMessage.updateMany method to throw an error
      const errorMessage = 'Failed to update messages';
      ChatMessage.updateMany.mockRejectedValue(new Error(errorMessage));

      // Call the service method and expect it to throw
      await expect(
        chatService.markMessagesAsRead(mockRoomId.toString(), mockUserId1.toString())
      ).rejects.toThrow('Error marking messages as read: ' + errorMessage);
    });
  });
});
