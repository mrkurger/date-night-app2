/**
 * Token blacklist model for revoking JWT tokens
 * Stores revoked tokens until they expire
 */
import mongoose, { Document, Model, Schema } from 'mongoose';
import { Types } from 'mongoose';

// Interface for token blacklist document
export interface ITokenBlacklistDocument extends Document {
  token: string;
  tokenType: 'access' | 'refresh' | 'all';
  userId: Types.ObjectId;
  reason: 'logout' | 'password_change' | 'security_breach' | 'user_request' | 'admin_action';
  expiresAt: Date;
  createdAt: Date;
}

// Interface for token blacklist model with static methods
export interface ITokenBlacklistModel extends Model<ITokenBlacklistDocument> {
  isBlacklisted(token: string): Promise<boolean>;
  blacklistToken(
    token: string,
    userId: Types.ObjectId,
    tokenType: 'access' | 'refresh' | 'all',
    reason: string,
    expiresAt: Date
  ): Promise<ITokenBlacklistDocument>;
  blacklistUserTokens(userId: Types.ObjectId, reason: string): Promise<number>;
}

const tokenBlacklistSchema = new Schema<ITokenBlacklistDocument, ITokenBlacklistModel>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  tokenType: {
    type: String,
    enum: ['access', 'refresh', 'all'],
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

/**
 * Check if a token is blacklisted
 */
tokenBlacklistSchema.statics.isBlacklisted = async function (token: string): Promise<boolean> {
  const blacklistedToken = await this.findOne({ token });
  return !!blacklistedToken;
};

/**
 * Blacklist a token
 * @param token The token to blacklist
 * @param userId The user ID associated with the token
 * @param tokenType The type of token
 * @param reason The reason for blacklisting
 * @param expiresAt The expiration date of the token
 */
tokenBlacklistSchema.statics.blacklistToken = async function (
  token: string,
  userId: Types.ObjectId,
  tokenType: 'access' | 'refresh' | 'all',
  reason: string,
  expiresAt: Date
): Promise<ITokenBlacklistDocument> {
  return this.create({
    token,
    tokenType,
    userId,
    reason,
    expiresAt,
  });
};

/**
 * Blacklist all tokens for a user
 * @param userId The user ID
 * @param reason The reason for blacklisting
 * @returns The number of tokens blacklisted
 */
tokenBlacklistSchema.statics.blacklistUserTokens = async function (
  userId: Types.ObjectId,
  reason: string
): Promise<number> {
  // This is a placeholder - in a real implementation,
  // we would need to know all tokens for a user which would require additional tracking
  console.warn('blacklistUserTokens called - this is a stub implementation');
  return 0;
};

const TokenBlacklist = mongoose.model<ITokenBlacklistDocument, ITokenBlacklistModel>(
  'TokenBlacklist',
  tokenBlacklistSchema
);

export default TokenBlacklist;
