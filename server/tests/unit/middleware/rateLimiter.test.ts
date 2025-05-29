// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the rateLimiter middleware
//
// COMMON CUSTOMIZATIONS:
// - MOCK_RATE_LIMIT_SETTINGS: Settings for rate limiting in tests
//   Related to: server/middleware/rateLimiter.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.ts';

// Mock express-rate-limit BEFORE importing rateLimiter
jest.mock('express-rate-limit');

import {
  rateLimiter,
  createRateLimiter,
  resetRateLimiter,
} from '../../../middleware/rateLimiter.js';
import rateLimit from 'express-rate-limit';

describe('Rate Limiter Middleware', () => {
  let req, res, next;
  let mockLimiter;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Reset rate limiter for fresh state
    resetRateLimiter();

    // Setup request, response, and next function
    req = mockRequest();
    res = mockResponse();
    next = mockNext;

    // Mock rate limiter middleware
    mockLimiter = jest.fn((req, res, next) => next());
    rateLimit.mockReturnValue(mockLimiter);
  });

  describe('createRateLimiter function', () => {
    it('should create a rate limiter with default options', () => {
      const limiter = createRateLimiter();

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          status: 'error',
          message: 'Too many requests, please try again later.',
        },
      });

      expect(limiter).toBe(mockLimiter);
    });

    it('should create a rate limiter with custom options', () => {
      const customOptions = {
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 50, // 50 requests per windowMs
        message: 'Custom rate limit message',
      };

      const limiter = createRateLimiter(customOptions);

      expect(rateLimit).toHaveBeenCalledWith({
        windowMs: 5 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Custom rate limit message',
      });

      expect(limiter).toBe(mockLimiter);
    });

    it('should create a rate limiter with custom keyGenerator', () => {
      const customKeyGenerator = jest.fn(req => req.ip);

      const limiter = createRateLimiter({
        keyGenerator: customKeyGenerator,
      });

      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          keyGenerator: customKeyGenerator,
        })
      );

      expect(limiter).toBe(mockLimiter);
    });

    it('should create a rate limiter with custom skip function', () => {
      const skipFunction = jest.fn(req => req.ip === '127.0.0.1');

      const limiter = createRateLimiter({
        skip: skipFunction,
      });

      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: skipFunction,
        })
      );

      expect(limiter).toBe(mockLimiter);
    });
  });

  describe('rateLimiter middleware', () => {
    it('should use the default rate limiter', () => {
      // Call the middleware
      rateLimiter(req, res, next);

      // Verify the default rate limiter was created
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          max: 100,
        })
      );

      // Verify the limiter was called with the request, response, and next
      expect(mockLimiter).toHaveBeenCalledWith(req, res, next);
    });

    it('should handle rate limit exceeded', () => {
      // Mock rate limiter to simulate rate limit exceeded
      const rateLimitExceededMock = jest.fn((req, res, next) => {
        res.status(429).json({
          success: false,
          status: 'error',
          message: 'Too many requests, please try again later.',
        });
      });

      // Set up the mock to return our rate limit exceeded mock
      rateLimit.mockReturnValue(rateLimitExceededMock);

      // Call the middleware
      rateLimiter(req, res, next);

      // Verify the response
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        status: 'error',
        message: 'Too many requests, please try again later.',
      });

      // Verify next was not called
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when rate limit is not exceeded', () => {
      // Mock rate limiter to call next
      mockLimiter.mockImplementation((req, res, next) => next());

      // Call the middleware
      rateLimiter(req, res, next);

      // Verify next was called
      expect(next).toHaveBeenCalled();

      // Verify response methods were not called
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('Rate limiter for specific routes', () => {
    it('should create a stricter rate limiter for auth routes', () => {
      const authLimiter = createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 requests per hour
        message: {
          success: false,
          status: 'error',
          message: 'Too many login attempts, please try again later.',
        },
      });

      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 60 * 60 * 1000,
          max: 5,
          message: {
            success: false,
            status: 'error',
            message: 'Too many login attempts, please try again later.',
          },
        })
      );

      expect(authLimiter).toBe(mockLimiter);
    });

    it('should create a rate limiter for API routes', () => {
      const apiLimiter = createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per 15 minutes
      });

      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          max: 100,
        })
      );

      expect(apiLimiter).toBe(mockLimiter);
    });
  });
});
