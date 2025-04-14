
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for review.model settings
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const mongoose = require('mongoose');

// Define the review schema
const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  categories: {
    communication: { type: Number, min: 1, max: 5 },
    appearance: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderationNotes: {
    type: String
  },
  isVerifiedMeeting: {
    type: Boolean,
    default: false
  },
  meetingDate: {
    type: Date
  },
  advertiserResponse: {
    content: String,
    date: Date
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  },
  reports: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only review an advertiser once
reviewSchema.index({ reviewer: 1, advertiser: 1 }, { unique: true });

// Index for finding reviews by advertiser
reviewSchema.index({ advertiser: 1, status: 1, createdAt: -1 });

// Index for finding reviews by ad
reviewSchema.index({ ad: 1, status: 1, createdAt: -1 });

// Pre-save middleware to update the updatedAt field
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for calculating the average rating
reviewSchema.virtual('averageRating').get(function() {
  const categoryRatings = [];
  
  if (this.categories) {
    if (this.categories.communication) categoryRatings.push(this.categories.communication);
    if (this.categories.appearance) categoryRatings.push(this.categories.appearance);
    if (this.categories.location) categoryRatings.push(this.categories.location);
    if (this.categories.value) categoryRatings.push(this.categories.value);
  }
  
  if (categoryRatings.length > 0) {
    const sum = categoryRatings.reduce((total, rating) => total + rating, 0);
    return (sum / categoryRatings.length).toFixed(1);
  }
  
  return this.rating;
});

// Method to mark a review as helpful
reviewSchema.methods.markHelpful = async function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Method to report a review
reviewSchema.methods.report = async function(userId, reason) {
  // Check if this user has already reported
  const alreadyReported = this.reports.some(report => 
    report.userId.toString() === userId.toString()
  );
  
  if (!alreadyReported) {
    this.reports.push({
      userId,
      reason
    });
    
    this.reportCount += 1;
    
    // If report count exceeds threshold, mark for moderation
    if (this.reportCount >= 3 && this.status === 'approved') {
      this.status = 'pending';
    }
    
    return this.save();
  }
  
  return this;
};

// Method for advertiser to respond to a review
reviewSchema.methods.respondToReview = async function(content) {
  this.advertiserResponse = {
    content,
    date: new Date()
  };
  
  return this.save();
};

// Static method to get average ratings for an advertiser
reviewSchema.statics.getAdvertiserRatings = async function(advertiserId) {
  const result = await this.aggregate([
    {
      $match: {
        advertiser: mongoose.Types.ObjectId(advertiserId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        communicationAvg: { $avg: '$categories.communication' },
        appearanceAvg: { $avg: '$categories.appearance' },
        locationAvg: { $avg: '$categories.location' },
        valueAvg: { $avg: '$categories.value' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      communicationAvg: 0,
      appearanceAvg: 0,
      locationAvg: 0,
      valueAvg: 0,
      totalReviews: 0
    };
  }
  
  return result[0];
};

// Static method to find recent reviews for an advertiser
reviewSchema.statics.findRecentReviews = function(advertiserId, limit = 5) {
  return this.find({
    advertiser: advertiserId,
    status: 'approved'
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('reviewer', 'username profileImage');
};

// Static method to find top-rated advertisers
reviewSchema.statics.findTopRated = async function(limit = 10, minReviews = 3) {
  return this.aggregate([
    {
      $match: {
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$advertiser',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    },
    {
      $match: {
        reviewCount: { $gte: minReviews }
      }
    },
    {
      $sort: {
        averageRating: -1,
        reviewCount: -1
      }
    },
    {
      $limit: limit
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'advertiserDetails'
      }
    },
    {
      $unwind: '$advertiserDetails'
    },
    {
      $project: {
        _id: 1,
        advertiser: '$advertiserDetails',
        averageRating: 1,
        reviewCount: 1
      }
    }
  ]);
};

module.exports = mongoose.model('Review', reviewSchema);