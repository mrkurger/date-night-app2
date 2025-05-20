import express from 'express';
const router = express.Router();
import reviewController from '../controllers/review.controller.js';
import { protect as authenticate, optionalAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';
import { ValidationUtils } from '../utils/validation-utils.ts';
import ReviewSchemas from '../middleware/validators/review.validator.js';

// Create a new review
router.post(
  '/',
  authenticate,
  ValidationUtils.validateWithZod(ReviewSchemas.createReview),
  reviewController.createReview
);

// Get reviews for an advertiser
router.get(
  '/advertiser/:advertiserId',
  optionalAuth,
  ValidationUtils.validateWithZod(
    z.object({ advertiserId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  ValidationUtils.validateWithZod(ValidationUtils.zodSchemas.pagination, 'query'),
  reviewController.getAdvertiserReviews
);

// Get a specific review
router.get(
  '/:reviewId',
  optionalAuth,
  ValidationUtils.validateWithZod(
    z.object({ reviewId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  reviewController.getReview
);

// Update a review (only by the reviewer)
router.put(
  '/:reviewId',
  authenticate,
  ValidationUtils.validateWithZod(
    z.object({ reviewId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  ValidationUtils.validateWithZod(ReviewSchemas.updateReview),
  reviewController.updateReview
);

// Delete a review (only by the reviewer or admin)
router.delete(
  '/:reviewId',
  authenticate,
  ValidationUtils.validateWithZod(
    z.object({ reviewId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  reviewController.deleteReview
);

// Mark a review as helpful
router.post(
  '/:reviewId/helpful',
  authenticate,
  ValidationUtils.validateWithZod(
    z.object({ reviewId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  reviewController.markReviewHelpful
);

// Report a review
router.post(
  '/:reviewId/report',
  authenticate,
  ValidationUtils.validateWithZod(
    z.object({ reviewId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  ValidationUtils.validateWithZod(ReviewSchemas.reportReview),
  reviewController.reportReview
);

// Respond to a review (only by the advertiser)
router.post(
  '/:reviewId/respond',
  authenticate,
  ValidationUtils.validateWithZod(
    z.object({ reviewId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  ValidationUtils.validateWithZod(ReviewSchemas.reviewResponse),
  reviewController.respondToReview
);

// Get top-rated advertisers
router.get(
  '/top-rated/advertisers',
  ValidationUtils.validateWithZod(ValidationUtils.zodSchemas.pagination, 'query'),
  reviewController.getTopRatedAdvertisers
);

// Admin routes
router.get(
  '/admin/pending',
  authenticate,
  isAdmin,
  ValidationUtils.validateWithZod(ValidationUtils.zodSchemas.pagination, 'query'),
  reviewController.getPendingReviews
);

// Admin approve review
router.post(
  '/admin/approve/:reviewId',
  authenticate,
  isAdmin,
  ValidationUtils.validateWithZod(
    z.object({ reviewId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  reviewController.approveReview
);

// Admin reject review
router.post(
  '/admin/reject/:reviewId',
  authenticate,
  isAdmin,
  ValidationUtils.validateWithZod(
    z.object({ reviewId: ValidationUtils.zodSchemas.objectId }),
    'params'
  ),
  ValidationUtils.validateWithZod(ReviewSchemas.moderationNote),
  reviewController.rejectReview
);

export default router;
