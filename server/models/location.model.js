// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for location.model settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import mongoose from 'mongoose';

/**
 * Location model for storing geocoded locations
 *
 * This model caches geocoded locations to reduce API calls to external geocoding services
 * and improve performance for commonly searched locations.
 */
const locationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    county: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Norway',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere',
    },
    source: {
      type: String,
      enum: ['manual', 'nominatim', 'google', 'mapbox', 'imported'],
      default: 'manual',
    },
    population: {
      type: Number,
    },
    timezone: {
      type: String,
    },
    postalCodes: {
      type: [String],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    searchCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient lookups
locationSchema.index({ city: 1, county: 1, country: 1 }, { unique: true });

// Create text index for search
locationSchema.index({ city: 'text', county: 'text', country: 'text' });

/**
 * Static method to find locations by name
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Array of matching locations
 */
locationSchema.statics.findByName = function (query, limit = 10) {
  return this.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

/**
 * Static method to find locations near coordinates
 * @param {number} longitude - Longitude
 * @param {number} latitude - Latitude
 * @param {number} maxDistance - Maximum distance in meters
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Array of nearby locations
 */
locationSchema.statics.findNearby = function (
  longitude,
  latitude,
  maxDistance = 10000,
  limit = 10
) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  }).limit(limit);
};

/**
 * Static method to increment search count
 * @param {string} id - Location ID
 * @returns {Promise<Object>} Updated location
 */
locationSchema.statics.incrementSearchCount = function (id) {
  return this.findByIdAndUpdate(
    id,
    { $inc: { searchCount: 1 }, lastUpdated: new Date() },
    { new: true }
  );
};

/**
 * Static method to get popular locations
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} Array of popular locations
 */
locationSchema.statics.getPopular = function (limit = 10) {
  return this.find().sort({ searchCount: -1 }).limit(limit);
};

module.exports = mongoose.model('Location', locationSchema);
