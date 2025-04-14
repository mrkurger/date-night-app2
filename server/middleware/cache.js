/**
 * Cache middleware for Express
 * Implements various caching strategies for API responses
 */

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

module.exports = {
  staticCache,
  dynamicCache,
  noCache,
  conditionalCache,
  etagCache
};