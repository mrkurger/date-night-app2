// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the message cleanup service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_MESSAGE_DATA: Mock message data for testing
//   Related to: server/services/message-cleanup.service.js
// ===================================================

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import ChatMessage from '../../../models/chat-message.model.js';
import ChatAttachment from '../../../models/chat-attachment.schema.js';
import messageCleanupService from '../../../services/message-cleanup.service.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';

// Mock fs, path, and cron
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/')),
}));

jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    stop: jest.fn(),
  }),
}));

describe('Message Cleanup Service', () => {
  // Setup test data
  const testUserId1 = new mongoose.Types.ObjectId();
  const testUserId2 = new mongoose.Types.ObjectId();
  const testRoomId = new mongoose.Types.ObjectId();

  const now = new Date();
  const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database and reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('constructor', () => {
    it('should schedule a cron job', () => {
      // Verify that cron.schedule was called with the correct parameters
      expect(cron.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
    });
  });

  describe('cleanupExpiredMessages', () => {
    it('should clean up expired messages and their attachments', async () => {
      // Create mock attachments
      const attachment1 = new ChatAttachment({
        name: 'test-file1.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file1.jpg',
        thumbnailUrl: '/uploads/thumbnails/thumb_test-file1.jpg',
        uploadedBy: testUserId1,
        roomId: testRoomId,
        messageId: new mongoose.Types.ObjectId(),
      });
      const savedAttachment1 = await attachment1.save();

      const attachment2 = new ChatAttachment({
        name: 'test-file2.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file2.jpg',
        thumbnailUrl: '/uploads/thumbnails/thumb_test-file2.jpg',
        uploadedBy: testUserId1,
        roomId: testRoomId,
        messageId: new mongoose.Types.ObjectId(),
      });
      const savedAttachment2 = await attachment2.save();

      // Create mock messages
      const expiredMessage = new ChatMessage({
        content: 'This is an expired message',
        sender: testUserId1,
        receiver: testUserId2,
        roomId: testRoomId,
        expiresAt: pastDate, // Expired
        attachments: [savedAttachment1._id],
      });
      await expiredMessage.save();

      const activeMessage = new ChatMessage({
        content: 'This is an active message',
        sender: testUserId1,
        receiver: testUserId2,
        roomId: testRoomId,
        expiresAt: futureDate, // Not expired
        attachments: [savedAttachment2._id],
      });
      await activeMessage.save();

      // Mock fs.existsSync to return true for files
      fs.existsSync.mockReturnValue(true);

      // Mock the populate method to return attachments
      jest.spyOn(mongoose.Query.prototype, 'populate').mockImplementation(function () {
        // This is a bit of a hack to simulate populate behavior
        // In a real scenario, populate would fetch the actual attachment documents
        if (this._conditions.expiresAt && this._conditions.expiresAt.$lte) {
          return Promise.resolve([
            {
              _id: expiredMessage._id,
              content: expiredMessage.content,
              sender: expiredMessage.sender,
              receiver: expiredMessage.receiver,
              roomId: expiredMessage.roomId,
              expiresAt: expiredMessage.expiresAt,
              attachments: [
                {
                  _id: savedAttachment1._id,
                  url: savedAttachment1.url,
                  thumbnailUrl: savedAttachment1.thumbnailUrl,
                },
              ],
            },
          ]);
        }
        return this;
      });

      // Mock console.log to verify it's called
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Call the method
      await messageCleanupService.cleanupExpiredMessages();

      // Verify fs.existsSync and fs.unlinkSync were called for the attachment and its thumbnail
      expect(fs.existsSync).toHaveBeenCalledTimes(2);
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('test-file1.jpg'));
      expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining('thumb_test-file1.jpg'));
      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('test-file1.jpg'));
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('thumb_test-file1.jpg'));

      // Verify that the expired message and its attachment were deleted
      const remainingMessages = await ChatMessage.find();
      expect(remainingMessages.length).toBe(1); // Only the active message should remain
      expect(remainingMessages[0]._id.toString()).toBe(activeMessage._id.toString());

      const remainingAttachments = await ChatAttachment.find();
      expect(remainingAttachments.length).toBe(1); // Only the attachment for the active message should remain
      expect(remainingAttachments[0]._id.toString()).toBe(savedAttachment2._id.toString());

      // Verify console.log was called with the correct message
      expect(consoleLogSpy).toHaveBeenCalledWith('Cleaned up 1 expired messages');

      // Restore mocks
      mongoose.Query.prototype.populate.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('should handle messages without attachments', async () => {
      // Create a mock message without attachments
      const expiredMessage = new ChatMessage({
        content: 'This is an expired message without attachments',
        sender: testUserId1,
        receiver: testUserId2,
        roomId: testRoomId,
        expiresAt: pastDate, // Expired
        attachments: [], // No attachments
      });
      await expiredMessage.save();

      // Mock the populate method
      jest.spyOn(mongoose.Query.prototype, 'populate').mockImplementation(function () {
        if (this._conditions.expiresAt && this._conditions.expiresAt.$lte) {
          return Promise.resolve([
            {
              _id: expiredMessage._id,
              content: expiredMessage.content,
              sender: expiredMessage.sender,
              receiver: expiredMessage.receiver,
              roomId: expiredMessage.roomId,
              expiresAt: expiredMessage.expiresAt,
              attachments: [], // No attachments
            },
          ]);
        }
        return this;
      });

      // Call the method
      await messageCleanupService.cleanupExpiredMessages();

      // Verify that fs functions were not called
      expect(fs.existsSync).not.toHaveBeenCalled();
      expect(fs.unlinkSync).not.toHaveBeenCalled();

      // Verify that the expired message was deleted
      const remainingMessages = await ChatMessage.find();
      expect(remainingMessages.length).toBe(0);

      // Restore mock
      mongoose.Query.prototype.populate.mockRestore();
    });

    it('should handle non-existent attachment files', async () => {
      // Create a mock attachment
      const attachment = new ChatAttachment({
        name: 'test-file.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file.jpg',
        thumbnailUrl: '/uploads/thumbnails/thumb_test-file.jpg',
        uploadedBy: testUserId1,
        roomId: testRoomId,
        messageId: new mongoose.Types.ObjectId(),
      });
      const savedAttachment = await attachment.save();

      // Create a mock message with the attachment
      const expiredMessage = new ChatMessage({
        content: 'This is an expired message with a non-existent attachment',
        sender: testUserId1,
        receiver: testUserId2,
        roomId: testRoomId,
        expiresAt: pastDate, // Expired
        attachments: [savedAttachment._id],
      });
      await expiredMessage.save();

      // Mock fs.existsSync to return false for files (they don't exist)
      fs.existsSync.mockReturnValue(false);

      // Mock the populate method
      jest.spyOn(mongoose.Query.prototype, 'populate').mockImplementation(function () {
        if (this._conditions.expiresAt && this._conditions.expiresAt.$lte) {
          return Promise.resolve([
            {
              _id: expiredMessage._id,
              content: expiredMessage.content,
              sender: expiredMessage.sender,
              receiver: expiredMessage.receiver,
              roomId: expiredMessage.roomId,
              expiresAt: expiredMessage.expiresAt,
              attachments: [
                {
                  _id: savedAttachment._id,
                  url: savedAttachment.url,
                  thumbnailUrl: savedAttachment.thumbnailUrl,
                },
              ],
            },
          ]);
        }
        return this;
      });

      // Call the method
      await messageCleanupService.cleanupExpiredMessages();

      // Verify fs.existsSync was called but fs.unlinkSync was not
      expect(fs.existsSync).toHaveBeenCalledTimes(2);
      expect(fs.unlinkSync).not.toHaveBeenCalled();

      // Verify that the expired message and its attachment were deleted
      const remainingMessages = await ChatMessage.find();
      expect(remainingMessages.length).toBe(0);

      const remainingAttachments = await ChatAttachment.find();
      expect(remainingAttachments.length).toBe(0);

      // Restore mock
      mongoose.Query.prototype.populate.mockRestore();
    });

    it('should handle errors during cleanup', async () => {
      // Create a mock message
      const expiredMessage = new ChatMessage({
        content: 'This is an expired message',
        sender: testUserId1,
        receiver: testUserId2,
        roomId: testRoomId,
        expiresAt: pastDate, // Expired
      });
      await expiredMessage.save();

      // Mock ChatMessage.find to throw an error
      jest.spyOn(ChatMessage, 'find').mockImplementation(() => {
        throw new Error('Database error');
      });

      // Mock console.error to verify it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Call the method
      await messageCleanupService.cleanupExpiredMessages();

      // Verify console.error was called with the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error cleaning up expired messages:',
        expect.any(Error)
      );

      // Restore mocks
      ChatMessage.find.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('stop', () => {
    it('should stop the cleanup job', () => {
      // Call the method
      messageCleanupService.stop();

      // Verify that the cleanup job's stop method was called
      const cleanupJob = cron.schedule.mock.results[0].value;
      expect(cleanupJob.stop).toHaveBeenCalled();
    });

    it('should handle case where cleanup job is not defined', () => {
      // Temporarily set cleanupJob to null
      const originalCleanupJob = messageCleanupService.cleanupJob;
      messageCleanupService.cleanupJob = null;

      // Call the method
      messageCleanupService.stop();

      // Verify that no error was thrown
      expect(() => messageCleanupService.stop()).not.toThrow();

      // Restore cleanupJob
      messageCleanupService.cleanupJob = originalCleanupJob;
    });
  });
});
