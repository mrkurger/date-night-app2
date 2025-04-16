import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import {
  FavoriteService,
  Favorite,
  FavoriteFilterOptions,
  FavoriteTag,
} from '../../../core/services/favorite.service';
import { DialogService } from '../../../core/services/dialog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FavoriteButtonComponent } from '../../../shared/components/favorite-button/favorite-button.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

/**
 * Enhanced favorites page component with filtering, sorting, and batch operations
 */
@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    FavoriteButtonComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="favorites-page">
      <div class="favorites-header">
        <h1 class="page-title">My Favorites</h1>

        <div class="favorites-actions" *ngIf="favorites && favorites.length > 0">
          <button
            mat-raised-button
            color="primary"
            [disabled]="selectedFavorites.length === 0"
            [matMenuTriggerFor]="batchMenu"
          >
            Batch Actions ({{ selectedFavorites.length }})
          </button>

          <mat-menu #batchMenu="matMenu">
            <button mat-menu-item (click)="removeFavoritesBatch()">
              <mat-icon>delete</mat-icon>
              <span>Remove Selected</span>
            </button>
            <button mat-menu-item (click)="openTagsDialog()">
              <mat-icon>label</mat-icon>
              <span>Add Tags to Selected</span>
            </button>
            <button mat-menu-item (click)="setPriorityBatch('high')">
              <mat-icon>priority_high</mat-icon>
              <span>Set High Priority</span>
            </button>
            <button mat-menu-item (click)="setPriorityBatch('normal')">
              <mat-icon>remove_circle_outline</mat-icon>
              <span>Set Normal Priority</span>
            </button>
            <button mat-menu-item (click)="setPriorityBatch('low')">
              <mat-icon>arrow_downward</mat-icon>
              <span>Set Low Priority</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <div class="filters-container" *ngIf="favorites && favorites.length > 0">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search favorites</mat-label>
          <input
            matInput
            [(ngModel)]="filterOptions.search"
            (input)="onSearchChange($event)"
            placeholder="Search by title, description, or notes"
          />
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Sort by</mat-label>
          <mat-select [(ngModel)]="filterOptions.sort" (selectionChange)="applyFilters()">
            <mat-option value="newest">Newest first</mat-option>
            <mat-option value="oldest">Oldest first</mat-option>
            <mat-option value="price-asc">Price: Low to High</mat-option>
            <mat-option value="price-desc">Price: High to Low</mat-option>
            <mat-option value="title-asc">Title: A to Z</mat-option>
            <mat-option value="title-desc">Title: Z to A</mat-option>
            <mat-option value="priority-high">Priority: High to Low</mat-option>
            <mat-option value="priority-low">Priority: Low to High</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="tags-filter" *ngIf="userTags && userTags.length > 0">
          <div class="tags-label">Filter by tag:</div>
          <div class="tags-chips">
            <mat-chip-listbox multiple [(ngModel)]="selectedTagFilters" (change)="applyFilters()">
              <mat-chip-option *ngFor="let tag of userTags" [value]="tag.tag">
                {{ tag.tag }} ({{ tag.count }})
              </mat-chip-option>
            </mat-chip-listbox>
          </div>
        </div>

        <button mat-button color="primary" (click)="resetFilters()" *ngIf="isFiltered">
          <mat-icon>clear</mat-icon>
          Clear Filters
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <app-loading-spinner></app-loading-spinner>
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
        <mat-card
          *ngFor="let favorite of favorites"
          class="favorite-card"
          [ngClass]="getPriorityClass(favorite)"
        >
          <div class="favorite-header">
            <div class="favorite-select">
              <mat-checkbox
                [(ngModel)]="favorite.selected"
                (change)="updateSelectedFavorites()"
                color="primary"
              ></mat-checkbox>
            </div>

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
                  {{ favorite.ad.location?.city }}, {{ favorite.ad.location?.county }}
                </span>

                <span class="favorite-price" *ngIf="favorite.ad.price">
                  <mat-icon>attach_money</mat-icon>
                  {{ favorite.ad.price | currency: 'NOK' : 'symbol' : '1.0-0' }}
                </span>

                <span class="favorite-date">
                  <mat-icon>event</mat-icon>
                  Added {{ favorite.createdAt | date: 'mediumDate' }}
                </span>

                <span class="favorite-priority" [ngClass]="'priority-' + favorite.priority">
                  <mat-icon>{{ getPriorityIcon(favorite.priority) }}</mat-icon>
                  {{ favorite.priority | titlecase }} Priority
                </span>
              </div>

              <div class="favorite-tags" *ngIf="favorite.tags && favorite.tags.length > 0">
                <mat-chip-listbox>
                  <mat-chip *ngFor="let tag of favorite.tags">{{ tag }}</mat-chip>
                </mat-chip-listbox>
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
                <button mat-menu-item (click)="openTagsDialogForSingle(favorite)">
                  <mat-icon>label</mat-icon>
                  <span>Edit Tags</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item [matMenuTriggerFor]="priorityMenu">
                  <mat-icon>priority_high</mat-icon>
                  <span>Set Priority</span>
                </button>
                <button mat-menu-item (click)="toggleNotifications(favorite)">
                  <mat-icon>{{
                    favorite.notificationsEnabled ? 'notifications' : 'notifications_off'
                  }}</mat-icon>
                  <span>{{
                    favorite.notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'
                  }}</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="removeFavorite(favorite.ad._id)">
                  <mat-icon>delete</mat-icon>
                  <span>Remove from Favorites</span>
                </button>
              </mat-menu>

              <mat-menu #priorityMenu="matMenu">
                <button mat-menu-item (click)="updatePriority(favorite, 'high')">
                  <mat-icon>arrow_upward</mat-icon>
                  <span>High</span>
                </button>
                <button mat-menu-item (click)="updatePriority(favorite, 'normal')">
                  <mat-icon>remove</mat-icon>
                  <span>Normal</span>
                </button>
                <button mat-menu-item (click)="updatePriority(favorite, 'low')">
                  <mat-icon>arrow_downward</mat-icon>
                  <span>Low</span>
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
      .favorites-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .favorites-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .page-title {
        margin: 0;
        color: #333;
        font-size: 2rem;
      }

      .filters-container {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 20px;
        align-items: center;
      }

      .search-field {
        flex: 1;
        min-width: 250px;
      }

      .tags-filter {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .tags-label {
        font-weight: 500;
        color: #666;
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

      .favorite-card.priority-high {
        border-left: 4px solid #f44336;
      }

      .favorite-card.priority-normal {
        border-left: 4px solid #2196f3;
      }

      .favorite-card.priority-low {
        border-left: 4px solid #4caf50;
      }

      .favorite-header {
        display: flex;
        padding: 16px;
      }

      .favorite-select {
        display: flex;
        align-items: center;
        margin-right: 16px;
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
        margin-bottom: 8px;
      }

      .favorite-location,
      .favorite-price,
      .favorite-date,
      .favorite-priority {
        display: flex;
        align-items: center;
      }

      .favorite-priority.priority-high {
        color: #f44336;
      }

      .favorite-priority.priority-normal {
        color: #2196f3;
      }

      .favorite-priority.priority-low {
        color: #4caf50;
      }

      .favorite-details mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
        margin-right: 4px;
      }

      .favorite-tags {
        margin-top: 8px;
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
        color: #555;
        white-space: pre-line;
      }

      .notifications-toggle {
        margin-left: auto;
      }

      @media (max-width: 768px) {
        .favorite-header {
          flex-direction: column;
        }

        .favorite-image {
          width: 100%;
          height: 200px;
          margin-bottom: 16px;
        }

        .favorite-info {
          margin-left: 0;
        }

        .favorite-actions {
          margin-top: 16px;
          justify-content: flex-end;
          width: 100%;
        }
      }
    `,
  ],
})
export class FavoritesPageComponent implements OnInit {
  favorites: (Favorite & { selected?: boolean })[] = [];
  loading = true;
  error = false;
  userTags: FavoriteTag[] = [];
  selectedFavorites: string[] = [];
  filterOptions: FavoriteFilterOptions = {
    sort: 'newest',
  };
  selectedTagFilters: string[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private favoriteService: FavoriteService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.loadUserTags();

    // Set up search debounce
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilters());
  }

  /**
   * Load user's favorites with optional filters
   */
  loadFavorites(): void {
    this.loading = true;
    this.error = false;

    this.favoriteService.getFavorites(this.filterOptions).subscribe(
      favorites => {
        this.favorites = favorites.map(favorite => ({
          ...favorite,
          selected: false,
        }));
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
   * Load user's tags for filtering
   */
  loadUserTags(): void {
    this.favoriteService.getUserTags().subscribe(
      tags => {
        this.userTags = tags;
      },
      error => {
        console.error('Error loading tags:', error);
      }
    );
  }

  /**
   * Handle search input changes
   */
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  /**
   * Apply current filters and reload favorites
   */
  applyFilters(): void {
    // If tag filters are selected, add them to the filter options
    if (this.selectedTagFilters.length > 0) {
      this.filterOptions.tags = this.selectedTagFilters;
    } else {
      delete this.filterOptions.tags;
    }

    this.loadFavorites();
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.filterOptions = {
      sort: 'newest',
    };
    this.selectedTagFilters = [];
    this.loadFavorites();
  }

  /**
   * Check if any filters are currently applied
   */
  get isFiltered(): boolean {
    return (
      !!this.filterOptions.search ||
      !!this.filterOptions.category ||
      !!this.filterOptions.county ||
      !!this.filterOptions.city ||
      this.selectedTagFilters.length > 0 ||
      this.filterOptions.sort !== 'newest'
    );
  }

  /**
   * Update the selected favorites array when checkboxes change
   */
  updateSelectedFavorites(): void {
    this.selectedFavorites = this.favorites
      .filter(favorite => favorite.selected)
      .map(favorite => favorite.ad._id);
  }

  /**
   * Remove a single favorite
   */
  removeFavorite(adId: string): void {
    this.favoriteService.removeFavorite(adId).subscribe(
      () => {
        this.favorites = this.favorites.filter(favorite => favorite.ad._id !== adId);
        this.notificationService.success('Removed from favorites');
      },
      error => {
        console.error('Error removing favorite:', error);
        this.notificationService.error('Failed to remove from favorites');
      }
    );
  }

  /**
   * Remove multiple favorites in a batch operation
   */
  removeFavoritesBatch(): void {
    if (this.selectedFavorites.length === 0) return;

    this.favoriteService.removeFavoritesBatch(this.selectedFavorites).subscribe(
      result => {
        // Remove the favorites from the local array
        this.favorites = this.favorites.filter(
          favorite => !this.selectedFavorites.includes(favorite.ad._id)
        );
        this.selectedFavorites = [];
        this.notificationService.success(`Removed ${result.removed} items from favorites`);
      },
      error => {
        console.error('Error removing favorites batch:', error);
        this.notificationService.error('Failed to remove items from favorites');
      }
    );
  }

  /**
   * Open dialog to edit notes for a favorite
   */
  openNotesDialog(favorite: Favorite): void {
    this.dialogService
      .openNotesDialog({
        title: 'Edit Notes',
        notes: favorite.notes || '',
        maxLength: 500,
        placeholder: 'Add your personal notes about this ad...',
      })
      .subscribe(notes => {
        if (notes !== undefined) {
          this.favoriteService.updateNotes(favorite.ad._id, notes).subscribe(
            () => {
              // Update local state
              favorite.notes = notes;
              this.notificationService.success('Notes updated successfully');
            },
            error => {
              console.error('Error updating notes:', error);
              this.notificationService.error('Failed to update notes');
            }
          );
        }
      });
  }

  /**
   * Open dialog to edit tags for a single favorite
   */
  openTagsDialogForSingle(favorite: Favorite): void {
    // Implementation will be added
  }

  /**
   * Open dialog to add tags to multiple favorites
   */
  openTagsDialog(): void {
    // Implementation will be added
  }

  /**
   * Update priority for a single favorite
   */
  updatePriority(favorite: Favorite, priority: 'low' | 'normal' | 'high'): void {
    this.favoriteService.updatePriority(favorite.ad._id, priority).subscribe(
      () => {
        // Update local state
        favorite.priority = priority;
        this.notificationService.success(`Priority set to ${priority}`);
      },
      error => {
        console.error('Error updating priority:', error);
        this.notificationService.error('Failed to update priority');
      }
    );
  }

  /**
   * Set priority for multiple favorites in a batch operation
   */
  setPriorityBatch(priority: 'low' | 'normal' | 'high'): void {
    // Implementation will be added
  }

  /**
   * Toggle notifications for a favorite
   */
  toggleNotifications(favorite: Favorite): void {
    this.favoriteService.toggleNotifications(favorite.ad._id).subscribe(
      () => {
        // Update local state
        favorite.notificationsEnabled = !favorite.notificationsEnabled;
        this.notificationService.success(
          `Notifications ${favorite.notificationsEnabled ? 'enabled' : 'disabled'}`
        );
      },
      error => {
        console.error('Error toggling notifications:', error);
        this.notificationService.error('Failed to update notification settings');
      }
    );
  }

  /**
   * Handle favorite removal from the favorite button component
   */
  onFavoriteRemoved(removed: boolean, favorite: Favorite): void {
    if (removed) {
      this.favorites = this.favorites.filter(f => f._id !== favorite._id);
    }
  }

  /**
   * Get CSS class based on favorite priority
   */
  getPriorityClass(favorite: Favorite): string {
    return `priority-${favorite.priority || 'normal'}`;
  }

  /**
   * Get icon name based on priority
   */
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'arrow_upward';
      case 'low':
        return 'arrow_downward';
      default:
        return 'remove_circle_outline';
    }
  }
}
