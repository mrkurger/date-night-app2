import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { NbDialogService, NbMenuItem } from '@nebular/theme';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Import NebularModule directly for standalone components if not already present
import { NebularModule } from '../../../shared/nebular.module'; // Ensure this path is correct and module exports necessary Nebular components

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NebularModule, // Ensure NebularModule is imported here
    // FavoriteButtonComponent is imported but not used in the template
    // FavoriteButtonComponent,
  ],
  template: `
    <div class="favorites-container">
      <div class="favorites-header">
        <h2 class="page-title">My Favorites</h2>

        <div class="favorites-actions" *ngIf="favorites && favorites.length > 0">
          <button
            nbButton
            status="primary"
            [disabled]="selectedFavorites.length === 0"
            [nbContextMenu]="batchActions"
            nbContextMenuTag="batch-menu"
          >
            Batch Actions ({{ selectedFavorites.length }})
            <nb-icon icon="chevron-down-outline"></nb-icon>
          </button>
        </div>
      </div>

      <div class="filters-container" *ngIf="favorites && favorites.length > 0">
        <nb-form-field>
          <nb-icon nbPrefix icon="search-outline"></nb-icon>
          <input
            nbInput
            fullWidth
            [(ngModel)]="filterOptions.search"
            (input)="onSearchChange($event)"
            placeholder="Search by title, description, or notes"
          />
        </nb-form-field>

        <nb-form-field>
          <nb-select
            fullWidth
            [(ngModel)]="filterOptions.sort"
            (selectedChange)="applyFilters()"
            placeholder="Sort by"
          >
            <nb-option value="newest">Newest first</nb-option>
            <nb-option value="oldest">Oldest first</nb-option>
            <nb-option value="price-asc">Price: Low to High</nb-option>
            <nb-option value="price-desc">Price: High to Low</nb-option>
            <nb-option value="title-asc">Title: A to Z</nb-option>
            <nb-option value="title-desc">Title: Z to A</nb-option>
            <nb-option value="priority-high">Priority: High to Low</nb-option>
            <nb-option value="priority-low">Priority: Low to High</nb-option>
          </nb-select>
        </nb-form-field>

        <div class="tags-filter" *ngIf="userTags && userTags.length > 0">
          <div class="tags-label">Filter by tag:</div>
          <nb-tag-list>
            <nb-tag
              *ngFor="let tag of userTags"
              [text]="tag.tag + ' (' + tag.count + ')'"
              [selected]="selectedTagFilters.includes(tag.tag)"
              (click)="toggleTagFilter(tag.tag)"
              appearance="outline"
              status="basic"
            >
            </nb-tag>
          </nb-tag-list>
        </div>

        <button nbButton ghost (click)="resetFilters()" *ngIf="isFiltered">
          <nb-icon icon="close-outline"></nb-icon>
          Clear Filters
        </button>
      </div>

      <div class="loading-container" *ngIf="loading">
        <nb-spinner size="large"></nb-spinner>
        <p>Loading your favorites...</p>
      </div>

      <div class="no-favorites" *ngIf="!loading && (!favorites || favorites.length === 0)">
        <nb-card>
          <nb-card-body>
            <nb-icon icon="heart-outline" class="empty-icon"></nb-icon>
            <h3>No favorites yet</h3>
            <p>Browse ads and click the heart icon to add them to your favorites.</p>
            <button nbButton status="primary" routerLink="/ads">Browse Ads</button>
          </nb-card-body>
        </nb-card>
      </div>

      <div class="favorites-list" *ngIf="!loading && favorites && favorites.length > 0">
        <nb-card *ngFor="let favorite of favorites" [ngClass]="getPriorityClass(favorite)">
          <nb-card-body>
            <div class="favorite-header">
              <div class="favorite-select">
                <nb-checkbox
                  [(ngModel)]="favorite.selected"
                  (ngModelChange)="updateSelectedFavorites()"
                  status="primary"
                ></nb-checkbox>
              </div>

              <div class="favorite-image">
                <img
                  [src]="
                    favorite.ad.images && favorite.ad.images.length > 0
                      ? favorite.ad.images[0]
                      : 'assets/images/placeholder.jpg'
                  "
                  [alt]="favorite.ad.title"
                />
              </div>

              <div class="favorite-info">
                <h3>
                  <a [routerLink]="['/ads', favorite.ad._id]">{{ favorite.ad.title }}</a>
                </h3>

                <div class="favorite-meta">
                  <nb-tag
                    [status]="getPriorityClass(favorite)"
                    [icon]="getPriorityIcon(favorite.priority)"
                  >
                    {{ favorite.priority | titlecase }} Priority
                  </nb-tag>

                  <nb-tag status="basic" icon="calendar-outline">
                    Added {{ favorite.dateAdded || favorite.createdAt | date }}
                  </nb-tag>

                  <nb-tag
                    *ngIf="favorite.notificationsEnabled"
                    status="success"
                    icon="bell-outline"
                  >
                    Notifications On
                  </nb-tag>
                </div>

                <div class="favorite-tags" *ngIf="favorite.tags && favorite.tags.length > 0">
                  <nb-tag-list>
                    <nb-tag
                      *ngFor="let tag of favorite.tags"
                      status="basic"
                      appearance="outline"
                      size="tiny"
                    >
                      {{ tag }}
                    </nb-tag>
                  </nb-tag-list>
                </div>

                <p class="favorite-notes" *ngIf="favorite.notes">
                  {{ favorite.notes }}
                </p>
              </div>

              <div class="favorite-actions">
                <button
                  nbButton
                  ghost
                  size="small"
                  [nbContextMenu]="[
                    {
                      title: 'View Details',
                      icon: 'eye-outline',
                      link: '/ads/' + this.getAdIdAsString(favorite.ad),
                    },
                    {
                      title: 'Edit Notes',
                      icon: 'edit-outline',
                      data: favorite,
                    },
                    {
                      title: 'Manage Tags',
                      icon: 'bookmark-outline',
                      data: favorite,
                    },
                    {
                      title: 'Set Priority',
                      icon: 'arrow-up-outline',
                      children: [
                        {
                          title: 'High',
                          icon: 'arrow-up-outline',
                          data: { favorite, priority: 'high' },
                        },
                        {
                          title: 'Normal',
                          icon: 'minus-outline',
                          data: { favorite, priority: 'normal' },
                        },
                        {
                          title: 'Low',
                          icon: 'arrow-down-outline',
                          data: { favorite, priority: 'low' },
                        },
                      ],
                    },
                    {
                      title: favorite.notificationsEnabled
                        ? 'Disable Notifications'
                        : 'Enable Notifications',
                      icon: favorite.notificationsEnabled ? 'bell-off-outline' : 'bell-outline',
                      data: favorite,
                    },
                    {
                      title: 'Remove',
                      icon: 'trash-2-outline',
                      data: favorite,
                    },
                  ]"
                  nbContextMenuTag="favorite-menu"
                >
                  <nb-icon icon="more-vertical-outline"></nb-icon>
                </button>
              </div>
            </div>
          </nb-card-body>
        </nb-card>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: var(--padding);
      }

      .favorites-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .favorites-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--margin);
      }

      .page-title {
        margin: 0;
        color: var(--text-basic-color);
      }

      .filters-container {
        background-color: var(--card-background-color);
        border-radius: var(--card-border-radius);
        padding: var(--card-padding);
        margin-bottom: var(--margin);
        box-shadow: var(--shadow);

        nb-form-field {
          margin-bottom: var(--margin);
        }
      }

      .tags-filter {
        margin-bottom: var(--margin);

        .tags-label {
          margin-bottom: var(--spacing);
          color: var(--text-hint-color);
        }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--padding);
        color: var(--text-hint-color);

        nb-spinner {
          margin-bottom: var(--spacing);
        }
      }

      .no-favorites {
        text-align: center;
        color: var(--text-hint-color);

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing);
        }

        h3 {
          margin: 0 0 var(--spacing);
          color: var(--text-basic-color);
        }

        p {
          margin: 0 0 var(--margin);
        }
      }

      .favorites-list {
        display: grid;
        gap: var(--margin);
      }

      nb-card {
        margin: 0;

        &.priority-high {
          border-left: 4px solid var(--color-danger-default);
        }

        &.priority-normal {
          border-left: 4px solid var(--color-warning-default);
        }

        &.priority-low {
          border-left: 4px solid var(--color-success-default);
        }
      }

      .favorite-header {
        display: flex;
        gap: var(--spacing);
        align-items: flex-start;
      }

      .favorite-image {
        width: 120px;
        height: 120px;
        border-radius: var(--border-radius);
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .favorite-info {
        flex: 1;

        h3 {
          margin: 0 0 var(--spacing);
          font-size: var(--text-heading-6-font-size);

          a {
            color: var(--text-basic-color);
            text-decoration: none;

            &:hover {
              color: var(--color-primary-hover);
            }
          }
        }
      }

      .favorite-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing);
      }

      .favorite-tags {
        margin-bottom: var(--spacing);
      }

      .favorite-notes {
        margin: 0;
        color: var(--text-hint-color);
        font-style: italic;
      }

      .favorite-actions {
        margin-left: auto;
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
  getAdIdAsString(adId: any): string {
    if (!adId) return '';
    if (typeof adId === 'string') return adId;
    if (adId._id) return adId._id;
    return JSON.stringify(adId);
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

  // Batch actions menu items
  batchActions: NbMenuItem[] = [
    { title: 'Add Tags', icon: 'tag-outline', data: { action: 'addTags' } },
    { title: 'Remove Tags', icon: 'close-circle-outline', data: { action: 'removeTags' } },
    { title: 'Delete Selected', icon: 'trash-2-outline', data: { action: 'delete' } },
  ];

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
      context: {
        data: {
          title: 'Edit Notes',
          notes: favorite.notes || '',
          maxLength: 500,
          placeholder: 'Add personal notes about this ad...',
        },
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
      context: {
        data: {
          title: 'Edit Tags',
          notes: favorite.tags ? favorite.tags.join(', ') : '',
          maxLength: 200,
          placeholder: 'Add tags separated by commas (e.g., vacation, summer, beach)',
        },
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
      context: {
        data: {
          title: 'Add Tags to Selected Favorites',
          notes: '',
          maxLength: 200,
          placeholder: 'Add tags separated by commas (e.g., vacation, summer, beach)',
        },
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

  toggleTagFilter(tag: string): void {
    if (this.selectedTagFilters.includes(tag)) {
      this.selectedTagFilters = this.selectedTagFilters.filter((t) => t !== tag);
    } else {
      this.selectedTagFilters.push(tag);
    }
    this.applyFilters();
  }
}
