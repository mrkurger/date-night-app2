/**
 * TypeScript-compatible error handler with URL sanitization
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ValidationErrorHandler } from './validation/error-handler';
import { sanitizeErrorMessage } from './error-sanitizer';
import { logger } from '../utils/logger';

/**
 * Custom application error class with status code support
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public status: string = 'error'
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler with URL sanitization for Express applications
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Log the error
  logger.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Sanitize error message to prevent path-to-regexp issues
  if (err.message) {
    err.message = sanitizeErrorMessage(err.message);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = ValidationErrorHandler.formatZodError(err);
    return ValidationErrorHandler.sendValidationError(res, formattedErrors);
  }

  // Handle Express-validator errors
  if (err.errors && Array.isArray(err.errors)) {
    const formattedErrors = ValidationErrorHandler.formatExpressValidatorError(err.errors);
    return ValidationErrorHandler.sendValidationError(res, formattedErrors);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: sanitizeErrorMessage(e.message) as string,
      value: e.value,
    }));
    return ValidationErrorHandler.sendValidationError(res, errors);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      status: 'fail',
      message: `Duplicate value for ${field}. Please use another value.`,
    });
  }

  // Handle path-to-regexp errors specifically
  if (
    err.message &&
    (err.message.includes('path-to-regexp') || err.message.includes('Missing parameter name'))
  ) {
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Invalid URL format in request',
    });
  }

  // Default to 500 Internal Server Error for unhandled errors
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  return res.status(statusCode).json({
    success: false,
    status,
    message:
      process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Something went wrong'
        : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
