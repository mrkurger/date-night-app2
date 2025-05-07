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

// Create a new safety check-in
router.post('/checkin', protect, safetyController.createSafetyCheckin);

// Get all safety check-ins for the current user
router.get('/checkins', protect, safetyController.getUserSafetyCheckins);

// Get a specific safety check-in
router.get('/checkin/:checkinId', protect, safetyController.getSafetyCheckin);

// Update a safety check-in
router.put('/checkin/:checkinId', protect, safetyController.updateSafetyCheckin);

// Start a safety check-in
router.post('/checkin/:checkinId/start', protect, safetyController.startSafetyCheckin);

// Complete a safety check-in
router.post('/checkin/:checkinId/complete', protect, safetyController.completeSafetyCheckin);

// Record a check-in response
router.post('/checkin/:checkinId/respond', protect, safetyController.recordCheckInResponse);

// Verify check-in with safety code
router.post('/checkin/:checkinId/verify', protect, safetyController.verifyWithSafetyCode);

// Add emergency contact to a check-in
router.post('/checkin/:checkinId/emergency-contact', protect, safetyController.addEmergencyContact);

// Remove emergency contact from a check-in
router.delete(
  '/checkin/:checkinId/emergency-contact/:contactId',
  protect,
  safetyController.removeEmergencyContact
);

// Get user's safety settings
router.get('/settings', protect, safetyController.getUserSafetySettings);

// Update user's safety settings
router.put('/settings', protect, safetyController.updateSafetySettings);

// Admin routes
router.get(
  '/admin/attention-required',
  protect,
  isAdmin,
  safetyController.getCheckinsRequiringAttention
);

export default router;
