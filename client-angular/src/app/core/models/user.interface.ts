export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'advertiser' | 'admin';
  online?: boolean;
  lastActive?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  travelPlan?: TravelPlanItem[];
  album?: string[];
  socialProfiles?: {
    github?: { id: string };
    google?: { id: string };
    reddit?: { id: string };
    apple?: { id: string };
  };
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
