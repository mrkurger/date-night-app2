import { IAd } from './ad.interface';
import { IUser } from './user.interface';

export interface IFavorite {
  _id: string;
  user: string | IUser;
  ad: string | IAd;
  adId?: string; // Reference to the ad ID
  title?: string; // Title from the ad
  dateAdded?: Date | string; // Alias for createdAt
  notes?: string;
  notificationsEnabled: boolean;
  tags: string[];
  priority: 'low' | 'normal' | 'high';
  lastViewed?: Date | string;
  lastNotified?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  selected?: boolean; // UI state for selection in lists
}

export interface IFavoriteCreateData {
  adId: string;
  notes?: string;
  notificationsEnabled?: boolean;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
}

export interface IFavoriteUpdateData {
  notes?: string;
  notificationsEnabled?: boolean;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
}

export interface IFavoriteFilterOptions {
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

export interface IFavoriteTag {
  tag: string;
  count: number;
}

export interface IFavoriteBatchResult {
  message: string;
  added?: number;
  removed?: number;
  alreadyFavorited?: number;
}
