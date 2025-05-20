import express from 'express';
import { protect as authenticate, restrictTo } from '../middleware/auth.js';
import locationController from '../controllers/location.controller.js';
import { ValidationUtils } from '../utils/validation-utils';
import { LocationSchemas } from '../middleware/validators/location.validator';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

/**
 * @route   GET /api/v1/locations
 * @desc    Get all locations with filtering and pagination
 * @access  Public
 */
router.get(
  '/',
  ValidationUtils.validateWithZod(LocationSchemas.filterQuery, 'query'),
  asyncHandler(locationController.getLocations)
);

/**
 * @route   GET /api/v1/locations/nearby
 * @desc    Get nearby locations
 * @access  Public
 */
router.get(
  '/nearby',
  ValidationUtils.validateWithZod(LocationSchemas.locationQuery, 'query'),
  asyncHandler(locationController.getNearbyLocations)
);

/**
 * @route   POST /api/v1/locations
 * @desc    Create a new location
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  restrictTo('admin'),
  ValidationUtils.validateWithZod(LocationSchemas.locationData),
  asyncHandler(locationController.createLocation)
);

/**
 * @route   PUT /api/v1/locations/:id
 * @desc    Update a location
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  restrictTo('admin'),
  ValidationUtils.validateWithZod(LocationSchemas.updateParams, 'params'),
  ValidationUtils.validateWithZod(LocationSchemas.locationData),
  asyncHandler(locationController.updateLocation)
);

/**
 * @route   DELETE /api/v1/locations/:id
 * @desc    Delete a location
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  restrictTo('admin'),
  ValidationUtils.validateWithZod(LocationSchemas.updateParams, 'params'),
  asyncHandler(locationController.deleteLocation)
);

export default router;
