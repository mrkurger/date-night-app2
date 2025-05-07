/**
 * Middleware to control access to uploaded files
 * Implements secure file serving with authentication and authorization checks
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for fileAccess settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

/**
 * Middleware to serve files securely
 * Checks if user has permission to access the file
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} _next - Express next function (not used as this handler sends response directly)
 */
// eslint-disable-next-line no-unused-vars
const secureFileServing = (req, res, _next) => {
  try {
    const filePath = req.params[0]; // Get the file path from the URL

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Prevent path traversal attacks
    const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(__dirname, '..', 'uploads', normalizedPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check if user has permission to access the file
    // For public files like ad images, this can be skipped
    // For private files, check if user is the owner or has permission

    // Example: Check if file is in user's directory
    const userId = req.user ? req.user.id.toString() : null;
    const isUserFile = userId && fullPath.includes(`/uploads/ads/${userId}/`);
    const isPublicFile = fullPath.includes('/uploads/ads/') && !fullPath.includes('/private/');

    if (!isPublicFile && !isUserFile) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Set proper content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Set cache control headers for public files
    if (isPublicFile) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day

      // Generate ETag based on file content
      const fileBuffer = fs.readFileSync(fullPath);
      const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      res.setHeader('ETag', `"${hash}"`);

      // Check if file is cached
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === `"${hash}"`) {
        return res.status(304).end(); // Not Modified
      }
    } else {
      // Private files should not be cached
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);

    // Handle errors
    fileStream.on('error', error => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error serving file',
        });
      }
    });
  } catch (error) {
    console.error('File access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing file',
    });
  }
};

export { secureFileServing };
