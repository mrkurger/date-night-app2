import mediaService from '../services/media.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { MediaSchemas } from '../middleware/validators/media.validator.ts';

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
      const { adId } = req.params;
      const userId = req.user.id;

      if (!req.file) {
        return sendError(res, 400, 'No file uploaded');
      }

      // Validate file metadata if present
      try {
        await MediaSchemas.fileMetadata.parseAsync(req.file);
      } catch (validationError) {
        return sendError(res, 400, 'Invalid file data', validationError.errors);
      }

      const media = await mediaService.uploadMedia(req.file, adId, userId);
      return sendSuccess(res, 201, 'Media uploaded successfully', media);
    } catch (error) {
      console.error('Error in uploadMedia controller:', error);
      return sendError(res, 500, error.message);
    }
  },

  /**
   * Get media by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getMediaById: async (req, res) => {
    try {
      const { mediaId } = req.params;
      const media = await mediaService.getMediaById(mediaId);
      return sendSuccess(res, 200, 'Media retrieved successfully', media);
    } catch (error) {
      console.error('Error in getMediaById controller:', error);
      return sendError(res, 500, error.message);
    }
  },

  /**
   * Update media metadata
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateMedia: async (req, res) => {
    try {
      const { mediaId } = req.params;
      const userId = req.user.id;

      const media = await mediaService.updateMedia(mediaId, req.body, userId);
      return sendSuccess(res, 200, 'Media updated successfully', media);
    } catch (error) {
      console.error('Error in updateMedia controller:', error);
      return sendError(res, 500, error.message);
    }
  },

  /**
   * Delete media
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteMedia: async (req, res) => {
    try {
      const { mediaId } = req.params;
      const userId = req.user.id;

      await mediaService.deleteMedia(mediaId, userId);
      return sendSuccess(res, 200, 'Media deleted successfully');
    } catch (error) {
      console.error('Error in deleteMedia controller:', error);
      return sendError(res, 500, error.message);
    }
  },
};

export async function someHandler(req, res) {
  try {
    const result = await mediaService.processMedia();
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err, err.status || 500);
  }
}

export default mediaController;
