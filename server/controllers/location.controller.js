// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for location.controller settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import Location from '../models/location.model.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Controller for managing locations
 */
class LocationController {
  /**
   * Search locations by name
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async searchLocations(req, res, next) {
    try {
      const { query, limit = 10 } = req.query;

      if (!query) {
        return next(new AppError('Search query is required', 400));
      }

      const locations = await Location.findByName(query, parseInt(limit));

      res.status(200).json(locations);
    } catch (error) {
      logger.error('Error searching locations:', error);
      next(new AppError('Failed to search locations', 500));
    }
  }

  /**
   * Get locations near coordinates
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getNearbyLocations(req, res, next) {
    try {
      const { longitude, latitude, maxDistance = 10000, limit = 10 } = req.query;

      if (!longitude || !latitude) {
        return next(new AppError('Longitude and latitude are required', 400));
      }

      const locations = await Location.findNearby(
        parseFloat(longitude),
        parseFloat(latitude),
        parseInt(maxDistance),
        parseInt(limit)
      );

      res.status(200).json(locations);
    } catch (error) {
      logger.error('Error getting nearby locations:', error);
      next(new AppError('Failed to get nearby locations', 500));
    }
  }

  /**
   * Get popular locations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPopularLocations(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const locations = await Location.getPopular(parseInt(limit));

      res.status(200).json(locations);
    } catch (error) {
      logger.error('Error getting popular locations:', error);
      next(new AppError('Failed to get popular locations', 500));
    }
  }

  /**
   * Get location by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getLocationById(req, res, next) {
    try {
      const { id } = req.params;

      const location = await Location.findById(id);

      if (!location) {
        return next(new AppError('Location not found', 404));
      }

      // Increment search count
      await Location.incrementSearchCount(id);

      res.status(200).json(location);
    } catch (error) {
      logger.error('Error getting location by ID:', error);
      next(new AppError('Failed to get location', 500));
    }
  }

  /**
   * Create a new location (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createLocation(req, res, next) {
    try {
      const { city, county, country, coordinates, source, population, timezone, postalCodes } =
        req.body;

      if (!city || !county || !coordinates) {
        return next(new AppError('City, county, and coordinates are required', 400));
      }

      // Check if location already exists
      const existingLocation = await Location.findOne({
        city,
        county,
        country: country || 'Norway',
      });

      if (existingLocation) {
        return next(new AppError('Location already exists', 400));
      }

      const location = new Location({
        city,
        county,
        country: country || 'Norway',
        coordinates,
        source: source || 'manual',
        population,
        timezone,
        postalCodes,
      });

      await location.save();

      res.status(201).json(location);
    } catch (error) {
      logger.error('Error creating location:', error);
      next(new AppError('Failed to create location', 500));
    }
  }

  /**
   * Update a location (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const location = await Location.findById(id);

      if (!location) {
        return next(new AppError('Location not found', 404));
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (key !== '_id' && key !== 'createdAt') {
          location[key] = updates[key];
        }
      });

      location.lastUpdated = new Date();

      await location.save();

      res.status(200).json(location);
    } catch (error) {
      logger.error('Error updating location:', error);
      next(new AppError('Failed to update location', 500));
    }
  }

  /**
   * Delete a location (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteLocation(req, res, next) {
    try {
      const { id } = req.params;

      const result = await Location.findByIdAndDelete(id);

      if (!result) {
        return next(new AppError('Location not found', 404));
      }

      res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
      logger.error('Error deleting location:', error);
      next(new AppError('Failed to delete location', 500));
    }
  }
}

const locationController = new LocationController();

export default locationController;
export { locationController };

export async function someHandler(req, res) {
  try {
    const result = await doSomething();
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, err, err.status || 500);
  }
}
