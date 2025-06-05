import { Request, Response, NextFunction } from 'express';
import { ValidationUtils } from '../utils/validation-utils.js';
import { catchAsync } from '../utils/error-handler.js';
import { sanitizeRequest } from './request-sanitizer.js';

/**
 * Combined request processing middleware that applies:
 * 1. Sanitization
 * 2. Validation
 * 3. Error handling
 */
export class RequestProcessor {
  constructor() {}

  /**
   * Create middleware stack for request processing
   */
  static createMiddleware(...validations: any[]) {
    return [
      // Apply sanitization
      sanitizeRequest,

      // Apply validations
      ValidationUtils.validate(validations),

      // Catch any errors
      catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        next();
      }),
    ];
  }
}

export default RequestProcessor;
