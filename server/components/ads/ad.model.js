// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad.model)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  thumbnail: { type: String },
  isApproved: { type: Boolean, default: false },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  moderationNotes: { type: String },
  uploadDate: { type: Date, default: Date.now },
});

const adSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    contact: String,
    location: String,
    datePosted: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
    },
    advertiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profileImage: { type: String, default: '/assets/images/default-profile.jpg' },
    county: String,
    category: { type: String },
    tags: [String],
    media: [mediaSchema],
    featuredMedia: { type: mongoose.Schema.Types.ObjectId, ref: 'media' },
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'rejected', 'inactive'],
      default: 'pending',
    },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    swipeData: {
      right: { type: Number, default: 0 },
      left: { type: Number, default: 0 },
    },
    ageRestricted: { type: Boolean, default: true },
    privacySettings: {
      showLocation: { type: Boolean, default: true },
      showContact: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create spatial index for location-based queries
adSchema.index({ coordinates: '2dsphere' });
adSchema.index({ tags: 1 });
adSchema.index({ category: 1 });
adSchema.index({ status: 1 });
adSchema.index({ 'media.moderationStatus': 1 });

// Virtual for calculating engagement score (for recommendation engine)
adSchema.virtual('engagementScore').get(function () {
  const viewWeight = 1;
  const likeWeight = 5;
  const rightSwipeWeight = 3;

  return (
    this.viewCount * viewWeight +
    this.likeCount * likeWeight +
    this.swipeData.right * rightSwipeWeight
  );
});

// Pre-save hook to update lastUpdated
adSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

// Check if model already exists before defining
if (mongoose.models.Ad) {
  module.exports = mongoose.model('Ad');
} else {
  module.exports = mongoose.model('Ad', adSchema);
}
