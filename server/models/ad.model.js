// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for ad.model settings
//
// COMMON CUSTOMIZATIONS:
// - R: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import mongoose from 'mongoose';

// Helper function to convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

// Define the point schema for geospatial data
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
});

// Define the pricing schema
const pricingSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'NOK',
  },
  duration: {
    type: String,
    enum: ['30min', '1hour', '2hours', 'overnight', 'custom'],
    required: true,
  },
  customDuration: {
    type: String,
  },
});

// Define the availability schema
const availabilitySchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0-6 (Sunday-Saturday)
    required: true,
  },
  startTime: {
    type: String, // HH:MM format
    required: true,
  },
  endTime: {
    type: String, // HH:MM format
    required: true,
  },
});

// Define the travel itinerary schema
const travelItinerarySchema = new mongoose.Schema({
  destination: {
    city: {
      type: String,
      required: true,
    },
    county: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'Norway',
    },
    location: {
      type: pointSchema,
    },
  },
  arrivalDate: {
    type: Date,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  accommodation: {
    name: String,
    address: String,
    location: pointSchema,
    showAccommodation: {
      type: Boolean,
      default: false,
    },
  },
  availability: [availabilitySchema],
  notes: String,
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned',
  },
});

// Define the service schema
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    min: 0,
  },
  included: {
    type: Boolean,
    default: false,
  },
});

