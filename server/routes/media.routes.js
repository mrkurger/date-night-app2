const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const mediaController = require('../controllers/media.controller');
const authenticateToken = require('../middleware/authenticateToken');

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
  '/:adId/upload',
  authenticateToken,
  upload.single('media'),
  mediaController.uploadMedia
);

// Delete media from an ad
router.delete(
  '/:adId/media/:mediaId',
  authenticateToken,
  mediaController.deleteMedia
);

// Moderate media (admin only)
router.put(
  '/:adId/media/:mediaId/moderate',
  authenticateToken,
  [
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be either approved or rejected'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  mediaController.moderateMedia
);

// Set featured media for an ad
router.put(
  '/:adId/media/:mediaId/featured',
  authenticateToken,
  mediaController.setFeaturedMedia
);

// Get all media for an ad
router.get(
  '/:adId/media',
  mediaController.getAdMedia
);

// Get all media pending moderation (admin only)
router.get(
  '/moderation/pending',
  authenticateToken,
  mediaController.getPendingModerationMedia
);

module.exports = router;