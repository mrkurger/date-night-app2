import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FavoriteService } from '../../../core/services/favorite.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FavoriteButtonComponent } from '../../../shared/components/favorite-button/favorite-button.component';
import { NotesDialogComponent } from '../../../shared/components/notes-dialog/notes-dialog.component';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule,
    RouterModule,
    FormsModule,
    FavoriteButtonComponent,
  ],
  template: `
    <div class="favorites-container">
      <h2 class="page-title">My Favorites</h2>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading your favorites...</p>
      </div>

      <div class="no-favorites" *ngIf="!loading && (!favorites || favorites.length === 0)">
        <mat-card>
          <mat-card-content>
            <mat-icon class="empty-icon">favorite_border</mat-icon>
            <h3>No favorites yet</h3>
            <p>Browse ads and click the heart icon to add them to your favorites.</p>
            <button mat-raised-button color="primary" routerLink="/ads">Browse Ads</button>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="favorites-list" *ngIf="!loading && favorites && favorites.length > 0">
        <mat-card *ngFor="let favorite of favorites" class="favorite-card">
          <div class="favorite-header">
            <img
              [src]="
                favorite.ad.images && favorite.ad.images.length > 0
                  ? favorite.ad.images[0].url
                  : 'assets/images/placeholder.jpg'
              "
              [alt]="favorite.ad.title"
              class="favorite-image"
              [routerLink]="['/ads', favorite.ad._id]"
            />

            <div class="favorite-info">
              <h3 class="favorite-title" [routerLink]="['/ads', favorite.ad._id]">
                {{ favorite.ad.title }}
              </h3>

              <div class="favorite-details">
                <span class="favorite-location">
                  <mat-icon>location_on</mat-icon>
                  {{ favorite.ad.location.city }}, {{ favorite.ad.location.county }}
                </span>

                <span class="favorite-price">
                  <mat-icon>attach_money</mat-icon>
                  {{ favorite.ad.price | currency: 'NOK' : 'symbol' : '1.0-0' }}
                </span>

                <span class="favorite-date">
                  <mat-icon>event</mat-icon>
                  Added {{ favorite.createdAt | date: 'mediumDate' }}
                </span>
              </div>
            </div>

            <div class="favorite-actions">
              <app-favorite-button
                [adId]="favorite.ad._id"
                (favoriteChanged)="onFavoriteRemoved($event, favorite)"
              ></app-favorite-button>

              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
                <mat-icon>more_vert</mat-icon>
              </button>

              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/ads', favorite.ad._id]">
                  <mat-icon>visibility</mat-icon>
                  <span>View Ad</span>
                </button>
                <button mat-menu-item (click)="openNotesDialog(favorite)">
                  <mat-icon>note</mat-icon>
                  <span>Edit Notes</span>
                </button>
                <button mat-menu-item (click)="toggleNotifications(favorite)">
                  <mat-icon>{{
                    favorite.notificationsEnabled ? 'notifications' : 'notifications_off'
                  }}</mat-icon>
                  <span>{{
                    favorite.notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'
                  }}</span>
                </button>
                <button mat-menu-item (click)="removeFavorite(favorite.ad._id)">
                  <mat-icon>delete</mat-icon>
                  <span>Remove from Favorites</span>
                </button>
              </mat-menu>
            </div>
          </div>

          <mat-divider *ngIf="favorite.notes"></mat-divider>

          <div class="favorite-notes" *ngIf="favorite.notes">
            <mat-icon>note</mat-icon>
            <p>{{ favorite.notes }}</p>
          </div>

          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/ads', favorite.ad._id]">
              <mat-icon>visibility</mat-icon>
              View Ad
            </button>

            <button
              mat-button
              color="accent"
              [routerLink]="['/chat']"
              [queryParams]="{ userId: favorite.ad.advertiser._id }"
            >
              <mat-icon>chat</mat-icon>
              Contact Advertiser
            </button>

            <mat-slide-toggle
              [checked]="favorite.notificationsEnabled"
              (change)="toggleNotifications(favorite)"
              color="primary"
              class="notifications-toggle"
            >
              Notifications
            </mat-slide-toggle>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .favorites-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .page-title {
        margin-bottom: 20px;
        color: #333;
        font-size: 2rem;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
      }

      .loading-container p {
        margin-top: 20px;
        color: #666;
      }

      .no-favorites {
        text-align: center;
        padding: 40px 0;
      }

      .no-favorites mat-card {
        max-width: 500px;
        margin: 0 auto;
        padding: 30px;
      }

      .empty-icon {
        font-size: 64px;
        height: 64px;
        width: 64px;
        color: #ccc;
        margin-bottom: 20px;
      }

      .no-favorites h3 {
        margin-bottom: 10px;
        color: #333;
      }

      .no-favorites p {
        margin-bottom: 20px;
        color: #666;
      }

      .favorite-card {
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .favorite-header {
        display: flex;
        padding: 16px;
      }

      .favorite-image {
        width: 120px;
        height: 120px;
        object-fit: cover;
        border-radius: 4px;
        cursor: pointer;
      }

      .favorite-info {
        flex: 1;
        margin-left: 16px;
        display: flex;
        flex-direction: column;
      }

      .favorite-title {
        margin: 0 0 10px 0;
        font-size: 1.2rem;
        cursor: pointer;
      }

      .favorite-title:hover {
        color: #3f51b5;
      }

      .favorite-details {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        color: #666;
        font-size: 0.9rem;
      }

      .favorite-location,
      .favorite-price,
      .favorite-date {
        display: flex;
        align-items: center;
      }

      .favorite-details mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
        margin-right: 4px;
      }

      .favorite-actions {
        display: flex;
        align-items: flex-start;
      }

      .favorite-notes {
        display: flex;
        padding: 16px;
        background-color: #f9f9f9;
        border-radius: 0 0 8px 8px;
      }

      .favorite-notes mat-icon {
        margin-right: 8px;
        color: #666;
      }

      .favorite-notes p {
        margin: 0;
        color: #333;
        white-space: pre-line;
      }

      .notifications-toggle {
        margin-left: auto;
      }
    `,
  ],
})
export class FavoritesListComponent implements OnInit {
  favorites: any[] = [];
  loading = false;

