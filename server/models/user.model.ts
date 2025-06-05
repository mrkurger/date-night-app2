import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import argon2 from 'argon2';
import bcrypt from 'bcrypt'; // Keep for backward compatibility

// Interface for Point Schema
export interface IPoint extends Document {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

const pointSchema = new Schema<IPoint>({
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

// Interface for Travel Plan Item Schema
export interface ITravelPlanItem extends Document {
  location: IPoint;
  county: string;
  city: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
}

const travelPlanItemSchema = new Schema<ITravelPlanItem>({
  location: {
    type: pointSchema,
    required: true,
  },
  county: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// Interface for Known Crypto Address
export interface IKnownCryptoAddress {
  currency: string;
  address: string;
  network: string;
}

// Interface for Emergency Contact
export interface IEmergencyContact {
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

// Interface for Payment Method
export interface IPaymentMethod {
  type: 'card' | 'bank_account';
  lastFour?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

// Main User Interface (Properties)
export interface IUser {
  username: string;
  email: string;
  password?: string; // Optional because it's removed in some projections and hashed
  firstName?: string;
  lastName?: string;
  name?: string;
  role: 'user' | 'advertiser' | 'admin';
  profileImage?: string;
  album?: string[];
  online: boolean;
  lastActive: Date;
  travelPlan?: ITravelPlanItem[];
  currentLocation?: IPoint;
  bio?: string;
  encryption?: {
    publicKey?: string;
    keyRegisteredAt?: Date;
    encryptionEnabled: boolean;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    privacy: {
      showOnlineStatus: boolean;
      showLastActive: boolean;
    };
  };
  socialProfiles?: {
    github?: { id: string };
    google?: { id: string };
    reddit?: { id: string };
    apple?: { id: string };
  };
  verified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationLevel: number;
  verificationBadges?: {
    identity: boolean;
    photo: boolean;
    phone: boolean;
    email: boolean;
    address: boolean;
  };
  knownDeviceFingerprints?: Map<string, string>[];
  knownIpAddresses?: string[];
  knownCryptoAddresses?: IKnownCryptoAddress[];
  safetySettings?: {
    emergencyContacts?: IEmergencyContact[];
    safetyCode?: string;
    distressCode?: string;
    autoCheckIn?: {
      enabled: boolean;
      intervalMinutes: number;
      missedCheckInsBeforeAlert: number;
    };
  };
  subscriptionTier: 'free' | 'premium' | 'vip';
  subscriptionExpires?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paymentMethods?: IPaymentMethod[];
  favorites?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  passwordChangedAt?: Date;
  securityLockout?: Date;
  failedLoginAttempts: number;
}

// Interface for User Document (includes Mongoose Document properties and methods)
export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAdvertiser(): boolean;
  isAdmin(): boolean;
  getActiveTravelPlans(): ITravelPlanItem[];
  getUpcomingTravelPlans(): ITravelPlanItem[];
  profileUrl: string; // Virtual
}

// Interface for User Model (includes static methods if any - none in this case)
export interface IUserModel extends Model<IUserDocument> {}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'advertiser', 'admin'],
      default: 'user',
    },
    profileImage: {
      type: String,
    },
    album: [String],
    online: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    travelPlan: [travelPlanItemSchema],
    currentLocation: {
      type: pointSchema,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    encryption: {
      publicKey: {
        type: String,
      },
      keyRegisteredAt: {
        type: Date,
      },
      encryptionEnabled: {
        type: Boolean,
        default: true,
      },
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      privacy: {
        showOnlineStatus: { type: Boolean, default: true },
        showLastActive: { type: Boolean, default: true },
      },
    },
    socialProfiles: {
      github: { id: String },
      google: { id: String },
      reddit: { id: String },
      apple: { id: String },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationLevel: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    verificationBadges: {
      identity: { type: Boolean, default: false },
      photo: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      address: { type: Boolean, default: false },
    },
    knownDeviceFingerprints: [
      {
        type: Map,
        of: String,
      },
    ],
    knownIpAddresses: [
      {
        type: String,
        trim: true,
      },
    ],
    knownCryptoAddresses: [
      {
        currency: { type: String, trim: true },
        address: { type: String, trim: true },
        network: { type: String, trim: true },
        _id: false,
      },
    ],
    safetySettings: {
      emergencyContacts: [
        {
          name: String,
          phone: String,
          email: String,
          relationship: String,
        },
      ],
      safetyCode: String,
      distressCode: String,
      autoCheckIn: {
        enabled: { type: Boolean, default: false },
        intervalMinutes: { type: Number, default: 30 },
        missedCheckInsBeforeAlert: { type: Number, default: 2 },
      },
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'premium', 'vip'],
      default: 'free',
    },
    subscriptionExpires: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ['card', 'bank_account'],
          required: true,
        },
        lastFour: String,
        brand: String,
        expiryMonth: Number,
        expiryYear: Number,
        isDefault: Boolean,
      },
    ],
    favorites: {
      type: [Schema.Types.ObjectId],
      ref: 'Ad',
      default: [],
    },
    // createdAt, updatedAt are handled by timestamps option
    passwordChangedAt: {
      type: Date,
    },
    securityLockout: {
      type: Date,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Add geospatial index for location-based queries
userSchema.index({ currentLocation: '2dsphere' });
userSchema.index({ 'travelPlan.location': '2dsphere' });
userSchema.index({ knownIpAddresses: 1 });
userSchema.index({ 'knownCryptoAddresses.address': 1 });
userSchema.index({ knownDeviceFingerprints: 1 });

// Hash password before saving
userSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    if (this.password.startsWith('$2') || this.password.startsWith('$argon2')) {
      return next();
    }
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
      hashLength: 32,
    });
    this.passwordChangedAt = new Date();
    next();
  } catch (error: any) {
    next(error);
  }
});

