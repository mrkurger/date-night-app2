/**
 * Response utility functions for the application
 * This file provides common response formatting functions used across the application
 */

/**
 * Creates a success response object
 * @param {any} data - The data to include in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} - Formatted success response
 */
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for response settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const successResponse = (data = null, message = 'Operation successful', statusCode = 200) => {
  return {
    success: true,
    message,
    statusCode,
    data,
  };
};

/**
 * Creates an error response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {any} errors - Additional error details
 * @returns {Object} - Formatted error response
 */
const errorResponse = (message = 'An error occurred', statusCode = 400, errors = null) => {
  return {
    success: false,
    message,
    statusCode,
    errors,
  };
};

/**
 * Creates a validation error response object
 * @param {Array|Object} errors - Validation errors
 * @param {string} message - Error message
 * @returns {Object} - Formatted validation error response
 */
const validationErrorResponse = (errors, message = 'Validation failed') => {
  return errorResponse(message, 422, errors);
};

/**
 * Creates a not found response object
 * @param {string} resource - The resource that was not found
 * @returns {Object} - Formatted not found response
 */
const notFoundResponse = (resource = 'Resource') => {
  return errorResponse(`${resource} not found`, 404);
};

/**
 * Creates an unauthorized response object
 * @param {string} message - Error message
 * @returns {Object} - Formatted unauthorized response
 */
const unauthorizedResponse = (message = 'Unauthorized access') => {
  return errorResponse(message, 401);
};

/**
 * Creates a forbidden response object
 * @param {string} message - Error message
 * @returns {Object} - Formatted forbidden response
 */
const forbiddenResponse = (message = 'Access forbidden') => {
  return errorResponse(message, 403);
};

/**
 * Creates a server error response object
 * @param {string} message - Error message
 * @param {any} error - Error details
 * @returns {Object} - Formatted server error response
 */
const serverErrorResponse = (message = 'Internal server error', error = null) => {
  return errorResponse(message, 500, error);
};

/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {any} payload - Data to include in the response
 */
export function sendSuccess(res, payload) {
  res.status(200).json({ success: true, data: payload });
}

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {Error|string} err - Error details
 * @param {number} code - HTTP status code (default: 500)
 */
export function sendError(res, err, code = 500) {
  console.error('Error:', err.message || err);
  res.status(code).json({ success: false, error: err.message || 'Internal Error' });
}

export {
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
};

export { sendSuccess as successResponse, sendError as errorResponse };

export default {
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  sendSuccess,
  sendError,
  successResponse, // still refers to the pure response object if you need it
  errorResponse,
};
