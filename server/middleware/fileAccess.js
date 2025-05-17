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
// - ALLOWED_EXTENSIONS: List of allowed file extensions
// - MAX_FILE_SIZE: Maximum allowed file size in bytes
// ===================================================
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Configuration constants
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt', '.csv'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to get the directory of the current module
const getCurrentDirname = () => path.dirname(fileURLToPath(import.meta.url));

// Configuration constants
const LOG_DIR_NAME = 'logs';
const UPLOADS_DIR_NAME = 'uploads';

export const getLogFilePath = filename => {
  const currentDir = getCurrentDirname();
  const logDir = path.join(currentDir, '..', LOG_DIR_NAME);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return path.join(logDir, filename);
};

export const getFilePath = filename => {
  const currentDir = getCurrentDirname();
  const uploadsDir = path.join(currentDir, '..', UPLOADS_DIR_NAME);
  return path.join(uploadsDir, filename);
};

export const secureCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  try {
    const aBuffer = Buffer.from(a);
    const bBuffer = Buffer.from(b);

    if (aBuffer.length !== bBuffer.length) {
      crypto.timingSafeEqual(aBuffer, aBuffer); // Mitigate timing attack
      return false;
    }
    return crypto.timingSafeEqual(aBuffer, bBuffer);
  } catch (_) {
    // Ignore error details for security reasons
    return false;
  }
};

export const checkFileExists = filePath => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    // Log error but don't expose details in response
    console.error(`Error checking if file exists: ${filePath}`, err.message);
    return false;
  }
};

export const readFileContent = filePath => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    // Keep 'err'
    console.error(`Error reading file: ${filePath}`, err.message);
    return null;
  }
};

export const streamFile = (filePath, res) => {
  if (!filePath || typeof filePath !== 'string') {
    console.error('streamFile: Invalid filePath provided.');
    if (res && typeof res.writeHead === 'function') {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid file path.');
    }
    return;
  }

  if (!res || typeof res.writeHead !== 'function' || typeof res.pipe !== 'function') {
    console.error('streamFile: Invalid response object provided.');
    return;
  }

  if (!checkFileExists(filePath)) {
    console.error(`streamFile: File not found at ${filePath}`);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found.');
    return;
  }

  try {
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('open', () => {
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.txt') contentType = 'text/plain';
      else if (ext === '.html') contentType = 'text/html';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.png') contentType = 'image/png';

      res.writeHead(200, { 'Content-Type': contentType });
      fileStream.pipe(res);
    });

    fileStream.on('error', streamError => {
      console.error('Stream error:', streamError.message);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error streaming file.');
      } else {
        res.end();
      }
    });

    fileStream.on('close', () => {
      if (!res.writableEnded) {
        res.end();
      }
    });
  } catch (err) {
    // Keep 'err'
    console.error(`Error setting up stream for file: ${filePath}`, err.message);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error while trying to stream file.');
    } else {
      res.end();
    }
  }
};

/**
 * Middleware to validate file access requests
 * Checks if the requested file is allowed to be accessed
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export default async function fileAccess(req, res, next) {
  try {
    const filename = req.params.filename;

    if (!filename) {
      return next({
        message: 'File not found',
        statusCode: 404,
      });
    }

    const normalizedPath = path.normalize(filename);
    if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
      return next({
        message: 'Invalid file path',
        statusCode: 403,
      });
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return next({
        message: 'Unsupported file type',
        statusCode: 403,
      });
    }

    const fullPath = getFilePath(normalizedPath);

    try {
      await fs.promises.access(fullPath, fs.constants.F_OK | fs.constants.R_OK);

      const stats = await fs.promises.stat(fullPath);
      if (stats.size > MAX_FILE_SIZE) {
        return next({
          message: 'File size exceeds the maximum allowed size',
          statusCode: 403,
        });
      }

      req.validatedFilePath = fullPath;
      next();
    } catch (_) {
      return next({
        message: 'File not found',
        statusCode: 404,
      });
    }
  } catch (err) {
    return next(err);
  }
}

/**
 * Middleware to serve files securely
 * Checks if user has permission to access the file
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} _next - Express next function (not used as this handler sends response directly)
 */

export const secureFileServing = (req, res, _next) => {
  try {
    const filePath = req.params[0];

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const normalizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = getFilePath(normalizedPath);

    if (!checkFileExists(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const userId = req.user ? req.user.id.toString() : null;
    const isUserFile = userId && fullPath.includes(`/uploads/ads/${userId}/`);
    const isPublicFile = fullPath.includes('/uploads/ads/') && !fullPath.includes('/private/');

    if (!isPublicFile && !isUserFile) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

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

    if (isPublicFile) {
      res.setHeader('Cache-Control', 'public, max-age=86400');

      const fileBuffer = fs.readFileSync(fullPath);
      const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      res.setHeader('ETag', `"${hash}"`);

      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === `"${hash}"`) {
        return res.status(304).end();
      }
    } else {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    streamFile(fullPath, res);
  } catch (err) {
    console.error('File serving error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Error accessing file' });
    }
  }
};
