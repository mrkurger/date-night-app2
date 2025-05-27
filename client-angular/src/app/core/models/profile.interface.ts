/**
 * User profile interface
 */
export interface IProfile {
  // Core user properties
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: {
    city: string;
    country: string;
  };
  // Extended profile preferences
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    notifications?: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    privacy?: {
      profileVisibility: 'public' | 'private' | 'contacts';
      showOnlineStatus: boolean;
      allowMessaging: 'everyone' | 'contacts' | 'none';
    };
  };
}

export interface IProfileUpdateDTO {
  phone?: string;
  avatar?: File;
  bio?: string;
  location?: {
    city: string;
    country: string;
  };
  preferences?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: boolean;
    visibility?: 'public' | 'private';
  };
}
