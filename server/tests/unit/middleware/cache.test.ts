import type { jest } from '@jest/globals';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the cache middleware
//
// COMMON CUSTOMIZATIONS:
// - MOCK_CACHE_SETTINGS: Settings for cache middleware tests
//   Related to: server/middleware/cache.js
// ===================================================

import { jest } from '@jest/globals';
import { cache } from '../../../middleware/cache.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers.js';
import NodeCache from 'node-cache';

// Mock NodeCache
jest.mock('node-cache');

describe('Cache Middleware', () => {
  let req, res, next;
  let mockCache;
  let originalConsoleWarn;

  beforeAll(() => {
    // Save original console.warn
    originalConsoleWarn = console.warn;
    // Mock console.warn to prevent noise in test output
    console.warn = jest.fn();
  });

  afterAll(() => {
    // Restore original console.warn
    console.warn = originalConsoleWarn;
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request, response, and next function
    req = mockRequest({
      originalUrl: '/api/test',
      method: 'GET',
    });
    res = mockResponse();
    next = mockNext;

    // Mock the cache instance
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      flushAll: jest.fn(),
    };

    // Mock NodeCache constructor to return our mockCache
    NodeCache.mockImplementation(() => mockCache);

    // Mock res.send to capture the response
    res.send = jest.fn().mockImplementation(function () {
      return this;
    });

    // Mock res.json to capture the response
    res.json = jest.fn().mockImplementation(function (data) {
      this.body = data;
      return this;
    });

    // Mock res.end to capture the response
    res.end = jest.fn().mockImplementation(function () {
      return this;
    });
  });

  describe('cache middleware creation', () => {
    it('should create a cache middleware with default options', () => {
      const middleware = cache();
      expect(middleware).toBeInstanceOf(Function);
      expect(NodeCache).toHaveBeenCalledWith({ stdTTL: 300, checkperiod: 600 });
    });

    it('should create a cache middleware with custom options', () => {
      const middleware = cache({ ttl: 600, checkperiod: 1200 });
      expect(middleware).toBeInstanceOf(Function);
      expect(NodeCache).toHaveBeenCalledWith({ stdTTL: 600, checkperiod: 1200 });
    });
  });

  describe('cache hit behavior', () => {
    it('should return cached response on cache hit', async () => {
      // Setup cache hit
      const cachedData = { message: 'Cached response' };
      mockCache.get.mockReturnValue(cachedData);

      // Create middleware
      const middleware = cache();

      // Call middleware
      await middleware(req, res, next);

      // Verify cache was checked
      expect(mockCache.get).toHaveBeenCalledWith('/api/test:GET');

      // Verify cached response was sent
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(cachedData);

      // Verify next was not called
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle cached non-JSON responses', async () => {
      // Setup cache hit with non-JSON data
      const cachedData = 'Plain text response';
      mockCache.get.mockReturnValue(cachedData);

      // Create middleware
      const middleware = cache();

      // Call middleware
      await middleware(req, res, next);

      // Verify cache was checked
      expect(mockCache.get).toHaveBeenCalledWith('/api/test:GET');

      // Verify cached response was sent
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(cachedData);

      // Verify next was not called
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('cache miss behavior', () => {
    it('should call next and cache response on cache miss', async () => {
      // Setup cache miss
      mockCache.get.mockReturnValue(null);

      // Create middleware
      const middleware = cache();

      // Call middleware
      await middleware(req, res, next);

      // Verify cache was checked
      expect(mockCache.get).toHaveBeenCalledWith('/api/test:GET');

      // Verify next was called
      expect(next).toHaveBeenCalled();

      // Simulate response from route handler
      const responseData = { message: 'Fresh response' };
      res.json(responseData);
      res.end();

      // Verify response was cached
      expect(mockCache.set).toHaveBeenCalledWith('/api/test:GET', responseData, expect.any(Number));
    });

    it('should not cache error responses', async () => {
      // Setup cache miss
      mockCache.get.mockReturnValue(null);

      // Create middleware
      const middleware = cache();

      // Call middleware
      await middleware(req, res, next);

      // Simulate error response from route handler
      res.status(500).json({ error: 'Server error' });
      res.end();

      // Verify response was not cached
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('should not cache responses with status codes >= 400', async () => {
      // Setup cache miss
      mockCache.get.mockReturnValue(null);

      // Create middleware
      const middleware = cache();

      // Call middleware
      await middleware(req, res, next);

      // Simulate error response from route handler
      res.status(404).json({ error: 'Not found' });
      res.end();

      // Verify response was not cached
      expect(mockCache.set).not.toHaveBeenCalled();
    });
  });

  describe('cache key generation', () => {
    it('should generate cache key based on URL and method', async () => {
      // Setup cache miss
      mockCache.get.mockReturnValue(null);

      // Create middleware
      const middleware = cache();

      // Call middleware with different URLs and methods
      req.originalUrl = '/api/users';
      req.method = 'GET';
      await middleware(req, res, next);
      expect(mockCache.get).toHaveBeenCalledWith('/api/users:GET');

      jest.clearAllMocks();
      req.originalUrl = '/api/users';
      req.method = 'POST';
      await middleware(req, res, next);
      expect(mockCache.get).toHaveBeenCalledWith('/api/users:POST');

      jest.clearAllMocks();
      req.originalUrl = '/api/users/123';
      req.method = 'GET';
      await middleware(req, res, next);
      expect(mockCache.get).toHaveBeenCalledWith('/api/users/123:GET');
    });

    it('should include query parameters in cache key', async () => {
      // Setup cache miss
      mockCache.get.mockReturnValue(null);

      // Create middleware
      const middleware = cache();

      // Call middleware with query parameters
      req.originalUrl = '/api/users?page=1&limit=10';
      req.method = 'GET';
      await middleware(req, res, next);
      expect(mockCache.get).toHaveBeenCalledWith('/api/users?page=1&limit=10:GET');
    });

    it('should use custom key generator if provided', async () => {
      // Setup cache miss
      mockCache.get.mockReturnValue(null);

      // Create middleware with custom key generator
      const customKeyGenerator = req => `custom:${req.method}:${req.originalUrl}`;
      const middleware = cache({ keyGenerator: customKeyGenerator });

      // Call middleware
      req.originalUrl = '/api/users';
      req.method = 'GET';
      await middleware(req, res, next);
      expect(mockCache.get).toHaveBeenCalledWith('custom:GET:/api/users');
    });
  });

  describe('cache bypass', () => {
    it('should bypass cache for non-GET requests by default', async () => {
      // Setup request with non-GET method
      req.method = 'POST';

      // Create middleware
      const middleware = cache();

      // Call middleware
      await middleware(req, res, next);

      // Verify cache was not checked
      expect(mockCache.get).not.toHaveBeenCalled();

      // Verify next was called
      expect(next).toHaveBeenCalled();
    });

    it('should bypass cache when req.skipCache is true', async () => {
      // Setup request with skipCache flag
      req.skipCache = true;

      // Create middleware
      const middleware = cache();

      // Call middleware
      await middleware(req, res, next);

      // Verify cache was not checked
      expect(mockCache.get).not.toHaveBeenCalled();

      // Verify next was called
      expect(next).toHaveBeenCalled();
    });

    it('should bypass cache for paths in excludePaths', async () => {
      // Setup request with excluded path
      req.originalUrl = '/api/auth/login';

      // Create middleware with excludePaths
      const middleware = cache({ excludePaths: ['/api/auth'] });

      // Call middleware
      await middleware(req, res, next);

      // Verify cache was not checked
      expect(mockCache.get).not.toHaveBeenCalled();

      // Verify next was called
      expect(next).toHaveBeenCalled();
    });

    it('should respect methods option for caching', async () => {
      // Setup request with POST method
      req.method = 'POST';

      // Create middleware that caches POST requests
      const middleware = cache({ methods: ['GET', 'POST'] });

      // Call middleware
      await middleware(req, res, next);

      // Verify cache was checked
      expect(mockCache.get).toHaveBeenCalledWith('/api/test:POST');

      // Verify next was called (cache miss)
      expect(next).toHaveBeenCalled();
    });
  });

  describe('cache utilities', () => {
    it('should expose clearCache method', () => {
      const middleware = cache();
      expect(middleware.clearCache).toBeInstanceOf(Function);

      // Call clearCache
      middleware.clearCache();
      expect(mockCache.flushAll).toHaveBeenCalled();
    });

    it('should expose deleteCache method', () => {
      const middleware = cache();
      expect(middleware.deleteCache).toBeInstanceOf(Function);

      // Call deleteCache
      middleware.deleteCache('/api/test', 'GET');
      expect(mockCache.del).toHaveBeenCalledWith('/api/test:GET');
    });

    it('should expose getCacheInstance method', () => {
      const middleware = cache();
      expect(middleware.getCacheInstance).toBeInstanceOf(Function);

      // Call getCacheInstance
      const instance = middleware.getCacheInstance();
      expect(instance).toBe(mockCache);
    });
  });
});
