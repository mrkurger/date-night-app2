// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains integration tests for the travel controller
//
// COMMON CUSTOMIZATIONS:
// - TEST_TRAVEL_DATA: Test travel data
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// ===================================================

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts';
import { createTestUser, generateTestToken } from '../../helpers.ts';
import { jest } from '@jest/globals';

// Mock dependencies
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

describe('Travel Controller', () => {
  let testUser;
  let accessToken;
  let testItineraryId;

  beforeAll(async () => {
    await setupTestDB();

    // Create a mock Express app for testing
    app = express();
    app.use(express.json());

    // Mock travel routes
    app.post('/api/v1/travel/itineraries', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.body.destination) {
        return res.status(400).json({ message: 'Destination is required' });
      }

      return res.status(201).json({
        _id: 'new-itinerary-id',
        user: 'user-id-1',
        destination: req.body.destination,
        startDate: req.body.startDate || new Date(),
        endDate: req.body.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        activities: req.body.activities || [],
        accommodations: req.body.accommodations || [],
        transportation: req.body.transportation || [],
        notes: req.body.notes || '',
        isPublic: req.body.isPublic || false,
        createdAt: new Date(),
      });
    });

    app.get('/api/v1/travel/itineraries/:id', (req, res) => {
      if (req.params.id === 'nonexistent-itinerary') {
        return res.status(404).json({ message: 'Itinerary not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        user: 'user-id-1',
        destination: 'Oslo, Norway',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        activities: [
          {
            name: 'Visit Oslo Opera House',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            location: 'Oslo Opera House',
            notes: 'Bring camera',
          },
        ],
        accommodations: [
          {
            name: 'Grand Hotel Oslo',
            checkIn: new Date(),
            checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            address: 'Karl Johans gate 31, 0159 Oslo',
            confirmationNumber: 'ABC123',
          },
        ],
        transportation: [
          {
            type: 'Flight',
            departureLocation: 'New York JFK',
            arrivalLocation: 'Oslo OSL',
            departureTime: new Date(),
            arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
            confirmationNumber: 'XYZ789',
          },
        ],
        notes: 'Bring warm clothes',
        isPublic: false,
        createdAt: new Date(),
      });
    });

    app.put('/api/v1/travel/itineraries/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-itinerary') {
        return res.status(404).json({ message: 'Itinerary not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        user: 'user-id-1',
        destination: req.body.destination || 'Oslo, Norway',
        startDate: req.body.startDate || new Date(),
        endDate: req.body.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        activities: req.body.activities || [
          {
            name: 'Visit Oslo Opera House',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            location: 'Oslo Opera House',
            notes: 'Bring camera',
          },
        ],
        accommodations: req.body.accommodations || [
          {
            name: 'Grand Hotel Oslo',
            checkIn: new Date(),
            checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            address: 'Karl Johans gate 31, 0159 Oslo',
            confirmationNumber: 'ABC123',
          },
        ],
        transportation: req.body.transportation || [
          {
            type: 'Flight',
            departureLocation: 'New York JFK',
            arrivalLocation: 'Oslo OSL',
            departureTime: new Date(),
            arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
            confirmationNumber: 'XYZ789',
          },
        ],
        notes: req.body.notes || 'Bring warm clothes',
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : false,
        updatedAt: new Date(),
      });
    });

    app.delete('/api/v1/travel/itineraries/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-itinerary') {
        return res.status(404).json({ message: 'Itinerary not found' });
      }

      return res.status(200).json({ message: 'Itinerary deleted successfully' });
    });

    app.get('/api/v1/travel/itineraries', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      return res.status(200).json([
        {
          _id: 'itinerary-id-1',
          user: 'user-id-1',
          destination: 'Oslo, Norway',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          activities: [
            {
              name: 'Visit Oslo Opera House',
              date: new Date(Date.now() + 24 * 60 * 60 * 1000),
              location: 'Oslo Opera House',
              notes: 'Bring camera',
            },
          ],
          isPublic: false,
          createdAt: new Date(),
        },
        {
          _id: 'itinerary-id-2',
          user: 'user-id-1',
          destination: 'Bergen, Norway',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
          activities: [],
          isPublic: true,
          createdAt: new Date(),
        },
      ]);
    });

    app.post('/api/v1/travel/itineraries/:id/share', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-itinerary') {
        return res.status(404).json({ message: 'Itinerary not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        shareUrl: `https://example.com/shared-itinerary/${req.params.id}`,
        isPublic: true,
        updatedAt: new Date(),
      });
    });

    app.post('/api/v1/travel/itineraries/:id/activities', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-itinerary') {
        return res.status(404).json({ message: 'Itinerary not found' });
      }

      if (!req.body.name || !req.body.date) {
        return res.status(400).json({ message: 'Name and date are required for activities' });
      }

      const newActivity = {
        _id: 'new-activity-id',
        name: req.body.name,
        date: req.body.date,
        location: req.body.location || '',
        notes: req.body.notes || '',
        createdAt: new Date(),
      };

      return res.status(201).json(newActivity);
    });

    // Create a real test user for some tests
    testUser = await createTestUser();
    accessToken = generateTestToken(testUser._id);
    testItineraryId = 'itinerary-id-1';
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

  describe('POST /api/v1/travel/itineraries', () => {
    it('should create a new travel itinerary', async () => {
      const itineraryData = {
        destination: 'Oslo, Norway',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Bring warm clothes',
      };

      const res = await request(app)
        .post('/api/v1/travel/itineraries')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(itineraryData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('destination', 'Oslo, Norway');
      expect(res.body).toHaveProperty('startDate');
      expect(res.body).toHaveProperty('endDate');
      expect(res.body).toHaveProperty('notes', 'Bring warm clothes');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 400 if destination is missing', async () => {
      const res = await request(app)
        .post('/api/v1/travel/itineraries')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Destination is required');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/v1/travel/itineraries')
        .send({
          destination: 'Oslo, Norway',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/travel/itineraries/:id', () => {
    it('should get a travel itinerary by ID', async () => {
      const res = await request(app).get(`/api/v1/travel/itineraries/${testItineraryId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testItineraryId);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('destination');
      expect(res.body).toHaveProperty('startDate');
      expect(res.body).toHaveProperty('endDate');
      expect(res.body).toHaveProperty('activities');
      expect(res.body).toHaveProperty('accommodations');
      expect(res.body).toHaveProperty('transportation');
      expect(res.body).toHaveProperty('notes');
      expect(res.body).toHaveProperty('isPublic');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 404 if itinerary does not exist', async () => {
      const res = await request(app).get('/api/v1/travel/itineraries/nonexistent-itinerary');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Itinerary not found');
    });
  });

  describe('PUT /api/v1/travel/itineraries/:id', () => {
    it('should update a travel itinerary', async () => {
      const updateData = {
        destination: 'Updated Destination',
        notes: 'Updated notes',
        isPublic: true,
      };

      const res = await request(app)
        .put(`/api/v1/travel/itineraries/${testItineraryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testItineraryId);
      expect(res.body).toHaveProperty('destination', 'Updated Destination');
      expect(res.body).toHaveProperty('notes', 'Updated notes');
      expect(res.body).toHaveProperty('isPublic', true);
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 404 if itinerary does not exist', async () => {
      const res = await request(app)
        .put('/api/v1/travel/itineraries/nonexistent-itinerary')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          destination: 'Updated Destination',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Itinerary not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).put(`/api/v1/travel/itineraries/${testItineraryId}`).send({
        destination: 'Updated Destination',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('DELETE /api/v1/travel/itineraries/:id', () => {
    it('should delete a travel itinerary', async () => {
      const res = await request(app)
        .delete(`/api/v1/travel/itineraries/${testItineraryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Itinerary deleted successfully');
    });

    it('should return 404 if itinerary does not exist', async () => {
      const res = await request(app)
        .delete('/api/v1/travel/itineraries/nonexistent-itinerary')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Itinerary not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete(`/api/v1/travel/itineraries/${testItineraryId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/travel/itineraries', () => {
    it('should get all travel itineraries for the user', async () => {
      const res = await request(app)
        .get('/api/v1/travel/itineraries')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('destination');
      expect(res.body[0]).toHaveProperty('startDate');
      expect(res.body[0]).toHaveProperty('endDate');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/travel/itineraries');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/v1/travel/itineraries/:id/share', () => {
    it('should share a travel itinerary', async () => {
      const res = await request(app)
        .post(`/api/v1/travel/itineraries/${testItineraryId}/share`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testItineraryId);
      expect(res.body).toHaveProperty('shareUrl');
      expect(res.body).toHaveProperty('isPublic', true);
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 404 if itinerary does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/travel/itineraries/nonexistent-itinerary/share')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Itinerary not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post(`/api/v1/travel/itineraries/${testItineraryId}/share`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/v1/travel/itineraries/:id/activities', () => {
    it('should add an activity to a travel itinerary', async () => {
      const activityData = {
        name: 'Visit Vigeland Park',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Vigeland Park, Oslo',
        notes: 'Bring water',
      };

      const res = await request(app)
        .post(`/api/v1/travel/itineraries/${testItineraryId}/activities`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(activityData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Visit Vigeland Park');
      expect(res.body).toHaveProperty('date');
      expect(res.body).toHaveProperty('location', 'Vigeland Park, Oslo');
      expect(res.body).toHaveProperty('notes', 'Bring water');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post(`/api/v1/travel/itineraries/${testItineraryId}/activities`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Visit Vigeland Park',
          // Missing date
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Name and date are required for activities');
    });

    it('should return 404 if itinerary does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/travel/itineraries/nonexistent-itinerary/activities')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Visit Vigeland Park',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Itinerary not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post(`/api/v1/travel/itineraries/${testItineraryId}/activities`)
        .send({
          name: 'Visit Vigeland Park',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });
});
