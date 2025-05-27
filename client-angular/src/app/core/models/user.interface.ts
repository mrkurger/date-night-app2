/**
 *
 */
export interface IUserSubscription {
  /**
   *
   */
  tier: string;
  /**
   *
   */
  expires: string;
  /**
   *
   */
  status: string;
  /**
   *
   */
  cancelAtPeriodEnd?: boolean;
  /**
   *
   */
  currentPeriodEnd?: string;
}

/**
 *
 */
export interface IUser {
  /**
   *
   */
  id: string;
  /**
   *
   */
  email: string;
  /**
   *
   */
  firstName: string;
  /**
   *
   */
  lastName: string;
  /**
   *
   */
  phone?: string;
  /**
   *
   */
  avatar?: string;
  /**
   *
   */
  bio?: string;
  /**
   *
   */
  location?: {
    /**
     *
     */
    city: string;
    /**
     *
     */
    country: string;
    /**
     *
     */
    coordinates?: {
      /**
       *
       */
      latitude: number;
      /**
       *
       */
      longitude: number;
    };
  };
  /**
   *
   */
  preferences: {
    /**
     *
     */
    theme: 'light' | 'dark' | 'system';
    /**
     *
     */
    language: string;
    /**
     *
     */
    notifications: INotificationSettings;
    /**
     *
     */
    privacy: IPrivacySettings;
  };
  /**
   *
   */
  socialProfiles?: {
    /**
     *
     */
    facebook?: string;
    /**
     *
     */
    twitter?: string;
    /**
     *
     */
    instagram?: string;
    /**
     *
     */
    linkedin?: string;
  };
  /**
   *
   */
  subscription?: IUserSubscription;
  /**
   *
   */
  stats?: {
    /**
     *
     */
    totalReviews: number;
    /**
     *
     */
    averageRating: number;
    /**
     *
     */
    responseRate: number;
    /**
     *
     */
    responseTime: number;
  };
  /**
   *
   */
  verificationStatus: {
    /**
     *
     */
    email: boolean;
    /**
     *
     */
    phone: boolean;
    /**
     *
     */
    documents: boolean;
    /**
     *
     */
    socialMedia: boolean;
  };
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  updatedAt: Date;
  /**
   *
   */
  lastLogin?: Date;
}

/**
 *
 */
export interface IPublicIProfile {
  /**
   *
   */
  id: string;
  /**
   *
   */
  firstName: string;
  /**
   *
   */
  lastName: string;
  /**
   *
   */
  avatar?: string;
  /**
   *
   */
  bio?: string;
  /**
   *
   */
  location?: {
    /**
     *
     */
    city: string;
    /**
     *
     */
    country: string;
  };
  /**
   *
   */
  stats?: {
    /**
     *
     */
    totalReviews: number;
    /**
     *
     */
    averageRating: number;
  };
  /**
   *
   */
  verificationStatus: {
    /**
     *
     */
    email: boolean;
    /**
     *
     */
    phone: boolean;
    /**
     *
     */
    documents: boolean;
    /**
     *
     */
    socialMedia: boolean;
  };
  /**
   *
   */
  joined: Date;
}

/**
 *
 */
export interface IUserIProfile extends IUser {
  /**
   *
   */
  settings: {
    /**
     *
     */
    notifications: INotificationSettings;
    /**
     *
     */
    privacy: IPrivacySettings;
    /**
     *
     */
    marketing: boolean;
    /**
     *
     */
    twoFactorAuth: boolean;
  };
  /**
   *
   */
  travelPlans: ITravelPlanItem[];
  /**
   *
   */
  favorites: string[];
  /**
   *
   */
  blockedUsers: string[];
  /**
   *
   */
  sessions: {
    /**
     *
     */
    deviceId: string;
    /**
     *
     */
    lastActive: Date;
    /**
     *
     */
    location?: string;
    /**
     *
     */
    deviceInfo?: string;
  }[];
}

/**
 *
 */
export interface ITravelPlanItem {
  /**
   *
   */
  id: string;
  /**
   *
   */
  destination: string;
  /**
   *
   */
  startDate: Date;
  /**
   *
   */
  endDate: Date;
  /**
   *
   */
  notes?: string;
  /**
   *
   */
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  /**
   *
   */
  guests?: number;
  /**
   *
   */
  budget?: {
    /**
     *
     */
    min: number;
    /**
     *
     */
    max: number;
    /**
     *
     */
    currency: string;
  };
}

/**
 *
 */
export interface ILoginDTO {
  /**
   *
   */
  email: string;
  /**
   *
   */
  password: string;
  /**
   *
   */
  rememberMe?: boolean;
}

/**
 *
 */
export interface IRegisterDTO {
  /**
   *
   */
  email: string;
  /**
   *
   */
  password: string;
  /**
   *
   */
  firstName: string;
  /**
   *
   */
  lastName: string;
  /**
   *
   */
  phone?: string;
  /**
   *
   */
  acceptTerms: boolean;
  /**
   *
   */
  marketingConsent?: boolean;
}

/**
 *
 */
export interface IAuthResponse {
  /**
   *
   */
  user: IUser;
  /**
   *
   */
  token: string;
  /**
   *
   */
  refreshToken: string;
  /**
   *
   */
  expiresIn: number;
}

/**
 *
 */
export interface INotificationSettings {
  /**
   *
   */
  email: boolean;
  /**
   *
   */
  push: boolean;
  /**
   *
   */
  sms: boolean;
  /**
   *
   */
  frequency: 'realtime' | 'daily' | 'weekly';
  /**
   *
   */
  types: {
    /**
     *
     */
    messages: boolean;
    /**
     *
     */
    reviews: boolean;
    /**
     *
     */
    bookings: boolean;
    /**
     *
     */
    promotions: boolean;
    /**
     *
     */
    updates: boolean;
  };
}

/**
 *
 */
export interface IPrivacySettings {
  /**
   *
   */
  profileVisibility: 'public' | 'private' | 'contacts';
  /**
   *
   */
  contactInfoVisibility: 'public' | 'private' | 'contacts';
  /**
   *
   */
  calendarVisibility: 'public' | 'private' | 'contacts';
  /**
   *
   */
  locationSharing: 'always' | 'never' | 'while-using';
  /**
   *
   */
  activityStatus: boolean;
}
