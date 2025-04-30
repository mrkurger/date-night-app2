import mediaService from '../services/media.service.js';
import { validationResult } from 'express-validator';

/**
 * Media Controller for handling media-related API endpoints
 */
const mediaController = {
  /**
   * Upload media for an ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadMedia: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { adId } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const media = await mediaService.uploadMedia(req.file, adId, userId);
      res.status(201).json(media);
    } catch (error) {
      console.error('Error in uploadMedia controller:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error uploading media', error: error.message });
    }
  },

  /**
   * Delete media from an ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteMedia: async (req, res) => {
    try {
      const { adId, mediaId } = req.params;
      const userId = req.user.id;

      await mediaService.deleteMedia(adId, mediaId, userId);
      res.status(200).json({ message: 'Media deleted successfully' });
    } catch (error) {
      console.error('Error in deleteMedia controller:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error deleting media', error: error.message });
    }
  },

  /**
   * Moderate media (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  moderateMedia: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { adId, mediaId } = req.params;
      const { status, notes } = req.body;

      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized: Admin access required' });
      }

      const media = await mediaService.moderateMedia(adId, mediaId, status, notes);
      res.status(200).json(media);
    } catch (error) {
      console.error('Error in moderateMedia controller:', error);
      res.status(500).json({ message: 'Error moderating media', error: error.message });
    }
  },

  /**
   * Set featured media for an ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  setFeaturedMedia: async (req, res) => {
    try {
      const { adId, mediaId } = req.params;
      const userId = req.user.id;

      const ad = await mediaService.setFeaturedMedia(adId, mediaId, userId);
      res.status(200).json(ad);
    } catch (error) {
      console.error('Error in setFeaturedMedia controller:', error);
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error setting featured media', error: error.message });
    }
  },

  /**
   * Get all media for an ad
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAdMedia: async (req, res) => {
    try {
      const { adId } = req.params;
      const media = await mediaService.getAdMedia(adId);
      res.status(200).json(media);
    } catch (error) {
      console.error('Error in getAdMedia controller:', error);
      res.status(500).json({ message: 'Error getting ad media', error: error.message });
    }
  },

  /**
   * Get all media pending moderation (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getPendingModerationMedia: async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized: Admin access required' });
      }

      const pendingMedia = await mediaService.getPendingModerationMedia();
      res.status(200).json(pendingMedia);
    } catch (error) {
      console.error('Error in getPendingModerationMedia controller:', error);
      res
        .status(500)
        .json({ message: 'Error getting pending moderation media', error: error.message });
    }
  },
};

export default mediaController;
