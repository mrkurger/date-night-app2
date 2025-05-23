import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Common Zod schemas for reuse across the application
 */
export const zodSchemas = {
  // Basic types
  shortString: z.string().min(1).max(255),
  longString: z.string().min(1).max(5000),
  nonEmptyString: z.string().min(1),
  boolean: z.boolean(),
  number: z.number(),
  date: z.string().datetime(),

  // MongoDB ObjectId
  objectId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  }),

  // Norwegian specific
  norwegianPhone: z.string().regex(/^(\+47)?[2-9]\d{7}$/, 'Invalid Norwegian phone number'),
  norwegianPostalCode: z.string().regex(/^\d{4}$/, 'Invalid Norwegian postal code'),

  // Common patterns
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  // Coordinates as [longitude, latitude]
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90), // latitude
  ]),

  // Address
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    county: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),

  // Pagination
  pagination: z.object({
    page: z.number().int().min(1).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),

  // Date range
  dateRange: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .refine(data => new Date(data.endDate) > new Date(data.startDate), {
      message: 'End date must be after start date',
    }),
};

/**
 * Utility functions for validation
 */
export class ValidationUtils {
  /**
   * Validate a string as MongoDB ObjectId
   */
  static validateObjectId(value) {
    return mongoose.Types.ObjectId.isValid(value);
  }

  /**
   * Validate a string as Norwegian phone number
   */
  static isValidNorwegianPhone(value) {
    return /^(\+47)?[2-9]\d{7}$/.test(value);
  }

  /**
   * Validate a string as Norwegian postal code
   */
  static isValidNorwegianPostalCode(value) {
    return /^\d{4}$/.test(value);
  }
}

/**
 * Validate with Zod schema
 */
export const validateWithZod = (
  schema,
  property = 'body'
) => {
  return async (req, res, next) => {
    try {
      const data = await schema.parseAsync(req[property]);
      req[property] = data; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};