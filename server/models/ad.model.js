const mongoose = require('mongoose');

// Define the point schema for geospatial data
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
});

// Define the pricing schema
const pricingSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NOK'
  },
  duration: {
    type: String,
    enum: ['30min', '1hour', '2hours', 'overnight', 'custom'],
    required: true
  },
  customDuration: {
    type: String
  }
});

// Define the availability schema
const availabilitySchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0-6 (Sunday-Saturday)
    required: true
  },
  startTime: {
    type: String, // HH:MM format
    required: true
  },
  endTime: {
    type: String, // HH:MM format
    required: true
  }
});

// Define the service schema
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    min: 0
  },
  included: {
    type: Boolean,
    default: false
  }
});

// Check if model already exists before defining
if (mongoose.models.Ad) {
  module.exports = mongoose.model('Ad');
} else {
  const adSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000
    },
    shortDescription: {
      type: String,
      maxlength: 200
    },
    advertiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['Escort', 'Striptease', 'Massage', 'Webcam', 'Phone', 'Other'],
      required: true
    },
    subcategory: {
      type: String
    },
    county: {  // For Norwegian counties
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    location: {  // For geo-based search
      type: pointSchema,
      required: true
    },
    address: {
      street: String,
      postalCode: String,
      hidden: { type: Boolean, default: true } // Whether to hide exact address
    },
    contact: {
      phone: String,
      email: String,
      website: String,
      telegram: String,
      whatsapp: String,
      preferred: {
        type: String,
        enum: ['phone', 'email', 'telegram', 'whatsapp'],
        default: 'phone'
      }
    },
    pricing: [pricingSchema],
    availability: [availabilitySchema],
    services: [serviceSchema],
    profileImage: {
      type: String,
      required: true
    },
    album: [String],
    featured: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    },
    boosted: {
      type: Boolean,
      default: false
    },
    boostExpires: {
      type: Date
    },
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    ageVerificationRequired: {
      type: Boolean,
      default: true
    },
    tags: [String],
    attributes: {
      age: Number,
      gender: {
        type: String,
        enum: ['female', 'male', 'transgender', 'non-binary', 'other']
      },
      height: Number, // in cm
      weight: Number, // in kg
      bodyType: String,
      hairColor: String,
      eyeColor: String,
      ethnicity: String,
      languages: [String]
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    }
  }, {
    timestamps: true // Automatically manage createdAt and updatedAt
  });

  // Add geospatial index for location-based queries
  adSchema.index({ location: '2dsphere' });

  // Add text index for search
  adSchema.index({
    title: 'text',
    description: 'text',
    shortDescription: 'text',
    tags: 'text',
    city: 'text',
    county: 'text'
  });

  // Add compound index for filtering
  adSchema.index({
    category: 1,
    active: 1,
    county: 1,
    city: 1
  });

  // Add index for sorting by featured and boosted ads
  adSchema.index({
    featured: -1,
    boosted: -1,
    createdAt: -1
  });

  // Pre-save middleware to set expiration date if not set
  adSchema.pre('save', function(next) {
    if (!this.expiresAt) {
      // Default ad expiration is 30 days from creation
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
  });

  // Virtual for ad's full URL
  adSchema.virtual('url').get(function() {
    return `/ads/${this._id}`;
  });

  // Method to check if ad is expired
  adSchema.methods.isExpired = function() {
    return this.expiresAt && this.expiresAt < new Date();
  };

  // Method to check if ad is boosted
  adSchema.methods.isBoosted = function() {
    return this.boosted && this.boostExpires && this.boostExpires > new Date();
  };

  // Method to increment view count
  adSchema.methods.incrementViews = async function() {
    this.views += 1;
    return this.save();
  };

  // Method to increment click count
  adSchema.methods.incrementClicks = async function() {
    this.clicks += 1;
    return this.save();
  };

  // Method to toggle like
  adSchema.methods.toggleLike = async function() {
    this.likes += 1;
    return this.save();
  };

  // Static method to find active ads
  adSchema.statics.findActive = function() {
    return this.find({
      active: true,
      expiresAt: { $gt: new Date() }
    });
  };

  // Static method to find featured ads
  adSchema.statics.findFeatured = function() {
    return this.find({
      active: true,
      featured: true,
      expiresAt: { $gt: new Date() }
    });
  };

  // Static method to find ads by location
  adSchema.statics.findByLocation = function(longitude, latitude, maxDistance = 10000) {
    return this.find({
      active: true,
      expiresAt: { $gt: new Date() },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance // in meters
        }
      }
    });
  };

  module.exports = mongoose.model('Ad', adSchema);
}
