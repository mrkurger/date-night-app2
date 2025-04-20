// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (travel.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import Ad from '../models/ad.model.js'; // Added .js
import User from '../models/user.model.js'; // Added .js
import { AppError } from '../middleware/errorHandler.js'; // Added .js
import socketService from './socket.service.js'; // Added .js
import { logger } from '../utils/logger.js'; // Added .js
import NodeCache from 'node-cache';
import axios from 'axios';
import config from '../config/index.js'; // Assuming config exports from an index.js

// Initialize cache with 5 minute TTL and check period of 10 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

class TravelService {
  /**
   * Get all travel itineraries for an ad
   * @param {string} adId - Ad ID
   * @returns {Promise<Array>} Array of travel itineraries
   */
  async getItineraries(adId) {
    try {
      // Check cache first
      const cacheKey = `itineraries:${adId}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        logger.debug(`Cache hit for itineraries of ad ${adId}`);
        return cachedData;
      }

      const ad = await Ad.findById(adId);

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      const itineraries = ad.travelItinerary || [];

      // Cache the result
      cache.set(cacheKey, itineraries);

      return itineraries;
    } catch (error) {
      logger.error(`Error getting travel itineraries for ad ${adId}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'Failed to get travel itineraries', 500);
    }
  }

  /**
   * Add a travel itinerary to an ad
   * @param {string} adId - Ad ID
   * @param {Object} itineraryData - Itinerary data
   * @param {string} userId - User ID (must be the advertiser)
   * @returns {Promise<Object>} Updated ad
   */
  async addItinerary(adId, itineraryData, userId) {
    try {
      const ad = await Ad.findById(adId).populate('advertiser');

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      // Check if user is the advertiser
      if (ad.advertiser._id.toString() !== userId) {
        logger.warn(`Unauthorized attempt to add itinerary to ad ${adId} by user ${userId}`);
        throw new AppError('You are not authorized to update this ad', 403);
      }

      // Add geolocation data if not provided
      if (itineraryData.destination && !itineraryData.destination.location) {
        itineraryData.destination.location = await this.geocodeLocation(
          itineraryData.destination.city,
          itineraryData.destination.county,
          itineraryData.destination.country || 'Norway'
        );
      }

      // Add itinerary
      await ad.addTravelItinerary(itineraryData);

      // Notify followers if any
      await this.notifyFollowers(ad._id, ad.advertiser.username, itineraryData);

      // Invalidate cache
      this.invalidateCache(adId);

      return ad;
    } catch (error) {
      logger.error(`Error adding travel itinerary to ad ${adId}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'Failed to add travel itinerary', 500);
    }
  }

  /**
   * Update a travel itinerary
   * @param {string} adId - Ad ID
   * @param {string} itineraryId - Itinerary ID
   * @param {Object} updates - Updates to apply
   * @param {string} userId - User ID (must be the advertiser)
   * @returns {Promise<Object>} Updated ad
   */
  async updateItinerary(adId, itineraryId, updates, userId) {
    try {
      const ad = await Ad.findById(adId);

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      // Check if user is the advertiser
      if (ad.advertiser.toString() !== userId) {
        logger.warn(
          `Unauthorized attempt to update itinerary ${itineraryId} for ad ${adId} by user ${userId}`
        );
        throw new AppError('You are not authorized to update this ad', 403);
      }

      // Check if itinerary exists
      const itinerary = ad.travelItinerary.id(itineraryId);
      if (!itinerary) {
        throw new AppError('Itinerary not found', 404);
      }

      // Add geolocation data if destination is updated but location is not provided
      if (updates.destination && !updates.destination.location) {
        updates.destination.location = await this.geocodeLocation(
          updates.destination.city || itinerary.destination.city,
          updates.destination.county || itinerary.destination.county,
          updates.destination.country || itinerary.destination.country || 'Norway'
        );
      }

      // Update itinerary
      await ad.updateTravelItinerary(itineraryId, updates);

      // If status changed to active, notify followers
      if (updates.status === 'active') {
        const updatedItinerary = ad.travelItinerary.id(itineraryId);
        const advertiser = await User.findById(ad.advertiser);
        await this.notifyFollowers(ad._id, advertiser.username, updatedItinerary);
      }

      // Invalidate cache
      this.invalidateCache(adId);

      return ad;
    } catch (error) {
      logger.error(`Error updating travel itinerary ${itineraryId} for ad ${adId}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'Failed to update travel itinerary', 500);
    }
  }

  /**
   * Cancel a travel itinerary
   * @param {string} adId - Ad ID
   * @param {string} itineraryId - Itinerary ID
   * @param {string} userId - User ID (must be the advertiser)
   * @returns {Promise<Object>} Updated ad
   */
  async cancelItinerary(adId, itineraryId, userId) {
    try {
      const ad = await Ad.findById(adId);

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      // Check if user is the advertiser
      if (ad.advertiser.toString() !== userId) {
        logger.warn(
          `Unauthorized attempt to cancel itinerary ${itineraryId} for ad ${adId} by user ${userId}`
        );
        throw new AppError('You are not authorized to update this ad', 403);
      }

      // Get itinerary before cancelling for notification
      const itinerary = ad.travelItinerary.id(itineraryId);

      if (!itinerary) {
        throw new AppError('Itinerary not found', 404);
      }

      // Cancel itinerary
      await ad.cancelTravelItinerary(itineraryId);

      // Notify followers about cancellation
      const advertiser = await User.findById(ad.advertiser);
      await this.notifyCancellation(ad._id, advertiser.username, itinerary);

      // Invalidate cache
      this.invalidateCache(adId);

      return ad;
    } catch (error) {
      logger.error(`Error cancelling travel itinerary ${itineraryId} for ad ${adId}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'Failed to cancel travel itinerary', 500);
    }
  }

  /**
   * Update advertiser's current location
   * @param {string} adId - Ad ID
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {string} userId - User ID (must be the advertiser)
   * @returns {Promise<Object>} Updated ad
   */
  async updateLocation(adId, longitude, latitude, userId) {
    try {
      const ad = await Ad.findById(adId);

      if (!ad) {
        throw new AppError('Ad not found', 404);
      }

      // Check if user is the advertiser
      if (ad.advertiser.toString() !== userId) {
        logger.warn(`Unauthorized attempt to update location for ad ${adId} by user ${userId}`);
        throw new AppError('You are not authorized to update this ad', 403);
      }

      // Verify location is within reasonable bounds
      if (!this.isValidCoordinate(longitude, latitude)) {
        throw new AppError('Invalid coordinates provided', 400);
      }

      // Update location
      await ad.updateCurrentLocation(longitude, latitude);

      // Invalidate location-based caches
      this.invalidateLocationCaches();

      return ad;
    } catch (error) {
      logger.error(`Error updating location for ad ${adId}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message || 'Failed to update location', 500);
    }
  }

  /**
   * Find touring advertisers
   * @returns {Promise<Array>} Array of ads
   */
  async findTouringAdvertisers() {
    try {
      // Check cache first
      const cacheKey = 'touring:advertisers';
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        logger.debug('Cache hit for touring advertisers');
        return cachedData;
      }

      const ads = await Ad.findTouring()
        .populate('advertiser', 'username profileImage')
        .sort('-createdAt');

      // Cache the result
      cache.set(cacheKey, ads, 60); // 1 minute TTL for touring data (more dynamic)

      return ads;
    } catch (error) {
      logger.error('Error finding touring advertisers:', error);
      throw new AppError(error.message || 'Failed to find touring advertisers', 500);
    }
  }

  /**
   * Find upcoming tours
   * @param {string} city - Optional city filter
   * @param {string} county - Optional county filter
   * @param {number} daysAhead - Days ahead to look (default: 30)
   * @returns {Promise<Array>} Array of ads
   */
  async findUpcomingTours(city = null, county = null, daysAhead = 30) {
    try {
      // Check cache first
      const cacheKey = `upcoming:${city || 'all'}:${county || 'all'}:${daysAhead}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        logger.debug(
          `Cache hit for upcoming tours (city: ${city}, county: ${county}, days: ${daysAhead})`
        );
        return cachedData;
      }

      const ads = await Ad.findUpcomingTours(city, county, daysAhead)
        .populate('advertiser', 'username profileImage')
        .sort('travelItinerary.arrivalDate');

      // Cache the result
      cache.set(cacheKey, ads, 300); // 5 minute TTL

      return ads;
    } catch (error) {
      logger.error(
        `Error finding upcoming tours (city: ${city}, county: ${county}, days: ${daysAhead}):`,
        error
      );
      throw new AppError(error.message || 'Failed to find upcoming tours', 500);
    }
  }

  /**
   * Find ads by location (including touring advertisers)
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {number} maxDistance - Max distance in meters (default: 10000)
   * @returns {Promise<Array>} Array of ads
   */
  async findByLocation(longitude, latitude, maxDistance = 10000) {
    try {
      // For location queries, use a shorter cache time as locations change frequently
      const cacheKey = `location:${longitude.toFixed(3)}:${latitude.toFixed(3)}:${maxDistance}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        logger.debug(`Cache hit for location search (${longitude}, ${latitude}, ${maxDistance}m)`);
        return cachedData;
      }

      const ads = await Ad.findByCurrentLocation(longitude, latitude, maxDistance)
        .populate('advertiser', 'username profileImage')
        .sort('-featured -boosted -createdAt');

      // Cache the result with a shorter TTL
      cache.set(cacheKey, ads, 60); // 1 minute TTL for location data

      return ads;
    } catch (error) {
      logger.error(
        `Error finding ads by location (${longitude}, ${latitude}, ${maxDistance}m):`,
        error
      );
      throw new AppError(error.message || 'Failed to find ads by location', 500);
    }
  }

  /**
   * Notify followers about new or updated travel itinerary
   * @param {string} adId - Ad ID
   * @param {string} advertiserName - Advertiser username
   * @param {Object} itinerary - Itinerary data
   */
  async notifyFollowers(adId, advertiserName, itinerary) {
    try {
      // Find users who follow this advertiser
      const followers = await User.find({
        'following.advertiser': adId,
      });

      if (followers.length === 0) {
        return;
      }

      const arrivalDate = new Date(itinerary.arrivalDate).toLocaleDateString();
      const departureDate = new Date(itinerary.departureDate).toLocaleDateString();

      const notification = {
        type: 'ad',
        message: `${advertiserName} will be in ${itinerary.destination.city} from ${arrivalDate} to ${departureDate}`,
        data: {
          adId,
          itineraryId: itinerary._id,
          destination: itinerary.destination.city,
          arrivalDate: itinerary.arrivalDate,
          departureDate: itinerary.departureDate,
        },
        timestamp: new Date(),
      };

      // Send notification to each follower
      const notificationPromises = followers.map(follower =>
        socketService.sendNotification(follower._id.toString(), notification)
      );

      await Promise.allSettled(notificationPromises);

      logger.info(
        `Sent travel itinerary notifications to ${followers.length} followers for ad ${adId}`
      );
    } catch (error) {
      logger.error(`Error notifying followers about itinerary for ad ${adId}:`, error);
      // Don't throw here to prevent the main operation from failing
    }
  }

  /**
   * Notify followers about cancelled travel itinerary
   * @param {string} adId - Ad ID
   * @param {string} advertiserName - Advertiser username
   * @param {Object} itinerary - Itinerary data
   */
  async notifyCancellation(adId, advertiserName, itinerary) {
    try {
      // Find users who follow this advertiser
      const followers = await User.find({
        'following.advertiser': adId,
      });

      if (followers.length === 0) {
        return;
      }

      const arrivalDate = new Date(itinerary.arrivalDate).toLocaleDateString();
      const departureDate = new Date(itinerary.departureDate).toLocaleDateString();

      const notification = {
        type: 'ad',
        message: `${advertiserName} has cancelled their trip to ${itinerary.destination.city} (${arrivalDate} - ${departureDate})`,
        data: {
          adId,
          itineraryId: itinerary._id,
          destination: itinerary.destination.city,
          cancelled: true,
        },
        timestamp: new Date(),
      };

      // Send notification to each follower
      const notificationPromises = followers.map(follower =>
        socketService.sendNotification(follower._id.toString(), notification)
      );

      await Promise.allSettled(notificationPromises);

      logger.info(
        `Sent cancellation notifications to ${followers.length} followers for ad ${adId}`
      );
    } catch (error) {
      logger.error(`Error notifying followers about cancellation for ad ${adId}:`, error);
      // Don't throw here to prevent the main operation from failing
    }
  }

  /**
   * Geocode a location to get coordinates
   * @param {string} city - City name
   * @param {string} county - County name
   * @param {string} country - Country name (default: Norway)
   * @returns {Promise<Object>} Location object with coordinates
   */
  async geocodeLocation(city, county, country) {
    try {
      // Use the geocoding API endpoint instead of directly calling the service
      const apiUrl = `${config.apiBaseUrl}/geocoding/forward`;
      const response = await axios.get(apiUrl, {
        params: {
          city,
          county,
          country,
        },
        // Use a short timeout to ensure quick fallback
        timeout: 5000,
      });

      if (response.data && response.data.coordinates) {
        return response.data;
      }

      // If API call succeeds but returns no data, try a fallback approach
      logger.warn(
        `Geocoding API returned no data for ${city}, ${county}, ${country}. Using fallback.`
      );
      return this.geocodeLocationFallback(city, county, country);
    } catch (error) {
      logger.error(`Error geocoding location (${city}, ${county}, ${country}):`, error);
      // If API call fails, try a fallback approach
      return this.geocodeLocationFallback(city, county, country);
    }
  }

  /**
   * Fallback method for geocoding when the API fails
   * @param {string} city - City name
   * @param {string} county - County name
   * @param {string} country - Country name
   * @returns {Promise<Object|null>} Location object with coordinates or null
   */
  async geocodeLocationFallback(city, county, country) {
    try {
      logger.info(`Using fallback geocoding for ${city}, ${county}, ${country}`);

      // Try to use a cached location first
      const cacheKey = `geocode:${city}:${county}:${country}`.toLowerCase();
      const cachedLocation = cache.get(cacheKey);

      if (cachedLocation) {
        logger.debug(`Using cached location for ${city}, ${county}, ${country}`);
        return cachedLocation;
      }

      // Try Nominatim API directly as a last resort
      const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
      const queryString = encodeURIComponent(`${city}, ${county}, ${country}`);

      const response = await axios.get(`${nominatimUrl}?q=${queryString}&format=json&limit=1`, {
        headers: {
          'User-Agent': 'DateNightApp/1.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 5000,
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const location = {
          type: 'Point',
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
          source: 'nominatim_fallback',
        };

        // Cache the result for future use
        cache.set(cacheKey, location, 86400); // 1 day TTL

        return location;
      }

      // If all else fails, return default coordinates (Oslo, Norway)
      logger.warn(
        `All geocoding methods failed for ${city}, ${county}, ${country}. Using default coordinates.`
      );
      return {
        type: 'Point',
        coordinates: [10.7522, 59.9139], // Oslo coordinates
        source: 'default',
      };
    } catch (error) {
      logger.error(`Fallback geocoding failed for ${city}, ${county}, ${country}:`, error);
      // Return default coordinates as a last resort
      return {
        type: 'Point',
        coordinates: [10.7522, 59.9139], // Oslo coordinates
        source: 'default',
      };
    }
  }

  /**
   * Validate coordinates
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @returns {boolean} Whether coordinates are valid
   */
  isValidCoordinate(longitude, latitude) {
    return (
      !isNaN(longitude) &&
      !isNaN(latitude) &&
      longitude >= -180 &&
      longitude <= 180 &&
      latitude >= -90 &&
      latitude <= 90
    );
  }

  /**
   * Invalidate cache for a specific ad
   * @param {string} adId - Ad ID
   */
  invalidateCache(adId) {
    cache.del(`itineraries:${adId}`);
    // Also invalidate general caches that might contain this ad
    this.invalidateGeneralCaches();
  }

  /**
   * Invalidate location-based caches
   */
  invalidateLocationCaches() {
    // Get all keys and delete those related to locations
    const keys = cache.keys();
    const locationKeys = keys.filter(key => key.startsWith('location:'));
    locationKeys.forEach(key => cache.del(key));

    // Also invalidate touring advertisers cache
    cache.del('touring:advertisers');
  }

  /**
   * Invalidate general caches
   */
  invalidateGeneralCaches() {
    cache.del('touring:advertisers');

    // Get all keys and delete those related to upcoming tours
    const keys = cache.keys();
    const upcomingKeys = keys.filter(key => key.startsWith('upcoming:'));
    upcomingKeys.forEach(key => cache.del(key));
  }
}

export default new TravelService();
