import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../../utils/validation-utils.js';

/**
 * Standardized error response format for validation errors
 */
interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: ValidationError[];
}

/**
 * Handles formatting and sending validation error responses
 */
export class ValidationErrorHandler {
  /**
   * Format Zod validation errors into a consistent structure
   */
  static formatZodError(error: ZodError): ValidationError[] {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      value: err.code,
    }));
  }

  /**
   * Send formatted validation error response
   */
  static sendValidationError(res: Response, errors: ValidationError[]): Response {
    const errorResponse: ValidationErrorResponse = {
      success: false,
      message: 'Validation failed',
      errors,
    };
    return res.status(422).json(errorResponse);
  }
}

/**
 * Main validation middleware class
 */
export class ValidationMiddleware {
  /**
   * Validate request using Zod schema
   * @param schema Schema to validate against
   * @param property Request property to validate (body, query, params)
   */
  static validateWithZod(schema: AnyZodObject, property: 'body' | 'query' | 'params' = 'body') {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync(req[property]);
        return next();
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = ValidationErrorHandler.formatZodError(error);
          return ValidationErrorHandler.sendValidationError(res, formattedErrors);
        }
        next(error);
      }
    };
  }

  /**
   * Combine multiple validation middlewares
   */
  static combine(
    // eslint-disable-next-line no-unused-vars
    ...middlewares: Array<(req: Request, res: Response, next: NextFunction) => Promise<void>>
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        for (const middleware of middlewares) {
          await new Promise((resolve, reject) => {
            middleware(req, res, err => {
              if (err) reject(err);
              else resolve(true);
            });
          });
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
