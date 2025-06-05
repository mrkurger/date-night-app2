import express from 'express';
import { protect } from '../middleware/auth.js';
import safetyController from '../controllers/safety.controller.js';
import { ValidationUtils, zodSchemas } from '../utils/validation-utils.ts.js';
import { safetySchemas } from './validators/safety.validator.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Create/update check-in
router.post(
  '/check-in',
  ValidationUtils.validateWithZod(safetySchemas.checkinData),
  safetyController.createCheckIn
);

// Get check-in by ID
router.get(
  '/check-in/:id',
  ValidationUtils.validateWithZod(zodSchemas.objectId, 'params'),
  safetyController.getCheckInById
);

// Respond to check-in
router.post(
  '/check-in/:id/respond',
  ValidationUtils.validateWithZod(zodSchemas.objectId, 'params'),
  ValidationUtils.validateWithZod(safetySchemas.checkinResponse),
  safetyController.respondToCheckIn
);

// Verify safety code
router.post(
  '/verify-code',
  ValidationUtils.validateWithZod(safetySchemas.safetyCode),
  safetyController.verifySafetyCode
);

// Add/update emergency contact
router.post(
  '/emergency-contact',
  ValidationUtils.validateWithZod(safetySchemas.emergencyContact),
  safetyController.updateEmergencyContact
);

// Get emergency contacts
router.get('/emergency-contacts', safetyController.getEmergencyContacts);

// Update safety settings
router.put(
  '/settings',
  ValidationUtils.validateWithZod(safetySchemas.safetySettings),
  safetyController.updateSafetySettings
);

// Get safety settings
router.get('/settings', safetyController.getSafetySettings);

export default router;
