/**
 * Test file for fileAccess middleware
 */

// Import required modules
const fs = require('fs');
// Using Jest's global object which is available in the test environment

// Mock fs module
jest.mock('fs', () => {
  return {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
    createReadStream: jest.fn().mockReturnValue({
      pipe: jest.fn(),
      on: jest.fn(function () {
        return this;
      }),
    }),
    promises: {
      access: jest.fn(),
      stat: jest.fn(),
    },
    constants: {
      F_OK: 0,
      R_OK: 4,
    },
  };
});

// Mock path module
jest.mock('path', () => {
  const originalPath = jest.requireActual('path');
  return {
    ...originalPath,
    join: jest.fn().mockImplementation((...args) => {
      return '/mocked/path/to/uploads/' + args[args.length - 1];
    }),
    normalize: jest.fn().mockImplementation(p => p),
    extname: originalPath.extname,
    dirname: jest.fn().mockReturnValue('/mocked/path'),
  };
});

// Create mock request, response, and next function
const mockRequest = (options = {}) => {
  return {
    params: {},
    headers: {},
    user: null,
    ...options,
  };
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// Import the middleware function
const fileAccess = require('../../../middleware/fileAccess.cjs');

describe('fileAccess Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should allow access to valid files', async () => {
    const req = mockRequest({
      params: { filename: 'test.jpg' },
    });
    const res = mockResponse();

    fs.promises.access.mockResolvedValue(undefined);
    fs.promises.stat.mockResolvedValue({ size: 1000 });

    await fileAccess(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.validatedFilePath).toBeDefined();
  });

  test('should reject files with invalid extensions', async () => {
    const req = mockRequest({
      params: { filename: 'test.exe' },
    });
    const res = mockResponse();

    await fileAccess(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: expect.stringContaining('file type'),
      })
    );
  });

  test('should reject files that are too large', async () => {
    const req = mockRequest({
      params: { filename: 'test.jpg' },
    });
    const res = mockResponse();

    fs.promises.access.mockResolvedValue(undefined);
    fs.promises.stat.mockResolvedValue({ size: 20 * 1024 * 1024 }); // 20MB

    await fileAccess(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: expect.stringContaining('file size'),
      })
    );
  });

  test('should reject files that do not exist', async () => {
    const req = mockRequest({
      params: { filename: 'nonexistent.jpg' },
    });
    const res = mockResponse();

    fs.promises.access.mockRejectedValue(new Error('File not found'));

    await fileAccess(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: expect.stringContaining('not found'),
      })
    );
  });

  test('should reject path traversal attempts', async () => {
    const req = mockRequest({
      params: { filename: '../../../etc/passwd' },
    });
    const res = mockResponse();

    await fileAccess(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: expect.stringContaining('Invalid file path'),
      })
    );
  });
});
