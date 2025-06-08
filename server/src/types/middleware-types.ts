/**
 * Comprehensive type definitions for the date-night-app server middleware
 *
 * This file provides type definitions for various middleware components
 * to ensure proper TypeScript compatibility.
 */

import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

/**
 * Extended Request interface to include custom properties
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * User information from authentication
       */
      user?: {
        id: string;
        role: string;
        email?: string;
        name?: string;
        [key: string]: any;
      };

      /**
       * Correlation ID for request tracking
       */
      correlationId?: string;

      /**
       * Flag indicating if the request has been validated
       */
      isValidated?: boolean;

      /**
       * Custom data that can be attached to the request
       */
      customData?: Record<string, any>;

      /**
       * Request start time for performance monitoring
       */
      startTime?: number;

      /**
       * Original URL before any rewriting
       */
      originalUrl?: string;

      /**
       * Additional properties
       */
      [key: string]: any;
    }
  }
}

/**
 * Standard middleware function type
 */
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Route handler function type
 */
export type RouteHandler = (req: Request, res: Response, next?: NextFunction) => Promise<any> | any;

/**
 * Request handler from express
 */
export type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Type for validation middleware
 */
export type ValidatorFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Type for authentication middleware
 */
export type AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

/**
 * Type for error handler middleware
 */
export type ErrorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Interface for validation options
 */
export interface ValidationOptions {
  /**
   * Whether to strip unknown properties
   */
  stripUnknown?: boolean;

  /**
   * Custom error messages
   */
  errorMessages?: Record<string, string>;

  /**
   * HTTP status code for validation errors
   */
  errorStatusCode?: number;
}

/**
 * Sources for validation
 */
export type ValidationSource = 'body' | 'query' | 'params';

/**
 * Authorization roles
 */
export type UserRole = 'user' | 'admin' | 'moderator' | 'advertiser';

/**
 * App error interface
 */
export interface AppErrorOptions {
  message: string;
  statusCode: number;
  isOperational?: boolean;
  code?: string;
  errors?: any[];
  [key: string]: any;
}

/**
 * Interface for middleware controller
 */
export interface Controller {
  [key: string]: RouteHandler;
}

/**
 * Interface for validator object
 */
export interface Validator {
  [key: string]: ValidatorFunction;
}

/**
 * Interface for Zod validation
 */
export interface ZodValidation {
  validateWithZod: (
    schema: ZodSchema,
    source?: ValidationSource,
    options?: ValidationOptions
  ) => ValidatorFunction;
  legacyValidateWithZod: (schema: ZodSchema) => ValidatorFunction;
  enhancedValidateWithZod: (
    schema: ZodSchema,
    source?: ValidationSource,
    options?: ValidationOptions
  ) => ValidatorFunction;
}
