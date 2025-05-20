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
const router = express.Router();
import safetyController from '../controllers/safety.controller.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';
import { param } from 'express-validator';
import {
  validateCheckinData,
  validateCheckinId,
  validateCheckInResponse,
  validateSafetyCode,
  validateEmergencyContact,
  validateSafetySettings,
} from '../middleware/validators/safety.validator.js';

// Create a new safety check-in
router.post('/checkin', protect, validateCheckinData, safetyController.createSafetyCheckin);

// Get all safety check-ins for the current user
router.get('/checkins', protect, safetyController.getUserSafetyCheckins);

// Get a specific safety check-in
router.get('/checkin/:checkinId', protect, validateCheckinId, safetyController.getSafetyCheckin);

// Update a safety check-in
router.put(
  '/checkin/:checkinId',
  protect,
  validateCheckinId,
  validateCheckinData,
  safetyController.updateSafetyCheckin
);

// Start a safety check-in
router.post(
  '/checkin/:checkinId/start',
  protect,
  validateCheckinId,
  safetyController.startSafetyCheckin
);

// Complete a safety check-in
router.post(
  '/checkin/:checkinId/complete',
  protect,
  validateCheckinId,
  safetyController.completeSafetyCheckin
);

// Record a check-in response
router.post(
  '/checkin/:checkinId/respond',
  protect,
  validateCheckinId,
  validateCheckInResponse,
  safetyController.recordCheckInResponse
);

// Verify check-in with safety code
router.post(
  '/checkin/:checkinId/verify',
  protect,
  validateCheckinId,
  validateSafetyCode,
  safetyController.verifyWithSafetyCode
);

// Add emergency contact to a check-in
router.post(
  '/checkin/:checkinId/emergency-contact',
  protect,
  validateCheckinId,
  validateEmergencyContact,
  safetyController.addEmergencyContact
);

// Remove emergency contact from a check-in
router.delete(
  '/checkin/:checkinId/emergency-contact/:contactId',
  protect,
  validateCheckinId,
  param('contactId')
    .notEmpty()
    .withMessage('Contact ID is required')
    .isMongoId()
    .withMessage('Invalid contact ID format'),
  safetyController.removeEmergencyContact
);

// Get user's safety settings
router.get('/settings', protect, safetyController.getUserSafetySettings);

// Update user's safety settings
router.put('/settings', protect, validateSafetySettings, safetyController.updateSafetySettings);

// Admin routes
router.get(
  '/admin/attention-required',
  protect,
  isAdmin,
  safetyController.getCheckinsRequiringAttention
);

export default router;
