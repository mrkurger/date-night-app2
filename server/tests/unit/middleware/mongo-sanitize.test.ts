// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the mongo-sanitize middleware
//
// COMMON CUSTOMIZATIONS:
// - None specific to this middleware
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.ts';
import { mongoSanitize } from '../../../middleware/mongo-sanitize.js';

describe('Mongo Sanitize Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    next.mockClear();
  });

  it('should pass through normal request objects unchanged', () => {
    req.body = { name: 'Test User', age: 30 };
    req.query = { sort: 'name', limit: '10' };
    req.params = { id: '123456' };

    const originalBody = { ...req.body };
    const originalQuery = { ...req.query };
    const originalParams = { ...req.params };

    mongoSanitize(req, res, next);

    expect(req.body).toEqual(originalBody);
    expect(req.query).toEqual(originalQuery);
    expect(req.params).toEqual(originalParams);
    expect(next).toHaveBeenCalled();
  });

  it('should remove $ operators from request body', () => {
    req.body = {
      name: 'Test User',
      query: { $gt: '' },
      nested: {
        $where: 'malicious code',
      },
    };

    mongoSanitize(req, res, next);

    expect(req.body).toEqual({
      name: 'Test User',
      query: {},
      nested: {},
    });
    expect(next).toHaveBeenCalled();
  });

  it('should remove $ operators from request query', () => {
    req.query = {
      name: 'Test User',
      filter: { $gt: '' },
      $where: 'malicious code',
    };

    mongoSanitize(req, res, next);

    expect(req.query).toEqual({
      name: 'Test User',
      filter: {},
    });
    expect(next).toHaveBeenCalled();
  });

  it('should remove $ operators from request params', () => {
    req.params = {
      id: '123456',
      $where: 'malicious code',
    };

    mongoSanitize(req, res, next);

    expect(req.params).toEqual({
      id: '123456',
    });
    expect(next).toHaveBeenCalled();
  });

  it('should handle arrays in request objects', () => {
    req.body = {
      names: ['User1', 'User2'],
      queries: [{ $gt: '' }, { $lt: '' }],
    };

    mongoSanitize(req, res, next);

    expect(req.body).toEqual({
      names: ['User1', 'User2'],
      queries: [{}, {}],
    });
    expect(next).toHaveBeenCalled();
  });

  it('should handle deeply nested objects', () => {
    req.body = {
      user: {
        profile: {
          settings: {
            $where: 'malicious code',
            theme: 'dark',
          },
        },
      },
    };

    mongoSanitize(req, res, next);

    expect(req.body).toEqual({
      user: {
        profile: {
          settings: {
            theme: 'dark',
          },
        },
      },
    });
    expect(next).toHaveBeenCalled();
  });

  it('should handle null and undefined values', () => {
    req.body = {
      nullValue: null,
      undefinedValue: undefined,
      emptyObject: {},
    };

    mongoSanitize(req, res, next);

    expect(req.body).toEqual({
      nullValue: null,
      undefinedValue: undefined,
      emptyObject: {},
    });
    expect(next).toHaveBeenCalled();
  });

  it('should handle requests with no body, query, or params', () => {
    req.body = undefined;
    req.query = undefined;
    req.params = undefined;

    mongoSanitize(req, res, next);

    expect(req.body).toBeUndefined();
    expect(req.query).toBeUndefined();
    expect(req.params).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
