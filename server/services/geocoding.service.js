// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for geocoding service configuration
//
// COMMON CUSTOMIZATIONS:
// - NOMINATIM_DELAY_MS: Delay between Nominatim API calls in milliseconds (default: 1000)
//   Related to: travel.service.js:geocodeLocation
// - DEFAULT_COORDINATES: Default coordinates to use when geocoding fails (default: Oslo)
//   Related to: travel.service.js:geocodeLocation
// ===================================================
import axios from 'axios';
import Location from '../models/location.model.js'; // Added .js
import { AppError } from '../middleware/errorHandler.js'; // Added .js
import { logger } from '../utils/logger.js'; // Added .js
import NodeCache from 'node-cache';
import LRU from 'lru-cache';
import fetch from 'node-fetch';

// Initialize cache with 1 day TTL and check period of 1 hour
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });
const lruCache = new LRU({ max: 500, ttl: 1000 * 60 * 5 }); // 5m

export async function geocode(addr) {
  const key = addr.toLowerCase();
  if (lruCache.has(key)) return lruCache.get(key);
  const res = await fetch(`https://maps.api/geocode?addr=${encodeURIComponent(addr)}`);
  const data = await res.json();
  lruCache.set(key, data);
  return data;
}

/**
 * Geocoding service for converting addresses to coordinates and vice versa
 * Provides multiple fallback strategies:
 * 1. Local cache
 * 2. Database lookup
 * 3. Nominatim API
 * 4. Default coordinates (Oslo)
 */
class GeocodingService {
  constructor() {
    // Nominatim API settings
    this.nominatimUrl = 'https://nominatim.openstreetmap.org';
    this.nominatimDelayMs = 1000; // Respect Nominatim usage policy (1 request per second)
    this.userAgent = 'DateNightApp/1.0';

    // Default coordinates (Oslo, Norway)
    this.defaultCoordinates = [10.7522, 59.9139];
  }

  /**
   * Geocode a location to get coordinates
   * @param {string} city - City name
   * @param {string} county - County name
   * @param {string} country - Country name (default: Norway)
   * @returns {Promise<Object>} Location object with coordinates
   */
  async geocodeLocation(city, county, country = 'Norway') {
    try {
      logger.info(`Geocoding location: ${city}, ${county}, ${country}`);

      // Check cache first
      const cacheKey = `geocode:${city}:${county}:${country}`.toLowerCase();
      const cachedResult = cache.get(cacheKey);

      if (cachedResult) {
        logger.debug(`Cache hit for location: ${city}, ${county}, ${country}`);
        return cachedResult;
      }

      // Try to get coordinates from our location database
      const location = await this.findLocationInDatabase(city, county, country);

      if (location) {
        const result = {
          type: 'Point',
          coordinates: location.coordinates,
          source: 'database',
        };

        // Cache the result
        cache.set(cacheKey, result);
        return result;
      }

      // If not found in database, use Nominatim API
      const nominatimResult = await this.geocodeWithNominatim(city, county, country);

      if (nominatimResult) {
        // Save to database for future use
        await this.saveLocationToDatabase(city, county, country, nominatimResult.coordinates);

        // Cache the result
        cache.set(cacheKey, nominatimResult);
        return nominatimResult;
      }

      // If all else fails, return default coordinates (Oslo)
      logger.warn(
        `Could not geocode location: ${city}, ${county}, ${country}. Using default coordinates.`
      );

      const defaultResult = {
        type: 'Point',
        coordinates: this.defaultCoordinates,
        source: 'default',
      };

      return defaultResult;
    } catch (error) {
      logger.error(`Error geocoding location (${city}, ${county}, ${country}):`, error);
      throw new AppError(`Failed to geocode location: ${error.message}`, 500);
    }
  }

  /**
   * Reverse geocode coordinates to get location information
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @returns {Promise<Object>} Location information
   */
  async reverseGeocode(longitude, latitude) {
    try {
      logger.info(`Reverse geocoding coordinates: ${longitude}, ${latitude}`);

      // Check cache first
      const cacheKey = `reverse:${longitude.toFixed(4)}:${latitude.toFixed(4)}`;
      const cachedResult = cache.get(cacheKey);

      if (cachedResult) {
        logger.debug(`Cache hit for coordinates: ${longitude}, ${latitude}`);
        return cachedResult;
      }

      // Try to find the nearest location in our database
      const nearestLocation = await this.findNearestLocation(longitude, latitude);

      if (nearestLocation) {
        const result = {
          city: nearestLocation.city,
          county: nearestLocation.county,
          country: nearestLocation.country,
          coordinates: nearestLocation.coordinates,
          source: 'database',
        };

        // Cache the result
        cache.set(cacheKey, result);
        return result;
      }

      // If not found in database, use Nominatim API
      const nominatimResult = await this.reverseGeocodeWithNominatim(longitude, latitude);

      if (nominatimResult) {
        // Save to database for future use if we have enough information
        if (nominatimResult.city && nominatimResult.county) {
          await this.saveLocationToDatabase(
            nominatimResult.city,
            nominatimResult.county,
            nominatimResult.country,
            [longitude, latitude]
          );
        }

        // Cache the result
        cache.set(cacheKey, nominatimResult);
        return nominatimResult;
      }

      // If all else fails, return a generic result
      logger.warn(
        `Could not reverse geocode coordinates: ${longitude}, ${latitude}. Using generic result.`
      );

      return {
        city: 'Unknown',
        county: 'Unknown',
        country: 'Norway',
        coordinates: [longitude, latitude],
        source: 'default',
      };
    } catch (error) {
      logger.error(`Error reverse geocoding coordinates (${longitude}, ${latitude}):`, error);
      throw new AppError(`Failed to reverse geocode coordinates: ${error.message}`, 500);
    }
  }

