// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains integration tests for the auth controller
// 
// COMMON CUSTOMIZATIONS:
// - TEST_USER_DATA: Test user data (default: imported from helpers)
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// ===================================================

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../../setup');
const { createTestUser, TEST_USER_DATA } = require('../../helpers');

// Import server app - adjust path as needed
let app;

describe('Auth Controller', () => {
  beforeAll(async () => {
    await setupTestDB();
    
    // Import the app after setting up the test environment
    // This ensures environment variables are set before app initialization
    const serverModule = require('../../../server');
    app = serverModule.app;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(TEST_USER_DATA);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', TEST_USER_DATA.username);
      expect(res.body.user).toHaveProperty('email', TEST_USER_DATA.email);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: TEST_USER_DATA.username,
          // Missing email and password
        });
      
      expect(res.statusCode).toBe(400);
    });

    it('should return 409 if username already exists', async () => {
      // Create a user first
      await createTestUser();
      
      // Try to register with the same username
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...TEST_USER_DATA,
          email: 'different@example.com' // Different email
        });
      
      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await createTestUser();
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: TEST_USER_DATA.username,
          password: TEST_USER_DATA.password
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: TEST_USER_DATA.username,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
    });

    it('should return 404 with non-existent username', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistentuser',
          password: TEST_USER_DATA.password
        });
      
      expect(res.statusCode).toBe(404);
    });
  });

  // Add more tests for other auth endpoints (refresh token, logout, etc.)
});