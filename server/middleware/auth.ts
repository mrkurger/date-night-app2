/**
 * Authentication middleware for protecting routes and verifying user permissions.
 * Implements JWT verification, token blacklist checking, and role-based access control.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import TokenBlacklist from '../models/token-blacklist.model.js';
import { IUserDocument } from '../models/user.model.js';

// Define the structure for decoded JWT payload
export interface DecodedToken {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Express Request type to include user properties and token information
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      token?: string;
      tokenDecoded?: DecodedToken;
    }
  }
}

/**
 * Middleware to authenticate users
 * Verifies JWT token and checks if it's blacklisted
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    let token: string | undefined;

    // Check for token in cookie first (preferred method)
    if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // Fallback to Authorization header for API clients
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked. Please log in again.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has a security lockout
    if (user.securityLockout && user.securityLockout > new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Account locked for security reasons. Please reset your password.',
      });
    }

    // Check if user's last password change was after token issuance
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      return res.status(401).json({
        success: false,
        message: 'Password has been changed. Please log in again.',
      });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    // Add user and token info to request
    req.user = user;
    req.token = token;
    req.tokenDecoded = decoded;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message || 'Unknown error',
    });
  }
};

/**
 * Middleware to restrict routes to specific user roles
 * @param roles Array of roles allowed to access the route
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

/**
 * Middleware to verify a user is verified (email confirmation)
 */
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!req.user.verified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email before proceeding.',
    });
  }

  next();
};

/**
 * Middleware to refresh token and user session
 */
export const refreshToken = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    let refreshToken: string | undefined;

    // Get refresh token from cookie or body
    if (req.cookies && req.cookies.refresh_token) {
      refreshToken = req.cookies.refresh_token;
    } else if (req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await TokenBlacklist.isBlacklisted(refreshToken);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token has been revoked',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as string
    ) as DecodedToken;

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    // Set new access token cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Return new token
    return res.json({
      success: true,
      data: {
        accessToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message || 'Unknown error',
    });
  }
};
