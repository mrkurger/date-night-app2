import { z } from 'zod';
import { body, param, query, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DOMPurify } from 'isomorphic-dompurify';

/**
 * Comprehensive validation utilities for request validation and sanitization
 */
export class ValidationUtils {
  /**
   * Common Zod schemas for reuse across the application
   */
  static zodSchemas = {
    objectId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid ObjectId format',
    }),

    email: z.string().email(),

    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),

    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90), // latitude
    ]),

    pagination: z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }),

    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
      message: 'Invalid phone number format',
    }),
  };

  /**
   * Validate request data using a Zod schema
   * @param schema Zod schema to validate against
   * @param source Request property to validate ('body' | 'query' | 'params')
   */
  static validateWithZod(schema: z.ZodType<any>, source: 'body' | 'query' | 'params' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await schema.parseAsync(req[source]);
        req[source] = result; // Replace with validated data
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
  }

  /**
   * Validate an array of express-validator validation chains
   * @param validations Array of ValidationChain objects
   */
  static validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      await Promise.all(validations.map(validation => validation.run(req)));

      const errors = validations.map(validation => validation.context).filter(error => error);
      if (errors.length === 0) {
        return next();
      }

      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.map(error => ({
          field: error?.path,
          message: error?.msg,
        })),
      });
    };
  }

  /**
   * Sanitize HTML content
   * @param html HTML string to sanitize
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href'],
    });
  }

  /**
   * Validate and sanitize an email address
   * @param email Email address to validate and sanitize
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Type guard for checking if a value is a string
   */
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  /**
   * Type guard for checking if a value is a number
   */
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Common validation chains
   */
  static commonValidations = {
    pagination: [
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
    ],

    objectId: (param: string) => [
      param(param)
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid ID format'),
    ],

    coordinates: [
      body('coordinates')
        .isArray({ min: 2, max: 2 })
        .withMessage('Coordinates must be an array of [longitude, latitude]'),
      body('coordinates.0')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
      body('coordinates.1')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    ],
  };
}
