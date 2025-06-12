import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import TokenBlacklist from '../models/token-blacklist.model.js';
import { logger } from '../utils/logger.js';
import { sendEmail } from '../utils/email.js';

/**
 * Authentication controller for handling user authentication
 */
export class AuthController {
  /**
   * User login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      // Check if user exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if password is correct
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment failed login attempts
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.securityLockout = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lockout
          await user.save();
          return res.status(401).json({
            success: false,
            message:
              'Account locked due to multiple failed attempts. Try again later or reset your password.',
          });
        }

        await user.save();

        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Reset failed login attempts on successful login
      user.failedLoginAttempts = 0;
      user.lastActive = new Date();
      user.online = true;
      await user.save();

      // Generate JWT tokens
      const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '7d',
      });

      // Set cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Log successful login
      logger.info(`Login successful for user: ${user.email}`);

      // Return user data (exclude sensitive information)
      const userData = {
        id: user._id,
        email: user.email,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        verified: user.verified,
      };

      res.json({
        success: true,
        data: {
          user: userData,
          accessToken, // Include token in response for mobile/API clients
          refreshToken,
        },
        message: 'Login successful',
      });
    } catch (error) {
      logger.error('Error during login:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * User registration
   */
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email ? 'Email already in use' : 'Username already taken',
        });
      }

      // Create verification token
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET as string, {
        expiresIn: '24h',
      });

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        name: `${firstName || ''} ${lastName || ''}`.trim(),
        verificationToken,
      });

      await user.save();

      // Send verification email
      try {
        await sendEmail({
          to: email,
          subject: 'Please verify your email',
          text: `Click the link to verify your email: ${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`,
          html: `
            <h1>Welcome to Date Night App!</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">
              Verify Email
            </a>
          `,
        });
      } catch (emailError) {
        logger.error('Error sending verification email:', emailError);
        // Continue registration process even if email fails
      }

      // Generate tokens for auto-login
      const accessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '7d',
      });

      // Set cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return user data (exclude sensitive information)
      const userData = {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        verified: user.verified,
      };

      res.status(201).json({
        success: true,
        data: {
          user: userData,
          accessToken,
          refreshToken,
        },
        message: 'Registration successful. Please verify your email.',
      });
    } catch (error) {
      logger.error('Error during registration:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * User logout
   */
  static async logout(req: Request, res: Response) {
    try {
      // Get tokens from request
      const accessToken =
        req.cookies.access_token ||
        (req.headers.authorization && req.headers.authorization.split(' ')[1]);
      const refreshToken = req.cookies.refresh_token;

      // Get user ID from token
      let userId;
      if (accessToken) {
        try {
          const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string) as {
            id: string;
          };
          userId = decoded.id;
        } catch (error) {
          // Token is invalid, try refresh token
          if (refreshToken) {
            try {
              const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET as string
              ) as { id: string };
              userId = decoded.id;
            } catch (error) {
              // Both tokens are invalid
            }
          }
        }
      }

      // If we have a userId, update user status
      if (userId) {
        await User.findByIdAndUpdate(userId, { online: false, lastActive: new Date() });
      }

      // Add tokens to blacklist if they exist
      if (accessToken) {
        const accessTokenExp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await TokenBlacklist.blacklist(
          accessToken,
          'access',
          userId || 'unknown',
          'logout',
          accessTokenExp
        );
      }

      if (refreshToken) {
        const refreshTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await TokenBlacklist.blacklist(
          refreshToken,
          'refresh',
          userId || 'unknown',
          'logout',
          refreshTokenExp
        );
      }

      // Clear cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Error during logout:', error);

      // Still clear cookies even if there was an error
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      res.status(500).json({
        success: false,
        message: 'Logout partially completed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      // Get refresh token from cookies or request body
      const refreshToken = req.cookies.refresh_token || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'No refresh token provided',
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
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
        id: string;
      };

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
          message: 'Account locked for security reasons',
        });
      }

      // Generate new tokens
      const newAccessToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: '7d',
      });

      // Update user activity
      user.lastActive = new Date();
      await user.save();

      // Blacklist old refresh token to prevent reuse
      const refreshTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await TokenBlacklist.blacklist(refreshToken, 'refresh', user._id, 'refresh', refreshTokenExp);

      // Set new cookies
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      logger.error('Error refreshing token:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response) {
    try {
      // Get user from request (set by auth middleware)
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
      }

      // Return user data (exclude sensitive information)
      const userData = {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        verified: user.verified,
        verificationLevel: user.verificationLevel,
        profileImage: user.profileImage,
        currentLocation: user.currentLocation,
        bio: user.bio,
        preferences: user.preferences,
        createdAt: user.createdAt,
      };

      res.json({
        success: true,
        data: userData,
        message: 'Profile retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Forgot password - send reset link
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      // Don't reveal if user exists
      if (!user) {
        return res.json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link',
        });
      }

      // Create reset token
      const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
      });

      // Update user with reset token
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // Send password reset email
      try {
        await sendEmail({
          to: email,
          subject: 'Password Reset Request',
          text: `Click the link to reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
          html: `
            <h1>Password Reset Request</h1>
            <p>Please click the link below to reset your password:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
              Reset Password
            </a>
            <p>This link will expire in 1 hour.</p>
          `,
        });
      } catch (emailError) {
        logger.error('Error sending password reset email:', emailError);
      }

      res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
      });
    } catch (error) {
      logger.error('Error during forgot password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Token and password are required',
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Find user with valid reset token
      const user = await User.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Update password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.failedLoginAttempts = 0;
      user.securityLockout = undefined;
      user.passwordChangedAt = new Date();
      await user.save();

      // Blacklist all previous tokens for this user
      const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await TokenBlacklist.blacklistAllForUser(user._id, 'password_change', expiry);

      res.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      logger.error('Error during password reset:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required',
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired verification token',
        });
      }

      // Find user with matching verification token
      const user = await User.findOne({
        email: decoded.email,
        verificationToken: token,
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid verification token',
        });
      }

      // Mark email as verified
      user.verified = true;
      user.verificationToken = undefined;
      user.verificationBadges.email = true;

      // If verification level was 0, update to 1
      if (user.verificationLevel === 0) {
        user.verificationLevel = 1;
      }

      await user.save();

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Error during email verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify email',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new AuthController();
