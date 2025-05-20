import { Request, Response, NextFunction } from 'express';
import { ValidationChain, ValidatorOptions, validationResult } from 'express-validator';
import { ObjectSchema } from 'joi';
import mongoose from 'mongoose';
import { z } from 'zod';
import validator from 'validator';

/**
 * Validation error response interface
 */
interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * General validation response interface
 */
interface ValidationResponse {
  success: boolean;
  message: string;
  errors?: ValidationError[];
}

/**
 * Base validation options
 */
interface BaseValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
}

/**
 * Common validation schemas using Zod
 */
export const zodSchemas = {
  objectId: z.string().refine((val: string) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  }),

  email: z.string().email(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  url: z.string().url(),

  date: z.string().datetime(),

  norwegianPhone: z.string().regex(/^(\+47)?[2-9]\d{7}$/, {
    message: 'Must be a valid Norwegian phone number',
  }),

  norwegianPostalCode: z.string().regex(/^\d{4}$/, {
    message: 'Must be a valid Norwegian postal code',
  }),

  coordinates: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90), // latitude
    ]),
  }),

  pagination: z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
  }),

  // Common string validations
  nonEmptyString: z.string().min(1, 'Field cannot be empty').max(1000, 'Field is too long'),
  shortString: z.string().max(100, 'Text is too long'),
  longString: z.string().max(2000, 'Text is too long'),

  // Date range validation
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
 * Utility functions for common validation tasks
 */
export class ValidationUtils {
  /**
   * Validate MongoDB ObjectId
   */
  static validateObjectId(value: string): boolean {
    return mongoose.Types.ObjectId.isValid(value);
  }

  /**
   * Process validation errors from express-validator
   */
  static processValidationErrors(errors: any[]): ValidationError[] {
    return errors.map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));
  }

  /**
   * Validate request using Joi schema
   */
  static validateWithJoi(
    schema: ObjectSchema,
    property: 'body' | 'query' | 'params' = 'body',
    options: BaseValidationOptions = { abortEarly: false }
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = schema.validate(req[property], options);

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      // Update validated value
      req[property] = value;
      return next();
    };
  }

  /**
   * Validate request using express-validator
   */
  static validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Execute all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Check results
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          return next();
        }

        // Format errors
        const formattedErrors = ValidationUtils.processValidationErrors(errors.array());
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Validate request using Zod schema
   */
  static validateWithZod(schema: z.ZodSchema, property: 'body' | 'query' | 'params' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req[property] = await schema.parseAsync(req[property]);
        next();
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
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
   * Sanitize string input
   */
  static sanitizeString(value: string): string {
    return value.trim().replace(/<[^>]*>/g, '');
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(value: string): string {
    return validator.escape(value);
  }

  /**
   * Sanitize URL
   */
  static sanitizeUrl(value: string): string {
    return validator.trim(value);
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(value: string): string {
    const normalized = validator.normalizeEmail(validator.trim(value));
    return typeof normalized === 'string' ? normalized : value;
  }

  /**
   * Type guard for string
   */
  static isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  /**
   * Type guard for number
   */
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Type guard for Date
   */
  static isDate(value: unknown): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * Common data validators
   */
  static validators = {
    isEmail: (value: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },

    isStrongPassword: (value: string): boolean => {
      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return strongPasswordRegex.test(value);
    },

    isValidDate: (value: string): boolean => {
      const date = new Date(value);
      return date instanceof Date && !isNaN(date.getTime());
    },

    isValidLatitude: (value: number): boolean => {
      return value >= -90 && value <= 90;
    },

    isValidLongitude: (value: number): boolean => {
      return value >= -180 && value <= 180;
    },

    isSecureUrl: (value: string): boolean => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:';
      } catch {
        return false;
      }
    },
  };

  /**
   * Check if a number is within a range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate Norwegian phone number
   */
  static isValidNorwegianPhone(phone: string): boolean {
    return /^(\+47)?[2-9]\d{7}$/.test(phone);
  }

  /**
   * Validate Norwegian postal code
   */
  static isValidNorwegianPostalCode(code: string): boolean {
    return /^\d{4}$/.test(code);
  }
}

export default ValidationUtils;
