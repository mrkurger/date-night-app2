const mongoose = require('mongoose');

// Check if model already exists before defining
if (mongoose.models.Ad) {
  module.exports = mongoose.model('Ad');
} else {
  const adSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['Escort', 'Striptease', 'Massage'],
      required: true
    },
    county: {  // For Norwegian counties
      type: String,
      required: true
    },
    location: {  // For geo-based search
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number]
      }
    },
    contact: {
      type: String,
      required: true
    },
    profileImage: String,
    album: [String],
    active: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  // Add geospatial index for location-based queries
  adSchema.index({ location: '2dsphere' });

  module.exports = mongoose.model('Ad', adSchema);
}
