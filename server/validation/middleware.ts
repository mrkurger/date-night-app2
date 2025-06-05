/**
 * Common validation middleware using express-validator
 */

import { body, query, param, validationResult } from 'express-validator';
import { ValidationUtils } from './utils.js';
import { zodSchemas } from './schemas.js';
import { ValidationError } from './validation.types.js';

/**
 * Process validation errors from express-validator
 */
const formatValidationError = (error: any): ValidationError => ({
  field: error.param,
  message: error.msg,
  value: error.value,
});

/**
 * Validate request data using express-validator
 */
const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(formatValidationError),
    });
  }
  next();
};

/**
 * Common validators that can be reused across routes
 */
const validators = {
  message: body('message').trim().notEmpty().isLength({ max: 2000 }),
  objectId: param('id').custom(ValidationUtils.validateObjectId).withMessage('Invalid ID format'),
  norwegianPhone: body('phone')
    .custom(ValidationUtils.isValidNorwegianPhone)
    .withMessage('Must be a valid Norwegian phone number'),
  norwegianPostalCode: body('postalCode')
    .custom(ValidationUtils.isValidNorwegianPostalCode)
    .withMessage('Must be a valid Norwegian postal code'),
  coordinates: [
    body('location.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Location coordinates must be an array of [longitude, latitude]'),
    body('location.coordinates.0')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('location.coordinates.1')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
  ],
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
};

/**
 * Standard validation chains for common operations
 */
const standardValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores and hyphens')
      .escape(),

    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),

    body('password').custom(value => {
      try {
        zodSchemas.password.parse(value);
        return true;
      } catch (error) {
        throw new Error(error.errors[0].message);
      }
    }),

    validate,
  ],

  login: [
    body('username').trim().notEmpty().withMessage('Username is required').escape(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],

  travelPlan: [
    body('destination.city').trim().notEmpty().withMessage('City is required').escape(),
    body('destination.county').trim().notEmpty().withMessage('County is required').escape(),
    ...validators.coordinates,
    body('arrivalDate')
      .isISO8601()
      .withMessage('Arrival date must be a valid date')
      .custom(value => {
        const date = new Date(value);
        if (date < new Date()) {
          throw new Error('Arrival date cannot be in the past');
        }
        return true;
      }),
    body('departureDate')
      .isISO8601()
      .withMessage('Departure date must be a valid date')
      .custom((value, { req }) => {
        const departureDate = new Date(value);
        const arrivalDate = new Date(req.body.arrivalDate);
        if (departureDate <= arrivalDate) {
          throw new Error('Departure date must be after arrival date');
        }
        return true;
      }),
    validate,
  ],
};

export { validate, validators, standardValidation };
