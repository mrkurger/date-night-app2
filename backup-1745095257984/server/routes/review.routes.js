// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for review.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// Create a new review
router.post('/', authenticate, reviewController.createReview);

// Get reviews for an advertiser
router.get('/advertiser/:advertiserId', optionalAuth, reviewController.getAdvertiserReviews);

// Get a specific review
router.get('/:reviewId', optionalAuth, reviewController.getReview);

// Update a review (only by the reviewer)
router.put('/:reviewId', authenticate, reviewController.updateReview);

// Delete a review (only by the reviewer or admin)
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

// Mark a review as helpful
router.post('/:reviewId/helpful', authenticate, reviewController.markReviewHelpful);

// Report a review
router.post('/:reviewId/report', authenticate, reviewController.reportReview);

// Respond to a review (only by the advertiser)
router.post('/:reviewId/respond', authenticate, reviewController.respondToReview);

// Get top-rated advertisers
router.get('/top-rated/advertisers', reviewController.getTopRatedAdvertisers);

// Admin routes
router.get('/admin/pending', authenticate, isAdmin, reviewController.getPendingReviews);
router.post('/admin/approve/:reviewId', authenticate, isAdmin, reviewController.approveReview);
router.post('/admin/reject/:reviewId', authenticate, isAdmin, reviewController.rejectReview);

module.exports = router;
