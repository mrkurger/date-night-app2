// Extended Express Type Definitions for date-night-app
import { Request, Response, NextFunction } from 'express';

// Extend the Express Request interface for common properties
declare global {
  namespace Express {
    interface Request {
      // User properties commonly added by auth middleware
      user?: {
        id: string;
        role: string;
        email?: string;
        [key: string]: any;
      };
      // Correlation ID for request tracking
      correlationId?: string;
      // Original URL before processing
      originalRawUrl?: string;
      // For file uploads
      file?: any;
      files?: any;
      // For validation results
      validationErrors?: any[];
      // For session data
      session?: any;
    }
  }
}

// Type for higher-order functions that wrap Express request handlers
export type AsyncHandlerFunction = <T extends Request, R extends Response>(
  fn: (req: T, res: R, next: NextFunction) => Promise<any> | any
) => (req: T, res: R, next: NextFunction) => void;

// Type for error handler functions
export type ErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => void;

// Type for middleware that validates request data
export type ValidatorMiddleware = (req: Request, res: Response, next: NextFunction) => void;

// Type for controller methods
export type ControllerMethod = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<any> | any;
