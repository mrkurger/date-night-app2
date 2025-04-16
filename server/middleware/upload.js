// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for upload settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { fileTypeFromBuffer } = require('file-type');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
const adsUploadsDir = path.join(uploadsDir, 'ads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(adsUploadsDir)) {
  fs.mkdirSync(adsUploadsDir);
}

// Use memory storage first for file type validation
const memoryStorage = multer.memoryStorage();

// Disk storage configuration - kept as reference for future use
// Currently using memory storage with manual file writing instead
// eslint-disable-next-line no-unused-vars
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create user-specific directory to prevent directory traversal attacks
    const userDir = path.join(adsUploadsDir, req.user ? req.user.id.toString() : 'anonymous');

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Generate a random filename to prevent path traversal attacks
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname).toLowerCase();
    const sanitizedExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt) ? fileExt : '.jpg';

    cb(null, `${randomName}${sanitizedExt}`);
  },
});

// Allowed MIME types and their corresponding file signatures
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
const validateAndSave = fieldName => {
  return (req, res, next) => {
    memoryUpload.array(fieldName, 5)(req, res, async err => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.files || req.files.length === 0) {
        return next();
      }

      try {
        const validatedFiles = [];

        for (const file of req.files) {
          // Validate file type using magic numbers
          const fileType = await fileTypeFromBuffer(file.buffer);

          // Check if file type is valid
          if (!fileType || !allowedTypes[file.mimetype].includes(fileType.ext)) {
            return res.status(400).json({
              success: false,
              message: `Invalid file type detected for ${file.originalname}. Only JPEG, PNG and WebP images are allowed.`,
            });
          }

          // Save file to disk
          const filename = crypto.randomBytes(16).toString('hex') + '.' + fileType.ext;
          const userDir = path.join(adsUploadsDir, req.user ? req.user.id.toString() : 'anonymous');

          if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
          }

          const filepath = path.join(userDir, filename);
          fs.writeFileSync(filepath, file.buffer);

          // Add file info to request
          validatedFiles.push({
            originalname: file.originalname,
            filename: filename,
            path: filepath,
            size: file.size,
            mimetype: fileType.mime,
          });
        }

        // Replace req.files with validated files
        req.files = validatedFiles;
        next();
      } catch (error) {
        console.error('File validation error:', error);
        res.status(500).json({
          success: false,
          message: 'Error processing uploaded files',
        });
      }
    });
  };
};

// Create middleware for single file upload
const uploadSingle = fieldName => validateAndSave(fieldName);

// Create middleware for multiple file upload
// maxCount is handled internally in validateAndSave
const uploadMultiple = fieldName => validateAndSave(fieldName);

module.exports = {
  uploadSingle,
  uploadMultiple,
  validateAndSave,
};
