// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains a mock of the user preferences service for testing
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_PREFERENCES: Default user preferences (default: see below)
//   Related to: user-preferences.service.ts:DEFAULT_PREFERENCES
// ===================================================

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ContentDensity, CardSize, UserPreferences } from './user-preferences.service';

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultViewType: 'netflix',
  contentDensity: 'comfortable',
  cardSize: 'medium',
  savedFilters: {},
  recentlyViewed: [],
  favorites: [],
};

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesServiceMock {
  private preferencesSubject = new BehaviorSubject<UserPreferences>({ ...DEFAULT_PREFERENCES });

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
   * Reset preferences to defaults
   */
  public resetPreferences(): void {
    this.preferencesSubject.next({ ...DEFAULT_PREFERENCES });
  }
}
