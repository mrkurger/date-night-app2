/**
 * Enhanced validation middleware with TypeScript support
 * This file provides improved validation capabilities with TypeScript compatibility
 */
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidatorFunction } from '../src/types/middleware.js';

/**
 * Source properties for validation
 */
export type RequestValidationSource = 'body' | 'query' | 'params';

/**
 * Validation options
 */
export interface ValidationOptions {
  /**
   * Strip unknown properties if true
   */
  stripUnknown?: boolean;

  /**
   * Custom error messages
   */
  errorMessages?: Record<string, string>;

  /**
   * HTTP status code to return on validation failure
   */
  errorStatusCode?: number;
}

/**
 * Enhanced middleware to validate request data using Zod schema
 * with TypeScript support and improved error handling
 *
 * @param schema - Zod schema for validation
 * @param source - Optional source of data to validate (body, query, params)
 * @param options - Additional options for validation
 * @returns Express middleware function
 */
export function validateWithZod(
  schema: ZodSchema,
  source?: RequestValidationSource,
  options: ValidationOptions = {}
): ValidatorFunction {
  const { stripUnknown = false, errorStatusCode = 422 } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (source) {
        // Validate only the specified source
        const parseOptions = stripUnknown ? { stripUnknown } : {};
        const validatedData = await schema.parseAsync(req[source as keyof Request], parseOptions);
        req[source as keyof Request] = validatedData;
      } else {
        // Validate all sources
        const validatedData = await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        // Replace request data with validated data
        req.body = validatedData.body || req.body;
        req.query = validatedData.query || req.query;
        req.params = validatedData.params || req.params;
      }

      // Store validation success flag for error handling middleware
      (req as any).isValidated = true;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(errorStatusCode).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Helper to format validation errors for consistent API responses
 *
 * @param error - Validation error object
 * @returns Formatted error object
 */
export function formatValidationError(error: ZodError) {
  return {
    success: false,
    status: 'error',
    message: 'Validation failed',
    errors: error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}

/**
 * Export the compatibility layer version for backward compatibility
 * @deprecated Use validateWithZod directly
 */
export const enhancedValidateWithZod = validateWithZod;

export default { validateWithZod, formatValidationError, enhancedValidateWithZod };
