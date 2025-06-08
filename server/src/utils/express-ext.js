/**
 * Express extension utilities for TypeScript compatibility
 */

/**
 * A helper function to safely get values from Express request objects.
 * This function helps prevent TypeScript errors when accessing req.body, req.params, etc.
 *
 * @param {Object} req - Express request object
 * @param {string} property - Property name to access ('body', 'params', 'query', 'headers')
 * @param {string} field - Field name within the property
 * @param {*} defaultValue - Default value if field doesn't exist
 * @returns {*} Value from request or default
 */
export function getReqField(req, property, field, defaultValue = undefined) {
  if (!req || !req[property]) return defaultValue;
  return req[property][field] !== undefined ? req[property][field] : defaultValue;
}

/**
 * Safely send a JSON response with status code
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @returns {Object} Express response
 */
export function sendJsonResponse(res, statusCode, data) {
  return res.status(statusCode).json(data);
}

/**
 * Send a success response
 *
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Express response
 */
export function sendSuccess(res, data, statusCode = 200) {
  return sendJsonResponse(res, statusCode, {
    success: true,
    data,
  });
}

/**
 * Send an error response
 *
 * @param {Object} res - Express response object
 * @param {string|Error} error - Error message or object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Object} Express response
 */
export function sendError(res, error, statusCode = 500) {
  const errorMessage = error instanceof Error ? error.message : error;

  return sendJsonResponse(res, statusCode, {
    success: false,
    error: errorMessage,
  });
}

export default {
  getReqField,
  sendJsonResponse,
  sendSuccess,
  sendError,
};
