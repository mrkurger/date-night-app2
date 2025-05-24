import { z } from 'zod';
import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { DOMPurify } from 'isomorphic-dompurify';
import crypto from 'crypto';

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
   * Validate request using express-validator
   */
  static validate(validations: ValidationChain[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Execute all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Get validation results
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          return next();
        }

        // Format errors using type assertion since we know the structure
        const validationErrors = errors.array().map(error => ({
          field: (error as any).param || error.type,
          message: error.msg,
          value: (error as any).value,
        }));

        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors,
        });
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Generate a cryptographically secure nonce
   */
  static generateNonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Check if a URL is secure (HTTPS)
   */
  static isSecureUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Sanitize HTML content with strict configuration
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^https:\/\//i,
      ADD_ATTR: ['target="_blank"', 'rel="noopener noreferrer"'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    });
  }

  /**
   * Sanitize and normalize an email address
   */
  static sanitizeEmail(email: string): string {
    // Trim whitespace and convert to lowercase
    email = email.toLowerCase().trim();

    // Remove any HTML tags
    email = email.replace(/<[^>]*>/g, '');

    // Remove invalid characters
    email = email.replace(/[^\w\.-@]/g, '');

    return email;
  }

  /**
   * Deep sanitize an object's string properties
   */
  static sanitizeObject<T extends object>(obj: T): T {
    const sanitized = { ...obj };
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = this.sanitizeText(sanitized[key] as string) as any;
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeObject(sanitized[key] as object) as any;
      }
    }
    return sanitized;
  }

  /**
   * Sanitize general text content
   */
  static sanitizeText(text: string): string {
    if (!text) return text;

    // Convert to string if not already
    text = String(text);

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Remove null bytes and other control characters
    text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Check if a value matches a specific pattern
   */
  static matchesPattern(value: string, pattern: RegExp): boolean {
    return pattern.test(value);
  }

  /**
   * Validator patterns for common use cases
   */
  static readonly patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
    norwegianPhone: /^(\+47|0047)?[2-9]\d{7}$/,
    norwegianPostalCode: /^\d{4}$/,
    url: /^https:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/,
    mongoId: /^[0-9a-fA-F]{24}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    coordinates: /^-?\d+(\.\d+)?$/,
  };

  /**
   * Type guard for checking if a value is a secure URL
   */
  static isValidSecureUrl(value: any): value is string {
    return typeof value === 'string' && this.isSecureUrl(value);
  }

  /**
   * Common validation checks for strings
   */
  static stringValidation = {
    notEmpty: (value: string) => value.trim().length > 0,
    minLength: (value: string, min: number) => value.length >= min,
    maxLength: (value: string, max: number) => value.length <= max,
    alphanumeric: (value: string) => /^[a-zA-Z0-9]+$/.test(value),
    numeric: (value: string) => /^\d+$/.test(value),
    alpha: (value: string) => /^[a-zA-Z]+$/.test(value),
  };
}
