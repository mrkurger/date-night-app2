import { jest } from '@jest/globals'; // Keep only one jest import
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains integration tests for the auth controller
//
// COMMON CUSTOMIZATIONS:
// - TEST_USER_DATA: Test user data (default: imported from helpers)
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// ===================================================

import request from 'supertest';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts';
import {
  createTestUser,
  TEST_USER_DATA,
  generateTestToken,
  generateRefreshToken,
} from '../../helpers.ts';

// Import server app - changed to named import
import { app } from '../../../server.js';

// Define UserDocument interface locally
interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password?: string;
  role?: string;
}

describe('Auth Controller', () => {
  let testUser: UserDocument | null;
  let accessToken: string | null;
  let refreshToken: string | null;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
    // It's good practice to explicitly close the mongoose connection
    // if it's not handled by teardownTestDB or if tests hang.
    // await mongoose.connection.close(); // Already present, good.
  });

  beforeEach(async () => {
    await clearDatabase();
    const createdUser = await createTestUser(TEST_USER_DATA);
    if (!createdUser) {
      throw new Error('Test user creation failed in beforeEach');
    }
    // Ensure the createdUser is compatible with UserDocument
    testUser = createdUser as unknown as UserDocument;
    accessToken = generateTestToken(testUser._id.toString()); // Ensure _id is string for JWT
    refreshToken = generateRefreshToken(testUser._id.toString()); // Ensure _id is string for JWT
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUserCredentials = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'user',
        acceptTerms: true,
      };
      const res = await request(app).post('/api/v1/auth/register').send(newUserCredentials);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', newUserCredentials.username);
      expect(res.body.user).toHaveProperty('email', newUserCredentials.email);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        username: 'newuser',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 409 if username already exists', async () => {
      // testUser with TEST_USER_DATA.username created in beforeEach
      const res = await request(app).post('/api/v1/auth/register').send({
        username: TEST_USER_DATA.username,
        email: 'anothernew@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'user',
        acceptTerms: true,
      });
      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 409 if email already exists', async () => {
      // testUser with TEST_USER_DATA.email created in beforeEach
      const res = await request(app).post('/api/v1/auth/register').send({
        username: 'anothernewuser',
        email: TEST_USER_DATA.email,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        role: 'user',
        acceptTerms: true,
      });
      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: TEST_USER_DATA.email,
        password: TEST_USER_DATA.password,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.user).toHaveProperty('email', TEST_USER_DATA.email);
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: TEST_USER_DATA.email,
        password: 'WrongPassword123!',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 or 404 with non-existent email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Password123!',
      });
      expect([401, 404]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      if (!refreshToken!) throw new Error('Refresh token not available for test'); // Added non-null assertion
      const res = await request(app).post('/api/v1/auth/refresh-token').send({
        refreshToken: refreshToken, // refreshToken is now guaranteed to be non-null here
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      if (!testUser) throw new Error('Test user not available for assertion');
      expect(res.body.user).toHaveProperty('_id', testUser._id.toString());
    });

    it('should return 400 if refresh token is missing', async () => {
      const res = await request(app).post('/api/v1/auth/refresh-token').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 if refresh token is invalid', async () => {
      const res = await request(app).post('/api/v1/auth/refresh-token').send({
        refreshToken: 'invalid-token',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      if (!accessToken) throw new Error('Access token not available for test');
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200); // Or 204
      // If 200, check body:
      // expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should return 401 if token is missing for logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/auth/validate', () => {
    it('should validate token successfully and return user info', async () => {
      if (!accessToken) throw new Error('Access token not available for test');
      if (!testUser) throw new Error('Test user not available for assertion');
      const res = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('_id', testUser._id.toString());
    });

    it('should return 401 if token is missing for validate', async () => {
      const res = await request(app).get('/api/v1/auth/validate');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 if token is invalid for validate', async () => {
      const res = await request(app)
        .get('/api/v1/auth/validate')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send password reset email successfully for existing user', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        email: TEST_USER_DATA.email,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if email is missing for forgot-password', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 200 or 404 if user is not found for forgot-password', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'nonexistent@example.com',
      });
      expect([200, 404]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/v1/auth/reset-password', () => {
    // These tests are more complex as they require a valid, live reset token.
    // This often involves mocking email services or having a DB query step.
    // For now, these are simplified.
    it('should return 400 or 401 with a placeholder/invalid token', async () => {
      const res = await request(app).post('/api/v1/auth/reset-password').send({
        token: 'invalid-or-placeholder-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });
      expect([400, 401]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if token or password is missing for reset-password', async () => {
      const res = await request(app).post('/api/v1/auth/reset-password').send({
        token: 'valid-token', // Placeholder
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/v1/auth/change-password', () => {
    it('should change password successfully when authenticated', async () => {
      if (!accessToken) throw new Error('Access token not available for test');
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: TEST_USER_DATA.password,
          newPassword: 'NewSecurePassword123!',
          confirmNewPassword: 'NewSecurePassword123!',
        });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should return 401 if not authenticated for change-password', async () => {
      const res = await request(app).put('/api/v1/auth/change-password').send({
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if current password or new password is missing for change-password', async () => {
      if (!accessToken) throw new Error('Access token not available for test');
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: TEST_USER_DATA.password,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 or 400 if current password is incorrect for change-password', async () => {
      if (!accessToken) throw new Error('Access token not available for test');
      const res = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!',
        });
      expect([400, 401]).toContain(res.statusCode);
      expect(res.body).toHaveProperty('message');
    });
  });
});
