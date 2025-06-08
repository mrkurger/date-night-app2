/**
 * Helper functions to assert Express request handlers for TypeScript compatibility
 */
import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from '../types/middleware.js';
import { ControllerMethod, ValidatorMiddleware } from '../types/express-enhanced.js';

/**
 * Asserts that a function is a valid Express request handler
 * This helps TypeScript recognize handlers that are wrapped by higher-order functions
 */
export function assertRequestHandler(handler: any): RequestHandler {
  return handler as RequestHandler;
}

/**
 * Asserts that an array contains valid Express request handlers
 */
export function assertRequestHandlers(handlers: any[]): RequestHandler[] {
  return handlers as RequestHandler[];
}

/**
 * Type-safe wrapper for controller methods
 * @param handler The request handler function
 * @returns TypeScript-friendly request handler
 */
export function controllerMethod(
  handler: (req: Request, res: Response, next?: NextFunction) => Promise<any> | any
): RequestHandler {
  return handler as RequestHandler;
}

/**
 * Type-safe wrapper for validator middleware
 * @param validator The validator function
 * @returns TypeScript-friendly middleware function
 */
export function asValidatorMiddleware(validator: any): ValidatorMiddleware {
  return validator as ValidatorMiddleware;
}

/**
 * Helper function to ensure Express middleware compatibility
 * @param middleware Any middleware function
 * @returns Express-compatible middleware function
 */
export function asMiddleware<T extends Function>(middleware: T): RequestHandler {
  return middleware as unknown as RequestHandler;
}
