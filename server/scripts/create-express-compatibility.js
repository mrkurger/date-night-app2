/**
 * This script creates a TypeScript-compatible wrapper for the middleware functions
 * to ensure proper compatibility between JavaScript and TypeScript code.
 */

// ES Module syntax
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project directories
const serverRoot = path.resolve(__dirname, '..');
const middlewareDir = path.resolve(serverRoot, 'middleware');

// Create the compatibility helpers
const expressCompatibilityJs = `/**
 * Express Compatibility Helpers 
 * These functions help bridge the gap between JavaScript and TypeScript middleware
 */

/**
 * Ensures a middleware function is compatible with Express's typing
 * @param {Function} fn - The middleware function to adapt
 * @returns {Function} - An Express-compatible middleware function
 */
export function adaptMiddleware(fn) {
  return function(req, res, next) {
    try {
      const result = fn(req, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Wraps a controller function to ensure proper error handling
 * @param {Function} fn - The controller function to wrap
 * @returns {Function} - A function that handles errors properly
 */
export function wrapAsync(fn) {
  return function(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

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
}`;

// TypeScript declaration file
const expressCompatibilityDts = `/**
 * Express compatibility helpers - TypeScript type definitions
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Ensures a middleware function is compatible with Express's typing
 */
export function adaptMiddleware<T extends Function>(fn: T): (req: Request, res: Response, next: NextFunction) => void;

/**
 * Wraps a controller function to ensure proper error handling
 */
export function wrapAsync<T extends (req: Request, res: Response, next?: NextFunction) => Promise<any> | any>(
  fn: T
): (req: Request, res: Response, next: NextFunction) => void;

/**
 * Helper to standardize JSON responses
 */
export function jsonResponse(
  res: Response,
  statusCode: number,
  data: Record<string, any>
): void;

/**
 * Helper to standardize error responses
 */
export function errorResponse(
  res: Response,
  error: Error,
  statusCode?: number
): void;`;

// Write the files
fs.writeFileSync(
  path.resolve(serverRoot, 'src/utils/express-compatibility.js'),
  expressCompatibilityJs
);
fs.writeFileSync(
  path.resolve(serverRoot, 'src/utils/express-compatibility.d.ts'),
  expressCompatibilityDts
);

console.log('Express compatibility helpers created successfully!');
