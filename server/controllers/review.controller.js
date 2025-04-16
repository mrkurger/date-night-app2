const Review = require('../models/review.model');
const User = require('../models/user.model');
const Ad = require('../models/ad.model');
const mongoose = require('mongoose');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const reviewerId = req.user._id;
    const { advertiserId, adId, rating, title, content, categories, meetingDate } = req.body;

    // Validate required fields
    if (!advertiserId || !rating || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Advertiser ID, rating, title, and content are required',
      });
    }

    // Check if advertiser exists and is an advertiser
    const advertiser = await User.findById(advertiserId);

    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found',
      });
    }

    if (advertiser.role !== 'advertiser') {
      return res.status(400).json({
        success: false,
        message: 'The user is not an advertiser',
      });
    }

    // Check if ad exists and belongs to the advertiser (if adId is provided)
    if (adId) {
      const ad = await Ad.findById(adId);

      if (!ad) {
        return res.status(404).json({
          success: false,
          message: 'Ad not found',
        });
      }

      if (ad.advertiser.toString() !== advertiserId) {
        return res.status(400).json({
          success: false,
          message: 'Ad does not belong to the specified advertiser',
        });
      }
    }

    // Check if user has already reviewed this advertiser
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      advertiser: advertiserId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this advertiser',
      });
    }

    // Create the review
    const review = new Review({
      reviewer: reviewerId,
      advertiser: advertiserId,
      ad: adId,
      rating,
      title,
      content,
      categories,
      meetingDate: meetingDate ? new Date(meetingDate) : undefined,
      status: 'pending', // All reviews start as pending for moderation
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and pending moderation',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message,
    });
  }
};

// Get reviews for an advertiser
exports.getAdvertiserReviews = async (req, res) => {
  try {
    const { advertiserId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    if (!advertiserId) {
      return res.status(400).json({
        success: false,
        message: 'Advertiser ID is required',
      });
    }

    // Check if advertiser exists
    const advertiser = await User.findById(advertiserId);

    if (!advertiser) {
      return res.status(404).json({
        success: false,
        message: 'Advertiser not found',
      });
    }

    // Set up sort options
    let sortOptions = {};

    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'highest':
        sortOptions = { rating: -1 };
        break;
      case 'lowest':
        sortOptions = { rating: 1 };
        break;
      case 'helpful':
        sortOptions = { helpfulVotes: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews
    const reviews = await Review.find({
      advertiser: advertiserId,
      status: 'approved', // Only show approved reviews
    })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviewer', 'username profileImage');

    // Get total count
    const totalReviews = await Review.countDocuments({
      advertiser: advertiserId,
      status: 'approved',
    });

    // Get average ratings
    const ratings = await Review.getAdvertiserRatings(advertiserId);

    res.status(200).json({
      success: true,
      count: reviews.length,
      totalPages: Math.ceil(totalReviews / parseInt(limit)),
      currentPage: parseInt(page),
      ratings,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving reviews',
      error: error.message,
    });
  }
};

// Get a specific review
exports.getReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required',
      });
    }

    const review = await Review.findById(reviewId)
      .populate('reviewer', 'username profileImage')
      .populate('advertiser', 'username profileImage');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Only return approved reviews or reviews by the current user
    if (
      review.status !== 'approved' &&
      (!req.user || review.reviewer._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'This review is pending moderation',
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving review',
      error: error.message,
    });
  }
};

// Update a review (only by the reviewer)
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, content, categories } = req.body;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required',
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if the current user is the reviewer
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews',
      });
    }

    // Update review fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (content) review.content = content;
    if (categories) review.categories = categories;

    // Reset status to pending for re-moderation
    review.status = 'pending';

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully and pending moderation',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message,
    });
  }
};

// Delete a review (only by the reviewer)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required',
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if the current user is the reviewer or an admin
    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews',
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message,
    });
  }
};

// Mark a review as helpful
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required',
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Only approved reviews can be marked as helpful
    if (review.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This review is pending moderation',
      });
    }

    await review.markHelpful();

    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      helpfulVotes: review.helpfulVotes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking review as helpful',
      error: error.message,
    });
  }
};

// Report a review
exports.reportReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason for report is required',
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    await review.report(req.user._id, reason);

    res.status(200).json({
      success: true,
      message: 'Review reported successfully',
      reportCount: review.reportCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reporting review',
      error: error.message,
    });
  }
};

// Respond to a review (only by the advertiser)
exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required',
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Response content is required',
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if the current user is the advertiser
    if (review.advertiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews of your profile',
      });
    }

    await review.respondToReview(content);

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: review.advertiserResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error responding to review',
      error: error.message,
    });
  }
};

// Admin: Get pending reviews
exports.getPendingReviews = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get pending reviews
    const reviews = await Review.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviewer', 'username profileImage')
      .populate('advertiser', 'username profileImage');

    // Get total count
    const totalReviews = await Review.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      count: reviews.length,
      totalPages: Math.ceil(totalReviews / parseInt(limit)),
      currentPage: parseInt(page),
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving pending reviews',
      error: error.message,
    });
  }
};

// Admin: Approve a review
exports.approveReview = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { reviewId } = req.params;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required',
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.status = 'approved';
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving review',
      error: error.message,
    });
  }
};

// Admin: Reject a review
exports.rejectReview = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Admin access required',
      });
    }

    const { reviewId } = req.params;
    const { moderationNotes } = req.body;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required',
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.status = 'rejected';
    review.moderationNotes = moderationNotes;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting review',
      error: error.message,
    });
  }
};

// Get top-rated advertisers
exports.getTopRatedAdvertisers = async (req, res) => {
  try {
    const { limit = 10, minReviews = 3 } = req.query;

    const topRated = await Review.findTopRated(parseInt(limit), parseInt(minReviews));

    res.status(200).json({
      success: true,
      count: topRated.length,
      data: topRated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving top-rated advertisers',
      error: error.message,
    });
  }
};
