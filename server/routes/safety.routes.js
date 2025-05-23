// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for safety.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import express from 'express';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';
import safetyController from '../controllers/safety.controller.js';
import { ValidationUtils } from '../utils/validation-utils.js';
import { SafetySchemas } from '../middleware/validators/safety.validator.ts';

const router = express.Router();

// Create a new safety check-in
router.post(
  '/checkin',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinData),
  safetyController.createSafetyCheckin
);

// Get all safety check-ins for the current user
router.get('/checkins', protect, safetyController.getUserSafetyCheckins);

// Get a specific safety check-in
router.get(
  '/checkin/:checkinId',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinIdParam, 'params'),
  safetyController.getSafetyCheckin
);

// Update a safety check-in
router.put(
  '/checkin/:checkinId',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinIdParam, 'params'),
  ValidationUtils.validateWithZod(SafetySchemas.checkinData),
  safetyController.updateSafetyCheckin
);

// Start a safety check-in
router.post(
  '/checkin/:checkinId/start',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinIdParam, 'params'),
  safetyController.startSafetyCheckin
);

// Complete a safety check-in
router.post(
  '/checkin/:checkinId/complete',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinIdParam, 'params'),
  safetyController.completeSafetyCheckin
);

// Record a check-in response
router.post(
  '/checkin/:checkinId/respond',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinIdParam, 'params'),
  ValidationUtils.validateWithZod(SafetySchemas.checkinResponse),
  safetyController.recordCheckInResponse
);

// Verify check-in with safety code
router.post(
  '/checkin/:checkinId/verify',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinIdParam, 'params'),
  ValidationUtils.validateWithZod(SafetySchemas.safetyCode),
  safetyController.verifyWithSafetyCode
);

// Add emergency contact to a check-in
router.post(
  '/checkin/:checkinId/emergency-contact',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinIdParam, 'params'),
  ValidationUtils.validateWithZod(SafetySchemas.emergencyContact),
  safetyController.addEmergencyContact
);

// Remove emergency contact from a check-in
router.delete(
  '/checkin/:checkinId/emergency-contact/:contactId',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.checkinIdParam, 'params'),
  ValidationUtils.validateWithZod(SafetySchemas.contactIdParam, 'params'),
  safetyController.removeEmergencyContact
);

// Get user's safety settings
router.get('/settings', protect, safetyController.getUserSafetySettings);

// Update user's safety settings
router.put(
  '/settings',
  protect,
  ValidationUtils.validateWithZod(SafetySchemas.safetySettings),
  safetyController.updateSafetySettings
);

// Admin routes
router.get(
  '/admin/attention-required',
  protect,
  isAdmin,
  safetyController.getCheckinsRequiringAttention
);

export default router;
