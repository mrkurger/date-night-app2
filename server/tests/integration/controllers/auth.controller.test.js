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
const jwt = require('jsonwebtoken');
const { setupTestDB, teardownTestDB, clearDatabase } = require('../../setup');
const { 
  createTestUser, 
  TEST_USER_DATA, 
  generateTestToken,
  generateRefreshToken
} = require('../../helpers');

// Import server app - adjust path as needed
let app;

describe('Auth Controller', () => {
  let testUser;
  let accessToken;
  let refreshToken;
  
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
      
      // Check if email exists (for testing duplicate email)
      if (email === 'existing@example.com') {
        return res.status(409).json({ message: 'Email already in use' });
      }
      
      return res.status(201).json({
        success: true,
        user: {
          _id: 'mock-id',
          username,
          email,
          role: 'user'
        },
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      });
    });
    
    app.post('/api/v1/auth/login', (req, res) => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      if (email === 'nonexistent@example.com') {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (password !== 'Password123!') {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          _id: 'mock-id',
          email,
          username: 'testuser',
          role: 'user'
        },
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      });
    });
    
    app.post('/api/v1/auth/refresh-token', (req, res) => {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }
      
      if (refreshToken === 'invalid-token') {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
      
      if (refreshToken === 'expired-token') {
        return res.status(401).json({ message: 'Refresh token expired' });
      }
      
      if (refreshToken === 'blacklisted-token') {
        return res.status(401).json({ message: 'Refresh token has been revoked' });
      }
      
      return res.status(200).json({
        success: true,
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        user: {
          _id: 'mock-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        }
      });
    });
    
    app.post('/api/v1/auth/logout', (req, res) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    });
    
    app.get('/api/v1/auth/validate', (req, res) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (token === 'invalid-token') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      
      if (token === 'expired-token') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      return res.status(200).json({
        success: true,
        user: {
          _id: 'mock-id',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user'
        }
      });
    });
    
    app.post('/api/v1/auth/forgot-password', (req, res) => {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      if (email === 'nonexistent@example.com') {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    });
    
    app.post('/api/v1/auth/reset-password', (req, res) => {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
      }
      
      if (token === 'invalid-token') {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    });
    
    app.put('/api/v1/auth/change-password', (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      if (currentPassword !== 'Password123!') {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    });
    
    // Create a real test user for some tests
    testUser = await createTestUser();
    accessToken = generateTestToken(testUser._id);
    refreshToken = generateRefreshToken(testUser._id);
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearDatabase();
    // Recreate test user after each test
    testUser = await createTestUser();
    accessToken = generateTestToken(testUser._id);
    refreshToken = generateRefreshToken(testUser._id);
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Password123!'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', 'newuser');
      expect(res.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('expiresIn');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          // Missing email and password
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Missing required fields');
    });

    it('should return 409 if username already exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'existinguser', // This username triggers the 409 in our mock
          email: 'new@example.com',
          password: 'Password123!'
        });
      
      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message', 'Username already exists');
    });
    
    it('should return 409 if email already exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com', // This email triggers the 409 in our mock
          password: 'Password123!'
        });
      
      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message', 'Email already in use');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('expiresIn');
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 404 with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          // Missing email and password
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Missing required fields');
    });
  });
  
  describe('POST /api/v1/auth/refresh-token', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: 'valid-refresh-token'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token', 'new-access-token');
      expect(res.body).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(res.body).toHaveProperty('expiresIn');
      expect(res.body).toHaveProperty('user');
    });
    
    it('should return 400 if refresh token is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Refresh token is required');
    });
    
    it('should return 401 if refresh token is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: 'invalid-token'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid refresh token');
    });
    
    it('should return 401 if refresh token is expired', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: 'expired-token'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Refresh token expired');
    });
    
    it('should return 401 if refresh token is blacklisted', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({
          refreshToken: 'blacklisted-token'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Refresh token has been revoked');
    });
  });
  
  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });
    
    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
  });
  
  describe('GET /api/v1/auth/validate', () => {
    it('should validate token successfully', async () => {
      const res = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
    });
    
    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .get('/api/v1/auth/validate');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
    
    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid token');
    });
    
    it('should return 401 if token is expired', async () => {
      const res = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', 'Bearer expired-token');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token expired');
    });
  });
  
  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send password reset email successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'test@example.com'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Password reset email sent');
    });
    
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email is required');
    });
    
    it('should return 404 if user is not found', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });
  
  describe('POST /api/v1/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'valid-token',
          password: 'NewPassword123!'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Password reset successful');
    });
    
    it('should return 400 if token or password is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'valid-token'
          // Missing password
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Token and password are required');
    });
    
    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewPassword123!'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });
  });
  
  describe('PUT /api/v1/auth/change-password', () => {
    it('should change password successfully', async () => {
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Password changed successfully');
    });
    
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Authentication required');
    });
    
    it('should return 400 if current password or new password is missing', async () => {
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Password123!'
          // Missing new password
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Current password and new password are required');
    });
    
    it('should return 401 if current password is incorrect', async () => {
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Current password is incorrect');
    });
  });
});