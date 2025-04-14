
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (user.controller)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
const { User } = require('../');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    // Prevent updating sensitive fields
    delete updates.password;
    delete updates.role;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTravelPlan = async (req, res) => {
  try {
    const { travelPlan } = req.body;
    
    // Ensure user is an advertiser
    const user = await User.findById(req.user._id);
    if (user.role !== 'advertiser') {
      return res.status(403).json({ message: 'Only advertisers can set travel plans' });
    }
    
    user.travelPlan = travelPlan;
    await user.save();
    
    res.json({ travelPlan: user.travelPlan });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('online lastActive');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      online: user.online,
      lastActive: user.lastActive
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;

    // Set passwordChangedAt timestamp
    user.passwordChangedAt = new Date();

    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.securityLockout = undefined;

    await user.save();

    // Blacklist all existing tokens for this user
    const TokenBlacklist = require('../../models/token-blacklist.model');

    // Set expiration date for blacklisted tokens (30 days from now)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Blacklist current token if it exists
    if (req.token) {
      await TokenBlacklist.blacklist(
        req.token,
        'access',
        user._id,
        'password_change',
        expiresAt
      );
    }

    // Also blacklist refresh token if it exists
    if (req.cookies && req.cookies.refresh_token) {
      try {
        const refreshToken = req.cookies.refresh_token;
        await TokenBlacklist.blacklist(
          refreshToken,
          'refresh',
          user._id,
          'password_change',
          expiresAt
        );
      } catch (error) {
        console.error('Error blacklisting refresh token:', error.message);
      }
    }

    // Clear auth cookies
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again with your new password.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: err.message
    });
  }
};
