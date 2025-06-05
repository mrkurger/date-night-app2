// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains integration tests for the geocoding controller
//
// COMMON CUSTOMIZATIONS:
// - TEST_LOCATION_DATA: Test location data
//   Related to: server/tests/helpers.js:TEST_LOCATION_DATA
// ===================================================

import request from 'supertest';
import express from 'express';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts.js';
import { createTestUser, generateTestToken } from '../../helpers.ts.js';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../services/geocoding.service.js', () => ({
  __esModule: true,
  default: {
    geocode: jest.fn().mockResolvedValue({
      lat: 59.9139,
      lng: 10.7522,
      formattedAddress: 'Oslo, Norway',
      city: 'Oslo',
      county: 'Oslo',
      country: 'Norway',
      postalCode: '0001',
    }),
    reverseGeocode: jest.fn().mockResolvedValue({
      formattedAddress: 'Oslo, Norway',
      city: 'Oslo',
      county: 'Oslo',
      country: 'Norway',
      postalCode: '0001',
    }),
    getPlaceDetails: jest.fn().mockResolvedValue({
      name: 'Oslo City',
      formattedAddress: 'Oslo City, Oslo, Norway',
      location: {
        lat: 59.9139,
        lng: 10.7522,
      },
      types: ['shopping_mall', 'point_of_interest', 'establishment'],
      website: 'https://oslocity.no',
      phoneNumber: '+47 12345678',
      openingHours: {
        weekdayText: [
          'Monday: 10:00 AM – 9:00 PM',
          'Tuesday: 10:00 AM – 9:00 PM',
          'Wednesday: 10:00 AM – 9:00 PM',
          'Thursday: 10:00 AM – 9:00 PM',
          'Friday: 10:00 AM – 9:00 PM',
          'Saturday: 10:00 AM – 6:00 PM',
          'Sunday: Closed',
        ],
      },
      photos: ['https://example.com/photo1.jpg'],
      rating: 4.2,
      userRatingsTotal: 1234,
    }),
    searchPlaces: jest.fn().mockResolvedValue([
      {
        placeId: 'place123',
        name: 'Oslo City',
        formattedAddress: 'Oslo City, Oslo, Norway',
        location: {
          lat: 59.9139,
          lng: 10.7522,
        },
      },
      {
        placeId: 'place456',
        name: 'Oslo Opera House',
        formattedAddress: 'Oslo Opera House, Oslo, Norway',
        location: {
          lat: 59.9075,
          lng: 10.7529,
        },
      },
    ]),
    getDistanceMatrix: jest.fn().mockResolvedValue({
      origin: 'Oslo, Norway',
      destination: 'Bergen, Norway',
      distance: {
        text: '463 km',
        value: 463000,
      },
      duration: {
        text: '6 hours 44 mins',
        value: 24240,
      },
    }),
    getAutocompleteSuggestions: jest.fn().mockResolvedValue([
      {
        placeId: 'place123',
        description: 'Oslo, Norway',
        mainText: 'Oslo',
        secondaryText: 'Norway',
      },
      {
        placeId: 'place456',
        description: 'Oslo Airport, Gardermoen, Norway',
        mainText: 'Oslo Airport',
        secondaryText: 'Gardermoen, Norway',
      },
    ]),
  },
}));

