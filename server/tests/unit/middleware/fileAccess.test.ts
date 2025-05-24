import { Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import fileAccess, { secureFileServing } from '../../../middleware/fileAccess.js';

// Types
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  buffer?: Buffer;
  stream?: NodeJS.ReadableStream;
}

type MockRequestParams = { [key: string]: string | undefined };

interface MockRequest {
  params: MockRequestParams;
  headers: { [key: string]: string };
  user: any | null;
  file?: MulterFile;
  files?: MulterFile[];
  validatedFilePath?: string;
}

type MockResponseBase = {
  headersSent: boolean;
  writableEnded: boolean;
};

interface MockResponse extends MockResponseBase {
  status: jest.Mock;
  json: jest.Mock;
  setHeader: jest.Mock;
  end: jest.Mock;
  writeHead: jest.Mock;
}

// Type guards for mock assertions
const isMockFileStats = (obj: any): obj is { size: number } =>
  obj && typeof obj === 'object' && typeof obj.size === 'number';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn(),
    on: jest.fn(function (this: any) {
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
}));

// Mock path module
jest.mock('path', () => {
  const originalPath = jest.requireActual('path') as typeof path;
  return {
    join: jest.fn((..._args: string[]) => '/mocked/path/to/uploads/testfile'),
    normalize: jest.fn((p: string) => p),
    extname: originalPath.extname,
    dirname: jest.fn(() => '/mocked/path'),
  };
});

// Create mock request, response, and next function
const mockRequest = (options: Partial<MockRequest> = {}): MockRequest => ({
  params: {},
  headers: {},
  user: null,
  ...options,
});

const mockResponse = (): MockResponse => {
  const res = {
    headersSent: false,
    writableEnded: false,
  } as MockResponse;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.setHeader = jest.fn().mockReturnThis();
  res.end = jest.fn();
  res.writeHead = jest.fn().mockReturnThis();
  return res;
};

const mockNext: jest.Mock = jest.fn();

describe('File Access Middleware', () => {
  let req: MockRequest;
  let res: MockResponse;

  beforeEach(() => {
    req = mockRequest({
      params: { filename: 'test.jpg' },
      user: null,
      headers: {},
    });
    res = mockResponse();
    mockNext.mockClear();

    // Reset fs.promises mocks with proper type assertions
    const accessMock = fs.promises.access as unknown as jest.Mock;
    const statMock = fs.promises.stat as unknown as jest.Mock;
    const existsSyncMock = fs.existsSync as jest.Mock;
    const readFileSyncMock = fs.readFileSync as jest.Mock;
    const createReadStreamMock = fs.createReadStream as jest.Mock;

    accessMock.mockReset().mockResolvedValue(undefined);
    statMock.mockReset().mockResolvedValue({ size: 0 });
    existsSyncMock.mockReset().mockReturnValue(true);
    readFileSyncMock.mockReset().mockReturnValue(Buffer.from('test'));
    createReadStreamMock.mockReset().mockReturnValue({
      pipe: jest.fn(),
      on: jest.fn().mockReturnThis(),
    });
  });

  describe('fileAccess middleware', () => {
    it('should allow access to files with valid extensions', async () => {
      req.params.filename = 'test.jpg';
      const statMock = fs.promises.stat as unknown as jest.Mock;
      statMock.mockResolvedValueOnce({ size: 1000 });

      await fileAccess(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.validatedFilePath).toBeDefined();
    });

    it('should reject access to files with invalid extensions', async () => {
      req.params.filename = 'malicious.exe';

      await fileAccess(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unsupported file type',
          statusCode: 403,
        })
      );
    });

    it('should reject files that exceed size limit', async () => {
      req.params.filename = 'test.jpg';
      const statMock = fs.promises.stat as unknown as jest.Mock;
      statMock.mockResolvedValueOnce({ size: 20 * 1024 * 1024 }); // 20MB

      await fileAccess(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'File size exceeds the maximum allowed size',
          statusCode: 403,
        })
      );
    });

    it('should reject files that do not exist', async () => {
      req.params.filename = 'nonexistent.jpg';
      const accessMock = fs.promises.access as unknown as jest.Mock;
      accessMock.mockRejectedValueOnce(new Error('File not found'));

      await fileAccess(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'File not found',
          statusCode: 404,
        })
      );
    });

    it('should reject path traversal attempts', async () => {
      req.params.filename = '../../../etc/passwd';

      await fileAccess(req as any, res as any, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid file path',
          statusCode: 403,
        })
      );
    });
  });

  describe('secureFileServing middleware', () => {
    it('should allow access to files with valid extensions', () => {
      req.params['0'] = 'ads/public-image.jpg';
      const existsSyncMock = fs.existsSync as jest.Mock;
      const readFileSyncMock = fs.readFileSync as jest.Mock;
      const createReadStreamMock = fs.createReadStream as jest.Mock;

      existsSyncMock.mockReturnValue(true);
      readFileSyncMock.mockReturnValue(Buffer.from('dummy file content for ETag'));
      createReadStreamMock.mockReturnValue({
        pipe: jest.fn(),
        on: jest.fn().mockReturnThis(),
      });

      secureFileServing(req as any, res as any, mockNext);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=86400');
      expect(res.setHeader).toHaveBeenCalledWith('ETag', expect.any(String));
      expect(createReadStreamMock).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject access to files with invalid extensions', () => {
      req.params['0'] = 'malicious.exe';

      secureFileServing(req as any, res as any, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Access denied',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing files', () => {
      req.params['0'] = '';

      secureFileServing(req as any, res as any, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'File not found',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle file access errors', () => {
      req.params['0'] = 'ads/public-image.jpg';
      const existsSyncMock = fs.existsSync as jest.Mock;
      existsSyncMock.mockImplementation(() => {
        throw new Error('Disk error');
      });

      secureFileServing(req as any, res as any, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error accessing file',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
