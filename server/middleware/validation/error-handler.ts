import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { ZodError } from 'zod';
import { logger } from '../../utils/logger';

export interface FormattedValidationError {
  field: string;
  message: string;
  value?: any;
}

export class ValidationErrorHandler {
  /**
   * Format Zod validation errors
   */
  static formatZodError(error: ZodError): FormattedValidationError[] {
    return error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      value: err.code === 'invalid_type' ? err.received : undefined,
    }));
  }

  /**
   * Format Express-validator validation errors
   */
  static formatExpressValidatorError(errors: ValidationError[]): FormattedValidationError[] {
    return errors.map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));
  }

  /**
   * Generic validation error response
   */
  static sendValidationError(res: Response, errors: FormattedValidationError[]) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  /**
   * Global validation error handler middleware
   */
  static handleValidationError(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof ZodError) {
      const formattedErrors = ValidationErrorHandler.formatZodError(error);
      return ValidationErrorHandler.sendValidationError(res, formattedErrors);
    }

    if (error instanceof ValidationError) {
      const formattedErrors = ValidationErrorHandler.formatExpressValidatorError([error]);
      return ValidationErrorHandler.sendValidationError(res, formattedErrors);
    }

    logger.error('Validation error:', error);
    next(error);
  }
}
