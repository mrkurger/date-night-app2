import { User } from './user.interface';

export interface Profile extends User {
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: {
    city: string;
    country: string;
  };
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;';
    theme: 'light' | 'dark';
    language: string;
    notifications?: boolean;
    visibility?: 'public' | 'private';
  };
}

export interface ProfileUpdateDTO {
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
