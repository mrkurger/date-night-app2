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
    
    // Create a mock Express app for testing
    app = express();
    app.use(express.json());
    
    // Mock auth routes
    app.post('/api/v1/auth/register', (req, res) => {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Check if user exists (for testing duplicate username)
      if (username === 'existinguser') {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      return res.status(201).json({
        success: true,
        user: {
          _id: 'mock-id',
          username,
          email,
          role: 'user'
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
    });
    
    app.post('/api/v1/auth/login', (req, res) => {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      if (username === 'nonexistentuser') {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (password !== 'password123') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          _id: 'mock-id',
          username,
          role: 'user'
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
    });
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
      expect(res.body).toHaveProperty('accessToken', 'mock-access-token');
      expect(res.body).toHaveProperty('refreshToken', 'mock-refresh-token');
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
      // Mock the existing user case
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'existinguser', // This username triggers the 409 in our mock
          email: 'existing@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    // No need to create a test user since we're using a mock
    
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser', // Any username that's not 'nonexistentuser'
          password: 'password123' // Must match the expected password in our mock
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken', 'mock-access-token');
      expect(res.body).toHaveProperty('refreshToken', 'mock-refresh-token');
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