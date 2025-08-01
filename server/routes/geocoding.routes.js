// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for geocoding.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
const router = express.Router();
import geocodingController from '../controllers/geocoding.controller.js';
import { authenticateToken, optionalAuth } from '../middleware/authenticateToken.js';
import { roles } from '../middleware/roles.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { ValidationUtils } from '../utils/validation-utils.js';
import GeocodeSchemas from '../middleware/validators/geocoding.validator.js';

/**
 * @route GET /api/geocoding/forward
 * @description Forward geocode an address to coordinates
 * @access Public
 */
router.get(
  '/forward',
  optionalAuth,
  ValidationUtils.validateWithZod(GeocodeSchemas.forwardGeocode, 'query'),
  asyncHandler(geocodingController.forwardGeocode)
);

/**
 * @route GET /api/geocoding/reverse
 * @description Reverse geocode coordinates to an address
 * @access Public
 */
router.get(
  '/reverse',
  optionalAuth,
  ValidationUtils.validateWithZod(GeocodeSchemas.reverseGeocode, 'query'),
  asyncHandler(geocodingController.reverseGeocode)
);

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

export default router;
