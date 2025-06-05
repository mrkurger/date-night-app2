/**
 * Comprehensive validation middleware using express-validator and Zod
 * Implements validation rules for various API endpoints
 */

import type { Request, Response, NextFunction } from 'express';
import {
  body,
  query,
  param,
  validationResult,
  ValidationError as ExpressValidationError,
} from 'express-validator';
import { zodSchemas, ValidationUtils } from '../utils/validation-utils.js';
import { ZodError, ZodSchema } from 'zod';
import { RequestProperty } from '../src/types/validation.js';

// Helper function to validate validation results
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error: ExpressValidationError) => ({
        field: error.type === 'field' ? error.path : error.type,
        message: error.msg,
      })),
    });
  }
  next();
};

// Zod validation middleware
export function validateWithZod(schema: ZodSchema, property: RequestProperty = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Type assertion needed since we know these properties exist from express.d.ts
      const data = req[property as keyof Request];
      const validated = await schema.parseAsync(data);
      req[property as keyof Request] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          success: false,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        });
      }
      next(error);
    }
  };
}

// Common validation chains reusable across routes
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

// Standard validation chains for common operations
const standardValidation = {
  // User registration validation
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
        if (error instanceof ZodError) {
          throw new Error(error.errors[0].message);
        }
        throw error;
      }
    }),

    validate,
  ],

  // Login validation
  login: [
    body('username').trim().notEmpty().withMessage('Username is required').escape(),

    body('password').notEmpty().withMessage('Password is required'),

    validate,
  ],

  // Travel plan validation
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

/**
 * Middleware to validate request data using Zod schema
 * @param schema - Zod schema for validation
 * @param source - Which part of the request to validate (body, query, params)
 * @returns Express middleware function
 */
export const validateWithZod = (schema: ZodSchema, source: RequestProperty = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Type assertion to handle dynamic property access
      const data = req[source as keyof Request] as unknown;
      const validatedData = await schema.parseAsync(data);

      // Replace request data with validated data
      // Using type assertion to handle dynamic property assignment
      (req as any)[source] = validatedData;

      next();
    } catch (error) {
      // Handle zod validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }

      // Pass other errors to the error handler
      next(error);
    }
  };
};

/**
 * Create a validation middleware for a specific request source
 * @param schema - Zod schema for validation
 * @param source - Which part of the request to validate
 * @returns Express middleware function
 */
export const validateRequest = (schema: ZodSchema, source: RequestProperty = 'body') =>
  validateWithZod(schema, source);

export { validate, validators, standardValidation };
