import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { ZodError } from 'zod';
import { ValidationErrorHandler } from './middleware/validation/error-handler';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public status: 'fail' | 'error' = 'error'
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = ValidationErrorHandler.formatZodError(err);
    return ValidationErrorHandler.sendValidationError(res, formattedErrors);
  }

  // Handle Express-validator errors
  if (err instanceof ValidationError) {
    const formattedErrors = ValidationErrorHandler.formatExpressValidatorError([err]);
    return ValidationErrorHandler.sendValidationError(res, formattedErrors);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    return ValidationErrorHandler.sendValidationError(res, errors);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    const error = err as any;
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: `Invalid ${error.path}: ${error.value}`,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Invalid token. Please log in again.',
    });
  }

  // Handle token expiration
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      status: 'fail',
      message: 'Your token has expired. Please log in again.',
    });
  }

  // Handle duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    return res.status(400).json({
      success: false,
      status: 'fail',
      message: `${field} already exists`,
    });
  }

  // Handle custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // Handle all other errors
  const statusCode = (err as any).statusCode || 500;
  const status = statusCode.toString().startsWith('4') ? 'fail' : 'error';

  res.status(statusCode).json({
    success: false,
    status,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack,
    }),
  });
};
