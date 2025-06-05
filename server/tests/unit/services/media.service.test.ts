// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the media service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_FILE_DATA: Mock file data for testing
//   Related to: server/services/media.service.js
// ===================================================

import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { mkdir, writeFile, unlink } from 'fs/promises';
import sharp from 'sharp';
import Ad from '../../../models/ad.model.js';
import mediaService from '../../../services/media.service.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts.js';

// Mock fs, fs/promises, and sharp
jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');
  return {
    ...originalFs,
    existsSync: jest.fn(),
    statSync: jest.fn(),
  };
});

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue({}),
  }));
});

describe('Media Service', () => {
  // Setup test data
  const testUserId = new mongoose.Types.ObjectId();
  const testAdId = new mongoose.Types.ObjectId();

  const MOCK_FILE_DATA = {
    originalname: 'test-image.jpg',
    buffer: Buffer.from('test image data'),
    mimetype: 'image/jpeg',
    size: 1024,
  };

  const MOCK_AD_DATA = {
    _id: testAdId,
    title: 'Test Ad',
    description: 'Test description',
    advertiser: testUserId,
    category: 'Massage',
    county: 'Oslo',
    city: 'Oslo',
    location: {
      type: 'Point',
      coordinates: [10.7522, 59.9139], // Oslo coordinates
    },
    profileImage: '/path/to/test-image.jpg',
    media: [],
  };

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

    // Mock fs.existsSync to return true for directories
    fs.existsSync.mockImplementation(path => {
      if (path.includes('uploads') || path.includes('thumbnails')) {
        return true;
      }
      return false;
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('ensureDirectoriesExist', () => {
    it('should create upload and thumbnail directories if they do not exist', async () => {
      // Mock fs.existsSync to return false for directories
      fs.existsSync.mockReturnValue(false);

      await mediaService.ensureDirectoriesExist();

      // Verify mkdir was called for both directories
      expect(mkdir).toHaveBeenCalledTimes(2);
      expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('uploads'), { recursive: true });
      expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('thumbnails'), {
        recursive: true,
      });
    });

    it('should not create directories if they already exist', async () => {
      // Mock fs.existsSync to return true for directories
      fs.existsSync.mockReturnValue(true);

      await mediaService.ensureDirectoriesExist();

      // Verify mkdir was not called
      expect(mkdir).not.toHaveBeenCalled();
    });

    it('should handle errors when creating directories', async () => {
      // Mock fs.existsSync to return false for directories
      fs.existsSync.mockReturnValue(false);

      // Mock mkdir to throw an error
      mkdir.mockRejectedValue(new Error('Directory creation error'));

      // Mock console.error to verify it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await mediaService.ensureDirectoriesExist();

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating upload directories:',
        expect.any(Error)
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('uploadMedia', () => {
    it('should upload an image file and create a thumbnail', async () => {
      // Create a mock ad in the database with explicit advertiser
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
      });
      await ad.save();

      // Mock writeFile to succeed
      writeFile.mockResolvedValue(undefined);

      // Call the method
      const result = await mediaService.uploadMedia(
        MOCK_FILE_DATA,
        testAdId,
        testUserId.toString()
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.url).toMatch(/^\/uploads\/.+\.jpg$/);
      expect(result.type).toBe('image');
      expect(result.thumbnail).toMatch(/^\/uploads\/thumbnails\/thumb_.+\.jpg$/);
      expect(result.isApproved).toBe(false);
      expect(result.moderationStatus).toBe('pending');
      expect(result.uploadDate).toBeDefined();

      // Verify writeFile was called
      expect(writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.jpg'),
        MOCK_FILE_DATA.buffer
      );

      // Verify sharp was called for thumbnail creation
      expect(sharp).toHaveBeenCalledWith(MOCK_FILE_DATA.buffer);

      // Verify the ad was updated in the database
      const updatedAd = await Ad.findById(testAdId);
      expect(updatedAd.media).toHaveLength(1);
      expect(updatedAd.media[0].url).toBe(result.url);
      expect(updatedAd.media[0].type).toBe(result.type);
      expect(updatedAd.media[0].thumbnail).toBe(result.thumbnail);
    });

    it('should upload a video file without creating a thumbnail', async () => {
      // Create a mock ad in the database with explicit advertiser
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
      });
      await ad.save();

      // Create a mock video file
      const videoFile = {
        ...MOCK_FILE_DATA,
        originalname: 'test-video.mp4',
        mimetype: 'video/mp4',
      };

      // Mock writeFile to succeed
      writeFile.mockResolvedValue(undefined);

      // Call the method
      const result = await mediaService.uploadMedia(videoFile, testAdId, testUserId.toString());

      // Verify the result
      expect(result).toBeDefined();
      expect(result.url).toMatch(/^\/uploads\/.+\.mp4$/);
      expect(result.type).toBe('video');
      expect(result.thumbnail).toBeNull(); // No thumbnail for videos

      // Verify writeFile was called
      expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('.mp4'), videoFile.buffer);

      // Verify sharp was not called for thumbnail creation
      expect(sharp).not.toHaveBeenCalled();

      // Verify the ad was updated in the database
      const updatedAd = await Ad.findById(testAdId);
      expect(updatedAd.media).toHaveLength(1);
      expect(updatedAd.media[0].url).toBe(result.url);
      expect(updatedAd.media[0].type).toBe(result.type);
      expect(updatedAd.media[0].thumbnail).toBeNull();
    });

    it('should throw an error if the ad is not found', async () => {
      // Call the method with a non-existent ad ID
      const nonExistentAdId = new mongoose.Types.ObjectId();

      await expect(
        mediaService.uploadMedia(MOCK_FILE_DATA, nonExistentAdId, testUserId.toString())
      ).rejects.toThrow('Ad not found');
    });

    it('should throw an error if the user does not own the ad', async () => {
      // Create a mock ad in the database with a different advertiser
      const differentUserId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        advertiser: differentUserId,
      });
      await ad.save();

      // Call the method
      await expect(
        mediaService.uploadMedia(MOCK_FILE_DATA, testAdId, testUserId.toString())
      ).rejects.toThrow('Unauthorized: User does not own this ad');
    });

    it('should handle errors during file upload', async () => {
      // Create a mock ad in the database with explicit advertiser
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
      });
      await ad.save();

      // Mock writeFile to fail
      writeFile.mockRejectedValue(new Error('File write error'));

      // Mock console.error to verify it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Call the method
      await expect(
        mediaService.uploadMedia(MOCK_FILE_DATA, testAdId, testUserId.toString())
      ).rejects.toThrow('File write error');

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error uploading media:', expect.any(Error));

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('createThumbnail', () => {
    it('should create a thumbnail for an image', async () => {
      // Call the method
      const result = await mediaService.createThumbnail(MOCK_FILE_DATA.buffer, 'test-image.jpg');

      // Verify the result
      expect(result).toMatch(/thumbnails\/thumb_test-image\.jpg$/);

      // Verify sharp was called with the correct parameters
      expect(sharp).toHaveBeenCalledWith(MOCK_FILE_DATA.buffer);
      const sharpInstance = sharp.mock.results[0].value;
      expect(sharpInstance.resize).toHaveBeenCalledWith(300, 300, { fit: 'inside' });
      expect(sharpInstance.jpeg).toHaveBeenCalledWith({ quality: 80 });
      expect(sharpInstance.toFile).toHaveBeenCalledWith(
        expect.stringContaining('thumb_test-image.jpg')
      );
    });

    it('should return null if thumbnail creation fails', async () => {
      // Mock sharp to throw an error
      sharp.mockImplementation(() => {
        throw new Error('Sharp error');
      });

      // Mock console.error to verify it's called
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Call the method
      const result = await mediaService.createThumbnail(MOCK_FILE_DATA.buffer, 'test-image.jpg');

      // Verify the result
      expect(result).toBeNull();

      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating thumbnail:', expect.any(Error));

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteMedia', () => {
    it('should delete a media file and its thumbnail', async () => {
      // Create a mock ad with media in the database
      const mediaId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
        media: [
          {
            _id: mediaId,
            url: '/uploads/test-image.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image.jpg',
            isApproved: true,
            moderationStatus: 'approved',
            uploadDate: new Date(),
          },
        ],
      });
      await ad.save();

      // Mock fs.existsSync to return true for files
      fs.existsSync.mockReturnValue(true);

      // Mock unlink to succeed
      unlink.mockResolvedValue(undefined);

      // Call the method
      const result = await mediaService.deleteMedia(testAdId, mediaId, testUserId.toString());

      // Verify the result
      expect(result).toBe(true);

      // Verify unlink was called for both the file and thumbnail
      expect(unlink).toHaveBeenCalledTimes(2);
      expect(unlink).toHaveBeenCalledWith(expect.stringContaining('test-image.jpg'));
      expect(unlink).toHaveBeenCalledWith(expect.stringContaining('thumb_test-image.jpg'));

      // Verify the ad was updated in the database
      const updatedAd = await Ad.findById(testAdId);
      expect(updatedAd.media).toHaveLength(0);
    });

    it('should delete a media file without thumbnail if it does not have one', async () => {
      // Create a mock ad with media in the database
      const mediaId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
        media: [
          {
            _id: mediaId,
            url: '/uploads/test-video.mp4',
            type: 'video',
            thumbnail: null, // No thumbnail
            isApproved: true,
            moderationStatus: 'approved',
            uploadDate: new Date(),
          },
        ],
      });
      await ad.save();

      // Mock fs.existsSync to return true for files
      fs.existsSync.mockReturnValue(true);

      // Mock unlink to succeed
      unlink.mockResolvedValue(undefined);

      // Call the method
      const result = await mediaService.deleteMedia(testAdId, mediaId, testUserId.toString());

      // Verify the result
      expect(result).toBe(true);

      // Verify unlink was called only for the file
      expect(unlink).toHaveBeenCalledTimes(1);
      expect(unlink).toHaveBeenCalledWith(expect.stringContaining('test-video.mp4'));

      // Verify the ad was updated in the database
      const updatedAd = await Ad.findById(testAdId);
      expect(updatedAd.media).toHaveLength(0);
    });

    it('should not attempt to delete files that do not exist', async () => {
      // Create a mock ad with media in the database
      const mediaId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
        media: [
          {
            _id: mediaId,
            url: '/uploads/test-image.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image.jpg',
            isApproved: true,
            moderationStatus: 'approved',
            uploadDate: new Date(),
          },
        ],
      });
      await ad.save();

      // Mock fs.existsSync to return false for files
      fs.existsSync.mockReturnValue(false);

      // Call the method
      const result = await mediaService.deleteMedia(testAdId, mediaId, testUserId.toString());

      // Verify the result
      expect(result).toBe(true);

      // Verify unlink was not called
      expect(unlink).not.toHaveBeenCalled();

      // Verify the ad was updated in the database
      const updatedAd = await Ad.findById(testAdId);
      expect(updatedAd.media).toHaveLength(0);
    });

    it('should throw an error if the ad is not found', async () => {
      // Call the method with a non-existent ad ID
      const nonExistentAdId = new mongoose.Types.ObjectId();
      const mediaId = new mongoose.Types.ObjectId();

      await expect(
        mediaService.deleteMedia(nonExistentAdId, mediaId, testUserId.toString())
      ).rejects.toThrow('Ad not found');
    });

    it('should throw an error if the user does not own the ad', async () => {
      // Create a mock ad in the database with a different advertiser
      const differentUserId = new mongoose.Types.ObjectId();
      const mediaId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        advertiser: differentUserId,
      });
      await ad.save();

      // Call the method
      await expect(
        mediaService.deleteMedia(testAdId, mediaId, testUserId.toString())
      ).rejects.toThrow('Unauthorized: User does not own this ad');
    });

    it('should throw an error if the media is not found in the ad', async () => {
      // Create a mock ad in the database with explicit advertiser
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
      });
      await ad.save();

      // Call the method with a non-existent media ID
      const nonExistentMediaId = new mongoose.Types.ObjectId();

      await expect(
        mediaService.deleteMedia(testAdId, nonExistentMediaId, testUserId.toString())
      ).rejects.toThrow('Media not found in ad');
    });
  });

  describe('moderateMedia', () => {
    it('should approve a media file', async () => {
      // Create a mock ad with media in the database
      const mediaId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
        media: [
          {
            _id: mediaId,
            url: '/uploads/test-image.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image.jpg',
            isApproved: false,
            moderationStatus: 'pending',
            uploadDate: new Date(),
          },
        ],
      });
      await ad.save();

      // Call the method
      const result = await mediaService.moderateMedia(
        testAdId,
        mediaId,
        'approved',
        'Approved by moderator'
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.moderationStatus).toBe('approved');
      expect(result.moderationNotes).toBe('Approved by moderator');
      expect(result.isApproved).toBe(true);

      // Verify the ad was updated in the database
      const updatedAd = await Ad.findById(testAdId);
      expect(updatedAd.media[0].moderationStatus).toBe('approved');
      expect(updatedAd.media[0].moderationNotes).toBe('Approved by moderator');
      expect(updatedAd.media[0].isApproved).toBe(true);
    });

    it('should reject a media file', async () => {
      // Create a mock ad with media in the database
      const mediaId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
        media: [
          {
            _id: mediaId,
            url: '/uploads/test-image.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image.jpg',
            isApproved: false,
            moderationStatus: 'pending',
            uploadDate: new Date(),
          },
        ],
      });
      await ad.save();

      // Call the method
      const result = await mediaService.moderateMedia(
        testAdId,
        mediaId,
        'rejected',
        'Violates content policy'
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.moderationStatus).toBe('rejected');
      expect(result.moderationNotes).toBe('Violates content policy');
      expect(result.isApproved).toBe(false);

      // Verify the ad was updated in the database
      const updatedAd = await Ad.findById(testAdId);
      expect(updatedAd.media[0].moderationStatus).toBe('rejected');
      expect(updatedAd.media[0].moderationNotes).toBe('Violates content policy');
      expect(updatedAd.media[0].isApproved).toBe(false);
    });

    it('should throw an error if the ad is not found', async () => {
      // Call the method with a non-existent ad ID
      const nonExistentAdId = new mongoose.Types.ObjectId();
      const mediaId = new mongoose.Types.ObjectId();

      await expect(
        mediaService.moderateMedia(nonExistentAdId, mediaId, 'approved')
      ).rejects.toThrow('Ad not found');
    });

    it('should throw an error if the media is not found in the ad', async () => {
      // Create a mock ad in the database with explicit advertiser
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
      });
      await ad.save();

      // Call the method with a non-existent media ID
      const nonExistentMediaId = new mongoose.Types.ObjectId();

      await expect(
        mediaService.moderateMedia(testAdId, nonExistentMediaId, 'approved')
      ).rejects.toThrow('Media not found in ad');
    });
  });

  describe('setFeaturedMedia', () => {
    it('should set a media as the featured media for an ad', async () => {
      // Create a mock ad with media in the database
      const mediaId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
        media: [
          {
            _id: mediaId,
            url: '/uploads/test-image.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image.jpg',
            isApproved: true,
            moderationStatus: 'approved',
            uploadDate: new Date(),
          },
        ],
      });
      await ad.save();

      // Call the method
      const result = await mediaService.setFeaturedMedia(testAdId, mediaId, testUserId.toString());

      // Verify the result
      expect(result).toBeDefined();
      expect(result.featuredMedia.toString()).toBe(mediaId.toString());

      // Verify the ad was updated in the database
      const updatedAd = await Ad.findById(testAdId);
      expect(updatedAd.featuredMedia.toString()).toBe(mediaId.toString());
    });

    it('should throw an error if the ad is not found', async () => {
      // Call the method with a non-existent ad ID
      const nonExistentAdId = new mongoose.Types.ObjectId();
      const mediaId = new mongoose.Types.ObjectId();

      await expect(
        mediaService.setFeaturedMedia(nonExistentAdId, mediaId, testUserId.toString())
      ).rejects.toThrow('Ad not found');
    });

    it('should throw an error if the user does not own the ad', async () => {
      // Create a mock ad in the database with a different advertiser
      const differentUserId = new mongoose.Types.ObjectId();
      const mediaId = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: differentUserId,
      });
      await ad.save();

      // Call the method
      await expect(
        mediaService.setFeaturedMedia(testAdId, mediaId, testUserId.toString())
      ).rejects.toThrow('Unauthorized: User does not own this ad');
    });

    it('should throw an error if the media is not found in the ad', async () => {
      // Create a mock ad in the database with explicit advertiser
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
      });
      await ad.save();

      // Call the method with a non-existent media ID
      const nonExistentMediaId = new mongoose.Types.ObjectId();

      await expect(
        mediaService.setFeaturedMedia(testAdId, nonExistentMediaId, testUserId.toString())
      ).rejects.toThrow('Media not found in ad');
    });
  });

  describe('getAdMedia', () => {
    it('should get all media for an ad', async () => {
      // Create a mock ad with media in the database
      const mediaId1 = new mongoose.Types.ObjectId();
      const mediaId2 = new mongoose.Types.ObjectId();
      const ad = new Ad({
        ...MOCK_AD_DATA,
        _id: testAdId,
        advertiser: testUserId,
        media: [
          {
            _id: mediaId1,
            url: '/uploads/test-image1.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image1.jpg',
            isApproved: true,
            moderationStatus: 'approved',
            uploadDate: new Date(),
          },
          {
            _id: mediaId2,
            url: '/uploads/test-image2.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image2.jpg',
            isApproved: false,
            moderationStatus: 'pending',
            uploadDate: new Date(),
          },
        ],
      });
      await ad.save();

      // Call the method
      const result = await mediaService.getAdMedia(testAdId);

      // Verify the result
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0]._id.toString()).toBe(mediaId1.toString());
      expect(result[1]._id.toString()).toBe(mediaId2.toString());
    });

    it('should throw an error if the ad is not found', async () => {
      // Call the method with a non-existent ad ID
      const nonExistentAdId = new mongoose.Types.ObjectId();

      await expect(mediaService.getAdMedia(nonExistentAdId)).rejects.toThrow('Ad not found');
    });
  });

  describe('getPendingModerationMedia', () => {
    it('should get all ads with media pending moderation', async () => {
      // Create mock ads in the database
      const ad1 = new Ad({
        ...MOCK_AD_DATA,
        media: [
          {
            url: '/uploads/test-image1.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image1.jpg',
            isApproved: false,
            moderationStatus: 'pending',
            uploadDate: new Date(),
          },
        ],
      });
      await ad1.save();

      const ad2 = new Ad({
        ...MOCK_AD_DATA,
        _id: new mongoose.Types.ObjectId(),
        title: 'Another Test Ad',
        media: [
          {
            url: '/uploads/test-image2.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image2.jpg',
            isApproved: true,
            moderationStatus: 'approved',
            uploadDate: new Date(),
          },
        ],
      });
      await ad2.save();

      const ad3 = new Ad({
        ...MOCK_AD_DATA,
        _id: new mongoose.Types.ObjectId(),
        title: 'Third Test Ad',
        media: [
          {
            url: '/uploads/test-image3.jpg',
            type: 'image',
            thumbnail: '/uploads/thumbnails/thumb_test-image3.jpg',
            isApproved: false,
            moderationStatus: 'pending',
            uploadDate: new Date(),
          },
        ],
      });
      await ad3.save();

      // Mock the populate method since we're not actually populating in tests
      jest.spyOn(mongoose.Query.prototype, 'populate').mockImplementation(function () {
        return this;
      });

      // Call the method
      const result = await mediaService.getPendingModerationMedia();

      // Verify the result
      expect(result).toBeDefined();
      expect(result).toHaveLength(2); // Only ad1 and ad3 have pending media

      // Verify the correct ads were returned
      const adIds = result.map(ad => ad._id.toString());
      expect(adIds).toContain(ad1._id.toString());
      expect(adIds).toContain(ad3._id.toString());
      expect(adIds).not.toContain(ad2._id.toString());

      // Restore the mock
      mongoose.Query.prototype.populate.mockRestore();
    });
  });
});
