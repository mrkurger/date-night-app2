// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for favorite.model settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import mongoose from 'mongoose';

/**
 * Favorite model for storing user favorites
 *
 * This model tracks which ads users have favorited, allowing for:
 * - Quick access to a user's favorite ads
 * - Filtering and sorting favorites
 * - Notifications when favorited advertisers update their profiles or travel plans
 * - Tagging and prioritizing favorites
 */
const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ad',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          // Ensure each tag is between 1 and 30 characters
          return tags.every(tag => tag.length > 0 && tag.length <= 30);
        },
        message: 'Tags must be between 1 and 30 characters',
      },
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    lastViewed: {
      type: Date,
      default: null,
    },
    lastNotified: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can only favorite an ad once
favoriteSchema.index({ user: 1, ad: 1 }, { unique: true });

// Create an index for efficiently finding a user's favorites
favoriteSchema.index({ user: 1, createdAt: -1 });

// Create indexes for filtering and sorting
favoriteSchema.index({ user: 1, tags: 1 });
favoriteSchema.index({ user: 1, priority: 1 });
favoriteSchema.index({ user: 1, lastViewed: -1 });

/**
 * Static method to get all favorites for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {Object} options.sort - Sort options
 * @param {Object} options.filters - Filter options
 * @returns {Promise<Array>} Array of favorites with populated ad data
 */
favoriteSchema.statics.findByUser = function (userId, options = {}) {
  const { sort = { createdAt: -1 }, filters = {} } = options;

  // Build the query
  const query = { user: userId };

  // Apply additional filters
  if (Object.keys(filters).length > 0) {
    Object.assign(query, filters);
  }

  return this.find(query)
    .sort(sort)
    .populate({
      path: 'ad',
      select: 'title description price images advertiser location category',
      populate: {
        path: 'advertiser',
        select: 'username profileImage',
      },
    });
};

/**
 * Static method to check if a user has favorited an ad
 * @param {string} userId - User ID
 * @param {string} adId - Ad ID
 * @returns {Promise<boolean>} True if the ad is favorited
 */
favoriteSchema.statics.isFavorite = async function (userId, adId) {
  const count = await this.countDocuments({ user: userId, ad: adId });
  return count > 0;
};

/**
 * Static method to toggle favorite status
 * @param {string} userId - User ID
 * @param {string} adId - Ad ID
 * @returns {Promise<Object>} Result with new status
 */
favoriteSchema.statics.toggleFavorite = async function (userId, adId) {
  const favorite = await this.findOne({ user: userId, ad: adId });

  if (favorite) {
    await Favorite.deleteOne({ _id: favorite._id });
    return { isFavorite: false };
  } else {
    await this.create({ user: userId, ad: adId });
    return { isFavorite: true };
  }
};

/**
 * Static method to get favorite ad IDs for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of ad IDs
 */
favoriteSchema.statics.getFavoriteIds = async function (userId) {
  const favorites = await this.find({ user: userId }).select('ad');
  return favorites.map(fav => fav.ad.toString());
};

/**
 * Static method to update the last viewed timestamp
 * @param {string} userId - User ID
 * @param {string} adId - Ad ID
 * @returns {Promise<void>}
 */
favoriteSchema.statics.updateLastViewed = async function (userId, adId) {
  await this.findOneAndUpdate({ user: userId, ad: adId }, { lastViewed: new Date() });
};

/**
 * Static method to update the last notified timestamp
 * @param {string} userId - User ID
 * @param {string} adId - Ad ID
 * @returns {Promise<void>}
 */
favoriteSchema.statics.updateLastNotified = async function (userId, adId) {
  await this.findOneAndUpdate({ user: userId, ad: adId }, { lastNotified: new Date() });
};

/**
 * Static method to find favorites by tag
 * @param {string} userId - User ID
 * @param {string} tag - Tag to search for
 * @returns {Promise<Array>} Array of favorites with the specified tag
 */
favoriteSchema.statics.findByTag = function (userId, tag) {
  return this.find({ user: userId, tags: tag })
    .sort({ createdAt: -1 })
    .populate({
      path: 'ad',
      select: 'title description price images advertiser location category',
      populate: {
        path: 'advertiser',
        select: 'username profileImage',
      },
    });
};

/**
 * Static method to find favorites by priority
 * @param {string} userId - User ID
 * @param {string} priority - Priority level (low, normal, high)
 * @returns {Promise<Array>} Array of favorites with the specified priority
 */
favoriteSchema.statics.findByPriority = function (userId, priority) {
  return this.find({ user: userId, priority })
    .sort({ createdAt: -1 })
    .populate({
      path: 'ad',
      select: 'title description price images advertiser location category',
      populate: {
        path: 'advertiser',
        select: 'username profileImage',
      },
    });
};

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
