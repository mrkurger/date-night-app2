// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for user preferences service
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_PREFERENCES: Default user preferences (default: see below)
//   Related to: user-settings.component.ts:defaultPreferences
// - STORAGE_KEY: Key used for localStorage (default: 'user_preferences')
//   Related to: theme.service.ts:THEME_STORAGE_KEY
// ===================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ContentDensity {
  value: 'comfortable' | 'compact' | 'condensed';
  label: string;
}

export interface CardSize {
  value: 'small' | 'medium' | 'large';
  label: string;
}

export interface UserPreferences {
  defaultViewType: 'netflix' | 'tinder' | 'list';
  contentDensity: ContentDensity['value'];
  cardSize: CardSize['value'];
  savedFilters: {
    [key: string]: any;
  };
  recentlyViewed: string[];
  favorites: string[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultViewType: 'netflix',
  contentDensity: 'comfortable',
  cardSize: 'medium',
  savedFilters: {},
  recentlyViewed: [],
  favorites: [],
};

const STORAGE_KEY = 'user_preferences';

/**
 * Service for managing user preferences
 * Handles saving and retrieving user preferences for layout customization
 */
@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private preferencesSubject = new BehaviorSubject<UserPreferences>(this.getInitialPreferences());

  /**
   * Observable that emits the current user preferences
   */
  public preferences$: Observable<UserPreferences> = this.preferencesSubject.asObservable();

  // Available content density options
  public readonly contentDensityOptions: ContentDensity[] = [
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' },
    { value: 'condensed', label: 'Condensed' },
  ];

  // Available card size options
  public readonly cardSizeOptions: CardSize[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  constructor() {
    // Initialize preferences
    this.loadPreferences();
  }

  /**
   * Get the current user preferences
   * @returns The current user preferences
   */
  public getPreferences(): UserPreferences {
    return this.preferencesSubject.value;
  }

  /**
   * Update user preferences
   * @param preferences The preferences to update
   */
  public updatePreferences(preferences: Partial<UserPreferences>): void {
    const updatedPreferences = {
      ...this.preferencesSubject.value,
      ...preferences,
    };

    this.preferencesSubject.next(updatedPreferences);
    this.savePreferences(updatedPreferences);
  }

  /**
   * Set the default view type
   * @param viewType The view type to set as default
   */
  public setDefaultViewType(viewType: 'netflix' | 'tinder' | 'list'): void {
    this.updatePreferences({ defaultViewType: viewType });
  }

  /**
   * Set the content density
   * @param density The content density to set
   */
  public setContentDensity(density: ContentDensity['value']): void {
    this.updatePreferences({ contentDensity: density });
  }

  /**
   * Set the card size
   * @param size The card size to set
   */
  public setCardSize(size: CardSize['value']): void {
    this.updatePreferences({ cardSize: size });
  }

  /**
   * Save a filter
   * @param name The name of the filter
   * @param filter The filter to save
   */
  public saveFilter(name: string, filter: any): void {
    const savedFilters = {
      ...this.preferencesSubject.value.savedFilters,
      [name]: filter,
    };

    this.updatePreferences({ savedFilters });
  }

  /**
   * Get a saved filter
   * @param name The name of the filter
   * @returns The saved filter or undefined if not found
   */
  public getSavedFilter(name: string): any {
    return this.preferencesSubject.value.savedFilters[name];
  }

  /**
   * Delete a saved filter
   * @param name The name of the filter to delete
   */
  public deleteSavedFilter(name: string): void {
    const savedFilters = { ...this.preferencesSubject.value.savedFilters };
    delete savedFilters[name];

    this.updatePreferences({ savedFilters });
  }

  /**
   * Add an item to recently viewed
   * @param id The ID of the item to add
   * @param maxItems Maximum number of items to keep (default: 10)
   */
  public addToRecentlyViewed(id: string, maxItems: number = 10): void {
    // Remove the item if it already exists
    const recentlyViewed = this.preferencesSubject.value.recentlyViewed.filter(item => item !== id);

    // Add the item to the beginning of the array
    recentlyViewed.unshift(id);

    // Limit the array to maxItems
    const limitedRecentlyViewed = recentlyViewed.slice(0, maxItems);

    this.updatePreferences({ recentlyViewed: limitedRecentlyViewed });
  }

  /**
   * Add or remove an item from favorites
   * @param id The ID of the item to toggle
   */
  public toggleFavorite(id: string): void {
    const favorites = [...this.preferencesSubject.value.favorites];
    const index = favorites.indexOf(id);

    if (index === -1) {
      // Add to favorites
      favorites.push(id);
    } else {
      // Remove from favorites
      favorites.splice(index, 1);
    }

    this.updatePreferences({ favorites });
  }

  /**
   * Check if an item is in favorites
   * @param id The ID of the item to check
   * @returns True if the item is in favorites, false otherwise
   */
  public isFavorite(id: string): boolean {
    return this.preferencesSubject.value.favorites.includes(id);
  }

  /**
   * Reset preferences to defaults
   */
  public resetPreferences(): void {
    this.preferencesSubject.next({ ...DEFAULT_PREFERENCES });
    this.savePreferences(DEFAULT_PREFERENCES);
  }

  /**
   * Get the initial preferences from localStorage or defaults
   * @returns The initial preferences
   */
  private getInitialPreferences(): UserPreferences {
    try {
      const savedPreferences = localStorage.getItem(STORAGE_KEY);

      if (savedPreferences) {
        return JSON.parse(savedPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences from localStorage:', error);
    }

    return { ...DEFAULT_PREFERENCES };
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    const preferences = this.getInitialPreferences();
    this.preferencesSubject.next(preferences);
  }

  /**
   * Save preferences to localStorage
   * @param preferences The preferences to save
   */
  private savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  }
}
