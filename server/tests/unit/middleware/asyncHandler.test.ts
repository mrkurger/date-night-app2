// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the asyncHandler middleware
//
// COMMON CUSTOMIZATIONS:
// - MOCK_ERROR_HANDLING: Settings for error handling in tests
//   Related to: server/middleware/asyncHandler.js
// ===================================================

import { jest } from '@jest/globals';
import { asyncHandler } from '../../../middleware/asyncHandler.js';
import { mockRequest, mockResponse, mockNext } from '../../helpers.ts.js';

describe('Async Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    jest.clearAllMocks();
  });

  it('should pass the request to the handler function', async () => {
    // Create a mock handler function
    const mockHandler = jest.fn().mockResolvedValue('success');

    // Create middleware using asyncHandler
    const middleware = asyncHandler(mockHandler);

    // Call the middleware
    await middleware(req, res, next);

    // Verify the handler was called with the correct arguments
    expect(mockHandler).toHaveBeenCalledWith(req, res, next);
  });

  it('should resolve successfully when the handler succeeds', async () => {
    // Create a mock handler that sends a response
    const mockHandler = jest.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create middleware using asyncHandler
    const middleware = asyncHandler(mockHandler);

    // Call the middleware
    await middleware(req, res, next);

    // Verify the response was sent correctly
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });

    // Verify next was not called (since we handled the response)
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error when the handler throws an error', async () => {
    // Create a mock error
    const mockError = new Error('Test error');

    // Create a mock handler that throws an error
    const mockHandler = jest.fn().mockRejectedValue(mockError);

    // Create middleware using asyncHandler
    const middleware = asyncHandler(mockHandler);

    // Call the middleware
    await middleware(req, res, next);

    // Verify next was called with the error
    expect(next).toHaveBeenCalledWith(mockError);

    // Verify response methods were not called
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle synchronous errors in the handler', async () => {
    // Create a mock handler that throws a synchronous error
    const mockHandler = jest.fn().mockImplementation(() => {
      throw new Error('Synchronous error');
    });

    // Create middleware using asyncHandler
    const middleware = asyncHandler(mockHandler);

    // Call the middleware and expect it to handle the error
    try {
      await middleware(req, res, next);
    } catch (error) {
      // The asyncHandler should catch this and call next, not throw
      throw new Error('AsyncHandler should catch errors and call next, not throw');
    }

    // Verify next was called with the error
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe('Synchronous error');
  });

  it('should work with async/await syntax in the handler', async () => {
    // Create a mock handler using async/await
    const mockHandler = jest.fn().mockImplementation(async (req, res) => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      res.status(201).json({ message: 'Created' });
    });

    // Create middleware using asyncHandler
    const middleware = asyncHandler(mockHandler);

    // Call the middleware
    await middleware(req, res, next);

    // Verify the response was sent correctly
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Created' });
  });

  it('should handle promises returned by the handler', async () => {
    // Create a mock handler that returns a promise
    const mockHandler = jest.fn().mockImplementation((req, res) => {
      return Promise.resolve().then(() => {
        res.status(200).json({ success: true });
      });
    });

    // Create middleware using asyncHandler
    const middleware = asyncHandler(mockHandler);

    // Call the middleware
    await middleware(req, res, next);

    // Verify the response was sent correctly
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('should handle rejected promises returned by the handler', async () => {
    // Create a mock error
    const mockError = new Error('Promise rejection');

    // Create a mock handler that returns a rejected promise
    const mockHandler = jest.fn().mockImplementation(() => {
      return Promise.reject(mockError);
    });

    // Create middleware using asyncHandler
    const middleware = asyncHandler(mockHandler);

    // Call the middleware
    await middleware(req, res, next);

    // Verify next was called with the error
    expect(next).toHaveBeenCalledWith(mockError);
  });
});