  constructor(
    private favoriteService: FavoriteService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;

    this.favoriteService.getFavorites().subscribe({
      next: favorites => {
        this.favorites = favorites;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading favorites:', error);
        this.notificationService.error('Failed to load favorites');
        this.loading = false;
      },
    });
  }

  removeFavorite(adId: string): void {
    this.favoriteService.removeFavorite(adId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(favorite => favorite.ad._id !== adId);
        this.notificationService.success('Removed from favorites');
      },
      error: error => {
        console.error('Error removing favorite:', error);
        this.notificationService.error('Failed to remove from favorites');
      },
    });
  }

  toggleNotifications(favorite: any): void {
    this.favoriteService.toggleNotifications(favorite.ad._id).subscribe({
      next: response => {
        favorite.notificationsEnabled = response.notificationsEnabled;
        this.notificationService.success(
          `Notifications ${favorite.notificationsEnabled ? 'enabled' : 'disabled'} for this favorite`
        );
      },
      error: error => {
        console.error('Error toggling notifications:', error);
        this.notificationService.error('Failed to update notification settings');
      },
    });
  }

  openNotesDialog(favorite: any): void {
    const dialogRef = this.dialog.open(NotesDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Notes',
        notes: favorite.notes || '',
        maxLength: 500,
        placeholder: 'Add personal notes about this ad...',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.updateNotes(favorite, result);
      }
    });
  }

  updateNotes(favorite: any, notes: string): void {
    this.favoriteService.updateNotes(favorite.ad._id, notes).subscribe({
      next: () => {
        favorite.notes = notes;
        this.notificationService.success('Notes updated');
      },
      error: error => {
        console.error('Error updating notes:', error);
        this.notificationService.error('Failed to update notes');
      },
    });
  }

  onFavoriteRemoved(isFavorite: boolean, favorite: any): void {
    if (!isFavorite) {
      this.favorites = this.favorites.filter(f => f.ad._id !== favorite.ad._id);
    }
  }
}
