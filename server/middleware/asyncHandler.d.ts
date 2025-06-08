// Type declarations for middleware/asyncHandler.js
import { Request, Response, NextFunction } from 'express';
import { AsyncHandler } from '../src/types/middleware';

/**
 * Async handler to wrap async route handlers and catch errors
 */
declare const asyncHandler: AsyncHandler;
export { asyncHandler };
export default asyncHandler;
