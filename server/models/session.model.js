// /Users/oivindlund/date-night-app/server/models/session.model.js
import mongoose from 'mongoose';

// Attempt to import pointSchema from user.model.js or define it if not available
// This should ideally be in a shared schema file
let pointSchema;
try {
  // This is a placeholder, actual import might differ based on user.model.js structure
  // For now, we'll define it directly if not easily importable.
  // import { pointSchema as importedPointSchema } from './user.model.js';
  // pointSchema = importedPointSchema;
  // If the above doesn't work or user.model.js doesn't export it, define it:
  if (!pointSchema) {
    pointSchema = new mongoose.Schema({
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false, // Make it optional for session, might not always be available
      },
    });
  }
} catch (e) {
  // Fallback to defining pointSchema if import fails
  pointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
    },
  });
}

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    deviceFingerprint: {
      type: Map,
      of: String, // Stores various fingerprinting attributes
    },
    location: {
      // Geo-IP based location or user-provided at session start
      type: pointSchema,
      index: '2dsphere', // Optional: if you plan to query sessions by location
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isTransferable: {
      // For session transfer feature
      type: Boolean,
      default: false,
    },
    transferToken: {
      // For session transfer
      type: String,
      index: true, // If you need to find sessions by transfer token
    },
    transferTokenExpiresAt: {
      // For session transfer
      type: Date,
    },
    logoutReason: {
      type: String,
      enum: [
        'user_initiated',
        'admin_terminated',
        'expired',
        'transferred',
        'token_revoked',
        'auto_timeout',
      ],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficiently finding active sessions for a user
sessionSchema.index({ userId: 1, isActive: 1 });
// Index for cleaning up expired sessions
sessionSchema.index({ expiresAt: 1, isActive: 1 });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;
