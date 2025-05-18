// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the upload middleware
//
// COMMON CUSTOMIZATIONS:
// - UPLOAD_LIMITS: File size and count limits
//   Related to: server/middleware/upload.js
// - ALLOWED_MIME_TYPES: Allowed file types
//   Related to: server/middleware/upload.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.js';
import { uploadSingle, uploadMultiple } from '../../../middleware/upload.js';
import multer from 'multer';

// Mock multer
jest.mock('multer', () => {
  const mockStorage = {};
  const multerMock = {
    diskStorage: jest.fn(() => mockStorage),
    memoryStorage: jest.fn(() => mockStorage), // Ensure memoryStorage is a function that returns a mock storage object
    single: jest.fn(() => jest.fn((req, res, next) => next())),
    array: jest.fn(() => jest.fn((req, res, next) => next())),
    limits: {},
    fileFilter: jest.fn(),
  };
  return jest.fn(() => multerMock);
});

describe('Upload Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    next.mockClear();

    // Reset multer mocks
    multer.mockClear();
    multer().single.mockClear();
    multer().array.mockClear();
  });

  describe('uploadSingle', () => {
    it('should configure multer with correct storage type', () => {
      uploadSingle('avatar');

      expect(multer).toHaveBeenCalled();
      expect(multer().single).toHaveBeenCalledWith('avatar');
    });

    it('should set file size limits', () => {
      uploadSingle('avatar');

      const multerInstance = multer.mock.results[0].value;
      expect(multerInstance.limits).toBeDefined();
      expect(multerInstance.limits.fileSize).toBeDefined();
    });

    it('should set file filter for allowed mime types', () => {
      uploadSingle('avatar');

      const multerInstance = multer.mock.results[0].value;
      expect(multerInstance.fileFilter).toBeDefined();
    });

    it('should handle custom destination path', () => {
      uploadSingle('avatar', '/custom/path');

      expect(multer).toHaveBeenCalled();
      // Check if diskStorage was configured with custom path
      // This depends on the implementation details
    });
  });

  describe('uploadMultiple', () => {
    it('should configure multer with correct storage type', () => {
      uploadMultiple('photos', 5);

      expect(multer).toHaveBeenCalled();
      expect(multer().array).toHaveBeenCalledWith('photos', 5);
    });

    it('should set file size limits', () => {
      uploadMultiple('photos', 5);

      const multerInstance = multer.mock.results[0].value;
      expect(multerInstance.limits).toBeDefined();
      expect(multerInstance.limits.fileSize).toBeDefined();
    });

    it('should set file filter for allowed mime types', () => {
      uploadMultiple('photos', 5);

      const multerInstance = multer.mock.results[0].value;
      expect(multerInstance.fileFilter).toBeDefined();
    });

    it('should handle custom destination path', () => {
      uploadMultiple('photos', 5, '/custom/path');

      expect(multer).toHaveBeenCalled();
      // Check if diskStorage was configured with custom path
      // This depends on the implementation details
    });

    it('should enforce maximum file count', () => {
      uploadMultiple('photos', 5);

      const multerInstance = multer.mock.results[0].value;
      expect(multerInstance.limits).toBeDefined();
      expect(multerInstance.limits.files).toBe(5);
    });
  });

  describe('File Filter', () => {
    it('should test file filter function with allowed mime type', () => {
      uploadSingle('avatar');

      // Extract the file filter function
      const multerInstance = multer.mock.results[0].value;
      const fileFilter = multerInstance.fileFilter;

      // Create a mock file with allowed mime type
      const file = {
        mimetype: 'image/jpeg',
      };

      // Create a mock callback
      const cb = jest.fn();

      // Call the file filter function
      fileFilter(req, file, cb);

      // Check if the callback was called with the correct arguments
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should test file filter function with disallowed mime type', () => {
      uploadSingle('avatar');

      // Extract the file filter function
      const multerInstance = multer.mock.results[0].value;
      const fileFilter = multerInstance.fileFilter;

      // Create a mock file with disallowed mime type
      const file = {
        mimetype: 'application/exe',
      };

      // Create a mock callback
      const cb = jest.fn();

      // Call the file filter function
      fileFilter(req, file, cb);

      // Check if the callback was called with the correct arguments
      expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
    });
  });
});
