// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the chat message model
//
// COMMON CUSTOMIZATIONS:
// - TEST_MESSAGE_DATA: Test message data (default: imported from helpers)
//   Related to: server/tests/helpers.js:TEST_MESSAGE_DATA
// ===================================================

import mongoose from 'mongoose';
import ChatMessage from '../../../models/chat-message.model.js';
import User from '../../../models/user.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts.js';
import { TEST_USER_DATA, TEST_MESSAGE_DATA } from '../../helpers.ts.js';

describe('ChatMessage Model', () => {
  let sender;
  let recipient;

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  // Create test users before each test
  beforeEach(async () => {
    // Create sender user
    const senderUser = new User({
      ...TEST_USER_DATA,
      username: 'sender',
      email: 'sender@example.com',
    });
    sender = await senderUser.save();

    // Create recipient user
    const recipientUser = new User({
      ...TEST_USER_DATA,
      username: 'recipient',
      email: 'recipient@example.com',
    });
    recipient = await recipientUser.save();
  });

  describe('Basic Validation', () => {
    it('should create a new chat message successfully', async () => {
      const messageData = {
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'Hello, this is a test message',
      };

      const chatMessage = new ChatMessage(messageData);
      const savedMessage = await chatMessage.save();

      // Verify the saved message
      expect(savedMessage._id).toBeDefined();
      expect(savedMessage.sender.toString()).toBe(sender._id.toString());
      expect(savedMessage.recipient.toString()).toBe(recipient._id.toString());
      expect(savedMessage.roomId).toBe('room123');
      expect(savedMessage.message).toBe('Hello, this is a test message');
      expect(savedMessage.read).toBe(false);
      expect(savedMessage.type).toBe('text');
      expect(savedMessage.createdAt).toBeDefined();
      expect(savedMessage.updatedAt).toBeDefined();
    });

    it('should require sender, roomId, and message', async () => {
      const messageWithoutRequiredFields = new ChatMessage({
        recipient: recipient._id,
      });

      // Expect validation to fail
      await expect(messageWithoutRequiredFields.save()).rejects.toThrow();
    });

    it('should enforce maximum message length', async () => {
      const messageWithLongText = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'a'.repeat(10001), // Too long (max is 10000)
      });

      await expect(messageWithLongText.save()).rejects.toThrow();
    });

    it('should trim whitespace from message', async () => {
      const messageWithWhitespace = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: '  Hello, this is a test message  ',
      });

      const savedMessage = await messageWithWhitespace.save();

      expect(savedMessage.message).toBe('Hello, this is a test message');
    });
  });

  describe('Attachments', () => {
    it('should support adding attachments', async () => {
      const messageWithAttachments = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'Check out these attachments',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            name: 'image.jpg',
            size: 1024,
            mimeType: 'image/jpeg',
          },
          {
            type: 'file',
            url: 'https://example.com/document.pdf',
            name: 'document.pdf',
            size: 2048,
            mimeType: 'application/pdf',
          },
        ],
      });

      const savedMessage = await messageWithAttachments.save();

      expect(savedMessage.attachments.length).toBe(2);
      expect(savedMessage.attachments[0].type).toBe('image');
      expect(savedMessage.attachments[0].url).toBe('https://example.com/image.jpg');
      expect(savedMessage.attachments[1].type).toBe('file');
      expect(savedMessage.attachments[1].name).toBe('document.pdf');
    });

    it('should validate attachment types', async () => {
      const messageWithInvalidAttachment = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'Invalid attachment type',
        attachments: [
          {
            type: 'invalid-type', // Invalid type
            url: 'https://example.com/file',
            name: 'file',
            size: 1024,
          },
        ],
      });

      await expect(messageWithInvalidAttachment.save()).rejects.toThrow();
    });
  });

  describe('Encryption', () => {
    it('should support encrypted messages', async () => {
      const encryptedMessage = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'U2FsdGVkX1/8kTxlINTpQZUfvLAIXy+N9GL1JH5wPX0=', // Encrypted content
        isEncrypted: true,
        encryptionData: {
          iv: 'abc123',
          authTag: 'def456',
        },
      });

      const savedMessage = await encryptedMessage.save();

      expect(savedMessage.isEncrypted).toBe(true);
      expect(savedMessage.encryptionData.iv).toBe('abc123');
      expect(savedMessage.encryptionData.authTag).toBe('def456');
    });

    it('should support encrypted attachments', async () => {
      const messageWithEncryptedAttachment = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'Encrypted attachment',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/encrypted.jpg',
            name: 'encrypted.jpg',
            size: 1024,
            mimeType: 'image/jpeg',
            isEncrypted: true,
            encryptionData: {
              iv: 'ghi789',
              authTag: 'jkl012',
            },
          },
        ],
      });

      const savedMessage = await messageWithEncryptedAttachment.save();

      expect(savedMessage.attachments[0].isEncrypted).toBe(true);
      expect(savedMessage.attachments[0].encryptionData.iv).toBe('ghi789');
      expect(savedMessage.attachments[0].encryptionData.authTag).toBe('jkl012');
    });
  });

  describe('Virtual Properties', () => {
    it('should correctly identify system messages', async () => {
      const systemMessage = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'User has joined the chat',
        type: 'system',
      });

      const savedMessage = await systemMessage.save();

      expect(savedMessage.isSystem).toBe(true);
    });

    it('should correctly identify non-system messages', async () => {
      const regularMessage = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'Hello there',
        type: 'text',
      });

      const savedMessage = await regularMessage.save();

      expect(savedMessage.isSystem).toBe(false);
    });

    it('should correctly identify messages with attachments', async () => {
      const messageWithAttachment = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'Check this out',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            name: 'image.jpg',
            size: 1024,
            mimeType: 'image/jpeg',
          },
        ],
      });

      const savedMessage = await messageWithAttachment.save();

      expect(savedMessage.hasAttachments).toBe(true);
    });

    it('should correctly identify messages without attachments', async () => {
      const messageWithoutAttachment = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'No attachments here',
      });

      const savedMessage = await messageWithoutAttachment.save();

      expect(savedMessage.hasAttachments).toBe(false);
    });
  });

  describe('Instance Methods', () => {
    it('should mark message as read', async () => {
      const message = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'Read this message',
      });

      const savedMessage = await message.save();

      // Initially message should be unread
      expect(savedMessage.read).toBe(false);
      expect(savedMessage.readAt).toBeUndefined();

      // Mark as read
      await savedMessage.markAsRead();

      // Message should now be marked as read
      expect(savedMessage.read).toBe(true);
      expect(savedMessage.readAt).toBeDefined();
    });

    it('should not update readAt if message is already read', async () => {
      const message = new ChatMessage({
        sender: sender._id,
        recipient: recipient._id,
        roomId: 'room123',
        message: 'Already read message',
        read: true,
        readAt: new Date('2023-01-01'),
      });

      const savedMessage = await message.save();
      const initialReadAt = savedMessage.readAt;

      // Try to mark as read again
      await savedMessage.markAsRead();

      // ReadAt should not change
      expect(savedMessage.readAt).toEqual(initialReadAt);
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test messages
      await ChatMessage.create([
        {
          sender: sender._id,
          recipient: recipient._id,
          roomId: 'room1',
          message: 'Message 1',
          read: false,
        },
        {
          sender: sender._id,
          recipient: recipient._id,
          roomId: 'room1',
          message: 'Message 2',
          read: true,
        },
        {
          sender: recipient._id,
          recipient: sender._id,
          roomId: 'room1',
          message: 'Message 3',
          read: false,
        },
        {
          sender: sender._id,
          recipient: recipient._id,
          roomId: 'room2',
          message: 'Message 4',
          read: false,
        },
      ]);
    });

    it('should get unread count for a user', async () => {
      const unreadCount = await ChatMessage.getUnreadCount(recipient._id);

      // recipient should have 2 unread messages (Message 1 and Message 4)
      expect(unreadCount).toBe(2);
    });

    it('should get unread count by room', async () => {
      const unreadCountRoom1 = await ChatMessage.getUnreadCountByRoom(recipient._id, 'room1');
      const unreadCountRoom2 = await ChatMessage.getUnreadCountByRoom(recipient._id, 'room2');

      // recipient should have 1 unread message in room1 (Message 1)
      expect(unreadCountRoom1).toBe(1);

      // recipient should have 1 unread message in room2 (Message 4)
      expect(unreadCountRoom2).toBe(1);
    });

    it('should get recent conversations', async () => {
      // Add one more message to ensure sorting works
      await ChatMessage.create({
        sender: recipient._id,
        recipient: sender._id,
        roomId: 'room2',
        message: 'Latest message',
        read: false,
        createdAt: new Date(Date.now() + 1000), // Ensure this is the latest
      });

      const conversations = await ChatMessage.getRecentConversations(sender._id);

      // Should have 2 conversations (room1 and room2)
      expect(conversations.length).toBe(2);

      // First conversation should be room2 (has the latest message)
      expect(conversations[0].roomId).toBe('room2');
      expect(conversations[0].latestMessage.message).toBe('Latest message');

      // Second conversation should be room1
      expect(conversations[1].roomId).toBe('room1');

      // Unread counts should be correct
      expect(conversations[0].unreadCount).toBe(1); // 1 unread in room2 for sender
      expect(conversations[1].unreadCount).toBe(1); // 1 unread in room1 for sender
    });
  });
});
