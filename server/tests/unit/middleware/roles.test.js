// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains unit tests for the roles middleware
//
// COMMON CUSTOMIZATIONS:
// - ROLES: Available user roles and their hierarchy
//   Related to: server/middleware/roles.js
// ===================================================

import { jest } from '@jest/globals';
import { mockRequest, mockResponse, mockNext } from '../../helpers.js';
import { authorize } from '../../../middleware/roles.js';

describe('Roles Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = mockRequest({
      user: {
        _id: '507f1f77bcf86cd799439011',
        role: 'user',
      },
    });
    res = mockResponse();
    next = mockNext;
    next.mockClear();
  });

  describe('Authorization', () => {
    it('should allow access if user has the exact required role', () => {
      req.user.role = 'admin';

      authorize('admin')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should allow access if user has a higher role than required', () => {
      req.user.role = 'admin';

      authorize('user')(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny access if user has a lower role than required', () => {
      req.user.role = 'user';

      authorize('admin')(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('permission'),
          statusCode: 403,
        })
      );
    });

    it('should allow access if user has one of multiple required roles', () => {
      req.user.role = 'moderator';

      authorize(['admin', 'moderator', 'support'])(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny access if user does not have any of the required roles', () => {
      req.user.role = 'user';

      authorize(['admin', 'moderator', 'support'])(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('permission'),
          statusCode: 403,
        })
      );
    });

    it('should deny access if no user is attached to the request', () => {
      req.user = undefined;

      authorize('user')(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('authenticated'),
          statusCode: 401,
        })
      );
    });

    it('should deny access if user has no role property', () => {
      req.user = { _id: '507f1f77bcf86cd799439011' };
      // No role property

      authorize('user')(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('role'),
          statusCode: 403,
        })
      );
    });

    it('should handle custom role hierarchies', () => {
      // Assuming the role hierarchy in the middleware is something like:
      // admin > moderator > support > user

      req.user.role = 'moderator';

      // Should allow access to moderator and lower roles
      authorize('moderator')(req, res, next);
      expect(next).toHaveBeenCalled();
      next.mockClear();

      authorize('support')(req, res, next);
      expect(next).toHaveBeenCalled();
      next.mockClear();

      authorize('user')(req, res, next);
      expect(next).toHaveBeenCalled();
      next.mockClear();

      // Should deny access to higher roles
      authorize('admin')(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle resource ownership checks if provided', () => {
      const checkOwnership = jest.fn(req => {
        return req.params.userId === req.user._id.toString();
      });

      req.params = { userId: '507f1f77bcf86cd799439011' };
      req.user._id = '507f1f77bcf86cd799439011';

      authorize('user', checkOwnership)(req, res, next);

      expect(checkOwnership).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it('should deny access if ownership check fails', () => {
      const checkOwnership = jest.fn(req => {
        return req.params.userId === req.user._id.toString();
      });

      req.params = { userId: 'different-user-id' };
      req.user._id = '507f1f77bcf86cd799439011';

      authorize('user', checkOwnership)(req, res, next);

      expect(checkOwnership).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('permission'),
          statusCode: 403,
        })
      );
    });

    it('should bypass ownership check for admin users', () => {
      const checkOwnership = jest.fn(req => {
        return req.params.userId === req.user._id.toString();
      });

      req.params = { userId: 'different-user-id' };
      req.user._id = '507f1f77bcf86cd799439011';
      req.user.role = 'admin';

      authorize('user', checkOwnership)(req, res, next);

      // Admin should bypass ownership check
      expect(checkOwnership).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
