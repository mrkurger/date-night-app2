const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// Define the travel plan item schema
const travelPlanItemSchema = new mongoose.Schema({
  location: {
    type: pointSchema,
    required: true
  },
  county: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Check if model already exists before defining
if (mongoose.models.User) {
  module.exports = mongoose.model('User');
} else {
  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    name: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['user', 'advertiser', 'admin'],
      default: 'user'
    },
    profileImage: {
      type: String
    },
    album: [String],
    online: {
      type: Boolean,
      default: false
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    travelPlan: [travelPlanItemSchema],
    currentLocation: {
      type: pointSchema
    },
    bio: {
      type: String,
      maxlength: 500
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      privacy: {
        showOnlineStatus: { type: Boolean, default: true },
        showLastActive: { type: Boolean, default: true }
      }
    },
    socialProfiles: {
      github: { id: String },
      google: { id: String },
      reddit: { id: String },
      apple: { id: String }
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationLevel: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    verificationBadges: {
      identity: { type: Boolean, default: false },
      photo: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      address: { type: Boolean, default: false }
    },
    safetySettings: {
      emergencyContacts: [{
        name: String,
        phone: String,
        email: String,
        relationship: String
      }],
      safetyCode: String,
      distressCode: String,
      autoCheckIn: {
        enabled: { type: Boolean, default: false },
        intervalMinutes: { type: Number, default: 30 },
        missedCheckInsBeforeAlert: { type: Number, default: 2 }
      }
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'premium', 'vip'],
      default: 'free'
    },
    subscriptionExpires: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    paymentMethods: [{
      type: {
        type: String,
        enum: ['card', 'bank_account'],
        required: true
      },
      lastFour: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
      isDefault: Boolean
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true // Automatically manage createdAt and updatedAt
  });

  // Add geospatial index for location-based queries
  userSchema.index({ currentLocation: '2dsphere' });
  userSchema.index({ 'travelPlan.location': '2dsphere' });

  // Hash password before saving
  userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      // Hash the password along with the new salt
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });

  // Update the updatedAt field on save
  userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });

  // Method to compare password for login
  userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Method to check if user is an advertiser
  userSchema.methods.isAdvertiser = function() {
    return this.role === 'advertiser';
  };

  // Method to check if user is an admin
  userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
  };

  // Virtual for user's full profile URL
  userSchema.virtual('profileUrl').get(function() {
    return `/profile/${this._id}`;
  });

  // Method to get active travel plans
  userSchema.methods.getActiveTravelPlans = function() {
    const now = new Date();
    return this.travelPlan.filter(plan =>
      plan.active && plan.startDate <= now && plan.endDate >= now
    );
  };

  // Method to get upcoming travel plans
  userSchema.methods.getUpcomingTravelPlans = function() {
    const now = new Date();
    return this.travelPlan.filter(plan =>
      plan.active && plan.startDate > now
    ).sort((a, b) => a.startDate - b.startDate);
  };

  module.exports = mongoose.model('User', userSchema);
}
