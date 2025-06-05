/**
 * Async handler to wrap async route handlers and catch errors
 * This eliminates the need for try/catch blocks in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
import { NextFunction, Request, Response } from 'express';
import { AsyncHandler, RouteHandler } from '../src/types/middleware.js';

/**
 * Wraps an async function to properly handle errors in Express route handlers
 */
export const asyncHandler: AsyncHandler = fn => (req, res, next) => {
  try {
    const result = fn(req, res, next);
    return Promise.resolve(result).catch(next);
  } catch (error) {
    return next(error);
  }
};

export default asyncHandler;
