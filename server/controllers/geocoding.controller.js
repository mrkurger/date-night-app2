// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for geocoding.controller settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const geocodingService = require('../services/geocoding.service');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger').logger;

/**
 * Controller for geocoding operations
 */
class GeocodingController {
  /**
   * Forward geocode an address to coordinates
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async forwardGeocode(req, res, next) {
    try {
      const { address, city, county, country } = req.query;

      if (!address && (!city || !county)) {
        return next(
          new AppError(
            'Either address or city and county parameters are required for forward geocoding',
            400
          )
        );
      }

      let result;

      // If address is provided, use it directly
      if (address) {
        // Extract city, county, country from address (simple implementation)
        const parts = address.split(',').map(part => part.trim());
        const extractedCity = parts[0] || '';
        const extractedCounty = parts[1] || '';
        const extractedCountry = parts[2] || country || 'Norway';

        result = await geocodingService.geocodeLocation(
          extractedCity,
          extractedCounty,
          extractedCountry
        );
      } else {
        // Use city, county, country parameters
        result = await geocodingService.geocodeLocation(city, county, country || 'Norway');
      }

      if (!result) {
        return next(new AppError('Could not geocode the provided location', 404));
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in forward geocoding:', error);
      next(new AppError(error.message || 'Failed to geocode location', 500));
    }
  }

  /**
   * Reverse geocode coordinates to an address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async reverseGeocode(req, res, next) {
    try {
      const { longitude, latitude } = req.query;

      if (!longitude || !latitude) {
        return next(
          new AppError(
            'Both longitude and latitude parameters are required for reverse geocoding',
            400
          )
        );
      }

      const parsedLongitude = parseFloat(longitude);
      const parsedLatitude = parseFloat(latitude);

      if (isNaN(parsedLongitude) || isNaN(parsedLatitude)) {
        return next(new AppError('Invalid longitude or latitude values', 400));
      }

      const result = await geocodingService.reverseGeocode(parsedLongitude, parsedLatitude);

      if (!result) {
        return next(new AppError('Could not reverse geocode the provided coordinates', 404));
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in reverse geocoding:', error);
      next(new AppError(error.message || 'Failed to reverse geocode coordinates', 500));
    }
  }

  /**
   * Get geocoding cache statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getCacheStats(req, res, next) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return next(new AppError('Unauthorized: Admin access required', 403));
      }

      const stats = geocodingService.getCacheStats();
      res.status(200).json(stats);
    } catch (error) {
      logger.error('Error getting geocoding cache stats:', error);
      next(new AppError(error.message || 'Failed to get cache statistics', 500));
    }
  }

  /**
   * Clear geocoding cache
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async clearCache(req, res, next) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return next(new AppError('Unauthorized: Admin access required', 403));
      }

      const deletedCount = geocodingService.clearCache();
      res.status(200).json({
        success: true,
        message: `Cleared ${deletedCount} entries from geocoding cache`,
        deletedCount,
      });
    } catch (error) {
      logger.error('Error clearing geocoding cache:', error);
      next(new AppError(error.message || 'Failed to clear cache', 500));
    }
  }
}

module.exports = new GeocodingController();
