// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for favorite.controller settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import Favorite from '../models/favorite.model.js';
import Ad from '../models/ad.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

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

      // Extract query parameters for filtering and sorting
      const {
        sort,
        category,
        county,
        city,
        search,
        priority,
        priceMin,
        priceMax,
        dateFrom,
        dateTo,
        tags,
      } = req.query;

      // Build query options
      const options = {
        sort: this.parseSortOption(sort),
        filters: this.buildFilters({
          category,
          county,
          city,
          search,
          priority,
          priceMin,
          priceMax,
          dateFrom,
          dateTo,
          tags,
        }),
      };

      const favorites = await Favorite.findByUser(userId, options);

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
        tags: req.body.tags || [],
        priority: req.body.priority || 'normal',
      });

      await favorite.save();

      res.status(201).json({ message: 'Ad added to favorites' });
    } catch (error) {
      logger.error('Error adding favorite:', error);
      next(new AppError('Failed to add favorite', 500));
    }
  }

  /**
   * Add multiple ads to favorites in a batch operation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addFavoritesBatch(req, res, next) {
    try {
      const userId = req.user._id;
      const { adIds, notes, notificationsEnabled, tags, priority } = req.body;

      if (!adIds || !Array.isArray(adIds) || adIds.length === 0) {
        return next(new AppError('No ad IDs provided', 400));
      }

      // Validate that all ads exist
      const ads = await Ad.find({ _id: { $in: adIds } });
      if (ads.length !== adIds.length) {
        const foundIds = ads.map(ad => ad._id.toString());
        const missingIds = adIds.filter(id => !foundIds.includes(id));
        return next(new AppError(`Some ads were not found: ${missingIds.join(', ')}`, 404));
      }

      // Find existing favorites to avoid duplicates
      const existingFavorites = await Favorite.find({
        user: userId,
        ad: { $in: adIds },
      });

      const existingAdIds = existingFavorites.map(fav => fav.ad.toString());
      const newAdIds = adIds.filter(id => !existingAdIds.includes(id));

      // Create new favorites
      if (newAdIds.length > 0) {
        const favoritesToCreate = newAdIds.map(adId => ({
          user: userId,
          ad: adId,
          notes: notes || '',
          notificationsEnabled: notificationsEnabled !== false,
          tags: tags || [],
          priority: priority || 'normal',
        }));

        await Favorite.insertMany(favoritesToCreate);
      }

      res.status(201).json({
        message: 'Batch favorite operation completed',
        added: newAdIds.length,
        alreadyFavorited: existingAdIds.length,
      });
    } catch (error) {
      logger.error('Error adding favorites batch:', error);
      next(new AppError('Failed to add favorites batch', 500));
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
   * Remove multiple ads from favorites in a batch operation
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeFavoritesBatch(req, res, next) {
    try {
      const userId = req.user._id;
      const { adIds } = req.body;

      if (!adIds || !Array.isArray(adIds) || adIds.length === 0) {
        return next(new AppError('No ad IDs provided', 400));
      }

      const result = await Favorite.deleteMany({
        user: userId,
        ad: { $in: adIds },
      });

      res.status(200).json({
        message: 'Batch removal completed',
        removed: result.deletedCount,
      });
    } catch (error) {
      logger.error('Error removing favorites batch:', error);
      next(new AppError('Failed to remove favorites batch', 500));
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

  /**
   * Update favorite tags
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateFavoriteTags(req, res, next) {
    try {
      const userId = req.user._id;
      const adId = req.params.adId;
      const { tags } = req.body;

      if (!Array.isArray(tags)) {
        return next(new AppError('Tags must be an array', 400));
      }

      const favorite = await Favorite.findOne({ user: userId, ad: adId });

      if (!favorite) {
        return next(new AppError('Favorite not found', 404));
      }

      favorite.tags = tags;
      await favorite.save();

      res.status(200).json({
        message: 'Favorite tags updated',
        tags: favorite.tags,
      });
    } catch (error) {
      logger.error('Error updating favorite tags:', error);
      next(new AppError('Failed to update favorite tags', 500));
    }
  }

  /**
   * Update favorite priority
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateFavoritePriority(req, res, next) {
    try {
      const userId = req.user._id;
      const adId = req.params.adId;
      const { priority } = req.body;

      const validPriorities = ['low', 'normal', 'high'];
      if (!validPriorities.includes(priority)) {
        return next(new AppError('Invalid priority value. Must be low, normal, or high', 400));
      }

      const favorite = await Favorite.findOne({ user: userId, ad: adId });

      if (!favorite) {
        return next(new AppError('Favorite not found', 404));
      }

      favorite.priority = priority;
      await favorite.save();

      res.status(200).json({
        message: 'Favorite priority updated',
        priority: favorite.priority,
      });
    } catch (error) {
      logger.error('Error updating favorite priority:', error);
      next(new AppError('Failed to update favorite priority', 500));
    }
  }

  /**
   * Get all tags used by the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserTags(req, res, next) {
    try {
      const userId = req.user._id;

      // Aggregate to get unique tags and their counts
      const tagStats = await Favorite.aggregate([
        { $match: { user: userId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { tag: '$_id', count: 1, _id: 0 } },
      ]);

      res.status(200).json(tagStats);
    } catch (error) {
      logger.error('Error getting user tags:', error);
      next(new AppError('Failed to get user tags', 500));
    }
  }

  /**
   * Parse sort option from query parameter
   * @param {string} sortOption - Sort option from query
   * @returns {Object} MongoDB sort object
   * @private
   */
  parseSortOption(sortOption) {
    if (!sortOption) return { createdAt: -1 }; // Default sort by creation date (newest first)

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { 'ad.price': 1 },
      'price-desc': { 'ad.price': -1 },
      'title-asc': { 'ad.title': 1 },
      'title-desc': { 'ad.title': -1 },
      'priority-high': { priority: -1 }, // High priority first
      'priority-low': { priority: 1 }, // Low priority first
    };

    return sortMap[sortOption] || { createdAt: -1 };
  }

  /**
   * Build filter object for database query
   * @param {Object} filterOptions - Filter options
   * @returns {Object} MongoDB filter object
   * @private
   */
  buildFilters({
    category,
    county,
    city,
    search,
    priority,
    priceMin,
    priceMax,
    dateFrom,
    dateTo,
    tags,
  }) {
    const filters = {};

    if (category) {
      filters['ad.category'] = category;
    }

    if (county) {
      filters['ad.location.county'] = county;
    }

    if (city) {
      filters['ad.location.city'] = city;
    }

    if (priority) {
      filters['priority'] = priority;
    }

    // Handle price range
    if (priceMin || priceMax) {
      filters['ad.price'] = {};

      if (priceMin) {
        filters['ad.price'].$gte = Number(priceMin);
      }

      if (priceMax) {
        filters['ad.price'].$lte = Number(priceMax);
      }
    }

    // Handle date range
    if (dateFrom || dateTo) {
      filters['createdAt'] = {};

      if (dateFrom) {
        filters['createdAt'].$gte = new Date(dateFrom);
      }

      if (dateTo) {
        // Add one day to include the end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        filters['createdAt'].$lte = endDate;
      }
    }

    // Handle tags (which can be an array or a single value)
    if (tags) {
      if (Array.isArray(tags)) {
        filters['tags'] = { $all: tags };
      } else {
        filters['tags'] = tags;
      }
    }

    if (search) {
      filters['$or'] = [
        { 'ad.title': { $regex: search, $options: 'i' } },
        { 'ad.description': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    return filters;
  }
}

const favoriteController = new FavoriteController();
export default favoriteController;
