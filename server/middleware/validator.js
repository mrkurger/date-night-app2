/**
 * Comprehensive validation middleware using express-validator
 * Implements validation rules for various API endpoints
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for validator settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import { body, query, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = value => mongoose.Types.ObjectId.isValid(value);

// Helper function to validate validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }
  next();
};

// Common validation chains
const validators = {
  message: body('message').trim().notEmpty().isLength({ max: 2000 }),
  userId: body('userId').isMongoId(),
  // Add more validators as needed
};

// User registration validation
const registerValidation = [
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

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('role')
    .optional()
    .isIn(['user', 'advertiser'])
    .withMessage('Role must be either "user" or "advertiser"'),

  validate,
];

// Login validation
const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required').escape(),

  body('password').notEmpty().withMessage('Password is required'),

  validate,
];

// Ad creation validation
const adValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .escape(),

  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
    .escape(),

  body('category')
    .isIn(['Escort', 'Striptease', 'Massage', 'Webcam', 'Phone', 'Other'])
    .withMessage('Invalid category'),

  body('county').trim().notEmpty().withMessage('County is required').escape(),

  body('city').trim().notEmpty().withMessage('City is required').escape(),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),

  body('location.coordinates.0')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('location.coordinates.1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('pricing.*.amount')
    .isFloat({ min: 0 })
    .withMessage('Price amount must be a positive number'),

  body('pricing.*.duration')
    .isIn(['30min', '1hour', '2hours', 'overnight', 'custom'])
    .withMessage('Invalid duration'),

  validate,
];

// Ad update validation
const adUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters')
    .escape(),

  body('category')
    .optional()
    .isIn(['Escort', 'Striptease', 'Massage', 'Webcam', 'Phone', 'Other'])
    .withMessage('Invalid category'),

  body('county').optional().trim().notEmpty().withMessage('County is required').escape(),

  body('city').optional().trim().notEmpty().withMessage('City is required').escape(),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),

  body('location.coordinates.0')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('location.coordinates.1')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  validate,
];

// Chat message validation
const chatMessageValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters')
    .escape(),

  body('recipient').custom(isValidObjectId).withMessage('Invalid recipient ID'),

  validate,
];

// ID parameter validation
const idParamValidation = [
  param('id').custom(isValidObjectId).withMessage('Invalid ID format'),

  validate,
];

// Ad ID parameter validation
const adIdParamValidation = [
  param('adId').custom(isValidObjectId).withMessage('Invalid ad ID format'),

  validate,
];

// User ID parameter validation
const userIdParamValidation = [
  param('userId').custom(isValidObjectId).withMessage('Invalid user ID format'),

  validate,
];

// Pagination query validation
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  validate,
];

// Search query validation
const searchValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Search term must be between 2 and 50 characters')
    .escape(),

  validate,
];

// Password reset validation
const passwordResetValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  validate,
];

// New password validation
const newPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),

  validate,
];

// Profile update validation
const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters')
    .escape(),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
    .escape(),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  validate,
];

// Travel plan validation
const travelPlanValidation = [
  body('destination.city').trim().notEmpty().withMessage('City is required').escape(),

  body('destination.county').trim().notEmpty().withMessage('County is required').escape(),

  body('destination.location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates must be an array of [longitude, latitude]'),

  body('destination.location.coordinates.0')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('destination.location.coordinates.1')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('arrivalDate')
    .isISO8601()
    .withMessage('Arrival date must be a valid date')
    .custom(value => {
      const arrivalDate = new Date(value);
      const now = new Date();
      if (arrivalDate < now) {
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
];

export default {
  validate,
  validators,
  registerValidation,
  loginValidation,
  adValidation,
  adUpdateValidation,
  chatMessageValidation,
  idParamValidation,
  adIdParamValidation,
  userIdParamValidation,
  paginationValidation,
  searchValidation,
  passwordResetValidation,
  newPasswordValidation,
  profileUpdateValidation,
  travelPlanValidation,
};
