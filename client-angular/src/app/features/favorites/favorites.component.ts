// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (favorites.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';
import { CardGridComponent } from '../../shared/emerald/components/card-grid/card-grid.component'; // Corrected path
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
// import { EmptyStateComponent } from '../../shared/emerald/components/empty-state/empty-state.component'; // Commented out - Cannot find module
import { NotificationService } from '../../core/services/notification.service';

export interface Favorite {
  _id: string;
  user: string;
  ad: {
    _id: string;
    title: string;
    description: string;
    profileImage: string;
    location: {
      city: string;
      county: string;
    };
    advertiser: {
      _id: string;
      username: string;
      profileImage: string;
    };
  };
  createdAt: string;
  notes?: string;
  notificationsEnabled: boolean;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CommonModule,
    MainLayoutComponent,
    CardGridComponent,
    LoadingSpinnerComponent,
    // EmptyStateComponent, // Commented out - Cannot find module
  ],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  favorites: Favorite[] = [];
  loading = true;
  error = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  /**
   * Load user's favorites
   */
  loadFavorites(): void {
    this.loading = true;
    this.error = false;

    this.getFavorites().subscribe(
      favorites => {
        this.favorites = favorites;
        this.loading = false;
      },
      error => {
        console.error('Error loading favorites:', error);
        this.error = true;
        this.loading = false;
        this.notificationService.error('Failed to load favorites. Please try again.');
      }
    );
  }

  /**
   * Get user's favorites from the API
   */
  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${environment.apiUrl}/favorites`).pipe(
      catchError(error => {
        console.error('Error fetching favorites:', error);
        return of([]);
      })
    );
  }

  /**
   * Handle card click event
   */
  onCardClick(adId: string): void {
    this.router.navigate(['/ads', adId]);
  }

  /**
   * Handle remove favorite action
   */
  onRemoveFavorite(favorite: Favorite): void {
    this.http
      .delete(`${environment.apiUrl}/favorites/${favorite.ad._id}`)
      .pipe(
        catchError(error => {
          console.error('Error removing favorite:', error);
          this.notificationService.error('Failed to remove favorite. Please try again.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response !== null) {
          // Remove from local array
          this.favorites = this.favorites.filter(f => f._id !== favorite._id);
          this.notificationService.success('Favorite removed successfully');
        }
      });
  }

  /**
   * Handle toggle notifications action
   */
  onToggleNotifications(favorite: Favorite): void {
    const newState = !favorite.notificationsEnabled;

    this.http
      .put(`${environment.apiUrl}/favorites/${favorite.ad._id}/notifications`, {
        enabled: newState,
      })
      .pipe(
        catchError(error => {
          console.error('Error toggling notifications:', error);
          this.notificationService.error(
            'Failed to update notification settings. Please try again.'
          );
          return of(null);
        })
      )
      .subscribe(response => {
        if (response !== null) {
          // Update local state
          favorite.notificationsEnabled = newState;
          this.notificationService.success(
            `Notifications ${newState ? 'enabled' : 'disabled'} for this favorite`
          );
        }
      });
  }

  /**
   * Handle update notes action
   */
  onUpdateNotes(data: { favorite: Favorite; notes: string }): void {
    this.http
      .put(`${environment.apiUrl}/favorites/${data.favorite.ad._id}/notes`, {
        notes: data.notes,
      })
      .pipe(
        catchError(error => {
          console.error('Error updating notes:', error);
          this.notificationService.error('Failed to update notes. Please try again.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response !== null) {
          // Update local state
          data.favorite.notes = data.notes;
          this.notificationService.success('Notes updated successfully');
        }
      });
  }

  /**
   * Transform favorites to card format for CardGridComponent
   */
  get favoriteCards() {
    return this.favorites.map(favorite => ({
      id: favorite.ad._id,
      title: favorite.ad.title,
      subtitle: `${favorite.ad.location.city}, ${favorite.ad.location.county}`,
      description: favorite.ad.description,
      image: favorite.ad.profileImage || '/assets/img/default-ad.jpg',
      badge: favorite.notificationsEnabled ? 'Notifications On' : null,
      badgeColor: 'success',
      metadata: {
        favorite: favorite,
        advertiser: favorite.ad.advertiser,
        notes: favorite.notes,
      },
    }));
  }
}