  /**
   * Find a location in the database
   * @param {string} city - City name
   * @param {string} county - County name
   * @param {string} country - Country name
   * @returns {Promise<Object|null>} Location object or null if not found
   */
  async findLocationInDatabase(city, county, country) {
    try {
      const location = await Location.findOne({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        county: { $regex: new RegExp(`^${county}$`, 'i') },
        country: { $regex: new RegExp(`^${country}$`, 'i') },
      });

      if (location && location.coordinates) {
        logger.debug(`Found location in database: ${city}, ${county}, ${country}`);
        return location;
      }

      return null;
    } catch (error) {
      logger.error(`Error finding location in database: ${error.message}`);
      return null;
    }
  }

  /**
   * Find the nearest location in the database to the given coordinates
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @param {number} maxDistance - Maximum distance in meters (default: 10000)
   * @returns {Promise<Object|null>} Location object or null if not found
   */
  async findNearestLocation(longitude, latitude, maxDistance = 10000) {
    try {
      const locations = await Location.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistance,
          },
        },
      }).limit(1);

      if (locations && locations.length > 0) {
        logger.debug(
          `Found nearest location in database for coordinates: ${longitude}, ${latitude}`
        );
        return locations[0];
      }

      return null;
    } catch (error) {
      logger.error(`Error finding nearest location in database: ${error.message}`);
      return null;
    }
  }

  /**
   * Save a location to the database
   * @param {string} city - City name
   * @param {string} county - County name
   * @param {string} country - Country name
   * @param {Array<number>} coordinates - [longitude, latitude]
   * @returns {Promise<Object>} Saved location
   */
  async saveLocationToDatabase(city, county, country, coordinates) {
    try {
      const location = await Location.findOneAndUpdate(
        {
          city: city,
          county: county,
          country: country,
        },
        {
          city: city,
          county: county,
          country: country,
          coordinates: coordinates,
          source: 'nominatim',
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );

      logger.debug(`Saved location to database: ${city}, ${county}, ${country}`);
      return location;
    } catch (error) {
      logger.error(`Error saving location to database: ${error.message}`);
      return null;
    }
  }

  /**
   * Geocode a location using Nominatim API
   * @param {string} city - City name
   * @param {string} county - County name
   * @param {string} country - Country name
   * @returns {Promise<Object|null>} Location object with coordinates or null if not found
   */
  async geocodeWithNominatim(city, county, country) {
    try {
      const queryString = encodeURIComponent(`${city}, ${county}, ${country}`);

      // Add a delay to respect Nominatim usage policy
      await new Promise(resolve => setTimeout(resolve, this.nominatimDelayMs));

      const response = await axios.get(
        `${this.nominatimUrl}/search?q=${queryString}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': this.userAgent,
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        logger.debug(`Geocoded with Nominatim: ${city}, ${county}, ${country}`);

        return {
          type: 'Point',
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
          source: 'nominatim',
          display_name: result.display_name,
        };
      }

      return null;
    } catch (error) {
      logger.error(`Error geocoding with Nominatim: ${error.message}`);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates using Nominatim API
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @returns {Promise<Object|null>} Location information or null if not found
   */
  async reverseGeocodeWithNominatim(longitude, latitude) {
    try {
      // Add a delay to respect Nominatim usage policy
      await new Promise(resolve => setTimeout(resolve, this.nominatimDelayMs));

      const response = await axios.get(
        `${this.nominatimUrl}/reverse?lon=${longitude}&lat=${latitude}&format=json`,
        {
          headers: {
            'User-Agent': this.userAgent,
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }
      );

      if (response.data && response.data.address) {
        const address = response.data.address;
        logger.debug(`Reverse geocoded with Nominatim: ${longitude}, ${latitude}`);

        return {
          city: address.city || address.town || address.village || address.hamlet || 'Unknown',
          county: address.county || address.state || 'Unknown',
          country: address.country || 'Norway',
          coordinates: [longitude, latitude],
          source: 'nominatim',
          display_name: response.data.display_name,
          address: address,
        };
      }

      return null;
    } catch (error) {
      logger.error(`Error reverse geocoding with Nominatim: ${error.message}`);
      return null;
    }
  }

  /**
   * Clear the geocoding cache
   * @returns {number} Number of deleted cache entries
   */
  clearCache() {
    return cache.flushAll();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses,
      ksize: cache.getStats().ksize,
      vsize: cache.getStats().vsize,
    };
  }
}

const geocodingService = new GeocodingService();
export default geocodingService;
