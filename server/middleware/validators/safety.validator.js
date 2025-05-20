/**
 * Validation middleware for safety-related routes
 */
import { body, param, validationResult } from 'express-validator';
import { AppError } from '../errorHandler.js';

// Helper function to check validation results
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new AppError(
        `Validation error: ${errors
          .array()
          .map(e => e.msg)
          .join(', ')}`,
        400
      )
    );
  }
  next();
};

// Validate check-in creation/update data
const validateCheckinData = [
  // Required fields
  body('meetingWith').optional().isMongoId().withMessage('Invalid meeting with ID'),

  body('clientName')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .escape()
    .withMessage('Client name must be less than 100 characters'),

  body('clientContact')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .escape()
    .withMessage('Client contact must be less than 100 characters'),

  // Location validation
  body('location.type').equals('Point').withMessage('Location type must be Point'),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),

  body('location.coordinates.0')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('location.coordinates.1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.address')
    .optional()
    .isLength({ max: 200 })
    .trim()
    .escape()
    .withMessage('Address must be less than 200 characters'),

  body('location.locationName')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .escape()
    .withMessage('Location name must be less than 100 characters'),

  body('location.city')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .escape()
    .withMessage('City must be less than 100 characters'),

  body('location.county')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .escape()
    .withMessage('County must be less than 100 characters'),

  // Time validation
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date')
    .custom(value => {
      if (new Date(value) < new Date()) {
        throw new Error('Start time cannot be in the past');
      }
      return true;
    }),

  body('expectedEndTime')
    .isISO8601()
    .withMessage('Expected end time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  // Notes and preferences
  body('safetyNotes')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .escape()
    .withMessage('Safety notes must be less than 1000 characters'),

  body('checkInMethod')
    .optional()
    .isIn(['app', 'sms', 'email'])
    .withMessage('Check-in method must be app, sms, or email'),

  // Auto check-in settings
  body('autoCheckInSettings.enabled')
    .optional()
    .isBoolean()
    .withMessage('Auto check-in enabled must be a boolean'),

  body('autoCheckInSettings.intervalMinutes')
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage('Auto check-in interval must be between 5 and 180 minutes'),

  body('autoCheckInSettings.missedCheckInsBeforeAlert')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Missed check-ins before alert must be between 1 and 5'),

  validateResults,
];

// Validate check-in ID parameter
const validateCheckinId = [
  param('checkinId')
    .notEmpty()
    .withMessage('Check-in ID is required')
    .isMongoId()
    .withMessage('Invalid check-in ID format'),

  validateResults,
];

// Validate check-in response
const validateCheckInResponse = [
  body('response')
    .isIn(['safe', 'need_more_time', 'distress'])
    .withMessage('Response must be safe, need_more_time, or distress'),

  body('coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),

  body('coordinates.0')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('coordinates.1')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  validateResults,
];

// Validate safety code
const validateSafetyCode = [
  body('safetyCode')
    .notEmpty()
    .withMessage('Safety code is required')
    .isString()
    .withMessage('Safety code must be a string'),

  validateResults,
];

// Validate emergency contact
const validateEmergencyContact = [
  body('name')
    .notEmpty()
    .withMessage('Contact name is required')
    .isLength({ max: 100 })
    .trim()
    .escape()
    .withMessage('Contact name must be less than 100 characters'),

  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),

  body('email').optional().isEmail().withMessage('Invalid email format').normalizeEmail(),

  body('relationship')
    .optional()
    .isLength({ max: 50 })
    .trim()
    .escape()
    .withMessage('Relationship must be less than 50 characters'),

  validateResults,
];

// Validate safety settings
const validateSafetySettings = [
  body('defaultCheckInMethod')
    .optional()
    .isIn(['app', 'sms', 'email'])
    .withMessage('Default check-in method must be app, sms, or email'),

  body('defaultAutoCheckInSettings.enabled')
    .optional()
    .isBoolean()
    .withMessage('Auto check-in enabled must be a boolean'),

  body('defaultAutoCheckInSettings.intervalMinutes')
    .optional()
    .isInt({ min: 5, max: 180 })
    .withMessage('Auto check-in interval must be between 5 and 180 minutes'),

  body('defaultAutoCheckInSettings.missedCheckInsBeforeAlert')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Missed check-ins before alert must be between 1 and 5'),

  body('trustedContacts').optional().isArray().withMessage('Trusted contacts must be an array'),

  body('trustedContacts.*.name')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .escape()
    .withMessage('Contact name must be less than 100 characters'),

  body('trustedContacts.*.phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),

  body('trustedContacts.*.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('trustedContacts.*.relationship')
    .optional()
    .isLength({ max: 50 })
    .trim()
    .escape()
    .withMessage('Relationship must be less than 50 characters'),

  validateResults,
];

export {
  validateCheckinData,
  validateCheckinId,
  validateCheckInResponse,
  validateSafetyCode,
  validateEmergencyContact,
  validateSafetySettings,
};

export default {
  validateCheckinData,
  validateCheckinId,
  validateCheckInResponse,
  validateSafetyCode,
  validateEmergencyContact,
  validateSafetySettings,
};
