// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains performance tests for the API
// 
// COMMON CUSTOMIZATIONS:
// - PERFORMANCE_THRESHOLDS: Response time thresholds (default: see constants below)
//   Related to: server/config/environment.js
// - REQUEST_COUNTS: Number of requests to make for load testing
//   Related to: server/middleware/rateLimiter.js
// ===================================================

const request = require('supertest');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../../setup');
const { createTestUser, generateTestToken, TEST_USER_DATA } = require('../../helpers');

// Performance thresholds in milliseconds
const PERFORMANCE_THRESHOLDS = {
  AUTH_LOGIN: 200,
  USER_PROFILE: 150,
  LISTING_SEARCH: 300
};

// Number of requests for load testing
const REQUEST_COUNTS = {
  SEQUENTIAL: 10,
  CONCURRENT: 5
};

// Import server app - adjust path as needed
let app;

describe('API Performance Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await setupTestDB();
    
    // Import the app after setting up the test environment
    const serverModule = require('../../../server');
    app = serverModule.app;
    
    // Create a test user and get auth token
    const user = await createTestUser();
    userId = user._id;
    authToken = generateTestToken(userId);
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Clear any test data except the user we created
    // This ensures a clean state for each test
    await clearDatabase();
    const user = await createTestUser();
    userId = user._id;
    authToken = generateTestToken(userId);
  });

  describe('Authentication Performance', () => {
    it('should login within performance threshold', async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: TEST_USER_DATA.username,
          password: TEST_USER_DATA.password
        });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(res.statusCode).toBe(200);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.AUTH_LOGIN);
    });

    it('should handle sequential login requests efficiently', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < REQUEST_COUNTS.SEQUENTIAL; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            username: TEST_USER_DATA.username,
            password: TEST_USER_DATA.password
          });
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / REQUEST_COUNTS.SEQUENTIAL;
      
      // Average response time should be reasonable
      expect(avgResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.AUTH_LOGIN * 1.5);
    });
  });

  describe('User Profile Performance', () => {
    it('should fetch user profile within performance threshold', async () => {
      const startTime = Date.now();
      
      const res = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(res.statusCode).toBe(200);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.USER_PROFILE);
    });
  });

  describe('Search Performance', () => {
    // This test assumes you have a search endpoint
    it('should perform search within performance threshold', async () => {
      // First, create some test data to search through
      // This would depend on your specific data model
      
      const startTime = Date.now();
      
      const res = await request(app)
        .get('/api/v1/search')
        .query({ q: 'test', limit: 10 })
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(res.statusCode).toBe(200);
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.LISTING_SEARCH);
    });
  });

  // This test is marked as skipped by default as it can be resource-intensive
  // Remove the .skip() to run it when needed
  describe.skip('Load Testing', () => {
    it('should handle concurrent requests efficiently', async () => {
      const requests = [];
      
      for (let i = 0; i < REQUEST_COUNTS.CONCURRENT; i++) {
        requests.push(
          request(app)
            .get(`/api/v1/users/${userId}`)
            .set('Authorization', `Bearer ${authToken}`)
        );
      }
      
      const startTime = Date.now();
      await Promise.all(requests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / REQUEST_COUNTS.CONCURRENT;
      
      // Average response time under concurrent load should be reasonable
      expect(avgResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.USER_PROFILE * 2);
    });
  });
});