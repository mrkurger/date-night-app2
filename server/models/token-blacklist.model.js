/**
 * Token blacklist model for revoking JWT tokens
 * Stores revoked tokens until they expire
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for token-blacklist.model settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    // index: true, // Removed duplicate index - unique already creates an index
  },
  tokenType: {
    type: String,
    enum: ['access', 'refresh', 'all'],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // We'll keep this index as it's needed for performance
    index: true,
  },
  reason: {
    type: String,
    enum: ['logout', 'password_change', 'security_breach', 'user_request', 'admin_action'],
    default: 'logout',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Document will be automatically deleted when expiresAt is reached
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes are defined in the schema fields

// Static method to check if a token is blacklisted
tokenBlacklistSchema.statics.isBlacklisted = async function (token) {
  const blacklistedToken = await this.findOne({ token });
  return !!blacklistedToken;
};

// Static method to blacklist a token
tokenBlacklistSchema.statics.blacklist = async function (
  token,
  tokenType,
  userId,
  reason,
  expiresAt
) {
  return this.create({
    token,
    tokenType,
    userId,
    reason: reason || 'logout',
    expiresAt,
  });
};

// Static method to blacklist all tokens for a user
tokenBlacklistSchema.statics.blacklistAllForUser = async function (userId, reason, expiresAt) {
  // This doesn't actually blacklist all tokens since we don't store them
  // It just creates a record that can be checked in the auth middleware
  return this.create({
    token: `all_tokens_for_${userId}_at_${Date.now()}`,
    tokenType: 'all',
    userId,
    reason: reason || 'security_breach',
    expiresAt,
  });
};

// Static method to clean up expired tokens
// This is a backup in case the TTL index doesn't work
tokenBlacklistSchema.statics.cleanupExpired = async function () {
  const now = new Date();
  return this.deleteMany({ expiresAt: { $lt: now } });
};

export default mongoose.model('TokenBlacklist', tokenBlacklistSchema);
