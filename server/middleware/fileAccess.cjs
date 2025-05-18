/**
 * CommonJS version of fileAccess middleware for testing
 */
const path = require('path');
const fs = require('fs');

// Configuration constants
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt', '.csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Middleware to validate file access requests
 * Checks if the requested file is allowed to be accessed
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function fileAccess(req, res, next) {
  try {
    const filename = req.params.filename;

    if (!filename) {
      return next({
        message: 'File not found',
        statusCode: 404,
      });
    }

    // Prevent path traversal attacks
    const normalizedPath = path.normalize(filename);
    if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
      return next({
        message: 'Invalid file path',
        statusCode: 403,
      });
    }

    // Check file extension
    const ext = path.extname(normalizedPath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return next({
        message: 'Unsupported file type',
        statusCode: 403,
      });
    }

    // Build the full file path
    const fullPath = path.join(__dirname, '..', 'uploads', normalizedPath);

    try {
      // Check if file exists
      await fs.promises.access(fullPath, fs.constants.F_OK | fs.constants.R_OK);

      // Check file size
      const stats = await fs.promises.stat(fullPath);
      if (stats.size > MAX_FILE_SIZE) {
        return next({
          message: 'File size exceeds the maximum allowed size',
          statusCode: 403,
        });
      }

      // Store the validated file path for the next middleware
      req.validatedFilePath = fullPath;
      next();
    } catch (_err) {
      return next({
        message: 'File not found',
        statusCode: 404,
      });
    }
  } catch (err) {
    return next(err);
  }
}

module.exports = fileAccess;
