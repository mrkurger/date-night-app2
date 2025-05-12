// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (favorites-list.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  NbSortComponent,
  NbSortHeaderComponent,
  NbSortEvent,
  NbDividerComponent,
} from '../../../shared/components/custom-nebular-components';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbDividerModule,
  NbMenuModule,
  NbInputModule,
  NbFormFieldModule,
  NbSpinnerModule,
  NbToggleModule,
  NbTooltipModule,
  NbDialogModule,
  NbDialog,
  NbSelectModule,
  NbTagModule,
  NbCheckboxModule,
} from '@nebular/theme';
import {
  FavoriteService,
  Favorite,
  FavoriteFilterOptions,
  FavoriteTag,
} from '../../../core/services/favorite.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FavoriteButtonComponent } from '../../../shared/components/favorite-button/favorite-button.component';
import { NotesDialogComponent } from '../../../shared/components/notes-dialog/notes-dialog.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbDividerModule,
    NbMenuModule,
    NbInputModule,
    NbFormFieldModule,
    NbSpinnerModule,
    NbToggleModule,
    NbTooltipModule,
    NbDialogModule,
    NbSelectModule,
    NbTagModule,
    NbCheckboxModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FavoriteButtonComponent,
    NbSortComponent,
    NbSortHeaderComponent,
    NbSortEvent,
    NbDividerComponent,
  ],
  template: `
    <div class="favorites-container">
      <div class="favorites-header">
        <h2 class="page-title">My Favorites</h2>

        <div class="favorites-actions" *ngIf="favorites && favorites.length > 0">
          <button
            mat-raised-button
            color="primary"
            [disabled]="selectedFavorites.length === 0"
            [nbContextMenu]="batchMenu"
          >
          </button>

          <nb-menu #batchMenu="matMenu">
            <button mat-menu-item (click)="removeFavoritesBatch()">
              <nb-icon icon="delete"></nb-icon>
              <span>Remove Selected</span>
            </button>
            <button mat-menu-item (click)="openTagsDialog()">
              <nb-icon icon="label"></nb-icon>
              <span>Add Tags to Selected</span>
            </button>
            <button mat-menu-item (click)="setPriorityBatch('high')">
              <nb-icon icon="priority_high"></nb-icon>
              <span>Set High Priority</span>
            </button>
            <button mat-menu-item (click)="setPriorityBatch('normal')">
              <nb-icon icon="remove_circle_outline"></nb-icon>
              <span>Set Normal Priority</span>
            </button>
            <button mat-menu-item (click)="setPriorityBatch('low')">
              <nb-icon icon="arrow_downward"></nb-icon>
              <span>Set Low Priority</span>
            </button>
          </nb-menu>
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
          <nb-icon matSuffix>search</nb-icon>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>NbSortEvent by</mat-label>
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
            <nb-tag-list multiple [(ngModel)]="selectedTagFilters" (change)="applyFilters()">
              <nb-tag-option *ngFor="let tag of userTags" [value]="tag.tag">
                {{ tag.tag }} ({{ tag.count }})
              </mat-chip-option>
            </nb-tag-list>
          </div>
        </div>

        <button mat-button color="primary" (click)="resetFilters()" *ngIf="isFiltered">
          <nb-icon icon="clear"></nb-icon>
          Clear Filters
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading your favorites...</p>
      </div>

      <div class="no-favorites" *ngIf="!loading && (!favorites || favorites.length === 0)">
        <nb-card>
          <nb-card-content>
            <nb-icon class="empty-icon">favorite_border</nb-icon>
            <h3>No favorites yet</h3>
            <p>Browse ads and click the heart icon to add them to your favorites.</p>
            <button mat-raised-button color="primary" routerLink="/ads">Browse Ads</button>
          </nb-card-body>
        </nb-card>
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
                  ? favorite.ad.images[0]
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
                  <nb-icon icon="location_on"></nb-icon>
                  {{ favorite.ad.location }}
                </span>

                <span class="favorite-price">
                  <nb-icon icon="attach_money"></nb-icon>
                  {{ favorite.ad.price | currency: 'NOK' : 'symbol' : '1.0-0' }}
                </span>

                <span class="favorite-date">
                  <nb-icon icon="event"></nb-icon>
                  Added {{ favorite.createdAt | date: 'mediumDate' }}
                </span>

                <span class="favorite-priority" [ngClass]="'priority-' + favorite.priority">
                  <nb-icon icon="{{ getPriorityIcon(favorite.priority) }}"></nb-icon>
                  {{ favorite.priority | titlecase }} Priority
                </span>
              </div>

              <div class="favorite-tags" *ngIf="favorite.tags && favorite.tags.length > 0">
                <nb-tag-list>
                  <nb-tag *ngFor="let tag of favorite.tags">{{ tag }}</nb-tag>
                </nb-tag-list>
              </div>
            </div>

            <div class="favorite-actions">
              <app-favorite-button
                [adId]="this.getAdIdAsString(favorite.ad._id)"
                (favoriteChanged)="onFavoriteRemoved($event, favorite)"
              ></app-favorite-button>

              <button mat-icon-button [nbContextMenu]="menu" nbTooltip="More options">
                <nb-icon icon="more_vert"></nb-icon>
              </button>

              <nb-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/ads', favorite.ad._id]">
                  <nb-icon icon="visibility"></nb-icon>
                  <span>View Ad</span>
                </button>
                <button mat-menu-item (click)="openNotesDialog(favorite)">
                  <nb-icon icon="note"></nb-icon>
                  <span>Edit Notes</span>
                </button>
                <button mat-menu-item (click)="openTagsDialogForSingle(favorite)">
                  <nb-icon icon="label"></nb-icon>
                  <span>Edit Tags</span>
                </button>
                <nb-divider></nb-divider>
                <button mat-menu-item [nbContextMenu]="priorityMenu">
                  <nb-icon icon="priority_high"></nb-icon>
                  <span>Set Priority</span>
                </button>
                <button mat-menu-item (click)="toggleNotifications(favorite)">
                  <nb-icon>{{
                    favorite.notificationsEnabled ? 'notifications' : 'notifications_off'
                  }}</nb-icon>
                  <span>{{
                    favorite.notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'
                  }}</span>
                </button>
                <nb-divider></nb-divider>
                <button
                  mat-menu-item
                  (click)="removeFavorite(this.getAdIdAsString(favorite.ad._id))"
                >
                  <nb-icon icon="delete"></nb-icon>
                  <span>Remove from Favorites</span>
                </button>
              </nb-menu>

              <nb-menu #priorityMenu="matMenu">
                <button mat-menu-item (click)="updatePriority(favorite, 'high')">
                  <nb-icon icon="arrow_upward"></nb-icon>
                  <span>High</span>
                </button>
                <button mat-menu-item (click)="updatePriority(favorite, 'normal')">
                  <nb-icon icon="remove"></nb-icon>
                  <span>Normal</span>
                </button>
                <button mat-menu-item (click)="updatePriority(favorite, 'low')">
                  <nb-icon icon="arrow_downward"></nb-icon>
                  <span>Low</span>
                </button>
              </nb-menu>
            </div>
          </div>

          <nb-divider *ngIf="favorite.notes"></nb-divider>

          <div class="favorite-notes" *ngIf="favorite.notes">
            <nb-icon icon="note"></nb-icon>
            <p>{{ favorite.notes }}</p>
          </div>

          <nb-card-actions>
            <button mat-button color="primary" [routerLink]="['/ads', favorite.ad._id]">
              <nb-icon icon="visibility"></nb-icon>
              View Ad
            </button>

            <button
              mat-button
              color="accent"
              [routerLink]="['/chat']"
              [queryParams]="{ userId: favorite.ad.userId }"
            >
              <nb-icon icon="chat"></nb-icon>
              Contact Advertiser
            </button>

            <mat-slide-toggle
              [checked]="favorite.notificationsEnabled"
              (change)="toggleNotifications(favorite)"
              color="primary"
              class="notifications-toggle"
            >
              Notifications
            </nb-toggle>
          </nb-card-footer>
        </nb-card>
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
        color: #333;
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
export class FavoritesListComponent implements OnInit {
  favorites: Favorite[] = [];
  loading = false;
  userTags: FavoriteTag[] = [];
  selectedTagFilters: string[] = [];
  selectedFavorites: (string | { city: string; county: string })[] = [];

  filterOptions: FavoriteFilterOptions = {
    sort: 'newest',
    search: '',
  };

  private searchSubject = new Subject<string>();

  /**
   * Convert ad ID to string regardless of its type
   */
  getAdIdAsString(adId: string | { city: string; county: string }): string {
    return typeof adId === 'string' ? adId : JSON.stringify(adId);
  }

  get isFiltered(): boolean {
    return (
      !!this.filterOptions.search ||
      !!this.filterOptions.category ||
      !!this.filterOptions.county ||
      !!this.filterOptions.city ||
      this.selectedTagFilters.length > 0
    );
  }

  constructor(
    private favoriteService: FavoriteService,
    private notificationService: NotificationService,
    private dialog: NbDialogService,
  ) {
    // Set up debounced search
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadFavorites();
    this.loadUserTags();
  }

  loadFavorites(): void {
    this.loading = true;

    this.favoriteService.getFavorites(this.filterOptions).subscribe({
      next: (favorites) => {
        this.favorites = favorites.map((favorite) => ({
          ...favorite,
          selected: false,
        }));
        this.loading = false;
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to load favorites');
        this.loading = false;
      },
    });
  }

  loadUserTags(): void {
    this.favoriteService.getUserTags().subscribe({
      next: (tags) => {
        this.userTags = tags;
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to load tags');
      },
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterOptions.search = value;
    this.searchSubject.next(value);
  }

  applyFilters(): void {
    this.loadFavorites();
  }

  resetFilters(): void {
    this.filterOptions = {
      sort: 'newest',
    };
    this.selectedTagFilters = [];
    this.applyFilters();
  }

  removeFavorite(adId: string): void {
    this.favoriteService.removeFavorite(adId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter((favorite) => favorite.ad._id !== adId);
        this.notificationService.success('Removed from favorites');
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to remove from favorites');
      },
    });
  }

  removeFavoritesBatch(): void {
    if (this.selectedFavorites.length === 0) return;

    const adIds = this.selectedFavorites;

    this.favoriteService.removeFavoritesBatch(adIds).subscribe({
      next: (result) => {
        this.favorites = this.favorites.filter(
          (favorite) => !adIds.includes(this.getAdIdAsString(favorite.ad._id)),
        );
        this.selectedFavorites = [];
        this.notificationService.success(`Removed ${result.removed} items from favorites`);
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to remove selected favorites');
      },
    });
  }

  toggleNotifications(favorite: Favorite): void {
    this.favoriteService.toggleNotifications(this.getAdIdAsString(favorite.ad._id)).subscribe({
      next: (response) => {
        favorite.notificationsEnabled = response.notificationsEnabled;
        this.notificationService.success(
          `Notifications ${favorite.notificationsEnabled ? 'enabled' : 'disabled'} for this favorite`,
        );
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to update notification settings');
      },
    });
  }

  openNotesDialog(favorite: Favorite): void {
    const dialogRef = this.dialog.open(NotesDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Notes',
        notes: favorite.notes || '',
        maxLength: 500,
        placeholder: 'Add personal notes about this ad...',
      },
    });

    dialogRef.onClose.subscribe((result) => {
      if (result !== undefined) {
        this.updateNotes(favorite, result);
      }
    });
  }

  openTagsDialogForSingle(favorite: Favorite): void {
    const dialogRef = this.dialog.open(NotesDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Tags',
        notes: favorite.tags ? favorite.tags.join(', ') : '',
        maxLength: 200,
        placeholder: 'Add tags separated by commas (e.g., vacation, summer, beach)',
      },
    });

    dialogRef.onClose.subscribe((result) => {
      if (result !== undefined) {
        const tags = result
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);

        this.updateTags(favorite, tags);
      }
    });
  }

  openTagsDialog(): void {
    if (this.selectedFavorites.length === 0) return;

    const dialogRef = this.dialog.open(NotesDialogComponent, {
      width: '500px',
      data: {
        title: 'Add Tags to Selected Favorites',
        notes: '',
        maxLength: 200,
        placeholder: 'Add tags separated by commas (e.g., vacation, summer, beach)',
      },
    });

    dialogRef.onClose.subscribe((result) => {
      if (result !== undefined) {
        const tags = result
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);

        this.updateTagsBatch(tags);
      }
    });
  }

  updateNotes(favorite: Favorite, notes: string): void {
    this.favoriteService.updateNotes(this.getAdIdAsString(favorite.ad._id), notes).subscribe({
      next: () => {
        favorite.notes = notes;
        this.notificationService.success('Notes updated');
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to update notes');
      },
    });
  }

  updateTags(favorite: Favorite, tags: string[]): void {
    this.favoriteService.updateTags(this.getAdIdAsString(favorite.ad._id), tags).subscribe({
      next: (response) => {
        favorite.tags = tags;
        this.notificationService.success('Tags updated');
        this.loadUserTags(); // Refresh tag list
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to update tags');
      },
    });
  }

  updateTagsBatch(tags: string[]): void {
    if (this.selectedFavorites.length === 0) return;

    // Update each selected favorite one by one
    let completed = 0;
    let failed = 0;

    this.selectedFavorites.forEach((adId) => {
      this.favoriteService.updateTags(adId, tags).subscribe({
        next: () => {
          completed++;

          // Find and update the favorite in the list
          const favorite = this.favorites.find((f) => this.getAdIdAsString(f.ad._id) === adId);
          if (favorite) {
            favorite.tags = [...tags];
          }

          // When all operations are complete
          if (completed + failed === this.selectedFavorites.length) {
            this.notificationService.success(`Updated tags for ${completed} favorites`);
            if (failed > 0) {
              this.notificationService.error(`Failed to update tags for ${failed} favorites`);
            }
            this.loadUserTags(); // Refresh tag list
          }
        },
        error: () => {
          failed++;

          // When all operations are complete
          if (completed + failed === this.selectedFavorites.length) {
            this.notificationService.success(`Updated tags for ${completed} favorites`);
            if (failed > 0) {
              this.notificationService.error(`Failed to update tags for ${failed} favorites`);
            }
          }
        },
      });
    });
  }

  updatePriority(favorite: Favorite, priority: 'low' | 'normal' | 'high'): void {
    this.favoriteService.updatePriority(this.getAdIdAsString(favorite.ad._id), priority).subscribe({
      next: (response) => {
        favorite.priority = priority;
        this.notificationService.success(`Priority set to ${priority}`);
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to update priority');
      },
    });
  }

  setPriorityBatch(priority: 'low' | 'normal' | 'high'): void {
    if (this.selectedFavorites.length === 0) return;

    // Update each selected favorite one by one
    let completed = 0;
    let failed = 0;

    this.selectedFavorites.forEach((adId) => {
      this.favoriteService.updatePriority(adId, priority).subscribe({
        next: () => {
          completed++;

          // Find and update the favorite in the list
          const favorite = this.favorites.find((f) => this.getAdIdAsString(f.ad._id) === adId);
          if (favorite) {
            favorite.priority = priority;
          }

          // When all operations are complete
          if (completed + failed === this.selectedFavorites.length) {
            this.notificationService.success(`Updated priority for ${completed} favorites`);
            if (failed > 0) {
              this.notificationService.error(`Failed to update priority for ${failed} favorites`);
            }
          }
        },
        error: () => {
          failed++;

          // When all operations are complete
          if (completed + failed === this.selectedFavorites.length) {
            this.notificationService.success(`Updated priority for ${completed} favorites`);
            if (failed > 0) {
              this.notificationService.error(`Failed to update priority for ${failed} favorites`);
            }
          }
        },
      });
    });
  }

  onFavoriteRemoved(isFavorite: boolean, favorite: Favorite): void {
    if (!isFavorite) {
      this.favorites = this.favorites.filter((f) => f.ad._id !== favorite.ad._id);
      this.updateSelectedFavorites();
    }
  }

  updateSelectedFavorites(): void {
    this.selectedFavorites = this.favorites
      .filter((favorite) => favorite.selected)
      .map((favorite) =>
        typeof favorite.ad === 'string' ? favorite.ad : this.getAdIdAsString(favorite.ad._id),
      );
  }

  getPriorityClass(favorite: Favorite): string {
    return `priority-${favorite.priority}`;
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'arrow_upward';
      case 'low':
        return 'arrow_downward';
      default:
        return 'remove';
    }
  }
}
