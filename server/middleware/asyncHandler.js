/**
 * Async handler to wrap async route handlers and catch errors
 * This eliminates the need for try/catch blocks in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for asyncHandler settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const asyncHandler = fn => (req, res, next) => {
  try {
    const result = fn(req, res, next);
    return Promise.resolve(result).catch(next);
  } catch (error) {
    return next(error);
  }
};

export { asyncHandler };
export default asyncHandler;
