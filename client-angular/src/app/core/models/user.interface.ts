export interface UserSubscription {
  tier: string;
  expires: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
}

export interface User {
  id: string;
  _id?: string; // MongoDB ID field, needed for compatibility with existing code
  username: string;
  email: string;
  roles: string[];
  status: 'active' | 'banned' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    location?: {
      city?: string;
      country?: string;
    };
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
  stats?: {
    totalLogins: number;
    totalPosts: number;
    totalLikes: number;
    reputation: number;
  };
  metadata?: {
    browser?: string;
    platform?: string;
    lastIp?: string;
  };
  notificationSettings?: NotificationSettings;
  privacySettings?: PrivacySettings;
  subscription?: UserSubscription;
}

export interface PublicProfile {
  id: string;
  username: string;
  profile?: {
    avatar?: string;
    bio?: string;
    location?: {
      city?: string;
      country?: string;
    };
  };
  stats?: {
    totalPosts: number;
    reputation: number;
  };
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: {
    city?: string;
    country?: string;
  };
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    theme: 'light' | 'dark';
    language: string;
  };
}

export interface TravelPlanItem {
  id: string;
  userId: string;
  destination: {
    city: string;
    country: string;
  };
  dates: {
    start: Date;
    end: Date;
  };
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'connections';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO extends LoginDTO {
  username: string;
  confirmPassword: string;
  role?: string;
  acceptTerms?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn?: number; // Add this to match the AuthService usage
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowDms: 'all' | 'connections' | 'none';
  showEmail: boolean;
}
