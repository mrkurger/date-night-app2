import { Ad } from './ad.interface';
import { User } from './user.interface';

export interface Favorite {
  _id: string;
  user: string | User;
  ad: string | Ad;
  notes?: string;
  notificationsEnabled: boolean;
  tags: string[];
  priority: 'low' | 'normal' | 'high';
  lastViewed?: Date;
  lastNotified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteCreateData {
  adId: string;
  notes?: string;
  notificationsEnabled?: boolean;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
}

export interface FavoriteUpdateData {
  notes?: string;
  notificationsEnabled?: boolean;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
}

export interface FavoriteFilterOptions {
  sort?: string;
  search?: string;
  tags?: string[];
  category?: string;
  county?: string;
  city?: string;
  priority?: 'low' | 'normal' | 'high';
  priceMin?: number;
  priceMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface FavoriteTag {
  tag: string;
  count: number;
}

export interface FavoriteBatchResult {
  message: string;
  added?: number;
  removed?: number;
  alreadyFavorited?: number;
}
