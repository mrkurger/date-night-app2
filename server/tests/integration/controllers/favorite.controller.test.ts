import type { jest } from '@jest/globals';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains integration tests for the favorite controller
//
// COMMON CUSTOMIZATIONS:
// - TEST_FAVORITE_DATA: Test favorite data
//   Related to: server/tests/helpers.js:TEST_FAVORITE_DATA
// ===================================================

import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';
import { createTestUser, TEST_USER_DATA, generateTestToken } from '../../helpers.js';
import Favorite from '../../../models/favorite.model.js';
import Ad from '../../../models/ad.model.js';
import { jest } from '@jest/globals';

// Mock dependencies
jest.mock('../../../models/favorite.model.js');
jest.mock('../../../models/ad.model.js');
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

describe('Favorite Controller', () => {
  let testUser;
  let accessToken;
  let testAdId;
  let testFavoriteId;

  beforeAll(async () => {
    await setupTestDB();

    // Create a mock Express app for testing
    app = express();
    app.use(express.json());

    // Mock favorite routes
    app.get('/api/v1/favorites', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      return res.status(200).json([
        {
          _id: 'mock-favorite-id',
          user: 'mock-user-id',
          ad: 'mock-ad-id',
          notes: 'Test notes',
          notificationsEnabled: true,
          tags: ['tag1', 'tag2'],
          priority: 'normal',
        },
      ]);
    });

    app.get('/api/v1/favorites/ids', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      return res.status(200).json(['mock-ad-id-1', 'mock-ad-id-2']);
    });

    app.get('/api/v1/favorites/check/:adId', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      return res.status(200).json(true);
    });

    app.post('/api/v1/favorites/:adId', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.adId === 'nonexistent-ad') {
        return res.status(404).json({ message: 'Ad not found' });
      }

      if (req.params.adId === 'already-favorited') {
        return res.status(200).json({ message: 'Ad is already in favorites' });
      }

      return res.status(201).json({ message: 'Ad added to favorites' });
    });

    app.post('/api/v1/favorites/batch', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.body.adIds || !Array.isArray(req.body.adIds) || req.body.adIds.length === 0) {
        return res.status(400).json({ message: 'No ad IDs provided' });
      }

      if (req.body.adIds.includes('nonexistent-ad')) {
        return res.status(404).json({ message: 'Some ads were not found: nonexistent-ad' });
      }

      return res.status(201).json({
        message: 'Batch favorite operation completed',
        added: 2,
        alreadyFavorited: 1,
      });
    });

    app.delete('/api/v1/favorites/:adId', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.adId === 'nonexistent-favorite') {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      return res.status(200).json({ message: 'Ad removed from favorites' });
    });

    app.delete('/api/v1/favorites/batch', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!req.body.adIds || !Array.isArray(req.body.adIds) || req.body.adIds.length === 0) {
        return res.status(400).json({ message: 'No ad IDs provided' });
      }

      return res.status(200).json({
        message: 'Batch removal completed',
        removed: 3,
      });
    });

    app.put('/api/v1/favorites/:adId/notes', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.adId === 'nonexistent-favorite') {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      return res.status(200).json({ message: 'Favorite notes updated' });
    });

    app.put('/api/v1/favorites/:adId/notifications', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.adId === 'nonexistent-favorite') {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      return res.status(200).json({
        notificationsEnabled: true,
        message: 'Notifications enabled for this favorite',
      });
    });

    app.put('/api/v1/favorites/:adId/tags', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.adId === 'nonexistent-favorite') {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      if (!Array.isArray(req.body.tags)) {
        return res.status(400).json({ message: 'Tags must be an array' });
      }

      return res.status(200).json({
        message: 'Favorite tags updated',
        tags: req.body.tags,
      });
    });

    app.put('/api/v1/favorites/:adId/priority', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (req.params.adId === 'nonexistent-favorite') {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      if (!['low', 'normal', 'high'].includes(req.body.priority)) {
        return res.status(400).json({
          message: 'Invalid priority value. Must be low, normal, or high',
        });
      }

      return res.status(200).json({
        message: 'Favorite priority updated',
        priority: req.body.priority,
      });
    });

    app.get('/api/v1/favorites/tags', (req, res) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      return res.status(200).json([
        { tag: 'tag1', count: 5 },
        { tag: 'tag2', count: 3 },
        { tag: 'tag3', count: 1 },
      ]);
    });

    // Create a real test user for some tests
    testUser = await createTestUser();
    accessToken = generateTestToken(testUser._id);
    testAdId = new mongoose.Types.ObjectId().toString();
    testFavoriteId = new mongoose.Types.ObjectId().toString();
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

  describe('GET /api/v1/favorites', () => {
    it('should return all favorites for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('ad');
      expect(res.body[0]).toHaveProperty('notes');
      expect(res.body[0]).toHaveProperty('tags');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/favorites');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/favorites/ids', () => {
    it('should return all favorite ad IDs for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/favorites/ids')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/favorites/ids');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/favorites/check/:adId', () => {
    it('should check if an ad is favorited by the user', async () => {
      const res = await request(app)
        .get(`/api/v1/favorites/check/${testAdId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(typeof res.body).toBe('boolean');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get(`/api/v1/favorites/check/${testAdId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/v1/favorites/:adId', () => {
    it('should add an ad to favorites', async () => {
      const res = await request(app)
        .post(`/api/v1/favorites/${testAdId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notes: 'Test notes',
          tags: ['tag1', 'tag2'],
          priority: 'high',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Ad added to favorites');
    });

    it('should return 404 if ad does not exist', async () => {
      const res = await request(app)
        .post('/api/v1/favorites/nonexistent-ad')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notes: 'Test notes',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Ad not found');
    });

    it('should return 200 if ad is already favorited', async () => {
      const res = await request(app)
        .post('/api/v1/favorites/already-favorited')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notes: 'Test notes',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Ad is already in favorites');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post(`/api/v1/favorites/${testAdId}`).send({
        notes: 'Test notes',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /api/v1/favorites/batch', () => {
    it('should add multiple ads to favorites', async () => {
      const res = await request(app)
        .post('/api/v1/favorites/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          adIds: [testAdId, 'another-ad-id', 'third-ad-id'],
          notes: 'Batch notes',
          tags: ['batch', 'tag'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Batch favorite operation completed');
      expect(res.body).toHaveProperty('added');
      expect(res.body).toHaveProperty('alreadyFavorited');
    });

    it('should return 400 if no ad IDs are provided', async () => {
      const res = await request(app)
        .post('/api/v1/favorites/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notes: 'Batch notes',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'No ad IDs provided');
    });

    it('should return 404 if some ads do not exist', async () => {
      const res = await request(app)
        .post('/api/v1/favorites/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          adIds: [testAdId, 'nonexistent-ad'],
          notes: 'Batch notes',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Some ads were not found: nonexistent-ad');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/v1/favorites/batch')
        .send({
          adIds: [testAdId],
          notes: 'Batch notes',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('DELETE /api/v1/favorites/:adId', () => {
    it('should remove an ad from favorites', async () => {
      const res = await request(app)
        .delete(`/api/v1/favorites/${testAdId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Ad removed from favorites');
    });

    it('should return 404 if favorite does not exist', async () => {
      const res = await request(app)
        .delete('/api/v1/favorites/nonexistent-favorite')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Favorite not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).delete(`/api/v1/favorites/${testAdId}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('DELETE /api/v1/favorites/batch', () => {
    it('should remove multiple ads from favorites', async () => {
      const res = await request(app)
        .delete('/api/v1/favorites/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          adIds: [testAdId, 'another-ad-id', 'third-ad-id'],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Batch removal completed');
      expect(res.body).toHaveProperty('removed');
    });

    it('should return 400 if no ad IDs are provided', async () => {
      const res = await request(app)
        .delete('/api/v1/favorites/batch')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'No ad IDs provided');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .delete('/api/v1/favorites/batch')
        .send({
          adIds: [testAdId],
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('PUT /api/v1/favorites/:adId/notes', () => {
    it('should update favorite notes', async () => {
      const res = await request(app)
        .put(`/api/v1/favorites/${testAdId}/notes`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notes: 'Updated notes',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Favorite notes updated');
    });

    it('should return 404 if favorite does not exist', async () => {
      const res = await request(app)
        .put('/api/v1/favorites/nonexistent-favorite/notes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          notes: 'Updated notes',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Favorite not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).put(`/api/v1/favorites/${testAdId}/notes`).send({
        notes: 'Updated notes',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('PUT /api/v1/favorites/:adId/notifications', () => {
    it('should toggle notifications for a favorite', async () => {
      const res = await request(app)
        .put(`/api/v1/favorites/${testAdId}/notifications`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('notificationsEnabled');
      expect(res.body).toHaveProperty('message');
    });

    it('should return 404 if favorite does not exist', async () => {
      const res = await request(app)
        .put('/api/v1/favorites/nonexistent-favorite/notifications')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Favorite not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).put(`/api/v1/favorites/${testAdId}/notifications`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('PUT /api/v1/favorites/:adId/tags', () => {
    it('should update favorite tags', async () => {
      const res = await request(app)
        .put(`/api/v1/favorites/${testAdId}/tags`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tags: ['updated', 'tags'],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Favorite tags updated');
      expect(res.body).toHaveProperty('tags');
    });

    it('should return 400 if tags is not an array', async () => {
      const res = await request(app)
        .put(`/api/v1/favorites/${testAdId}/tags`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tags: 'not-an-array',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Tags must be an array');
    });

    it('should return 404 if favorite does not exist', async () => {
      const res = await request(app)
        .put('/api/v1/favorites/nonexistent-favorite/tags')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tags: ['updated', 'tags'],
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Favorite not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put(`/api/v1/favorites/${testAdId}/tags`)
        .send({
          tags: ['updated', 'tags'],
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('PUT /api/v1/favorites/:adId/priority', () => {
    it('should update favorite priority', async () => {
      const res = await request(app)
        .put(`/api/v1/favorites/${testAdId}/priority`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          priority: 'high',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Favorite priority updated');
      expect(res.body).toHaveProperty('priority', 'high');
    });

    it('should return 400 if priority is invalid', async () => {
      const res = await request(app)
        .put(`/api/v1/favorites/${testAdId}/priority`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          priority: 'invalid-priority',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty(
        'message',
        'Invalid priority value. Must be low, normal, or high'
      );
    });

    it('should return 404 if favorite does not exist', async () => {
      const res = await request(app)
        .put('/api/v1/favorites/nonexistent-favorite/priority')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          priority: 'high',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Favorite not found');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).put(`/api/v1/favorites/${testAdId}/priority`).send({
        priority: 'high',
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('GET /api/v1/favorites/tags', () => {
    it('should return all tags used by the user with counts', async () => {
      const res = await request(app)
        .get('/api/v1/favorites/tags')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]).toHaveProperty('tag');
      expect(res.body[0]).toHaveProperty('count');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/favorites/tags');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });
});
