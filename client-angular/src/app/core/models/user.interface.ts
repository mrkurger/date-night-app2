export interface User {
  _id: string;
  id?: string; // Alias for _id for compatibility
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Full name of the user
  phone?: string; // Phone number
  bio?: string; // User biography or description
  role: 'user' | 'advertiser' | 'admin';
  roles?: string[]; // For role-based authorization
  online?: boolean;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  travelPlan?: TravelPlanItem[];
  album?: string[];
  socialProfiles?: {
    github?: { id: string };
    google?: { id: string };
    reddit?: { id: string };
    apple?: { id: string };
  };
  subscriptionTier?: 'free' | 'premium' | 'vip';
  subscriptionExpires?: Date;
  notificationSettings?: NotificationSettings;
  privacySettings?: PrivacySettings;
  profileImage?: string;
  avatarUrl?: string; // Alias for profileImage for compatibility
  location?: {
    city?: string;
    country?: string;
  };
}

export interface UserProfile extends User {
  phoneNumber?: string;
  website?: string;
  preferences?: {
    notifications?: boolean;
    darkMode?: boolean;
    language?: string;
  };
}

export interface PublicProfile {
  _id: string;
  username: string;
  profileImage?: string;
  bio?: string;
  role: string;
}

export interface TravelPlanItem {
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  county: string;
  city: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'advertiser';
  acceptTerms: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number; // Expiration time in seconds
  user: User;
}

export interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export interface OAuthProvider {
  name: string;
  url: string;
  icon: string;
}

export interface NotificationSettings {
  emailNotifications?: boolean;
  chatNotifications?: boolean;
  marketingEmails?: boolean;
  newMatchNotifications?: boolean;
}

export interface PrivacySettings {
  profileVisibility?: 'public' | 'private' | 'friends';
  showOnlineStatus?: boolean;
  allowMessaging?: 'all' | 'friends' | 'none';
  dataSharing?: boolean;
}
