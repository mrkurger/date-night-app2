import type { jest } from '@jest/globals';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the token-blacklist model
//
// COMMON CUSTOMIZATIONS:
// - TEST_TOKEN_DATA: Test token blacklist data
//   Related to: server/models/token-blacklist.model.js
// ===================================================

import mongoose from 'mongoose';
import TokenBlacklist from '../../../models/token-blacklist.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.js';

describe('TokenBlacklist Model', () => {
  // Setup test data
  const testUserId = new mongoose.Types.ObjectId();
  const testToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  const TEST_TOKEN_DATA = {
    token: testToken,
    tokenType: 'access',
    userId: testUserId,
    reason: 'logout',
    expiresAt: expiresAt,
  };

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Basic Validation', () => {
    it('should create a new token blacklist entry successfully', async () => {
      const tokenBlacklist = new TokenBlacklist(TEST_TOKEN_DATA);
      const savedTokenBlacklist = await tokenBlacklist.save();

      // Verify the saved token blacklist entry
      expect(savedTokenBlacklist._id).toBeDefined();
      expect(savedTokenBlacklist.token).toBe(TEST_TOKEN_DATA.token);
      expect(savedTokenBlacklist.tokenType).toBe(TEST_TOKEN_DATA.tokenType);
      expect(savedTokenBlacklist.userId.toString()).toBe(testUserId.toString());
      expect(savedTokenBlacklist.reason).toBe(TEST_TOKEN_DATA.reason);
      expect(savedTokenBlacklist.expiresAt).toEqual(TEST_TOKEN_DATA.expiresAt);
      expect(savedTokenBlacklist.createdAt).toBeDefined();
    });

    it('should require token, tokenType, userId, and expiresAt', async () => {
      const tokenBlacklistWithoutRequiredFields = new TokenBlacklist({
        reason: 'logout',
      });

      // Expect validation to fail
      await expect(tokenBlacklistWithoutRequiredFields.save()).rejects.toThrow();
    });

    it('should enforce tokenType enum validation', async () => {
      const tokenBlacklistWithInvalidTokenType = new TokenBlacklist({
        ...TEST_TOKEN_DATA,
        tokenType: 'invalid-type', // Not in enum: ['access', 'refresh']
      });

      // Expect validation to fail
      await expect(tokenBlacklistWithInvalidTokenType.save()).rejects.toThrow();
    });

    it('should enforce reason enum validation', async () => {
      const tokenBlacklistWithInvalidReason = new TokenBlacklist({
        ...TEST_TOKEN_DATA,
        reason: 'invalid-reason', // Not in enum: ['logout', 'password_change', 'security_breach', 'user_request', 'admin_action']
      });

      // Expect validation to fail
      await expect(tokenBlacklistWithInvalidReason.save()).rejects.toThrow();
    });

    it('should use default reason when not provided', async () => {
      const tokenBlacklistWithoutReason = new TokenBlacklist({
        ...TEST_TOKEN_DATA,
        reason: undefined, // Not providing a reason
      });

      const savedTokenBlacklist = await tokenBlacklistWithoutReason.save();
      expect(savedTokenBlacklist.reason).toBe('logout'); // Default reason
    });
  });

  describe('Static Methods', () => {
    describe('isBlacklisted', () => {
      it('should return true for a blacklisted token', async () => {
        // Create a blacklisted token
        await TokenBlacklist.create(TEST_TOKEN_DATA);

        // Check if the token is blacklisted
        const isBlacklisted = await TokenBlacklist.isBlacklisted(testToken);
        expect(isBlacklisted).toBe(true);
      });

      it('should return false for a non-blacklisted token', async () => {
        // Check a token that is not in the blacklist
        const isBlacklisted = await TokenBlacklist.isBlacklisted('non-blacklisted-token');
        expect(isBlacklisted).toBe(false);
      });
    });

    describe('blacklist', () => {
      it('should blacklist a token', async () => {
        // Blacklist a token
        const blacklistedToken = await TokenBlacklist.blacklist(
          testToken,
          'access',
          testUserId,
          'password_change',
          expiresAt
        );

        // Verify the blacklisted token
        expect(blacklistedToken).toBeDefined();
        expect(blacklistedToken.token).toBe(testToken);
        expect(blacklistedToken.tokenType).toBe('access');
        expect(blacklistedToken.userId.toString()).toBe(testUserId.toString());
        expect(blacklistedToken.reason).toBe('password_change');
        expect(blacklistedToken.expiresAt).toEqual(expiresAt);

        // Verify the token is blacklisted
        const isBlacklisted = await TokenBlacklist.isBlacklisted(testToken);
        expect(isBlacklisted).toBe(true);
      });

      it('should use default reason when not provided', async () => {
        // Blacklist a token without providing a reason
        const blacklistedToken = await TokenBlacklist.blacklist(
          testToken,
          'access',
          testUserId,
          undefined, // Not providing a reason
          expiresAt
        );

        expect(blacklistedToken.reason).toBe('logout'); // Default reason
      });
    });

    describe('blacklistAllForUser', () => {
      it('should create a special blacklist entry for all user tokens', async () => {
        // Blacklist all tokens for a user
        const blacklistEntry = await TokenBlacklist.blacklistAllForUser(
          testUserId,
          'security_breach',
          expiresAt
        );

        // Verify the blacklist entry
        expect(blacklistEntry).toBeDefined();
        expect(blacklistEntry.token).toContain(`all_tokens_for_${testUserId}_at_`);
        expect(blacklistEntry.tokenType).toBe('all');
        expect(blacklistEntry.userId.toString()).toBe(testUserId.toString());
        expect(blacklistEntry.reason).toBe('security_breach');
        expect(blacklistEntry.expiresAt).toEqual(expiresAt);
      });

      it('should use default reason when not provided', async () => {
        // Blacklist all tokens without providing a reason
        const blacklistEntry = await TokenBlacklist.blacklistAllForUser(
          testUserId,
          undefined, // Not providing a reason
          expiresAt
        );

        expect(blacklistEntry.reason).toBe('security_breach'); // Default reason
      });
    });

    describe('cleanupExpired', () => {
      it('should remove expired tokens', async () => {
        // Create expired and non-expired tokens
        const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await TokenBlacklist.create([
          {
            token: 'expired-token-1',
            tokenType: 'access',
            userId: testUserId,
            reason: 'logout',
            expiresAt: pastDate,
          },
          {
            token: 'expired-token-2',
            tokenType: 'refresh',
            userId: testUserId,
            reason: 'logout',
            expiresAt: pastDate,
          },
          {
            token: 'valid-token',
            tokenType: 'access',
            userId: testUserId,
            reason: 'logout',
            expiresAt: futureDate,
          },
        ]);

        // Verify we have 3 tokens in the database
        let count = await TokenBlacklist.countDocuments();
        expect(count).toBe(3);

        // Clean up expired tokens
        const result = await TokenBlacklist.cleanupExpired();
        expect(result.deletedCount).toBe(2); // 2 expired tokens should be deleted

        // Verify only the non-expired token remains
        count = await TokenBlacklist.countDocuments();
        expect(count).toBe(1);

        const remainingToken = await TokenBlacklist.findOne();
        expect(remainingToken.token).toBe('valid-token');
      });

      it('should not remove any tokens if none are expired', async () => {
        // Create only non-expired tokens
        const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        await TokenBlacklist.create([
          {
            token: 'valid-token-1',
            tokenType: 'access',
            userId: testUserId,
            reason: 'logout',
            expiresAt: futureDate,
          },
          {
            token: 'valid-token-2',
            tokenType: 'refresh',
            userId: testUserId,
            reason: 'logout',
            expiresAt: futureDate,
          },
        ]);

        // Verify we have 2 tokens in the database
        let count = await TokenBlacklist.countDocuments();
        expect(count).toBe(2);

        // Clean up expired tokens
        const result = await TokenBlacklist.cleanupExpired();
        expect(result.deletedCount).toBe(0); // No tokens should be deleted

        // Verify both tokens remain
        count = await TokenBlacklist.countDocuments();
        expect(count).toBe(2);
      });
    });
  });

  describe('Indexes', () => {
    it('should have the expected indexes', async () => {
      const indexes = await TokenBlacklist.collection.indexes();

      // Check for index on userId
      const userIdIndex = indexes.find(index => index.key.userId === 1);
      expect(userIdIndex).toBeDefined();

      // Check for TTL index on expiresAt
      const expiresAtIndex = indexes.find(
        index => index.key.expiresAt === 1 && index.expireAfterSeconds === 0
      );
      expect(expiresAtIndex).toBeDefined();
    });
  });
});
