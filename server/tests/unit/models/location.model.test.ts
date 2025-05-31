// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the location model
//
// COMMON CUSTOMIZATIONS:
// - TEST_LOCATION_DATA: Test location data
//   Related to: server/models/location.model.js
// ===================================================

import mongoose from 'mongoose';
import Location from '../../../models/location.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts';

describe('Location Model', () => {
  // Setup test data
  const TEST_LOCATION_DATA = {
    city: 'Oslo',
    county: 'Oslo',
    country: 'Norway',
    coordinates: [10.7522, 59.9139], // [longitude, latitude]
    source: 'manual',
    population: 693494,
    timezone: 'Europe/Oslo',
    postalCodes: ['0001', '0010', '0015'],
  };

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
    // Ensure indexes are created for testing
    await Location.createIndexes();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Basic Validation', () => {
    it('should create a new location successfully', async () => {
      const location = new Location(TEST_LOCATION_DATA);
      const savedLocation = await location.save();

      // Verify the saved location
      expect(savedLocation._id).toBeDefined();
      expect(savedLocation.city).toBe(TEST_LOCATION_DATA.city);
      expect(savedLocation.county).toBe(TEST_LOCATION_DATA.county);
      expect(savedLocation.country).toBe(TEST_LOCATION_DATA.country);
      expect(savedLocation.coordinates).toEqual(TEST_LOCATION_DATA.coordinates);
      expect(savedLocation.source).toBe(TEST_LOCATION_DATA.source);
      expect(savedLocation.population).toBe(TEST_LOCATION_DATA.population);
      expect(savedLocation.timezone).toBe(TEST_LOCATION_DATA.timezone);
      expect(savedLocation.postalCodes).toEqual(TEST_LOCATION_DATA.postalCodes);
      expect(savedLocation.lastUpdated).toBeDefined();
      expect(savedLocation.searchCount).toBe(0);
      expect(savedLocation.createdAt).toBeDefined();
      expect(savedLocation.updatedAt).toBeDefined();
    });

    it('should require city, county, country, and coordinates', async () => {
      const locationWithoutRequiredFields = new Location({
        source: 'manual',
      });

      // Expect validation to fail
      await expect(locationWithoutRequiredFields.save()).rejects.toThrow();
    });

    it('should enforce source enum validation', async () => {
      const locationWithInvalidSource = new Location({
        ...TEST_LOCATION_DATA,
        source: 'invalid-source', // Not in enum: ['manual', 'nominatim', 'google', 'mapbox', 'imported']
      });

      // Expect validation to fail
      await expect(locationWithInvalidSource.save()).rejects.toThrow();
    });

    it('should use default values when not provided', async () => {
      const locationWithDefaults = new Location({
        city: 'Bergen',
        county: 'Vestland',
        coordinates: [5.3221, 60.3913],
        // country and source will use defaults
      });

      const savedLocation = await locationWithDefaults.save();
      expect(savedLocation.country).toBe('Norway'); // Default country
      expect(savedLocation.source).toBe('manual'); // Default source
      expect(savedLocation.searchCount).toBe(0); // Default search count
    });

    it('should prevent duplicate locations with same city, county, and country', async () => {
      // Create first location
      const location1 = new Location(TEST_LOCATION_DATA);
      await location1.save();

      // Try to create second location with same city, county, and country
      const location2 = new Location({
        ...TEST_LOCATION_DATA,
        coordinates: [10.7523, 59.914], // Slightly different coordinates
      });

      // Expect duplicate to throw error due to unique index
      await expect(location2.save()).rejects.toThrow();
    });

    it('should trim whitespace from city, county, and country', async () => {
      const locationWithWhitespace = new Location({
        ...TEST_LOCATION_DATA,
        city: '  Oslo  ',
        county: '  Oslo  ',
        country: '  Norway  ',
      });

      const savedLocation = await locationWithWhitespace.save();
      expect(savedLocation.city).toBe('Oslo');
      expect(savedLocation.county).toBe('Oslo');
      expect(savedLocation.country).toBe('Norway');
    });
  });

  describe('Static Methods', () => {
    // Setup for static method tests
    const setupLocations = async (): Promise<void> => {
      await Location.create([
        TEST_LOCATION_DATA, // Oslo
        {
          city: 'Bergen',
          county: 'Vestland',
          country: 'Norway',
          coordinates: [5.3221, 60.3913],
          source: 'nominatim',
          searchCount: 50,
        },
        {
          city: 'Trondheim',
          county: 'Trøndelag',
          country: 'Norway',
          coordinates: [10.3951, 63.4305],
          source: 'google',
          searchCount: 30,
        },
        {
          city: 'Stavanger',
          county: 'Rogaland',
          country: 'Norway',
          coordinates: [5.7331, 58.9701],
          source: 'mapbox',
          searchCount: 20,
        },
        {
          city: 'Tromsø',
          county: 'Troms og Finnmark',
          country: 'Norway',
          coordinates: [18.9553, 69.6492],
          source: 'imported',
          searchCount: 10,
        },
      ]);
    };

    describe('findByName', () => {
      it('should find locations by text search', async () => {
        await setupLocations();

        const locations = await Location.findByName('Oslo');
        expect(locations.length).toBeGreaterThan(0);
        expect(locations[0].city).toBe('Oslo');
      });

      it('should respect the limit parameter', async () => {
        await setupLocations();

        const locations = await Location.findByName('Norway', 3);
        expect(locations.length).toBeLessThanOrEqual(3);
      });

      it('should return empty array when no matches found', async () => {
        await setupLocations();

        const locations = await Location.findByName('NonExistentCity');
        expect(locations).toHaveLength(0);
      });
    });

    describe('findNearby', () => {
      it('should find locations near given coordinates', async () => {
        await setupLocations();

        // Search near Oslo
        const locations = await Location.findNearby(10.7522, 59.9139, 100000);
        expect(locations.length).toBeGreaterThan(0);

        // The closest location should be Oslo itself
        expect(locations[0].city).toBe('Oslo');
      });

      it('should respect the maxDistance parameter', async () => {
        await setupLocations();

        // Search with a very small radius (10 meters) - should only find exact match
        const locations = await Location.findNearby(10.7522, 59.9139, 10);
        expect(locations.length).toBeLessThanOrEqual(1);
      });

      it('should respect the limit parameter', async () => {
        await setupLocations();

        // Search with limit of 2
        const locations = await Location.findNearby(10.7522, 59.9139, 1000000, 2);
        expect(locations.length).toBeLessThanOrEqual(2);
      });
    });

    describe('incrementSearchCount', () => {
      it('should increment the search count for a location', async () => {
        const location = new Location(TEST_LOCATION_DATA);
        const savedLocation = await location.save();

        expect(savedLocation.searchCount).toBe(0);

        // Increment search count
        const updatedLocation = await Location.incrementSearchCount(savedLocation._id);

        expect(updatedLocation.searchCount).toBe(1);

        // Increment again
        const updatedLocation2 = await Location.incrementSearchCount(savedLocation._id);

        expect(updatedLocation2.searchCount).toBe(2);
      });

      it('should update the lastUpdated timestamp', async () => {
        const location = new Location(TEST_LOCATION_DATA);
        const savedLocation = await location.save();

        const originalTimestamp = savedLocation.lastUpdated;

        // Wait a bit to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 100));

        // Increment search count
        const updatedLocation = await Location.incrementSearchCount(savedLocation._id);

        expect(updatedLocation.lastUpdated).not.toEqual(originalTimestamp);
      });
    });

    describe('getPopular', () => {
      it('should return locations sorted by search count', async () => {
        await setupLocations();

        const popularLocations = await Location.getPopular();

        expect(popularLocations).toHaveLength(5);
        expect(popularLocations[0].city).toBe('Bergen'); // 50 searches
        expect(popularLocations[1].city).toBe('Trondheim'); // 30 searches
        expect(popularLocations[2].city).toBe('Stavanger'); // 20 searches
        expect(popularLocations[3].city).toBe('Tromsø'); // 10 searches
        expect(popularLocations[4].city).toBe('Oslo'); // 0 searches
      });

      it('should respect the limit parameter', async () => {
        await setupLocations();

        const popularLocations = await Location.getPopular(3);

        expect(popularLocations).toHaveLength(3);
        expect(popularLocations[0].city).toBe('Bergen');
        expect(popularLocations[1].city).toBe('Trondheim');
        expect(popularLocations[2].city).toBe('Stavanger');
      });
    });
  });

  describe('Indexes', () => {
    it('should have the expected indexes', async () => {
      const indexes = await Location.collection.indexes();

      // Check for unique compound index on city, county, and country
      const cityCountyCountryIndex = indexes.find(
        index =>
          index.key.city === 1 &&
          index.key.county === 1 &&
          index.key.country === 1 &&
          index.unique === true
      );
      expect(cityCountyCountryIndex).toBeDefined();

      // Check for text index on city, county, and country
      const textIndex = indexes.find(
        index =>
          index.key._fts === 'text' && // eslint-disable-line no-underscore-dangle
          index.weights &&
          Object.keys(index.weights).includes('city') &&
          Object.keys(index.weights).includes('county') &&
          Object.keys(index.weights).includes('country')
      );
      expect(textIndex).toBeDefined();

      // Check for 2dsphere index on coordinates
      const coordinatesIndex = indexes.find(index => index.key.coordinates === '2dsphere');
      expect(coordinatesIndex).toBeDefined();
    });
  });
});
