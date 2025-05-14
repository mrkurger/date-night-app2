// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the fileAccess middleware
//
// COMMON CUSTOMIZATIONS:
// - ALLOWED_EXTENSIONS: List of allowed file extensions
//   Related to: server/middleware/fileAccess.js
// - MAX_FILE_SIZE: Maximum allowed file size in bytes
//   Related to: server/middleware/fileAccess.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.js';
import fileAccess from '../../../middleware/fileAccess.js';
import path from 'path';
import fs from 'fs';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    stat: jest.fn(),
  },
  constants: {
    F_OK: 0,
    R_OK: 4,
  },
}));

describe('File Access Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest({
      params: {
        filename: 'test-file.jpg',
      },
    });
    res = mockResponse();
    next = mockNext;
    next.mockClear();

    // Reset mocks
    fs.promises.access.mockReset();
    fs.promises.stat.mockReset();
  });

  it('should allow access to files with valid extensions', async () => {
    fs.promises.access.mockResolvedValue(undefined);
    fs.promises.stat.mockResolvedValue({ size: 1000 }); // Small file

    await fileAccess(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should reject access to files with invalid extensions', async () => {
    req.params.filename = 'malicious.exe';

    await fileAccess(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('file type'),
        statusCode: 403,
      })
    );
  });

  it('should reject access to files that exceed size limit', async () => {
    fs.promises.access.mockResolvedValue(undefined);
    fs.promises.stat.mockResolvedValue({ size: 1000000000 }); // Very large file

    await fileAccess(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('file size'),
        statusCode: 403,
      })
    );
  });

  it('should reject access to files that do not exist', async () => {
    fs.promises.access.mockRejectedValue(new Error('File not found'));

    await fileAccess(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('not found'),
        statusCode: 404,
      })
    );
  });

  it('should reject access to files outside the allowed directory', async () => {
    req.params.filename = '../../../config/secrets.js';

    await fileAccess(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid'),
        statusCode: 403,
      })
    );
  });

  it('should handle path traversal attempts', async () => {
    req.params.filename = '..%2F..%2F..%2Fconfig%2Fsecrets.js';

    await fileAccess(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid'),
        statusCode: 403,
      })
    );
  });

  it('should handle errors during file access check', async () => {
    fs.promises.access.mockRejectedValue(new Error('Unknown error'));

    await fileAccess(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
