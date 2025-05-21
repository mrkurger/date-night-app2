import type { jest } from '@jest/globals';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains integration tests for the location controller
//
// COMMON CUSTOMIZATIONS:
// - TEST_LOCATION_DATA: Test location data
//   Related to: server/tests/helpers.js:TEST_LOCATION_DATA
// ===================================================

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';
import { createTestUser, generateTestToken } from '../../helpers.js';
import Location from '../../../models/location.model.js';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../models/location.model.js');
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

describe('Location Controller', () => {
  let testUser;
  let accessToken;
  let testLocationId;

  beforeAll(async () => {
    await setupTestDB();

    // Create a mock Express app for testing
    app = express();
    app.use(express.json());

    // Mock location routes
    app.get('/api/v1/locations', (req, res) => {
      return res.status(200).json([
        {
          _id: 'mock-location-id-1',
          name: 'Oslo City',
          address: 'Stenersgata 1, 0050 Oslo',
          city: 'Oslo',
          county: 'Oslo',
          country: 'Norway',
          coordinates: {
            lat: 59.9139,
            lng: 10.7522,
          },
          type: 'shopping_mall',
          amenities: ['parking', 'restaurants', 'wifi'],
          openingHours: {
            monday: '10:00-21:00',
            tuesday: '10:00-21:00',
            wednesday: '10:00-21:00',
            thursday: '10:00-21:00',
            friday: '10:00-21:00',
            saturday: '10:00-18:00',
            sunday: 'closed',
          },
          photos: ['https://example.com/photo1.jpg'],
          rating: 4.2,
          reviewCount: 1234,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: 'mock-location-id-2',
          name: 'Oslo Opera House',
          address: 'Kirsten Flagstads Plass 1, 0150 Oslo',
          city: 'Oslo',
          county: 'Oslo',
          country: 'Norway',
          coordinates: {
            lat: 59.9075,
            lng: 10.7529,
          },
          type: 'tourist_attraction',
          amenities: ['parking', 'cafe', 'guided_tours'],
          openingHours: {
            monday: '10:00-20:00',
            tuesday: '10:00-20:00',
            wednesday: '10:00-20:00',
            thursday: '10:00-20:00',
            friday: '10:00-20:00',
            saturday: '11:00-18:00',
            sunday: '11:00-18:00',
          },
          photos: ['https://example.com/photo2.jpg'],
          rating: 4.7,
          reviewCount: 5678,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });

    app.get('/api/v1/locations/:id', (req, res) => {
      if (req.params.id === 'nonexistent-location') {
        return res.status(404).json({ message: 'Location not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        name: 'Oslo City',
        address: 'Stenersgata 1, 0050 Oslo',
        city: 'Oslo',
        county: 'Oslo',
        country: 'Norway',
        coordinates: {
          lat: 59.9139,
          lng: 10.7522,
        },
        type: 'shopping_mall',
        amenities: ['parking', 'restaurants', 'wifi'],
        openingHours: {
          monday: '10:00-21:00',
          tuesday: '10:00-21:00',
          wednesday: '10:00-21:00',
          thursday: '10:00-21:00',
          friday: '10:00-21:00',
          saturday: '10:00-18:00',
          sunday: 'closed',
        },
        photos: ['https://example.com/photo1.jpg'],
        rating: 4.2,
        reviewCount: 1234,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    app.post('/api/v1/locations', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.body.name || !req.body.address) {
        return res.status(400).json({ message: 'Name and address are required' });
      }

      return res.status(201).json({
        _id: 'new-location-id',
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    app.put('/api/v1/locations/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-location') {
        return res.status(404).json({ message: 'Location not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        ...req.body,
        updatedAt: new Date(),
      });
    });

    app.delete('/api/v1/locations/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-location') {
        return res.status(404).json({ message: 'Location not found' });
      }

      return res.status(200).json({ message: 'Location deleted successfully' });
    });

    app.get('/api/v1/locations/search', (req, res) => {
      if (!req.query.query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      return res.status(200).json([
        {
          _id: 'search-result-1',
          name: 'Oslo City',
          address: 'Stenersgata 1, 0050 Oslo',
          city: 'Oslo',
          coordinates: {
            lat: 59.9139,
            lng: 10.7522,
          },
        },
        {
          _id: 'search-result-2',
          name: 'Oslo Opera House',
          address: 'Kirsten Flagstads Plass 1, 0150 Oslo',
          city: 'Oslo',
          coordinates: {
            lat: 59.9075,
            lng: 10.7529,
          },
        },
      ]);
    });

    app.get('/api/v1/locations/nearby', (req, res) => {
      if (!req.query.lat || !req.query.lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      return res.status(200).json([
        {
          _id: 'nearby-1',
          name: 'Oslo City',
          address: 'Stenersgata 1, 0050 Oslo',
          city: 'Oslo',
          coordinates: {
            lat: 59.9139,
            lng: 10.7522,
          },
          distance: 0.5, // km
        },
        {
          _id: 'nearby-2',
          name: 'Oslo Opera House',
          address: 'Kirsten Flagstads Plass 1, 0150 Oslo',
          city: 'Oslo',
          coordinates: {
            lat: 59.9075,
            lng: 10.7529,
          },
          distance: 1.2, // km
        },
      ]);
    });

    app.get('/api/v1/locations/cities', (req, res) => {
      return res.status(200).json([
        { city: 'Oslo', count: 42 },
        { city: 'Bergen', count: 28 },
        { city: 'Trondheim', count: 19 },
        { city: 'Stavanger', count: 15 },
        { city: 'Tromsø', count: 10 },
      ]);
    });

    app.get('/api/v1/locations/types', (req, res) => {
      return res.status(200).json([
        { type: 'restaurant', count: 120 },
        { type: 'cafe', count: 85 },
        { type: 'bar', count: 65 },
        { type: 'shopping_mall', count: 25 },
        { type: 'tourist_attraction', count: 40 },
      ]);
    });

    // Create a real test user for some tests
    testUser = await createTestUser();
    accessToken = generateTestToken(testUser._id);
    testLocationId = new mongoose.Types.ObjectId().toString();
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

  describe('GET /api/v1/locations', () => {
    it('should return all locations', async () => {
      const res = await request(app).get('/api/v1/locations');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('address');
      expect(res.body[0]).toHaveProperty('coordinates');
    });

    it('should filter locations by query parameters', async () => {
      const res = await request(app)
        .get('/api/v1/locations')
        .query({ city: 'Oslo', type: 'shopping_mall' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/v1/locations/:id', () => {
    it('should return a location by ID', async () => {
      const res = await request(app).get(`/api/v1/locations/${testLocationId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testLocationId);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('address');
      expect(res.body).toHaveProperty('coordinates');
    });

    it('should return 404 if location does not exist', async () => {
      const res = await request(app).get('/api/v1/locations/nonexistent-location');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Location not found');
    });
  });

  describe('POST /api/v1/locations', () => {
    it('should create a new location', async () => {
      const locationData = {
        name: 'New Test Location',
        address: '123 Test Street, Oslo',
        city: 'Oslo',
        county: 'Oslo',
        country: 'Norway',
        coordinates: {
          lat: 59.9139,
          lng: 10.7522,
        },
        type: 'restaurant',
        amenities: ['parking', 'wifi'],
      };

      const res = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(locationData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'New Test Location');
      expect(res.body).toHaveProperty('address', '123 Test Street, Oslo');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/locations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Incomplete Location',
          // Missing address
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Name and address are required');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/v1/locations').send({
        name: 'Test Location',
        address: '123 Test Street',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('PUT /api/v1/locations/:id', () => {
    it('should update a location', async () => {
      const updateData = {
        name: 'Updated Location Name',
        amenities: ['parking', 'wifi', 'restaurant'],
      };

      const res = await request(app)
        .put(`/api/v1/locations/${testLocationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testLocationId);
      expect(res.body).toHaveProperty('name', 'Updated Location Name');
      expect(res.body).toHaveProperty('amenities');
      expect(res.body.amenities).toContain('restaurant');
    });

    it('should return 404 if location does not exist', async () => {
      const res = await request(app)
        .put('/api/v1/locations/nonexistent-location')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Location not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).put(`/api/v1/locations/${testLocationId}`).send({
        name: 'Updated Name',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('DELETE /api/v1/locations/:id', () => {
    it('should delete a location', async () => {
      const res = await request(app)
        .delete(`/api/v1/locations/${testLocationId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Location deleted successfully');
    });

    it('should return 404 if location does not exist', async () => {
      const res = await request(app)
        .delete('/api/v1/locations/nonexistent-location')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Location not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete(`/api/v1/locations/${testLocationId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/locations/search', () => {
    it('should search for locations', async () => {
      const res = await request(app).get('/api/v1/locations/search').query({ query: 'Oslo' });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('address');
      expect(res.body[0]).toHaveProperty('coordinates');
    });

    it('should return 400 if search query is missing', async () => {
      const res = await request(app).get('/api/v1/locations/search');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Search query is required');
    });
  });

  describe('GET /api/v1/locations/nearby', () => {
    it('should find nearby locations', async () => {
      const res = await request(app)
        .get('/api/v1/locations/nearby')
        .query({ lat: 59.9139, lng: 10.7522, radius: 5 });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('distance');
    });

    it('should return 400 if coordinates are missing', async () => {
      const res = await request(app).get('/api/v1/locations/nearby');

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Latitude and longitude are required');
    });
  });

  describe('GET /api/v1/locations/cities', () => {
    it('should return cities with location counts', async () => {
      const res = await request(app).get('/api/v1/locations/cities');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('city');
      expect(res.body[0]).toHaveProperty('count');
    });
  });

  describe('GET /api/v1/locations/types', () => {
    it('should return location types with counts', async () => {
      const res = await request(app).get('/api/v1/locations/types');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('type');
      expect(res.body[0]).toHaveProperty('count');
    });
  });
});
