// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the chat attachment schema
//
// COMMON CUSTOMIZATIONS:
// - TEST_ATTACHMENT_DATA: Test attachment data
//   Related to: server/models/chat-attachment.schema.js
// ===================================================

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import ChatAttachment from '../../../models/chat-attachment.schema.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('ChatAttachment Schema', () => {
  // Setup test data
  const testUserId = new mongoose.Types.ObjectId();
  const testRoomId = new mongoose.Types.ObjectId();
  const testMessageId = new mongoose.Types.ObjectId();

  const TEST_ATTACHMENT_DATA = {
    name: 'test-file.jpg',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 1024 * 1024, // 1MB
    url: '/uploads/test-file.jpg',
    uploadedBy: testUserId,
    roomId: testRoomId,
    messageId: testMessageId,
    isEncrypted: false,
  };

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
    jest.clearAllMocks();
  });

  describe('Basic Validation', () => {
    it('should create a new attachment successfully', async () => {
      const attachment = new ChatAttachment(TEST_ATTACHMENT_DATA);
      const savedAttachment = await attachment.save();

      // Verify the saved attachment
      expect(savedAttachment._id).toBeDefined();
      expect(savedAttachment.name).toBe(TEST_ATTACHMENT_DATA.name);
      expect(savedAttachment.type).toBe(TEST_ATTACHMENT_DATA.type);
      expect(savedAttachment.mimeType).toBe(TEST_ATTACHMENT_DATA.mimeType);
      expect(savedAttachment.size).toBe(TEST_ATTACHMENT_DATA.size);
      expect(savedAttachment.url).toBe(TEST_ATTACHMENT_DATA.url);
      expect(savedAttachment.uploadedBy.toString()).toBe(testUserId.toString());
      expect(savedAttachment.roomId.toString()).toBe(testRoomId.toString());
      expect(savedAttachment.messageId.toString()).toBe(testMessageId.toString());
      expect(savedAttachment.isEncrypted).toBe(false);
      expect(savedAttachment.createdAt).toBeDefined();
    });

    it('should require name, type, mimeType, size, url, uploadedBy, roomId, and messageId', async () => {
      const attachmentWithoutRequiredFields = new ChatAttachment({
        // Missing required fields
      });

      // Expect validation to fail
      await expect(attachmentWithoutRequiredFields.save()).rejects.toThrow();
    });

    it('should validate mimeType against allowed types', async () => {
      const attachmentWithInvalidMimeType = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        mimeType: 'invalid/type',
      });

      // Expect validation to fail
      await expect(attachmentWithInvalidMimeType.save()).rejects.toThrow();
    });

    it('should validate file size against maximum allowed size', async () => {
      const attachmentWithExcessiveSize = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        size: 20 * 1024 * 1024, // 20MB (exceeds 10MB limit)
      });

      // Expect validation to fail
      await expect(attachmentWithExcessiveSize.save()).rejects.toThrow();
    });
  });

  describe('Encryption Validation', () => {
    it('should require encryption data when isEncrypted is true', async () => {
      const attachmentWithoutEncryptionData = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        isEncrypted: true,
        // Missing encryptionData
      });

      // Expect validation to fail
      await expect(attachmentWithoutEncryptionData.save()).rejects.toThrow();
    });

    it('should accept valid encryption data when isEncrypted is true', async () => {
      const attachmentWithEncryptionData = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        isEncrypted: true,
        encryptionData: {
          iv: 'test-iv',
          authTag: 'test-auth-tag',
        },
      });

      const savedAttachment = await attachmentWithEncryptionData.save();
      expect(savedAttachment.isEncrypted).toBe(true);
      expect(savedAttachment.encryptionData.iv).toBe('test-iv');
      expect(savedAttachment.encryptionData.authTag).toBe('test-auth-tag');
    });

    it('should not require encryption data when isEncrypted is false', async () => {
      const attachment = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        isEncrypted: false,
        // No encryptionData
      });

      const savedAttachment = await attachment.save();
      expect(savedAttachment.isEncrypted).toBe(false);
      expect(savedAttachment.encryptionData).toBeUndefined();
    });
  });

  describe('Instance Methods', () => {
    it('should validate file size correctly', async () => {
      const validSizeAttachment = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        size: 5 * 1024 * 1024, // 5MB
      });

      const invalidSizeAttachment = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        size: 15 * 1024 * 1024, // 15MB
      });

      expect(validSizeAttachment.validateFileSize()).toBe(true);
      expect(invalidSizeAttachment.validateFileSize()).toBe(false);
    });

    it('should validate file type correctly', async () => {
      const validTypeAttachment = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        mimeType: 'image/png',
      });

      const invalidTypeAttachment = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        mimeType: 'invalid/type',
      });

      expect(validTypeAttachment.validateFileType()).toBe(true);
      expect(invalidTypeAttachment.validateFileType()).toBe(false);
    });
  });

  describe('Hooks', () => {
    it('should delete file when attachment is removed', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);

      // Create and save an attachment
      const attachment = new ChatAttachment(TEST_ATTACHMENT_DATA);
      const savedAttachment = await attachment.save();

      // Trigger the pre-remove hook
      await savedAttachment.remove();

      // Verify file deletion was attempted
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(TEST_ATTACHMENT_DATA.url));
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining(TEST_ATTACHMENT_DATA.url));
    });

    it('should delete thumbnail when attachment with thumbnail is removed', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(true);

      // Create and save an attachment with thumbnail
      const attachmentWithThumbnail = new ChatAttachment({
        ...TEST_ATTACHMENT_DATA,
        thumbnailUrl: '/uploads/thumbnails/test-file-thumb.jpg',
      });
      const savedAttachment = await attachmentWithThumbnail.save();

      // Trigger the pre-remove hook
      await savedAttachment.remove();

      // Verify both file and thumbnail deletion were attempted
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(TEST_ATTACHMENT_DATA.url));
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining(TEST_ATTACHMENT_DATA.url));
      expect(fs.existsSync).toHaveBeenCalledWith(
        expect.stringContaining('/uploads/thumbnails/test-file-thumb.jpg')
      );
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining('/uploads/thumbnails/test-file-thumb.jpg')
      );
    });

    it('should not attempt to delete file if it does not exist', async () => {
      // Setup mocks
      fs.existsSync.mockReturnValue(false);

      // Create and save an attachment
      const attachment = new ChatAttachment(TEST_ATTACHMENT_DATA);
      const savedAttachment = await attachment.save();

      // Trigger the pre-remove hook
      await savedAttachment.remove();

      // Verify file existence was checked but deletion was not attempted
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(TEST_ATTACHMENT_DATA.url));
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('Indexes', () => {
    it('should have the expected indexes', async () => {
      const indexes = await ChatAttachment.collection.indexes();

      // Check for roomId and createdAt compound index
      const roomIdCreatedAtIndex = indexes.find(
        index => index.key.roomId === 1 && index.key.createdAt === -1
      );
      expect(roomIdCreatedAtIndex).toBeDefined();

      // Check for messageId index
      const messageIdIndex = indexes.find(index => index.key.messageId === 1);
      expect(messageIdIndex).toBeDefined();

      // Check for uploadedBy index
      const uploadedByIndex = indexes.find(index => index.key.uploadedBy === 1);
      expect(uploadedByIndex).toBeDefined();
    });
  });
});
