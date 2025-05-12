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
    notifications: boolean;
    visibility: 'public' | 'private';
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
    notifications: boolean;
    visibility: 'public' | 'private';
  };
}