// Check if model already exists before defining
let Ad;
if (mongoose.models.Ad) {
  Ad = mongoose.model('Ad');
} else {
  const adSchema = new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      description: {
        type: String,
        required: true,
        maxlength: 2000,
      },
      shortDescription: {
        type: String,
        maxlength: 200,
      },
      advertiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      category: {
        type: String,
        enum: ['Escort', 'Striptease', 'Massage', 'Webcam', 'Phone', 'Other'],
        required: true,
      },
      subcategory: {
        type: String,
      },
      county: {
        // For Norwegian counties
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      location: {
        // For geo-based search
        type: pointSchema,
        required: true,
      },
      address: {
        street: String,
        postalCode: String,
        hidden: { type: Boolean, default: true }, // Whether to hide exact address
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
          default: 'phone',
        },
      },
      pricing: [pricingSchema],
      availability: [availabilitySchema],
      services: [serviceSchema],
      profileImage: {
        type: String,
        required: true,
      },
      album: [String],
      featured: {
        type: Boolean,
        default: false,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      active: {
        type: Boolean,
        default: true,
      },
      boosted: {
        type: Boolean,
        default: false,
      },
      boostExpires: {
        type: Date,
      },
      views: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      ageVerificationRequired: {
        type: Boolean,
        default: true,
      },
      tags: [String],
      attributes: {
        age: Number,
        gender: {
          type: String,
          enum: ['female', 'male', 'transgender', 'non-binary', 'other'],
        },
        height: Number, // in cm
        weight: Number, // in kg
        bodyType: String,
        hairColor: String,
        eyeColor: String,
        ethnicity: String,
        languages: [String],
      },
      travelItinerary: [travelItinerarySchema],
      currentLocation: {
        type: pointSchema,
        default: null,
      },
      isTouring: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
      },
    },
    {
      timestamps: true, // Automatically manage createdAt and updatedAt
    }
  );

  // Add geospatial index for location-based queries
  adSchema.index({ location: '2dsphere' });

  // Add text index for search
  adSchema.index({
    title: 'text',
    description: 'text',
    shortDescription: 'text',
    tags: 'text',
    city: 'text',
    county: 'text',
  });

  // Add compound index for filtering
  adSchema.index({
    category: 1,
    active: 1,
    county: 1,
    city: 1,
  });

  // Add index for sorting by featured and boosted ads
  adSchema.index({
    featured: -1,
    boosted: -1,
    createdAt: -1,
  });

  // Pre-save middleware to set expiration date if not set
  adSchema.pre('save', function (next) {
    if (!this.expiresAt) {
      // Default ad expiration is 30 days from creation
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
  });

  // Virtual for ad's full URL
  adSchema.virtual('url').get(function () {
    return `/ads/${this._id}`;
  });

  // Method to check if ad is expired
  adSchema.methods.isExpired = function () {
    return this.expiresAt && this.expiresAt < new Date();
  };

  // Method to check if ad is boosted
  adSchema.methods.isBoosted = function () {
    return this.boosted && this.boostExpires && this.boostExpires > new Date();
  };

  // Method to increment view count
  adSchema.methods.incrementViews = async function () {
    this.views += 1;
    return this.save();
  };

  // Method to increment click count
  adSchema.methods.incrementClicks = async function () {
    this.clicks += 1;
    return this.save();
  };

  // Method to toggle like
  adSchema.methods.toggleLike = async function () {
    this.likes += 1;
    return this.save();
  };

  // Static method to find active ads
  adSchema.statics.findActive = function () {
    return this.find({
      active: true,
      expiresAt: { $gt: new Date() },
    });
  };

  // Static method to find featured ads
  adSchema.statics.findFeatured = function () {
    return this.find({
      active: true,
      featured: true,
      expiresAt: { $gt: new Date() },
    });
  };

  // Static method to find ads by location
  adSchema.statics.findByLocation = function (longitude, latitude, maxDistance = 10000) {
    return this.find({
      active: true,
      expiresAt: { $gt: new Date() },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance, // in meters
        },
      },
    });
  };

  // Static method to find ads by current location (including touring advertisers)
  adSchema.statics.findByCurrentLocation = function (longitude, latitude, maxDistance = 10000) {
    const now = new Date();

    return this.find({
      active: true,
      expiresAt: { $gt: now },
      $or: [
        // Regular ads in this location
        {
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              $maxDistance: maxDistance, // in meters
            },
          },
        },
        // Touring advertisers currently in this location
        {
          isTouring: true,
          currentLocation: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              $maxDistance: maxDistance, // in meters
            },
          },
        },
        // Advertisers with active travel itineraries for this location
        {
          isTouring: true,
          'travelItinerary.status': 'active',
          'travelItinerary.arrivalDate': { $lte: now },
          'travelItinerary.departureDate': { $gte: now },
          'travelItinerary.destination.location': {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              $maxDistance: maxDistance, // in meters
            },
          },
        },
      ],
    });
  };

  // Static method to find touring advertisers
  adSchema.statics.findTouring = function () {
    return this.find({
      active: true,
      isTouring: true,
      expiresAt: { $gt: new Date() },
    });
  };

  // Static method to find ads with upcoming travel plans
  adSchema.statics.findUpcomingTours = function (city = null, county = null, daysAhead = 30) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const query = {
      active: true,
      isTouring: true,
      'travelItinerary.status': 'planned',
      'travelItinerary.arrivalDate': { $gte: now, $lte: futureDate },
    };

    if (city) {
      query['travelItinerary.destination.city'] = city;
    }

    if (county) {
      query['travelItinerary.destination.county'] = county;
    }

    return this.find(query).sort('travelItinerary.arrivalDate');
  };

  // Method to update advertiser's current location
  /**
   * @this {import('mongoose').Document & {currentLocation: any, isTouring: boolean, travelItinerary: any[], save: Function}}
   */
  adSchema.methods.updateCurrentLocation = async function (longitude, latitude) {
    this.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    // If touring, check if this location matches any active itinerary
    if (this.isTouring && this.travelItinerary && this.travelItinerary.length > 0) {
      const now = new Date();

      // Find active itineraries
      const activeItineraries = this.travelItinerary.filter(
        itinerary => itinerary.status === 'planned' || itinerary.status === 'active'
      );

      for (const itinerary of activeItineraries) {
        // Check if current date is within itinerary dates
        if (now >= itinerary.arrivalDate && now <= itinerary.departureDate) {
          // Check if current location is near destination
          if (itinerary.destination.location && itinerary.destination.location.coordinates) {
            const [destLong, destLat] = itinerary.destination.location.coordinates;

            // Calculate distance (simple approximation)
            const distance = calculateDistance(latitude, longitude, destLat, destLong);

            // If within 20km of destination, mark itinerary as active
            if (distance <= 20) {
              itinerary.status = 'active';
            }
          }
        } else if (now > itinerary.departureDate && itinerary.status === 'active') {
          // Mark as completed if departure date has passed
          itinerary.status = 'completed';
        }
      }
    }

    return this.save();
  };

  // Method to add a travel itinerary
  /**
   * @this {import('mongoose').Document & {travelItinerary: any[], isTouring: boolean, save: Function}}
   */
  adSchema.methods.addTravelItinerary = async function (itineraryData) {
    if (!this.travelItinerary) {
      this.travelItinerary = [];
    }

    this.travelItinerary.push(itineraryData);
    this.isTouring = true;

    return this.save();
  };

  // Method to update a travel itinerary
  /**
   * @this {import('mongoose').Document & {travelItinerary: any[], isTouring: boolean, save: Function}}
   */
  adSchema.methods.updateTravelItinerary = async function (itineraryId, updates) {
    const itinerary = this.travelItinerary.id(itineraryId);

    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    Object.assign(itinerary, updates);

    // If no more active or planned itineraries, set isTouring to false
    const hasActiveItineraries = this.travelItinerary.some(
      it => it.status === 'planned' || it.status === 'active'
    );

    if (!hasActiveItineraries) {
      this.isTouring = false;
    }

    return this.save();
  };

  // Method to cancel a travel itinerary
  /**
   * @this {import('mongoose').Document & {travelItinerary: any[], isTouring: boolean, save: Function}}
   */
  adSchema.methods.cancelTravelItinerary = async function (itineraryId) {
    const itinerary = this.travelItinerary.id(itineraryId);

    if (!itinerary) {
      throw new Error('Itinerary not found');
    }

    itinerary.status = 'cancelled';

    // If no more active or planned itineraries, set isTouring to false
    const hasActiveItineraries = this.travelItinerary.some(
      it => it.status === 'planned' || it.status === 'active'
    );

    if (!hasActiveItineraries) {
      this.isTouring = false;
    }

    return this.save();
  };

  Ad = mongoose.model('Ad', adSchema);
}

export default Ad;
