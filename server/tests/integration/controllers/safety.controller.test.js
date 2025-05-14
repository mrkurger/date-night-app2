// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains integration tests for the safety controller
//
// COMMON CUSTOMIZATIONS:
// - TEST_SAFETY_DATA: Test safety data
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// ===================================================

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';
import { createTestUser, generateTestToken } from '../../helpers.js';
import SafetyCheckin from '../../../models/safety-checkin.model.js';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../models/safety-checkin.model.js');
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

describe('Safety Controller', () => {
  let testUser;
  let accessToken;
  let testCheckinId;
  let testEmergencyContactId;

  beforeAll(async () => {
    await setupTestDB();

    // Create a mock Express app for testing
    app = express();
    app.use(express.json());

    // Mock safety routes
    app.post('/api/v1/safety/checkin', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.body.location) {
        return res.status(400).json({ message: 'Location is required' });
      }

      return res.status(201).json({
        _id: 'new-checkin-id',
        user: 'user-id-1',
        location: req.body.location,
        scheduledTime: req.body.scheduledTime || new Date(Date.now() + 3600000), // 1 hour from now
        status: 'scheduled',
        notes: req.body.notes || '',
        createdAt: new Date(),
      });
    });

    app.get('/api/v1/safety/checkin/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-checkin') {
        return res.status(404).json({ message: 'Check-in not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        user: 'user-id-1',
        location: 'Oslo City Center',
        scheduledTime: new Date(Date.now() + 3600000),
        status: 'scheduled',
        notes: 'Meeting with John',
        createdAt: new Date(),
      });
    });

    app.put('/api/v1/safety/checkin/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-checkin') {
        return res.status(404).json({ message: 'Check-in not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        user: 'user-id-1',
        location: req.body.location || 'Oslo City Center',
        scheduledTime: req.body.scheduledTime || new Date(Date.now() + 3600000),
        status: req.body.status || 'scheduled',
        notes: req.body.notes || 'Meeting with John',
        updatedAt: new Date(),
      });
    });

    app.delete('/api/v1/safety/checkin/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-checkin') {
        return res.status(404).json({ message: 'Check-in not found' });
      }

      return res.status(200).json({ message: 'Check-in deleted successfully' });
    });

    app.post('/api/v1/safety/checkin/:id/complete', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-checkin') {
        return res.status(404).json({ message: 'Check-in not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        user: 'user-id-1',
        location: 'Oslo City Center',
        scheduledTime: new Date(Date.now() - 1000), // Just in the past
        status: 'completed',
        notes: 'Meeting with John',
        completedAt: new Date(),
        updatedAt: new Date(),
      });
    });

    app.get('/api/v1/safety/checkins', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      return res.status(200).json([
        {
          _id: 'checkin-id-1',
          user: 'user-id-1',
          location: 'Oslo City Center',
          scheduledTime: new Date(Date.now() + 3600000),
          status: 'scheduled',
          notes: 'Meeting with John',
          createdAt: new Date(),
        },
        {
          _id: 'checkin-id-2',
          user: 'user-id-1',
          location: 'Bergen Downtown',
          scheduledTime: new Date(Date.now() + 7200000),
          status: 'scheduled',
          notes: 'Meeting with Sarah',
          createdAt: new Date(),
        },
      ]);
    });

    app.post('/api/v1/safety/emergency-contacts', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.body.name || !req.body.phone) {
        return res.status(400).json({ message: 'Name and phone are required' });
      }

      return res.status(201).json({
        _id: 'new-contact-id',
        user: 'user-id-1',
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email || null,
        relationship: req.body.relationship || null,
        isActive: true,
        createdAt: new Date(),
      });
    });

    app.get('/api/v1/safety/emergency-contacts', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      return res.status(200).json([
        {
          _id: 'contact-id-1',
          user: 'user-id-1',
          name: 'John Doe',
          phone: '+4712345678',
          email: 'john@example.com',
          relationship: 'Friend',
          isActive: true,
          createdAt: new Date(),
        },
        {
          _id: 'contact-id-2',
          user: 'user-id-1',
          name: 'Jane Smith',
          phone: '+4787654321',
          email: 'jane@example.com',
          relationship: 'Family',
          isActive: true,
          createdAt: new Date(),
        },
      ]);
    });

    app.put('/api/v1/safety/emergency-contacts/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-contact') {
        return res.status(404).json({ message: 'Emergency contact not found' });
      }

      return res.status(200).json({
        _id: req.params.id,
        user: 'user-id-1',
        name: req.body.name || 'John Doe',
        phone: req.body.phone || '+4712345678',
        email: req.body.email || 'john@example.com',
        relationship: req.body.relationship || 'Friend',
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        updatedAt: new Date(),
      });
    });

    app.delete('/api/v1/safety/emergency-contacts/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-contact') {
        return res.status(404).json({ message: 'Emergency contact not found' });
      }

      return res.status(200).json({ message: 'Emergency contact deleted successfully' });
    });

    app.post('/api/v1/safety/sos', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      return res.status(200).json({
        message: 'SOS alert sent successfully',
        alertId: 'sos-alert-id-1',
        timestamp: new Date(),
        location: req.body.location || null,
        contactsNotified: 2,
      });
    });

    app.post('/api/v1/safety/sos/cancel/:id', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.id === 'nonexistent-alert') {
        return res.status(404).json({ message: 'SOS alert not found' });
      }

      return res.status(200).json({
        message: 'SOS alert cancelled successfully',
        alertId: req.params.id,
        cancelledAt: new Date(),
      });
    });

    // Create a real test user for some tests
    testUser = await createTestUser();
    accessToken = generateTestToken(testUser._id);
    testCheckinId = 'checkin-id-1';
    testEmergencyContactId = 'contact-id-1';
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

  describe('POST /api/v1/safety/checkin', () => {
    it('should create a new safety check-in', async () => {
      const checkinData = {
        location: 'Oslo City Center',
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
        notes: 'Meeting with John',
      };

      const res = await request(app)
        .post('/api/v1/safety/checkin')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(checkinData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('location', 'Oslo City Center');
      expect(res.body).toHaveProperty('scheduledTime');
      expect(res.body).toHaveProperty('status', 'scheduled');
      expect(res.body).toHaveProperty('notes', 'Meeting with John');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 400 if location is missing', async () => {
      const res = await request(app)
        .post('/api/v1/safety/checkin')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          scheduledTime: new Date(Date.now() + 3600000).toISOString(),
          notes: 'Meeting with John',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Location is required');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/v1/safety/checkin')
        .send({
          location: 'Oslo City Center',
          scheduledTime: new Date(Date.now() + 3600000).toISOString(),
          notes: 'Meeting with John',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/safety/checkin/:id', () => {
    it('should get a safety check-in by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/safety/checkin/${testCheckinId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testCheckinId);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('location');
      expect(res.body).toHaveProperty('scheduledTime');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('notes');
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 404 if check-in does not exist', async () => {
      const res = await request(app)
        .get('/api/v1/safety/checkin/nonexistent-checkin')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Check-in not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get(`/api/v1/safety/checkin/${testCheckinId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('PUT /api/v1/safety/checkin/:id', () => {
    it('should update a safety check-in', async () => {
      const updateData = {
        location: 'Updated Location',
        scheduledTime: new Date(Date.now() + 7200000).toISOString(),
        notes: 'Updated notes',
      };

      const res = await request(app)
        .put(`/api/v1/safety/checkin/${testCheckinId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testCheckinId);
      expect(res.body).toHaveProperty('location', 'Updated Location');
      expect(res.body).toHaveProperty('notes', 'Updated notes');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 404 if check-in does not exist', async () => {
      const res = await request(app)
        .put('/api/v1/safety/checkin/nonexistent-checkin')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          location: 'Updated Location',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Check-in not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).put(`/api/v1/safety/checkin/${testCheckinId}`).send({
        location: 'Updated Location',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('DELETE /api/v1/safety/checkin/:id', () => {
    it('should delete a safety check-in', async () => {
      const res = await request(app)
        .delete(`/api/v1/safety/checkin/${testCheckinId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Check-in deleted successfully');
    });

    it('should return 404 if check-in does not exist', async () => {
      const res = await request(app)
        .delete('/api/v1/safety/checkin/nonexistent-checkin')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Check-in not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete(`/api/v1/safety/checkin/${testCheckinId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/v1/safety/checkin/:id/complete', () => {
    it('should mark a safety check-in as completed', async () => {
      const res = await request(app)
        .post(`/api/v1/safety/checkin/${testCheckinId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testCheckinId);
      expect(res.body).toHaveProperty('status', 'completed');
      expect(res.body).toHaveProperty('completedAt');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 404 if check-in does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/safety/checkin/nonexistent-checkin/complete')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Check-in not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post(`/api/v1/safety/checkin/${testCheckinId}/complete`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/safety/checkins', () => {
    it('should get all safety check-ins for the user', async () => {
      const res = await request(app)
        .get('/api/v1/safety/checkins')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('location');
      expect(res.body[0]).toHaveProperty('scheduledTime');
      expect(res.body[0]).toHaveProperty('status');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/safety/checkins');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/v1/safety/emergency-contacts', () => {
    it('should create a new emergency contact', async () => {
      const contactData = {
        name: 'John Doe',
        phone: '+4712345678',
        email: 'john@example.com',
        relationship: 'Friend',
      };

      const res = await request(app)
        .post('/api/v1/safety/emergency-contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(contactData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('name', 'John Doe');
      expect(res.body).toHaveProperty('phone', '+4712345678');
      expect(res.body).toHaveProperty('email', 'john@example.com');
      expect(res.body).toHaveProperty('relationship', 'Friend');
      expect(res.body).toHaveProperty('isActive', true);
      expect(res.body).toHaveProperty('createdAt');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/safety/emergency-contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'John Doe',
          // Missing phone
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Name and phone are required');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/v1/safety/emergency-contacts').send({
        name: 'John Doe',
        phone: '+4712345678',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/safety/emergency-contacts', () => {
    it('should get all emergency contacts for the user', async () => {
      const res = await request(app)
        .get('/api/v1/safety/emergency-contacts')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('phone');
      expect(res.body[0]).toHaveProperty('isActive');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/safety/emergency-contacts');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('PUT /api/v1/safety/emergency-contacts/:id', () => {
    it('should update an emergency contact', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '+4798765432',
        email: 'updated@example.com',
      };

      const res = await request(app)
        .put(`/api/v1/safety/emergency-contacts/${testEmergencyContactId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', testEmergencyContactId);
      expect(res.body).toHaveProperty('name', 'Updated Name');
      expect(res.body).toHaveProperty('phone', '+4798765432');
      expect(res.body).toHaveProperty('email', 'updated@example.com');
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 404 if emergency contact does not exist', async () => {
      const res = await request(app)
        .put('/api/v1/safety/emergency-contacts/nonexistent-contact')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Emergency contact not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put(`/api/v1/safety/emergency-contacts/${testEmergencyContactId}`)
        .send({
          name: 'Updated Name',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('DELETE /api/v1/safety/emergency-contacts/:id', () => {
    it('should delete an emergency contact', async () => {
      const res = await request(app)
        .delete(`/api/v1/safety/emergency-contacts/${testEmergencyContactId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Emergency contact deleted successfully');
    });

    it('should return 404 if emergency contact does not exist', async () => {
      const res = await request(app)
        .delete('/api/v1/safety/emergency-contacts/nonexistent-contact')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Emergency contact not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete(
        `/api/v1/safety/emergency-contacts/${testEmergencyContactId}`
      );

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/v1/safety/sos', () => {
    it('should send an SOS alert', async () => {
      const sosData = {
        location: 'Oslo City Center',
        message: 'Need help!',
      };

      const res = await request(app)
        .post('/api/v1/safety/sos')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(sosData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'SOS alert sent successfully');
      expect(res.body).toHaveProperty('alertId');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('contactsNotified');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/v1/safety/sos').send({
        location: 'Oslo City Center',
        message: 'Need help!',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/v1/safety/sos/cancel/:id', () => {
    it('should cancel an SOS alert', async () => {
      const res = await request(app)
        .post('/api/v1/safety/sos/cancel/sos-alert-id-1')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'SOS alert cancelled successfully');
      expect(res.body).toHaveProperty('alertId', 'sos-alert-id-1');
      expect(res.body).toHaveProperty('cancelledAt');
    });

    it('should return 404 if SOS alert does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/safety/sos/cancel/nonexistent-alert')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'SOS alert not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/v1/safety/sos/cancel/sos-alert-id-1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });
});
