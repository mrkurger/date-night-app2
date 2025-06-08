/**
 * TypeScript-compatible validation error handler
 *
 * This module enhances validation error handling with URL sanitization
 * to prevent path-to-regexp errors when error messages contain URLs with colons
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sanitizeErrorMessage, sanitizeValidationErrors } from './error-sanitizer';

/**
 * Interface for a standardized validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation error handler with URL sanitization
 */
export class ValidationErrorHandler {
  /**
   * Format Zod validation errors
   * @param error Zod error object
   * @returns Array of standardized validation errors
   */
  static formatZodError(error: ZodError): ValidationError[] {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: sanitizeErrorMessage(err.message) as string,
      value: err.code === 'invalid_type' ? err.received : undefined,
    }));

    return errors;
  }

  /**
   * Format express-validator validation errors
   * @param errors Array of express-validator errors
   * @returns Array of standardized validation errors
   */
  static formatExpressValidatorError(errors: any[]): ValidationError[] {
    return errors.map(err => ({
      field: err.param || err.path || 'unknown',
      message: sanitizeErrorMessage(err.msg) as string,
      value: err.value,
    }));
  }

  /**
   * Send validation error response with sanitized error messages
   * @param res Express response object
   * @param errors Array of validation errors
   */
  static sendValidationError(res: Response, errors: ValidationError[]): void {
    res.status(422).json({
      success: false,
      message: 'Validation Failed',
      errors: sanitizeValidationErrors(errors),
    });
  }

  /**
   * Handle validation errors middleware
   * @param err Error object
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  static handleValidationError(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Failed',
        errors: err.errors || [{ message: sanitizeErrorMessage(err.message) }],
      });
    }
    next(err);
  }

  /**
   * Handle Zod validation errors middleware
   * @param err Error object
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  static handleZodError(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {
    if (err instanceof ZodError) {
      const formattedErrors = this.formatZodError(err);
      return this.sendValidationError(res, formattedErrors);
    }
    next(err);
  }

  /**
   * Handle all validation errors middleware
   * @param err Error object
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  static handleAllValidationErrors(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): Response | void {
    // Handle Zod errors
    if (err instanceof ZodError) {
      const formattedErrors = this.formatZodError(err);
      return this.sendValidationError(res, formattedErrors);
    }

    // Handle Express-validator errors
    if (Array.isArray(err.errors) && err.errors.length > 0) {
      const formattedErrors = this.formatExpressValidatorError(err.errors);
      return this.sendValidationError(res, formattedErrors);
    }

    // Handle mongoose validation errors
    if (err.name === 'ValidationError' && err.errors) {
      const errors = Object.values(err.errors).map((e: any) => ({
        field: e.path,
        message: sanitizeErrorMessage(e.message) as string,
        value: e.value,
      }));
      return this.sendValidationError(res, errors);
    }

    next(err);
  }
}
