// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for favorite.model settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const mongoose = require('mongoose');

/**
 * Favorite model for storing user favorites
 *
 * This model tracks which ads users have favorited, allowing for:
 * - Quick access to a user's favorite ads
 * - Filtering and sorting favorites
 * - Notifications when favorited advertisers update their profiles or travel plans
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
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
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

/**
 * Static method to get all favorites for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of favorites with populated ad data
 */
favoriteSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'ad',
      select: 'title description profileImage advertiser location',
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
    await favorite.remove();
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

module.exports = mongoose.model('Favorite', favoriteSchema);
