/**
 * TypeScript type definitions for express compatibility helpers
 */
import { Response } from 'express';
import { adaptMiddleware, wrapController, assertRequestHandler } from './middleware-compatibility';

export { adaptMiddleware, wrapController, assertRequestHandler };

// Legacy compatibility
export const wrapAsync: typeof wrapController;

/**
 * Helper to standardize JSON responses
 */
export function jsonResponse(res: Response, statusCode: number, data: any): void;

/**
 * Helper to standardize error responses
 */
export function errorResponse(res: Response, error: Error, statusCode?: number): void;
