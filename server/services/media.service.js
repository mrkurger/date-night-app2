
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (media.service)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const Ad = require('../components/ads/ad.model');

// Convert fs functions to promise-based
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

class MediaService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.thumbnailDir = path.join(this.uploadDir, 'thumbnails');
    this.ensureDirectoriesExist();
  }

  async ensureDirectoriesExist() {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        await mkdir(this.uploadDir, { recursive: true });
      }
      if (!fs.existsSync(this.thumbnailDir)) {
        await mkdir(this.thumbnailDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating upload directories:', error);
    }
  }

  /**
   * Upload a media file
   * @param {Object} file - The file object from multer
   * @param {string} adId - The ID of the ad to associate the media with
   * @param {string} userId - The ID of the user uploading the media
   * @returns {Promise<Object>} - The uploaded media object
   */
  async uploadMedia(file, adId, userId) {
    try {
      const fileExt = path.extname(file.originalname).toLowerCase();
      const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(fileExt);
      const mediaType = isVideo ? 'video' : 'image';
      
      // Generate unique filename
      const filename = `${uuidv4()}${fileExt}`;
      const filePath = path.join(this.uploadDir, filename);
      
      // Write file to disk
      await writeFile(filePath, file.buffer);
      
      // Create thumbnail for images
      let thumbnailPath = null;
      if (!isVideo) {
        thumbnailPath = await this.createThumbnail(file.buffer, filename);
      }
      
      // Create media object
      const mediaObj = {
        url: `/uploads/${filename}`,
        type: mediaType,
        thumbnail: thumbnailPath ? `/uploads/thumbnails/${path.basename(thumbnailPath)}` : null,
        isApproved: false,
        moderationStatus: 'pending',
        uploadDate: new Date()
      };
      
      // Add media to ad
      const ad = await Ad.findById(adId);
      if (!ad) {
        throw new Error('Ad not found');
      }
      
      // Verify user owns the ad
      if (ad.advertiser.toString() !== userId) {
        throw new Error('Unauthorized: User does not own this ad');
      }
      
      ad.media.push(mediaObj);
      await ad.save();
      
      return mediaObj;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }
  
  /**
   * Create a thumbnail for an image
   * @param {Buffer} buffer - The image buffer
   * @param {string} originalFilename - The original filename
   * @returns {Promise<string>} - The path to the thumbnail
   */
  async createThumbnail(buffer, originalFilename) {
    try {
      const thumbnailFilename = `thumb_${originalFilename}`;
      const thumbnailPath = path.join(this.thumbnailDir, thumbnailFilename);
      
      await sharp(buffer)
        .resize(300, 300, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      
      return thumbnailPath;
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return null;
    }
  }
  
  /**
   * Delete a media file
   * @param {string} adId - The ID of the ad
   * @param {string} mediaId - The ID of the media to delete
   * @param {string} userId - The ID of the user deleting the media
   * @returns {Promise<boolean>} - Whether the deletion was successful
   */
  async deleteMedia(adId, mediaId, userId) {
    try {
      const ad = await Ad.findById(adId);
      if (!ad) {
        throw new Error('Ad not found');
      }
      
      // Verify user owns the ad
      if (ad.advertiser.toString() !== userId) {
        throw new Error('Unauthorized: User does not own this ad');
      }
      
      // Find the media in the ad
      const mediaIndex = ad.media.findIndex(m => m._id.toString() === mediaId);
      if (mediaIndex === -1) {
        throw new Error('Media not found in ad');
      }
      
      const media = ad.media[mediaIndex];
      
      // Delete the file from disk
      const filePath = path.join(__dirname, '..', media.url);
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
      }
      
      // Delete the thumbnail if it exists
      if (media.thumbnail) {
        const thumbnailPath = path.join(__dirname, '..', media.thumbnail);
        if (fs.existsSync(thumbnailPath)) {
          await unlink(thumbnailPath);
        }
      }
      
      // Remove the media from the ad
      ad.media.splice(mediaIndex, 1);
      await ad.save();
      
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  }
  
  /**
   * Moderate a media file
   * @param {string} adId - The ID of the ad
   * @param {string} mediaId - The ID of the media to moderate
   * @param {string} status - The moderation status ('approved' or 'rejected')
   * @param {string} notes - Optional moderation notes
   * @returns {Promise<Object>} - The updated media object
   */
  async moderateMedia(adId, mediaId, status, notes = '') {
    try {
      const ad = await Ad.findById(adId);
      if (!ad) {
        throw new Error('Ad not found');
      }
      
      // Find the media in the ad
      const mediaIndex = ad.media.findIndex(m => m._id.toString() === mediaId);
      if (mediaIndex === -1) {
        throw new Error('Media not found in ad');
      }
      
      // Update the media moderation status
      ad.media[mediaIndex].moderationStatus = status;
      ad.media[mediaIndex].moderationNotes = notes;
      ad.media[mediaIndex].isApproved = status === 'approved';
      
      await ad.save();
      
      return ad.media[mediaIndex];
    } catch (error) {
      console.error('Error moderating media:', error);
      throw error;
    }
  }
  
  /**
   * Set a media as the featured media for an ad
   * @param {string} adId - The ID of the ad
   * @param {string} mediaId - The ID of the media to set as featured
   * @param {string} userId - The ID of the user making the change
   * @returns {Promise<Object>} - The updated ad object
   */
  async setFeaturedMedia(adId, mediaId, userId) {
    try {
      const ad = await Ad.findById(adId);
      if (!ad) {
        throw new Error('Ad not found');
      }
      
      // Verify user owns the ad
      if (ad.advertiser.toString() !== userId) {
        throw new Error('Unauthorized: User does not own this ad');
      }
      
      // Find the media in the ad
      const mediaExists = ad.media.some(m => m._id.toString() === mediaId);
      if (!mediaExists) {
        throw new Error('Media not found in ad');
      }
      
      // Set the featured media
      ad.featuredMedia = mediaId;
      await ad.save();
      
      return ad;
    } catch (error) {
      console.error('Error setting featured media:', error);
      throw error;
    }
  }
  
  /**
   * Get all media for an ad
   * @param {string} adId - The ID of the ad
   * @returns {Promise<Array>} - Array of media objects
   */
  async getAdMedia(adId) {
    try {
      const ad = await Ad.findById(adId);
      if (!ad) {
        throw new Error('Ad not found');
      }
      
      return ad.media;
    } catch (error) {
      console.error('Error getting ad media:', error);
      throw error;
    }
  }
  
  /**
   * Get all media pending moderation
   * @returns {Promise<Array>} - Array of ads with pending media
   */
  async getPendingModerationMedia() {
    try {
      const ads = await Ad.find({ 'media.moderationStatus': 'pending' })
        .select('_id title advertiser media')
        .populate('advertiser', 'username');
      
      return ads;
    } catch (error) {
      console.error('Error getting pending moderation media:', error);
      throw error;
    }
  }
}

module.exports = new MediaService();