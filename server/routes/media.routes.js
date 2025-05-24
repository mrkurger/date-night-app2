// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for media.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import multer from 'multer';
import mediaController from '../controllers/media.controller.js';
import { protect } from '../middleware/auth.js';
import { ValidationUtils } from '../utils/validation-utils.js';
import { MediaSchemas } from '../middleware/validators/media.validator.ts';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  },
});

// Upload media for an ad
router.post(
  '/ad/:adId/upload',
  protect,
  ValidationUtils.validateWithZod(MediaSchemas.uploadParams, 'params'),
  upload.single('media'),
  mediaController.uploadMedia
);

// Get media by ID
router.get(
  '/:mediaId',
  ValidationUtils.validateWithZod(MediaSchemas.mediaIdParam, 'params'),
  mediaController.getMediaById
);

// Update media metadata
router.put(
  '/:mediaId',
  protect,
  ValidationUtils.validateWithZod(MediaSchemas.mediaIdParam, 'params'),
  ValidationUtils.validateWithZod(MediaSchemas.mediaUpdate),
  mediaController.updateMedia
);

// Delete media
router.delete(
  '/:mediaId',
  protect,
  ValidationUtils.validateWithZod(MediaSchemas.mediaIdParam, 'params'),
  mediaController.deleteMedia
);

export default router;
