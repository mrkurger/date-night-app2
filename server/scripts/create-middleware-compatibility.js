#!/usr/bin/env node

/**
 * Middleware Compatibility Script
 *
 * This script creates compatibility helpers to ensure middleware works
 * between JavaScript and TypeScript code.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverRoot = path.join(__dirname, '..');
const utilsDir = path.join(serverRoot, 'src', 'utils');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`❌ Failed to create directory: ${error.message}`);
      throw error;
    }
  }
}

async function createMiddlewareHelpers() {
  console.log('🚀 Creating middleware compatibility helpers...');

  try {
    // Ensure utilities directory exists
    await ensureDir(utilsDir);

    // Create the middleware compatibility file
    const middlewareCompatPath = path.join(utilsDir, 'middleware-compatibility.js');
    const middlewareCompatContent = `/**
 * Middleware Compatibility Helpers
 * 
 * These utilities help bridge the gap between JavaScript and TypeScript
 * middleware implementations, ensuring smooth interoperability.
 */

/**
 * Adapts a middleware function to ensure proper typing and error handling
 * @param {Function} middleware - The middleware function to adapt
 * @returns {Function} Express-compatible middleware function
 */
export function adaptMiddleware(middleware) {
  if (!middleware) {
    throw new Error('Middleware function is undefined');
  }

  return function(req, res, next) {
    try {
      const result = middleware(req, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Adapts a validator function to ensure proper typing and error handling
 * Specifically for Zod-based validators
 * @param {Function} validatorFn - The validation function to adapt
 * @returns {Function} Express-compatible middleware function
 */
export function adaptValidator(validatorFn) {
  return adaptMiddleware(validatorFn);
}

/**
 * Transforms multiple middleware functions into a compatible form
 * @param {...Function} middlewares - The middleware functions to adapt
 * @returns {Array<Function>} Array of Express-compatible middleware functions
 */
export function adaptMiddlewares(...middlewares) {
  return middlewares.map(middleware => adaptMiddleware(middleware));
}

/**
 * Ensures a controller function properly handles async operations
 * @param {Function} controller - The controller function to wrap
 * @returns {Function} Express-compatible route handler
 */
export function wrapController(controller) {
  return function(req, res, next) {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}

/**
 * Legacy compatibility - alias for wrapController
 */
export const wrapAsync = wrapController;

/**
 * Ensures a request handler has the correct TypeScript type
 * @param {Function} fn - The function to assert as a request handler
 * @returns {Function} The same function, but with correct typing
 */
export function assertRequestHandler(fn) {
  return fn;
}
`;

    await fs.writeFile(middlewareCompatPath, middlewareCompatContent);
    console.log(`✅ Created middleware compatibility file at ${middlewareCompatPath}`);

    // Create TypeScript declaration file for the middleware compatibility helpers
    const dtsPath = path.join(utilsDir, 'middleware-compatibility.d.ts');
    const dtsContent = `/**
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
`;

    await fs.writeFile(dtsPath, dtsContent);
    console.log(`✅ Created TypeScript declarations at ${dtsPath}`);

    // Update the express-compatibility file to include the new middleware helpers
    const expressCompatPath = path.join(utilsDir, 'express-compatibility.js');

    try {
      const currentContent = await fs.readFile(expressCompatPath, 'utf8');

      if (!currentContent.includes('middleware-compatibility')) {
        const updatedContent = `/**
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
`;

        await fs.writeFile(expressCompatPath, updatedContent);
        console.log(`✅ Updated express compatibility file at ${expressCompatPath}`);
      } else {
        console.log('⏭️ Express compatibility file already includes middleware helpers');
      }
    } catch (error) {
      // If file doesn't exist, create it
      if (error.code === 'ENOENT') {
        const compatContent = `/**
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
`;
        await fs.writeFile(expressCompatPath, compatContent);
        console.log(`✅ Created express compatibility file at ${expressCompatPath}`);
      } else {
        console.error(`❌ Error updating express compatibility file: ${error.message}`);
      }
    }

    // Create TypeScript declaration file for the express compatibility helpers
    const expressDtsPath = path.join(utilsDir, 'express-compatibility.d.ts');
    const expressDtsContent = `/**
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
`;

    await fs.writeFile(expressDtsPath, expressDtsContent);
    console.log(
      `✅ Created TypeScript declarations for express compatibility at ${expressDtsPath}`
    );

    console.log('✅ Middleware compatibility helpers created successfully!');
    return true;
  } catch (error) {
    console.error(`❌ Failed to create middleware compatibility helpers: ${error.message}`);
    return false;
  }
}

// Run the function
createMiddlewareHelpers().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
