// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for favorite.controller settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const Favorite = require('../models/favorite.model');
const Ad = require('../models/ad.model');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger').logger;

/**
 * Controller for managing user favorites
 */
class FavoriteController {
  /**
   * Get all favorites for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getFavorites(req, res, next) {
    try {
      const userId = req.user._id;
      const favorites = await Favorite.findByUser(userId);

      res.status(200).json(favorites);
    } catch (error) {
      logger.error('Error getting favorites:', error);
      next(new AppError('Failed to get favorites', 500));
    }
  }

  /**
   * Get favorite ad IDs for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getFavoriteIds(req, res, next) {
    try {
      const userId = req.user._id;
      const favoriteIds = await Favorite.getFavoriteIds(userId);

      res.status(200).json(favoriteIds);
    } catch (error) {
      logger.error('Error getting favorite IDs:', error);
      next(new AppError('Failed to get favorite IDs', 500));
    }
  }

  /**
   * Check if an ad is favorited by the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async checkFavorite(req, res, next) {
    try {
      const userId = req.user._id;
      const adId = req.params.adId;

      const isFavorite = await Favorite.isFavorite(userId, adId);

      res.status(200).json(isFavorite);
    } catch (error) {
      logger.error('Error checking favorite status:', error);
      next(new AppError('Failed to check favorite status', 500));
    }
  }

  /**
   * Add an ad to favorites
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addFavorite(req, res, next) {
    try {
      const userId = req.user._id;
      const adId = req.params.adId;

      // Check if ad exists
      const ad = await Ad.findById(adId);
      if (!ad) {
        return next(new AppError('Ad not found', 404));
      }

      // Create favorite if it doesn't exist
      const existingFavorite = await Favorite.findOne({ user: userId, ad: adId });
      if (existingFavorite) {
        return res.status(200).json({ message: 'Ad is already in favorites' });
      }

      const favorite = new Favorite({
        user: userId,
        ad: adId,
        notes: req.body.notes || '',
        notificationsEnabled: req.body.notificationsEnabled !== false,
      });

      await favorite.save();

      res.status(201).json({ message: 'Ad added to favorites' });
    } catch (error) {
      logger.error('Error adding favorite:', error);
      next(new AppError('Failed to add favorite', 500));
    }
  }

  /**
   * Remove an ad from favorites
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeFavorite(req, res, next) {
    try {
      const userId = req.user._id;
      const adId = req.params.adId;

      const result = await Favorite.deleteOne({ user: userId, ad: adId });

      if (result.deletedCount === 0) {
        return next(new AppError('Favorite not found', 404));
      }

      res.status(200).json({ message: 'Ad removed from favorites' });
    } catch (error) {
      logger.error('Error removing favorite:', error);
      next(new AppError('Failed to remove favorite', 500));
    }
  }

  /**
   * Update favorite notes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateFavoriteNotes(req, res, next) {
    try {
      const userId = req.user._id;
      const adId = req.params.adId;
      const { notes } = req.body;

      const favorite = await Favorite.findOne({ user: userId, ad: adId });

      if (!favorite) {
        return next(new AppError('Favorite not found', 404));
      }

      favorite.notes = notes;
      await favorite.save();

      res.status(200).json({ message: 'Favorite notes updated' });
    } catch (error) {
      logger.error('Error updating favorite notes:', error);
      next(new AppError('Failed to update favorite notes', 500));
    }
  }

  /**
   * Toggle notifications for a favorite
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async toggleNotifications(req, res, next) {
    try {
      const userId = req.user._id;
      const adId = req.params.adId;

      const favorite = await Favorite.findOne({ user: userId, ad: adId });

      if (!favorite) {
        return next(new AppError('Favorite not found', 404));
      }

      favorite.notificationsEnabled = !favorite.notificationsEnabled;
      await favorite.save();

      res.status(200).json({
        notificationsEnabled: favorite.notificationsEnabled,
        message: `Notifications ${favorite.notificationsEnabled ? 'enabled' : 'disabled'} for this favorite`,
      });
    } catch (error) {
      logger.error('Error toggling favorite notifications:', error);
      next(new AppError('Failed to toggle notifications', 500));
    }
  }
}

module.exports = new FavoriteController();
