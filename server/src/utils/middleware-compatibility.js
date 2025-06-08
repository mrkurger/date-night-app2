/**
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
