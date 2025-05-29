/**
 * Cache middleware for Express
 * Implements various caching strategies for API responses
 */

import NodeCache from 'node-cache';

/**
 * Create a cache middleware with NodeCache
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds (default: 300)
 * @param {number} options.checkperiod - Check period in seconds (default: 600)
 * @param {Array} options.methods - HTTP methods to cache (default: ['GET'])
 * @param {Array} options.excludePaths - Paths to exclude from caching
 * @param {Function} options.keyGenerator - Custom key generator function
 * @returns {Function} - Express middleware function
 */
const cache = (options = {}) => {
  const {
    ttl = 300,
    checkperiod = 600,
    methods = ['GET'],
    excludePaths = [],
    keyGenerator = null,
  } = options;

  // Create cache instance
  const cacheInstance = new NodeCache({ stdTTL: ttl, checkperiod });

  // Default key generator
  const defaultKeyGenerator = req => `${req.originalUrl}:${req.method}`;
  const generateKey = keyGenerator || defaultKeyGenerator;

  const middleware = async (req, res, next) => {
    // Skip cache if method not allowed
    if (!methods.includes(req.method)) {
      return next();
    }

    // Skip cache if skipCache flag is set
    if (req.skipCache) {
      return next();
    }

    // Skip cache for excluded paths
    if (excludePaths.some(path => req.originalUrl.startsWith(path))) {
      return next();
    }

    // Generate cache key
    const key = generateKey(req);

    // Try to get from cache
    const cachedData = cacheInstance.get(key);
    if (cachedData !== undefined) {
      // Cache hit - return cached response
      res.status(200);
      if (typeof cachedData === 'object') {
        return res.json(cachedData);
      } else {
        return res.send(cachedData);
      }
    }

    // Cache miss - intercept response to cache it
    const originalJson = res.json;
    const originalSend = res.send;
    const originalEnd = res.end;

    let responseData = null;
    let statusCode = 200;

    // Override json method
    res.json = function (data) {
      responseData = data;
      statusCode = this.statusCode || 200;
      return originalJson.call(this, data);
    };

    // Override send method
    res.send = function (data) {
      responseData = data;
      statusCode = this.statusCode || 200;
      return originalSend.call(this, data);
    };

    // Override end method to cache response
    res.end = function (...args) {
      // Only cache successful responses
      if (statusCode < 400 && responseData !== null) {
        cacheInstance.set(key, responseData, ttl);
      }
      return originalEnd.call(this, ...args);
    };

    next();
  };

  // Expose utility methods
  middleware.clearCache = () => cacheInstance.flushAll();
  middleware.deleteCache = (url, method = 'GET') => {
    const key = `${url}:${method}`;
    cacheInstance.del(key);
  };
  middleware.getCacheInstance = () => cacheInstance;

  return middleware;
};

/**
 * Set cache headers for static content
 * @param {number} maxAge - Max age in seconds
 */
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for cache settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const staticCache = (maxAge = 86400) => {
  return (req, res, next) => {
    // Set cache headers
    res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`);
    res.set('Surrogate-Control', `max-age=${maxAge * 2}`);
    next();
  };
};

/**
 * Set cache headers for dynamic content
 * @param {number} maxAge - Max age in seconds
 */
const dynamicCache = (maxAge = 60) => {
  return (req, res, next) => {
    // Set cache headers
    res.set('Cache-Control', `private, max-age=${maxAge}`);
    next();
  };
};

/**
 * Set no-cache headers for sensitive content
 */
const noCache = () => {
  return (req, res, next) => {
    // Set no-cache headers
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
  };
};

/**
 * Set conditional cache headers based on request method
 */
const conditionalCache = () => {
  return (req, res, next) => {
    // Only cache GET and HEAD requests
    if (req.method === 'GET' || req.method === 'HEAD') {
      // Set public cache for GET requests
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    } else {
      // Set no-cache for other methods
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.set('Pragma', 'no-cache');
    }
    next();
  };
};

/**
 * Set ETag header for conditional requests
 */
const etagCache = () => {
  return (req, res, next) => {
    // Enable ETag generation
    res.set('ETag', true);
    next();
  };
};

export { cache, staticCache, dynamicCache, noCache, conditionalCache, etagCache };
