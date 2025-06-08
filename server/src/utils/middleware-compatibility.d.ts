/**
 * TypeScript type definitions for middleware compatibility helpers
 */
import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from '../types/middleware';

/**
 * Types for middleware functions
 */
export type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;
export type ControllerFunction = (req: Request, res: Response, next?: NextFunction) => Promise<any> | any;

/**
 * Adapts a middleware function to ensure proper typing and error handling
 */
export function adaptMiddleware(middleware: MiddlewareFunction): RequestHandler;

/**
 * Adapts a validator function to ensure proper typing and error handling
 */
export function adaptValidator(validatorFn: MiddlewareFunction): RequestHandler;

/**
 * Transforms multiple middleware functions into a compatible form
 */
export function adaptMiddlewares(...middlewares: MiddlewareFunction[]): RequestHandler[];

/**
 * Ensures a controller function properly handles async operations
 */
export function wrapController(controller: ControllerFunction): RequestHandler;

/**
 * Legacy compatibility - alias for wrapController
 */
export const wrapAsync: typeof wrapController;

/**
 * Ensures a request handler has the correct TypeScript type
 */
export function assertRequestHandler<T extends ControllerFunction>(fn: T): T;
