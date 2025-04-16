import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Ad } from '../models/ad.interface';

export interface FavoriteTag {
  tag: string;
  count: number;
}

export interface FavoriteFilterOptions {
  sort?:
    | 'newest'
    | 'oldest'
    | 'price-asc'
    | 'price-desc'
    | 'title-asc'
    | 'title-desc'
    | 'priority-high'
    | 'priority-low';
  category?: string;
  county?: string;
  city?: string;
  search?: string;
}

export interface FavoriteBatchResult {
  message: string;
  added?: number;
  alreadyFavorited?: number;
  removed?: number;
}

export interface Favorite {
  _id: string;
  user: string;
  ad: Ad;
  notes: string;
  notificationsEnabled: boolean;
  tags: string[];
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  updatedAt: string;
}

/**
 * Service for managing user favorites
 * Provides methods for adding, removing, and managing favorite ads
 */
@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorites`;
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  private favoritesLoaded = false;

  // Observable of favorite ad IDs
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load all favorite IDs for the current user
   * This is used to efficiently check if an ad is favorited
   */
  loadFavoriteIds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/ids`).pipe(
      tap(ids => {
        this.favoritesSubject.next(ids);
        this.favoritesLoaded = true;
      })
    );
  }

  /**
   * Get all favorites for the current user with full ad details
   * @param options Optional filter and sort options
   */
  getFavorites(options?: FavoriteFilterOptions): Observable<Favorite[]> {
    let params = new HttpParams();

    if (options) {
      if (options.sort) {
        params = params.set('sort', options.sort);
      }
      if (options.category) {
        params = params.set('category', options.category);
      }
      if (options.county) {
        params = params.set('county', options.county);
      }
      if (options.city) {
        params = params.set('city', options.city);
      }
      if (options.search) {
        params = params.set('search', options.search);
      }
      if (options.priority) {
        params = params.set('priority', options.priority);
      }
      if (options.priceMin !== undefined) {
        params = params.set('priceMin', options.priceMin.toString());
      }
      if (options.priceMax !== undefined) {
        params = params.set('priceMax', options.priceMax.toString());
      }
      if (options.dateFrom) {
        params = params.set('dateFrom', new Date(options.dateFrom).toISOString());
      }
      if (options.dateTo) {
        params = params.set('dateTo', new Date(options.dateTo).toISOString());
      }
      if (options.tags && options.tags.length > 0) {
        // For multiple tags, we need to handle them specially
        options.tags.forEach(tag => {
          params = params.append('tags', tag);
        });
      }
    }

    return this.http.get<Favorite[]>(this.apiUrl, { params });
  }

  /**
   * Get all tags used by the current user
   * @returns Observable of tags with usage counts
   */
  getUserTags(): Observable<FavoriteTag[]> {
    return this.http.get<FavoriteTag[]>(`${this.apiUrl}/tags`);
  }

  /**
   * Check if an ad is in the user's favorites
   * @param adId Ad ID to check
   */
  isFavorite(adId: string): Observable<boolean> {
    // If we've already loaded favorites, check locally
    if (this.favoritesLoaded) {
      return this.favorites$.pipe(map(favorites => favorites.includes(adId)));
    }

    // Otherwise, check with the server
    return this.http.get<boolean>(`${this.apiUrl}/check/${adId}`);
  }

  /**
   * Add an ad to favorites
   * @param adId Ad ID to add
   * @param notes Optional notes about this favorite
   * @param notificationsEnabled Whether to enable notifications for this favorite
   * @param tags Optional tags for categorizing this favorite
   * @param priority Optional priority level (low, normal, high)
   */
  addFavorite(
    adId: string,
    notes = '',
    notificationsEnabled = true,
    tags: string[] = [],
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/${adId}`, {
        notes,
        notificationsEnabled,
        tags,
        priority,
      })
      .pipe(
        tap(() => {
          if (this.favoritesLoaded) {
            const currentFavorites = this.favoritesSubject.value;
            if (!currentFavorites.includes(adId)) {
              this.favoritesSubject.next([...currentFavorites, adId]);
            }
          }
        })
      );
  }

  /**
   * Add multiple ads to favorites in a batch operation
   * @param adIds Array of ad IDs to add
   * @param notes Optional notes to apply to all favorites
   * @param notificationsEnabled Whether to enable notifications for all favorites
   * @param tags Optional tags to apply to all favorites
   * @param priority Optional priority level to apply to all favorites
   */
  addFavoritesBatch(
    adIds: string[],
    notes = '',
    notificationsEnabled = true,
    tags: string[] = [],
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Observable<FavoriteBatchResult> {
    return this.http
      .post<FavoriteBatchResult>(`${this.apiUrl}/batch`, {
        adIds,
        notes,
        notificationsEnabled,
        tags,
        priority,
      })
      .pipe(
        tap(result => {
          if (this.favoritesLoaded && result.added && result.added > 0) {
            const currentFavorites = this.favoritesSubject.value;
            const newFavorites = [...currentFavorites];

            // Add only the IDs that aren't already in the list
            adIds.forEach(id => {
              if (!currentFavorites.includes(id)) {
                newFavorites.push(id);
              }
            });

            this.favoritesSubject.next(newFavorites);
          }
        })
      );
  }

  /**
   * Remove an ad from favorites
   * @param adId Ad ID to remove
   */
  removeFavorite(adId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${adId}`).pipe(
      tap(() => {
        if (this.favoritesLoaded) {
          const currentFavorites = this.favoritesSubject.value;
          this.favoritesSubject.next(currentFavorites.filter(id => id !== adId));
        }
      })
    );
  }

  /**
   * Remove multiple ads from favorites in a batch operation
   * @param adIds Array of ad IDs to remove
   */
  removeFavoritesBatch(adIds: string[]): Observable<FavoriteBatchResult> {
    return this.http
      .delete<FavoriteBatchResult>(`${this.apiUrl}/batch`, {
        body: { adIds },
      })
      .pipe(
        tap(() => {
          if (this.favoritesLoaded) {
            const currentFavorites = this.favoritesSubject.value;
            this.favoritesSubject.next(currentFavorites.filter(id => !adIds.includes(id)));
          }
        })
      );
  }

  /**
   * Update notes for a favorite
   * @param adId Ad ID
   * @param notes New notes
   */
  updateNotes(adId: string, notes: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${adId}/notes`, { notes });
  }

  /**
   * Update tags for a favorite
   * @param adId Ad ID
   * @param tags New tags array
   */
  updateTags(adId: string, tags: string[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${adId}/tags`, { tags });
  }

  /**
   * Update priority for a favorite
   * @param adId Ad ID
   * @param priority New priority (low, normal, high)
   */
  updatePriority(adId: string, priority: 'low' | 'normal' | 'high'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${adId}/priority`, { priority });
  }

  /**
   * Toggle notifications for a favorite
   * @param adId Ad ID
   */
  toggleNotifications(adId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${adId}/notifications`, {});
  }

  /**
   * Clear the cached favorites (e.g., on logout)
   */
  clearCache(): void {
    this.favoritesSubject.next([]);
    this.favoritesLoaded = false;
  }
}
