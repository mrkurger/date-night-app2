import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Ad } from '../models/ad.interface';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorites`;
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  private favoritesLoaded = false;

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
   */
  getFavorites(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
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
   */
  addFavorite(adId: string, notes = '', notificationsEnabled = true): Observable<any> {
    return this.http.post(`${this.apiUrl}/${adId}`, { notes, notificationsEnabled }).pipe(
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
   * Update notes for a favorite
   * @param adId Ad ID
   * @param notes New notes
   */
  updateNotes(adId: string, notes: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${adId}/notes`, { notes });
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
