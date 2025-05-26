// User related types
/**
 *
 */
export interface User {
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
  displayName: string;
  /**
   *
   */
  photoURL?: string;
  /**
   *
   */
  preferences?: UserPreferences;
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  updatedAt: Date;
}

/**
 *
 */
export interface UserPreferences {
  /**
   *
   */
  theme: 'light' | 'dark' | 'system';
  /**
   *
   */
  notifications: NotificationPreferences;
  /**
   *
   */
  datePreferences: DatePreferences;
}

/**
 *
 */
export interface NotificationPreferences {
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
  inApp: boolean;
}

/**
 *
 */
export interface DatePreferences {
  /**
   *
   */
  maxDistance: number;
  /**
   *
   */
  ageRange: {
    /**
     *
     */
    min: number;
    /**
     *
     */
    max: number;
  };
  /**
   *
   */
  interests: string[];
}

// Notification related types
/**
 *
 */
export interface Notification {
  /**
   *
   */
  id: string;
  /**
   *
   */
  userId: string;
  /**
   *
   */
  type: NotificationType;
  /**
   *
   */
  title: string;
  /**
   *
   */
  message: string;
  /**
   *
   */
  read: boolean;
  /**
   *
   */
  createdAt: Date;
  /**
   *
   */
  data?: Record;
}

/**
 *
 */
export type NotificationType = 'match' | 'message' | 'system' | 'date_reminder' | 'profile_update';

// Menu related types
/**
 *
 */
export interface MenuItem {
  /**
   *
   */
  title: string;
  /**
   *
   */
  icon?: string;
  /**
   *
   */
  link?: string;
  /**
   *
   */
  children?: MenuItem[];
  /**
   *
   */
  data?: Record;
}

// Theme related types
/**
 *
 */
export interface ThemeConfig {
  /**
   *
   */
  name: string;
  /**
   *
   */
  variables: Record;
}

// API Response types
/**
 *
 */
export interface ApiResponse {
  /**
   *
   */
  success: boolean;
  /**
   *
   */
  data?: T;
  /**
   *
   */
  error?: {
    /**
     *
     */
    code: string;
    /**
     *
     */
    message: string;
    /**
     *
     */
    details?: Record;
  };
}
