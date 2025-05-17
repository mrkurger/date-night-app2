// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for upload settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import Logger from '../utils/logger.js'; // Corrected path
import createError from 'http-errors';

// Get _currentFilePath and _currentDirPath equivalent in ESM
const _currentFilePath = fileURLToPath(import.meta.url);
const _currentDirPath = path.dirname(_currentFilePath);

const uploadDir = path.join(_currentDirPath, '..', 'public', 'uploads');
const adsUploadsDir = path.join(uploadDir, 'ads');

// Ensure the upload directory exists
const ensureUploadDirExists = async () => {
  try {
    await fs.access(uploadDir);
  } catch (error) {
    if (error.code === 'ENOENT') {
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        Logger.info(`Upload directory created: ${uploadDir}`);
      } catch (mkdirError) {
        Logger.error(`Error creating upload directory: ${mkdirError.message}`);
        throw createError(500, 'Failed to create upload directory');
      }
    } else {
      Logger.error(`Error accessing upload directory: ${error.message}`);
      throw createError(500, 'Failed to access upload directory');
    }
  }
};

// Call this at the module level to ensure directory exists when module is loaded.
// However, for testing or if this runs too early, it might be better to call it inside functions that need it.
ensureUploadDirExists().catch(err => {
  Logger.error(`Failed to ensure upload directory on module load: ${err.message}`);
  // Depending on the application's needs, you might want to exit or handle this more gracefully.
});

// Use memory storage first for file type validation
const memoryStorage = multer.memoryStorage();

// Disk storage configuration - kept as reference for future use
// Currently using memory storage with manual file writing instead
const diskStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // The ensureUploadDirExists function needs to be adapted if we switch to diskStorage
    // For now, this assumes adsUploadsDir is the base and a user-specific subdir is created
    const userDir = path.join(adsUploadsDir, req.user ? req.user.id.toString() : 'anonymous');
    try {
      await fs.access(userDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        try {
          await fs.mkdir(userDir, { recursive: true });
          Logger.info(`User-specific upload directory created: ${userDir}`);
        } catch (mkdirError) {
          Logger.error(`Error creating user-specific upload directory: ${mkdirError.message}`);
          return cb(createError(500, 'Failed to create user-specific upload directory'));
        }
      } else {
        Logger.error(`Error accessing user-specific upload directory: ${error.message}`);
        return cb(createError(500, 'Failed to access user-specific upload directory'));
      }
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwrites and ensure compatibility
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname) || '.' + allowedTypes[file.mimetype][0];
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

// Allowed file types for validation
const allowedTypes = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};

// File filter with magic number validation
const fileFilter = async (req, file, cb) => {
  try {
    // First check MIME type
    if (!Object.keys(allowedTypes).includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
    }

    // Magic number validation will be done after the file is uploaded to memory
    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Create multer instance with memory storage for initial upload
const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Maximum 5 files
  },
});

// Middleware to validate file type using magic numbers and save to disk if valid
const validateAndSave = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const { fileTypeFromBuffer } = await import('file-type');
    const processedFilesInfo = [];

    for (const file of req.files) {
      const buffer = file.buffer;
      const fileTypeInfo = await fileTypeFromBuffer(buffer);

      if (!fileTypeInfo || !Object.keys(allowedTypes).includes(fileTypeInfo.mime)) {
        return next(
          createError(
            400,
            `Invalid file content for ${file.originalname}. Only JPEG, PNG, and WebP are allowed.`
          )
        );
      }

      if (file.mimetype !== fileTypeInfo.mime) {
        return next(
          createError(
            400,
            `MIME type mismatch for ${file.originalname}: ${file.mimetype} vs ${fileTypeInfo.mime}.`
          )
        );
      }

      // File is valid, prepare to save it
      const userDir = path.join(adsUploadsDir, req.user ? req.user.id.toString() : 'anonymous');
      try {
        await fs.access(userDir);
      } catch (error) {
        if (error.code === 'ENOENT') {
          await fs.mkdir(userDir, { recursive: true });
        } else {
          throw error; // Rethrow other access errors
        }
      }

      const uniqueFilename = crypto.randomBytes(16).toString('hex') + '.' + fileTypeInfo.ext;
      const filePath = path.join(userDir, uniqueFilename);

      await fs.writeFile(filePath, buffer);
      Logger.info(`File saved: ${filePath}`);

      processedFilesInfo.push({
        originalname: file.originalname,
        filename: uniqueFilename,
        path: filePath,
        size: file.size,
        mimetype: fileTypeInfo.mime,
      });
    }

    req.processedFiles = processedFilesInfo;
    next();
  } catch (error) {
    Logger.error('File validation and saving error:', error);
    if (createError.isHttpError(error)) {
      return next(error);
    }
    return next(createError(500, 'Error processing uploaded files.'));
  }
};

// Export configured multer instance for single and multiple file uploads
// These will first upload to memory, then validateAndSave will process them.
const uploadSingle = fieldName => [memoryUpload.single(fieldName), validateAndSave];

const uploadMultiple = (fieldName, maxCount) => [
  memoryUpload.array(fieldName, maxCount),
  validateAndSave,
];

export { uploadSingle, uploadMultiple, adsUploadsDir };
