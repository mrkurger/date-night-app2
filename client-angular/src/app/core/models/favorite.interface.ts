import { Ad } from './ad.interface';
import { User } from './user.interface';

export interface Favorite {
  _id: string;
  user: string | User;
  ad: string | Ad;
  notes?: string;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteCreateData {
  adId: string;
  notes?: string;
  notificationsEnabled?: boolean;
}

export interface FavoriteUpdateData {
  notes?: string;
  notificationsEnabled?: boolean;
}
