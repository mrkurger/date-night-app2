// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for safety.routes settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safety.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// Create a new safety check-in
router.post('/checkin', authenticate, safetyController.createSafetyCheckin);

// Get all safety check-ins for the current user
router.get('/checkins', authenticate, safetyController.getUserSafetyCheckins);

// Get a specific safety check-in
router.get('/checkin/:checkinId', authenticate, safetyController.getSafetyCheckin);

// Update a safety check-in
router.put('/checkin/:checkinId', authenticate, safetyController.updateSafetyCheckin);

// Start a safety check-in
router.post('/checkin/:checkinId/start', authenticate, safetyController.startSafetyCheckin);

// Complete a safety check-in
router.post('/checkin/:checkinId/complete', authenticate, safetyController.completeSafetyCheckin);

// Record a check-in response
router.post('/checkin/:checkinId/respond', authenticate, safetyController.recordCheckInResponse);

// Verify check-in with safety code
router.post('/checkin/:checkinId/verify', authenticate, safetyController.verifyWithSafetyCode);

// Add emergency contact to a check-in
router.post(
  '/checkin/:checkinId/emergency-contact',
  authenticate,
  safetyController.addEmergencyContact
);

// Remove emergency contact from a check-in
router.delete(
  '/checkin/:checkinId/emergency-contact/:contactId',
  authenticate,
  safetyController.removeEmergencyContact
);

// Get user's safety settings
router.get('/settings', authenticate, safetyController.getUserSafetySettings);

// Update user's safety settings
router.put('/settings', authenticate, safetyController.updateSafetySettings);

// Admin routes
router.get(
  '/admin/attention-required',
  authenticate,
  isAdmin,
  safetyController.getCheckinsRequiringAttention
);

module.exports = router;
