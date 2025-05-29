// ===================================================
// ANALYTICS MODEL
// ===================================================
// This model is used for storing analytics data in the secondary database.
// It demonstrates how to use the secondary database connection.
// ===================================================

import mongoose from 'mongoose';
import database1 from '../config/database1.js';

// Define the analytics schema
const analyticSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    properties: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
    // Use schema options to optimize for analytics use case
    collection: 'analytics', // Explicitly name the collection
    autoIndex: true, // Auto-build indexes in development
    minimize: false, // Don't remove empty objects
  }
);

// Add compound indexes for common queries
analyticSchema.index({ event: 1, timestamp: -1 });
analyticSchema.index({ userId: 1, event: 1, timestamp: -1 });

// Create the model using the secondary database connection
// This is the key difference from regular models
const Analytic = database1.model('Analytic', analyticSchema);

export default Analytic;
