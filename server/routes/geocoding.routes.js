// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for geocoding.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const geocodingController = require('../controllers/geocoding.controller');
const { authenticateToken, optionalAuth } = require('../middleware/authenticateToken');
const { roles } = require('../middleware/roles');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route GET /api/geocoding/forward
 * @description Forward geocode an address to coordinates
 * @access Public
 */
router.get('/forward', optionalAuth, asyncHandler(geocodingController.forwardGeocode));

/**
 * @route GET /api/geocoding/reverse
 * @description Reverse geocode coordinates to an address
 * @access Public
 */
router.get('/reverse', optionalAuth, asyncHandler(geocodingController.reverseGeocode));

/**
 * @route GET /api/geocoding/cache/stats
 * @description Get geocoding cache statistics
 * @access Admin
 */
router.get(
  '/cache/stats',
  authenticateToken,
  roles(['admin']),
  asyncHandler(geocodingController.getCacheStats)
);

/**
 * @route POST /api/geocoding/cache/clear
 * @description Clear geocoding cache
 * @access Admin
 */
router.post(
  '/cache/clear',
  authenticateToken,
  roles(['admin']),
  asyncHandler(geocodingController.clearCache)
);

module.exports = router;