// Methods
userSchema.methods.comparePassword = async function (
  this: IUserDocument, // Keep 'this' for Mongoose context
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user is an advertiser
userSchema.methods.isAdvertiser = function (): boolean {
  return this.role === 'advertiser';
};

// Method to check if user is an admin
userSchema.methods.isAdmin = function (): boolean {
  return this.role === 'admin';
};

// Virtual for user's full profile URL
userSchema.virtual('profileUrl').get(function (this: IUserDocument) {
  // TODO: Implement logic that uses 'this' or remove 'this: IUserDocument' if not needed.
  // For now, let's assume it might be used and keep it, but acknowledge the linter.
  // If it's truly unused, it should be: userSchema.virtual('profileUrl').get(function () {
  return `/profile/${this._id}`;
});

// Method to get active travel plans
userSchema.methods.getActiveTravelPlans = function (this: IUserDocument): ITravelPlanItem[] {
  // TODO: Implement logic that uses 'this' or remove 'this: IUserDocument' if not needed.
  // For now, let's assume it might be used and keep it.
  // If it's truly unused, it should be: userSchema.methods.getActiveTravelPlans = function (): ITravelPlanItem[] {
  const now = new Date();
  return (
    this.travelPlan?.filter(
      (plan: ITravelPlanItem) => plan.active && plan.startDate <= now && plan.endDate >= now
    ) || []
  );
};

// Method to get upcoming travel plans
userSchema.methods.getUpcomingTravelPlans = function (this: IUserDocument): ITravelPlanItem[] {
  // TODO: Implement logic that uses 'this' or remove 'this: IUserDocument' if not needed.
  // For now, let's assume it might be used and keep it.
  // If it's truly unused, it should be: userSchema.methods.getUpcomingTravelPlans = function (): ITravelPlanItem[] {
  const now = new Date();
  return (
    this.travelPlan
      ?.filter((plan: ITravelPlanItem) => plan.active && plan.startDate > now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()) || []
  );
};

// Check if model already exists before defining
const User =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