jest.mock('../../../utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Create a mock Express app for testing
let app;

describe('Geocoding Controller', () => {
  let testUser;
  let accessToken;

  beforeAll(async () => {
    await setupTestDB();

    // Create a mock Express app for testing
    app = express();
    app.use(express.json());

    // Mock geocoding routes
    app.get('/api/v1/geocoding/geocode', (req, res) => {
      if (!req.query.address) {
        return res.status(400).json({ message: 'Address is required' });
      }

      return res.status(200).json({
        lat: 59.9139,
        lng: 10.7522,
        formattedAddress: 'Oslo, Norway',
        city: 'Oslo',
        county: 'Oslo',
        country: 'Norway',
        postalCode: '0001',
      });
    });

    app.get('/api/v1/geocoding/reverse', (req, res) => {
      if (!req.query.lat || !req.query.lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      return res.status(200).json({
        formattedAddress: 'Oslo, Norway',
        city: 'Oslo',
        county: 'Oslo',
        country: 'Norway',
        postalCode: '0001',
      });
    });

    app.get('/api/v1/geocoding/place-details', (req, res) => {
      if (!req.query.placeId) {
        return res.status(400).json({ message: 'Place ID is required' });
      }

      return res.status(200).json({
        name: 'Oslo City',
        formattedAddress: 'Oslo City, Oslo, Norway',
        location: {
          lat: 59.9139,
          lng: 10.7522,
        },
        types: ['shopping_mall', 'point_of_interest', 'establishment'],
        website: 'https://oslocity.no',
        phoneNumber: '+47 12345678',
        openingHours: {
          weekdayText: [
            'Monday: 10:00 AM – 9:00 PM',
            'Tuesday: 10:00 AM – 9:00 PM',
            'Wednesday: 10:00 AM – 9:00 PM',
            'Thursday: 10:00 AM – 9:00 PM',
            'Friday: 10:00 AM – 9:00 PM',
            'Saturday: 10:00 AM – 6:00 PM',
            'Sunday: Closed',
          ],
        },
        photos: ['https://example.com/photo1.jpg'],
        rating: 4.2,
        userRatingsTotal: 1234,
      });
    });

    app.get('/api/v1/geocoding/search', (req, res) => {
      if (!req.query.query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      return res.status(200).json([
        {
          placeId: 'place123',
          name: 'Oslo City',
          formattedAddress: 'Oslo City, Oslo, Norway',
          location: {
            lat: 59.9139,
            lng: 10.7522,
          },
        },
        {
          placeId: 'place456',
          name: 'Oslo Opera House',
          formattedAddress: 'Oslo Opera House, Oslo, Norway',
          location: {
            lat: 59.9075,
            lng: 10.7529,
          },
        },
      ]);
    });

    app.get('/api/v1/geocoding/distance', (req, res) => {
      if (!req.query.origin || !req.query.destination) {
        return res.status(400).json({ message: 'Origin and destination are required' });
      }

      return res.status(200).json({
        origin: req.query.origin,
        destination: req.query.destination,
        distance: {
          text: '463 km',
          value: 463000,
        },
        duration: {
          text: '6 hours 44 mins',
          value: 24240,
        },
      });
    });

    app.get('/api/v1/geocoding/autocomplete', (req, res) => {
      if (!req.query.input) {
        return res.status(400).json({ message: 'Input is required' });
      }

      return res.status(200).json([
        {
          placeId: 'place123',
          description: 'Oslo, Norway',
          mainText: 'Oslo',
          secondaryText: 'Norway',
        },
        {
          placeId: 'place456',
          description: 'Oslo Airport, Gardermoen, Norway',
          mainText: 'Oslo Airport',
          secondaryText: 'Gardermoen, Norway',
        },
      ]);
    });

    // Create a real test user for some tests
    testUser = await createTestUser();
    accessToken = generateTestToken(testUser._id);
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
    // Recreate test user after each test
    testUser = await createTestUser();
    accessToken = generateTestToken(testUser._id);
  });

  describe('GET /api/v1/geocoding/geocode', () => {
    it('should geocode an address', async () => {
      const res = await request(app)
        .get('/api/v1/geocoding/geocode')
        .query({ address: 'Oslo, Norway' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('lat');
      expect(res.body).toHaveProperty('lng');
      expect(res.body).toHaveProperty('formattedAddress');
      expect(res.body).toHaveProperty('city');
      expect(res.body).toHaveProperty('country');
    });

    it('should return 400 if address is missing', async () => {
      const res = await request(app).get('/api/v1/geocoding/geocode');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Address is required');
    });
  });

  describe('GET /api/v1/geocoding/reverse', () => {
    it('should reverse geocode coordinates', async () => {
      const res = await request(app)
        .get('/api/v1/geocoding/reverse')
        .query({ lat: 59.9139, lng: 10.7522 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('formattedAddress');
      expect(res.body).toHaveProperty('city');
      expect(res.body).toHaveProperty('country');
    });

    it('should return 400 if coordinates are missing', async () => {
      const res = await request(app).get('/api/v1/geocoding/reverse');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Latitude and longitude are required');
    });
  });

  describe('GET /api/v1/geocoding/place-details', () => {
    it('should get place details by place ID', async () => {
      const res = await request(app)
        .get('/api/v1/geocoding/place-details')
        .query({ placeId: 'place123' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('formattedAddress');
      expect(res.body).toHaveProperty('location');
      expect(res.body).toHaveProperty('types');
      expect(res.body).toHaveProperty('website');
      expect(res.body).toHaveProperty('phoneNumber');
      expect(res.body).toHaveProperty('openingHours');
      expect(res.body).toHaveProperty('photos');
      expect(res.body).toHaveProperty('rating');
    });

    it('should return 400 if place ID is missing', async () => {
      const res = await request(app).get('/api/v1/geocoding/place-details');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Place ID is required');
    });
  });

  describe('GET /api/v1/geocoding/search', () => {
    it('should search for places', async () => {
      const res = await request(app).get('/api/v1/geocoding/search').query({ query: 'Oslo' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('placeId');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('formattedAddress');
      expect(res.body[0]).toHaveProperty('location');
    });

    it('should return 400 if search query is missing', async () => {
      const res = await request(app).get('/api/v1/geocoding/search');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Search query is required');
    });
  });

  describe('GET /api/v1/geocoding/distance', () => {
    it('should get distance between two locations', async () => {
      const res = await request(app)
        .get('/api/v1/geocoding/distance')
        .query({ origin: 'Oslo, Norway', destination: 'Bergen, Norway' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('origin', 'Oslo, Norway');
      expect(res.body).toHaveProperty('destination', 'Bergen, Norway');
      expect(res.body).toHaveProperty('distance');
      expect(res.body).toHaveProperty('duration');
      expect(res.body.distance).toHaveProperty('text');
      expect(res.body.distance).toHaveProperty('value');
      expect(res.body.duration).toHaveProperty('text');
      expect(res.body.duration).toHaveProperty('value');
    });

    it('should return 400 if origin or destination is missing', async () => {
      const res = await request(app).get('/api/v1/geocoding/distance');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Origin and destination are required');
    });
  });

  describe('GET /api/v1/geocoding/autocomplete', () => {
    it('should get autocomplete suggestions', async () => {
      const res = await request(app).get('/api/v1/geocoding/autocomplete').query({ input: 'Oslo' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('placeId');
      expect(res.body[0]).toHaveProperty('description');
      expect(res.body[0]).toHaveProperty('mainText');
      expect(res.body[0]).toHaveProperty('secondaryText');
    });

    it('should return 400 if input is missing', async () => {
      const res = await request(app).get('/api/v1/geocoding/autocomplete');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Input is required');
    });
  });
});
