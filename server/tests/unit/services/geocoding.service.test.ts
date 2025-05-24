import type { jest } from '@jest/globals';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the geocoding service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_LOCATION_DATA: Mock location data for testing
//   Related to: server/services/geocoding.service.js
// ===================================================

import mongoose from 'mongoose';
import axios from 'axios';
import geocodingService from '../../../services/geocoding.service.js';
import Location from '../../../models/location.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';

// Mock axios
jest.mock('axios');

describe('Geocoding Service', () => {
  // Setup test data
  const MOCK_LOCATION_DATA = {
    city: 'Oslo',
    county: 'Oslo',
    country: 'Norway',
    coordinates: [10.7522, 59.9139], // [longitude, latitude]
    source: 'manual',
  };

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database and reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('geocodeLocation', () => {
    it('should return cached result if available', async () => {
      // Setup: Add a location to the cache (by calling the method once with mocked response)
      const cacheKey = `geocode:oslo:oslo:norway`.toLowerCase();

      // Mock the cache.get method to return a cached result
      const originalGet = geocodingService.cache.get;
      geocodingService.cache.get = jest.fn().mockImplementation(key => {
        if (key === cacheKey) {
          return {
            type: 'Point',
            coordinates: [10.7522, 59.9139],
            source: 'cache',
          };
        }
        return null;
      });

      // Call the method
      const result = await geocodingService.geocodeLocation('Oslo', 'Oslo', 'Norway');

      // Verify the result
      expect(result).toBeDefined();
      expect(result.type).toBe('Point');
      expect(result.coordinates).toEqual([10.7522, 59.9139]);
      expect(result.source).toBe('cache');

      // Verify that cache.get was called with the correct key
      expect(geocodingService.cache.get).toHaveBeenCalledWith(cacheKey);

      // Restore the original cache.get method
      geocodingService.cache.get = originalGet;
    });

    it('should return location from database if found', async () => {
      // Setup: Add a location to the database
      await Location.create(MOCK_LOCATION_DATA);

      // Mock the cache to ensure it doesn't return a result
      const originalGet = geocodingService.cache.get;
      geocodingService.cache.get = jest.fn().mockReturnValue(null);

      // Mock the cache.set method to verify it's called
      const originalSet = geocodingService.cache.set;
      geocodingService.cache.set = jest.fn();

      // Call the method
      const result = await geocodingService.geocodeLocation('Oslo', 'Oslo', 'Norway');

      // Verify the result
      expect(result).toBeDefined();
      expect(result.type).toBe('Point');
      expect(result.coordinates).toEqual(MOCK_LOCATION_DATA.coordinates);
      expect(result.source).toBe('database');

      // Verify that cache.set was called to cache the result
      expect(geocodingService.cache.set).toHaveBeenCalled();

      // Restore the original cache methods
      geocodingService.cache.get = originalGet;
      geocodingService.cache.set = originalSet;
    });

    it('should use Nominatim API if location not found in database', async () => {
      // Mock the cache to ensure it doesn't return a result
      const originalGet = geocodingService.cache.get;
      geocodingService.cache.get = jest.fn().mockReturnValue(null);

      // Mock the cache.set method to verify it's called
      const originalSet = geocodingService.cache.set;
      geocodingService.cache.set = jest.fn();

      // Mock axios.get to return a Nominatim response
      axios.get.mockResolvedValue({
        data: [
          {
            lat: '59.9139',
            lon: '10.7522',
            display_name: 'Oslo, Oslo, Norway',
          },
        ],
      });

      // Call the method
      const result = await geocodingService.geocodeLocation('Oslo', 'Oslo', 'Norway');

      // Verify the result
      expect(result).toBeDefined();
      expect(result.type).toBe('Point');
      expect(result.coordinates).toEqual([10.7522, 59.9139]);
      expect(result.source).toBe('nominatim');

      // Verify that axios.get was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://nominatim.openstreetmap.org/search'),
        expect.any(Object)
      );

      // Verify that cache.set was called to cache the result
      expect(geocodingService.cache.set).toHaveBeenCalled();

      // Restore the original cache methods
      geocodingService.cache.get = originalGet;
      geocodingService.cache.set = originalSet;
    });

    it('should return default coordinates if all methods fail', async () => {
      // Mock the cache to ensure it doesn't return a result
      const originalGet = geocodingService.cache.get;
      geocodingService.cache.get = jest.fn().mockReturnValue(null);

      // Mock axios.get to fail
      axios.get.mockRejectedValue(new Error('Nominatim API error'));

      // Call the method with a non-existent location
      const result = await geocodingService.geocodeLocation(
        'NonExistentCity',
        'NonExistentCounty',
        'NonExistentCountry'
      );

      // Verify the result uses default coordinates (Oslo)
      expect(result).toBeDefined();
      expect(result.type).toBe('Point');
      expect(result.coordinates).toEqual([10.7522, 59.9139]); // Default coordinates (Oslo)
      expect(result.source).toBe('default');

      // Restore the original cache method
      geocodingService.cache.get = originalGet;
    });
  });

  describe('reverseGeocode', () => {
    it('should return cached result if available', async () => {
      const longitude = 10.7522;
      const latitude = 59.9139;
      const cacheKey = `reverse:${longitude.toFixed(4)}:${latitude.toFixed(4)}`;

      // Mock the cache.get method to return a cached result
      const originalGet = geocodingService.cache.get;
      geocodingService.cache.get = jest.fn().mockImplementation(key => {
        if (key === cacheKey) {
          return {
            city: 'Oslo',
            county: 'Oslo',
            country: 'Norway',
            coordinates: [longitude, latitude],
            source: 'cache',
          };
        }
        return null;
      });

      // Call the method
      const result = await geocodingService.reverseGeocode(longitude, latitude);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Oslo');
      expect(result.county).toBe('Oslo');
      expect(result.country).toBe('Norway');
      expect(result.coordinates).toEqual([longitude, latitude]);
      expect(result.source).toBe('cache');

      // Verify that cache.get was called with the correct key
      expect(geocodingService.cache.get).toHaveBeenCalledWith(cacheKey);

      // Restore the original cache.get method
      geocodingService.cache.get = originalGet;
    });

    it('should find nearest location in database if available', async () => {
      // Setup: Add a location to the database
      await Location.create(MOCK_LOCATION_DATA);

      // Mock the cache to ensure it doesn't return a result
      const originalGet = geocodingService.cache.get;
      geocodingService.cache.get = jest.fn().mockReturnValue(null);

      // Mock the cache.set method to verify it's called
      const originalSet = geocodingService.cache.set;
      geocodingService.cache.set = jest.fn();

      // Call the method with coordinates very close to Oslo
      const longitude = 10.7523; // Slightly different from stored coordinates
      const latitude = 59.914; // Slightly different from stored coordinates
      const result = await geocodingService.reverseGeocode(longitude, latitude);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Oslo');
      expect(result.county).toBe('Oslo');
      expect(result.country).toBe('Norway');
      expect(result.source).toBe('database');

      // Verify that cache.set was called to cache the result
      expect(geocodingService.cache.set).toHaveBeenCalled();

      // Restore the original cache methods
      geocodingService.cache.get = originalGet;
      geocodingService.cache.set = originalSet;
    });

    it('should use Nominatim API if location not found in database', async () => {
      // Mock the cache to ensure it doesn't return a result
      const originalGet = geocodingService.cache.get;
      geocodingService.cache.get = jest.fn().mockReturnValue(null);

      // Mock the cache.set method to verify it's called
      const originalSet = geocodingService.cache.set;
      geocodingService.cache.set = jest.fn();

      // Mock axios.get to return a Nominatim response
      axios.get.mockResolvedValue({
        data: {
          address: {
            city: 'Oslo',
            county: 'Oslo',
            country: 'Norway',
          },
          display_name: 'Oslo, Oslo, Norway',
        },
      });

      // Call the method with coordinates
      const longitude = 10.7522;
      const latitude = 59.9139;
      const result = await geocodingService.reverseGeocode(longitude, latitude);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Oslo');
      expect(result.county).toBe('Oslo');
      expect(result.country).toBe('Norway');
      expect(result.coordinates).toEqual([longitude, latitude]);
      expect(result.source).toBe('nominatim');

      // Verify that axios.get was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://nominatim.openstreetmap.org/reverse'),
        expect.any(Object)
      );

      // Verify that cache.set was called to cache the result
      expect(geocodingService.cache.set).toHaveBeenCalled();

      // Restore the original cache methods
      geocodingService.cache.get = originalGet;
      geocodingService.cache.set = originalSet;
    });

    it('should return generic result if all methods fail', async () => {
      // Mock the cache to ensure it doesn't return a result
      const originalGet = geocodingService.cache.get;
      geocodingService.cache.get = jest.fn().mockReturnValue(null);

      // Mock axios.get to fail
      axios.get.mockRejectedValue(new Error('Nominatim API error'));

      // Call the method with coordinates
      const longitude = 0;
      const latitude = 0;
      const result = await geocodingService.reverseGeocode(longitude, latitude);

      // Verify the result is a generic fallback
      expect(result).toBeDefined();
      expect(result.city).toBe('Unknown');
      expect(result.county).toBe('Unknown');
      expect(result.country).toBe('Norway');
      expect(result.coordinates).toEqual([longitude, latitude]);
      expect(result.source).toBe('default');

      // Restore the original cache method
      geocodingService.cache.get = originalGet;
    });
  });

  describe('findLocationInDatabase', () => {
    it('should find a location by city, county, and country', async () => {
      // Setup: Add a location to the database
      await Location.create(MOCK_LOCATION_DATA);

      // Call the method
      const result = await geocodingService.findLocationInDatabase('Oslo', 'Oslo', 'Norway');

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Oslo');
      expect(result.county).toBe('Oslo');
      expect(result.country).toBe('Norway');
      expect(result.coordinates).toEqual(MOCK_LOCATION_DATA.coordinates);
    });

    it('should return null if location not found', async () => {
      // Call the method with non-existent location
      const result = await geocodingService.findLocationInDatabase(
        'NonExistentCity',
        'NonExistentCounty',
        'NonExistentCountry'
      );

      // Verify the result
      expect(result).toBeNull();
    });

    it('should be case-insensitive', async () => {
      // Setup: Add a location to the database
      await Location.create(MOCK_LOCATION_DATA);

      // Call the method with different case
      const result = await geocodingService.findLocationInDatabase('oslo', 'OSLO', 'Norway');

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Oslo');
      expect(result.county).toBe('Oslo');
      expect(result.country).toBe('Norway');
    });
  });

  describe('findNearestLocation', () => {
    it('should find the nearest location to given coordinates', async () => {
      // Setup: Add locations to the database
      await Location.create([
        MOCK_LOCATION_DATA, // Oslo
        {
          city: 'Bergen',
          county: 'Vestland',
          country: 'Norway',
          coordinates: [5.3221, 60.3913], // Far from Oslo
          source: 'manual',
        },
      ]);

      // Call the method with coordinates near Oslo
      const result = await geocodingService.findNearestLocation(10.7523, 59.914, 1000); // Within 1km of Oslo

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Oslo');
      expect(result.county).toBe('Oslo');
      expect(result.country).toBe('Norway');
    });

    it('should return null if no location found within maxDistance', async () => {
      // Setup: Add a location to the database
      await Location.create(MOCK_LOCATION_DATA); // Oslo

      // Call the method with coordinates far from Oslo and a small maxDistance
      const result = await geocodingService.findNearestLocation(5.3221, 60.3913, 10); // Bergen coordinates, 10m max distance

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('saveLocationToDatabase', () => {
    it('should save a new location to the database', async () => {
      // Call the method
      const result = await geocodingService.saveLocationToDatabase(
        'Bergen',
        'Vestland',
        'Norway',
        [5.3221, 60.3913]
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Bergen');
      expect(result.county).toBe('Vestland');
      expect(result.country).toBe('Norway');
      expect(result.coordinates).toEqual([5.3221, 60.3913]);
      expect(result.source).toBe('nominatim');
      expect(result.lastUpdated).toBeDefined();

      // Verify the location was saved to the database
      const savedLocation = await Location.findOne({ city: 'Bergen' });
      expect(savedLocation).toBeDefined();
      expect(savedLocation.city).toBe('Bergen');
    });

    it('should update an existing location', async () => {
      // Setup: Add a location to the database
      await Location.create({
        city: 'Bergen',
        county: 'Vestland',
        country: 'Norway',
        coordinates: [5.3221, 60.3913],
        source: 'manual',
      });

      // Call the method with updated coordinates
      const result = await geocodingService.saveLocationToDatabase(
        'Bergen',
        'Vestland',
        'Norway',
        [5.3222, 60.3914] // Slightly different coordinates
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Bergen');
      expect(result.county).toBe('Vestland');
      expect(result.country).toBe('Norway');
      expect(result.coordinates).toEqual([5.3222, 60.3914]); // Updated coordinates
      expect(result.source).toBe('nominatim');

      // Verify there's still only one Bergen in the database
      const count = await Location.countDocuments({ city: 'Bergen' });
      expect(count).toBe(1);
    });
  });

  describe('geocodeWithNominatim', () => {
    it('should geocode a location using Nominatim API', async () => {
      // Mock axios.get to return a Nominatim response
      axios.get.mockResolvedValue({
        data: [
          {
            lat: '60.3913',
            lon: '5.3221',
            display_name: 'Bergen, Vestland, Norway',
          },
        ],
      });

      // Call the method
      const result = await geocodingService.geocodeWithNominatim('Bergen', 'Vestland', 'Norway');

      // Verify the result
      expect(result).toBeDefined();
      expect(result.type).toBe('Point');
      expect(result.coordinates).toEqual([5.3221, 60.3913]);
      expect(result.source).toBe('nominatim');
      expect(result.display_name).toBe('Bergen, Vestland, Norway');

      // Verify that axios.get was called with the correct URL and headers
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://nominatim.openstreetmap.org/search'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.any(String),
            'Accept-Language': 'en-US,en;q=0.9',
          }),
        })
      );
    });

    it('should return null if Nominatim API returns no results', async () => {
      // Mock axios.get to return an empty response
      axios.get.mockResolvedValue({
        data: [],
      });

      // Call the method
      const result = await geocodingService.geocodeWithNominatim(
        'NonExistentCity',
        'NonExistentCounty',
        'NonExistentCountry'
      );

      // Verify the result
      expect(result).toBeNull();
    });

    it('should return null if Nominatim API call fails', async () => {
      // Mock axios.get to fail
      axios.get.mockRejectedValue(new Error('Nominatim API error'));

      // Call the method
      const result = await geocodingService.geocodeWithNominatim('Bergen', 'Vestland', 'Norway');

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('reverseGeocodeWithNominatim', () => {
    it('should reverse geocode coordinates using Nominatim API', async () => {
      // Mock axios.get to return a Nominatim response
      axios.get.mockResolvedValue({
        data: {
          address: {
            city: 'Bergen',
            county: 'Vestland',
            country: 'Norway',
            town: null,
            village: null,
            hamlet: null,
          },
          display_name: 'Bergen, Vestland, Norway',
        },
      });

      // Call the method
      const longitude = 5.3221;
      const latitude = 60.3913;
      const result = await geocodingService.reverseGeocodeWithNominatim(longitude, latitude);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Bergen');
      expect(result.county).toBe('Vestland');
      expect(result.country).toBe('Norway');
      expect(result.coordinates).toEqual([longitude, latitude]);
      expect(result.source).toBe('nominatim');
      expect(result.display_name).toBe('Bergen, Vestland, Norway');

      // Verify that axios.get was called with the correct URL and headers
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('https://nominatim.openstreetmap.org/reverse'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.any(String),
            'Accept-Language': 'en-US,en;q=0.9',
          }),
        })
      );
    });

    it('should handle alternative address fields', async () => {
      // Mock axios.get to return a Nominatim response with town instead of city
      axios.get.mockResolvedValue({
        data: {
          address: {
            city: null,
            town: 'Lillehammer',
            county: 'Innlandet',
            country: 'Norway',
          },
          display_name: 'Lillehammer, Innlandet, Norway',
        },
      });

      // Call the method
      const longitude = 10.4663;
      const latitude = 61.1152;
      const result = await geocodingService.reverseGeocodeWithNominatim(longitude, latitude);

      // Verify the result
      expect(result).toBeDefined();
      expect(result.city).toBe('Lillehammer'); // Should use town when city is null
      expect(result.county).toBe('Innlandet');
      expect(result.country).toBe('Norway');
    });

    it('should return null if Nominatim API returns no address', async () => {
      // Mock axios.get to return a response without address
      axios.get.mockResolvedValue({
        data: {
          // No address field
          display_name: 'Middle of nowhere',
        },
      });

      // Call the method
      const result = await geocodingService.reverseGeocodeWithNominatim(0, 0);

      // Verify the result
      expect(result).toBeNull();
    });

    it('should return null if Nominatim API call fails', async () => {
      // Mock axios.get to fail
      axios.get.mockRejectedValue(new Error('Nominatim API error'));

      // Call the method
      const result = await geocodingService.reverseGeocodeWithNominatim(5.3221, 60.3913);

      // Verify the result
      expect(result).toBeNull();
    });
  });

  describe('Cache Management', () => {
    it('should clear the cache', () => {
      // Setup: Mock the cache.flushAll method
      const originalFlushAll = geocodingService.cache.flushAll;
      geocodingService.cache.flushAll = jest.fn().mockReturnValue(5); // Pretend 5 items were cleared

      // Call the method
      const result = geocodingService.clearCache();

      // Verify the result
      expect(result).toBe(5);

      // Verify that cache.flushAll was called
      expect(geocodingService.cache.flushAll).toHaveBeenCalled();

      // Restore the original method
      geocodingService.cache.flushAll = originalFlushAll;
    });

    it('should get cache statistics', () => {
      // Setup: Mock the cache.getStats method
      const originalGetStats = geocodingService.cache.getStats;
      geocodingService.cache.getStats = jest.fn().mockReturnValue({
        hits: 10,
        misses: 5,
        ksize: 1000,
        vsize: 5000,
      });

      // Setup: Mock the cache.keys method
      const originalKeys = geocodingService.cache.keys;
      geocodingService.cache.keys = jest.fn().mockReturnValue(['key1', 'key2', 'key3']);

      // Call the method
      const stats = geocodingService.getCacheStats();

      // Verify the result
      expect(stats).toBeDefined();
      expect(stats.keys).toBe(3);
      expect(stats.hits).toBe(10);
      expect(stats.misses).toBe(5);
      expect(stats.ksize).toBe(1000);
      expect(stats.vsize).toBe(5000);

      // Verify that cache methods were called
      expect(geocodingService.cache.getStats).toHaveBeenCalled();
      expect(geocodingService.cache.keys).toHaveBeenCalled();

      // Restore the original methods
      geocodingService.cache.getStats = originalGetStats;
      geocodingService.cache.keys = originalKeys;
    });
  });
});
