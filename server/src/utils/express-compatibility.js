/**
 * Express Compatibility Helpers
 * These functions help bridge the gap between JavaScript and TypeScript code
 */
import { adaptMiddleware, wrapController, assertRequestHandler } from './middleware-compatibility.js';

export { adaptMiddleware, wrapController, assertRequestHandler };

// Legacy compatibility
export const wrapAsync = wrapController;

/**
 * Helper to standardize JSON responses
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {Object} data - Response data
 */
export function jsonResponse(res, statusCode, data) {
  res.status(statusCode).json(data);
}

/**
 * Helper to standardize error responses
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {Number} statusCode - HTTP status code
 */
export function errorResponse(res, error, statusCode = 500) {
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Internal Server Error',
  });
}
