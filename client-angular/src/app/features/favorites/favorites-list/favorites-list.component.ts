import {
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import { FavoriteButtonComponent } from '../../../shared/components/favorite-button/favorite-button.component';
import { NotesDialogComponent } from '../../../shared/components/notes-dialog/notes-dialog.component';
import { Subject } from 'rxjs';
import { NbDialogService, NbMenuItem } from '@nebular/theme';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
  FavoriteService,
  Favorite,
  FavoriteFilterOptions,
  FavoriteTag,';
} from '../../../core/services/favorite.service';

// Import NebularModule directly for standalone components if not already present
import { NebularModule } from '../../../../app/shared/nebular.module'; // Ensure this path is correct and module exports necessary Nebular components

@Component({';
  selector: 'app-favorites-list',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [;
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NebularModule, // Ensure NebularModule is imported here
    // FavoriteButtonComponent is imported but not used in the template
    // FavoriteButtonComponent,
  ],
  template: `;`
    ;
      ;
        My Favorites;

         0">;
          ;
            Batch Actions ({{ selectedFavorites.length }})
            ;
          ;
        ;
      ;

       0">;
        ;
          ;
          ;
        ;

        ;
          ;
            Newest first;
            Oldest first;
            Price: Low to High;
            Price: High to Low;
            Title: A to Z;
            Title: Z to A;
            Priority: High to Low;
            Priority: Low to High;
          ;
        ;

         0">;
          Filter by tag:;
          ;
            ;
            ;
          ;
        ;

        ;
          ;
          Clear Filters;
        ;
      ;

      ;
        ;
        Loading your favorites...;
      ;

      ;
        ;
          ;
            ;
            No favorites yet;
            Browse ads and click the heart icon to add them to your favorites.;
            Browse Ads;
          ;
        ;
      ;

       0">;
        ;
          ;
            ;
              ;
                ;
              ;

              ;
                 0;
                      ? favorite.ad.images[0]
                      : 'assets/images/placeholder.jpg';
                  ";
                  [alt]="favorite.ad.title";
                />;
              ;

              ;
                ;
                  {{ favorite.ad.title }}
                ;

                ;
                  ;
                    {{ favorite.priority | titlecase }} Priority;
                  ;

                  ;
                    Added {{ favorite.dateAdded || favorite.createdAt | date }}
                  ;

                  ;
                    Notifications On;
                  ;
                ;

                 0">;
                  ;
                    ;
                      {{ tag }}
                    ;
                  ;
                ;

                ;
                  {{ favorite.notes }}
                ;
              ;

              ;
                ;
                  ;
                ;
              ;
            ;
          ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      :host {
        display: block;
        padding: var(--padding)
      }

      .favorites-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .favorites-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--margin)
      }

      .page-title {
        margin: 0;
        color: var(--text-basic-color)
      }

      .filters-container {
        background-color: var(--card-background-color)
        border-radius: var(--card-border-radius)
        padding: var(--card-padding)
        margin-bottom: var(--margin)
        box-shadow: var(--shadow)

        nb-form-field {
          margin-bottom: var(--margin)
        }
      }

      .tags-filter {
        margin-bottom: var(--margin)

        .tags-label {
          margin-bottom: var(--spacing)
          color: var(--text-hint-color)
        }
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--padding)
        color: var(--text-hint-color)

        nb-spinner {
          margin-bottom: var(--spacing)
        }
      }

      .no-favorites {
        text-align: center;
        color: var(--text-hint-color)

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing)
        }

        h3 {
          margin: 0 0 var(--spacing)
          color: var(--text-basic-color)
        }

        p {
          margin: 0 0 var(--margin)
        }
      }

      .favorites-list {
        display: grid;
        gap: var(--margin)
      }

      nb-card {
        margin: 0;

        &.priority-high {
          border-left: 4px solid var(--color-danger-default)
        }

        &.priority-normal {
          border-left: 4px solid var(--color-warning-default)
        }

        &.priority-low {
          border-left: 4px solid var(--color-success-default)
        }
      }

      .favorite-header {
        display: flex;
        gap: var(--spacing)
        align-items: flex-start;
      }

      .favorite-image {
        width: 120px;
        height: 120px;
        border-radius: var(--border-radius)
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
          margin: 0 0 var(--spacing)
          font-size: var(--text-heading-6-font-size)

          a {
            color: var(--text-basic-color)
            text-decoration: none;

            &:hover {
              color: var(--color-primary-hover)
            }
          }
        }
      }

      .favorite-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs)
        margin-bottom: var(--spacing)
      }

      .favorite-tags {
        margin-bottom: var(--spacing)
      }

      .favorite-notes {
        margin: 0;
        color: var(--text-hint-color)
        font-style: italic;
      }

      .favorite-actions {
        margin-left: auto;
      }
    `,`
  ],
})
export class FavoritesListComponen {t implements OnInit {
  favorites: Favorite[] = []
  loading = false;
  userTags: FavoriteTag[] = []
  selectedTagFilters: string[] = []
  selectedFavorites: (string | { city: string; county: string })[] = []

  filterOptions: FavoriteFilterOptions = {
    sort: 'newest',
    search: '',
  }

  private searchSubject = new Subject()

  /**
   * Convert ad ID to string regardless of its type;
   */
  getAdIdAsString(adId: any): string {
    if (!adId) return '';
    if (typeof adId === 'string') return adId;
    if (adId._id) return adId._id;
    return JSON.stringify(adId)
  }

  get isFiltered(): boolean {
    return (;
      !!this.filterOptions.search ||;
      !!this.filterOptions.category ||;
      !!this.filterOptions.county ||;
      !!this.filterOptions.city ||;
      this.selectedTagFilters.length > 0;
    )
  }

  // Batch actions menu items
  batchActions: NbMenuItem[] = [;
    { title: 'Add Tags', icon: 'tag-outline', data: { action: 'addTags' } },
    { title: 'Remove Tags', icon: 'close-circle-outline', data: { action: 'removeTags' } },
    { title: 'Delete Selected', icon: 'trash-2-outline', data: { action: 'delete' } },
  ]

  constructor(;
    private favoriteService: FavoriteService,
    private notificationService: NotificationService,
    private dialog: NbDialogService,
  ) {
    // Set up debounced search
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.applyFilters()
    })
  }

  ngOnInit(): void {
    this.loadFavorites()
    this.loadUserTags()
  }

  loadFavorites(): void {
    this.loading = true;

    this.favoriteService.getFavorites(this.filterOptions).subscribe({
      next: (favorites) => {
        this.favorites = favorites.map((favorite) => ({
          ...favorite,
          selected: false,
        }))
        this.loading = false;
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to load favorites')
        this.loading = false;
      },
    })
  }

  loadUserTags(): void {
    this.favoriteService.getUserTags().subscribe({
      next: (tags) => {
        this.userTags = tags;
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to load tags')
      },
    })
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterOptions.search = value;
    this.searchSubject.next(value)
  }

  applyFilters(): void {
    this.loadFavorites()
  }

  resetFilters(): void {
    this.filterOptions = {
      sort: 'newest',
    }
    this.selectedTagFilters = []
    this.applyFilters()
  }

  removeFavorite(adId: string): void {
    this.favoriteService.removeFavorite(adId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter((favorite) => favorite.ad._id !== adId)
        this.notificationService.success('Removed from favorites')
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to remove from favorites')
      },
    })
  }

  removeFavoritesBatch(): void {
    if (this.selectedFavorites.length === 0) return;

    const adIds = this.selectedFavorites;

    this.favoriteService.removeFavoritesBatch(adIds).subscribe({
      next: (result) => {
        this.favorites = this.favorites.filter(;
          (favorite) => !adIds.includes(this.getAdIdAsString(favorite.ad._id)),
        )
        this.selectedFavorites = []
        this.notificationService.success(`Removed ${result.removed} items from favorites`)`
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to remove selected favorites')
      },
    })
  }

  toggleNotifications(favorite: Favorite): void {
    this.favoriteService.toggleNotifications(this.getAdIdAsString(favorite.ad._id)).subscribe({
      next: (response) => {
        favorite.notificationsEnabled = response.notificationsEnabled;
        this.notificationService.success(;
          `Notifications ${favorite.notificationsEnabled ? 'enabled' : 'disabled'} for this favorite`,`
        )
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to update notification settings')
      },
    })
  }

  openNotesDialog(favorite: Favorite): void {
    // const dialogRef = this.dialog.open(NotesDialogComponent, {
    //   context: {
    //     title: `Notes for ${favorite.ad.title}`,`
    //     notes: favorite.notes,
    //     maxLength: 500,
    //     placeholder: 'Enter your notes here...',
    //   },
    //   hasBackdrop: true,
    //   closeOnBackdropClick: true,
    // })
    // dialogRef, : .onClose.subscribe((result) => {
    //   if (result) {
    //     this.updateNotes(favorite,_result))
    //   }
    // })
  }

  openTagsDialogForSingle(favorite: Favorite): void {
    // const dialogRef = this.dialog.open(NotesDialogComponent, {
    //   context: {
    //     title: `Tags for ${favorite.ad.title}`,`
    //     notes: favorite.tags ? favorite.tags.join(', ') : '',
    //     maxLength: 200,
    //     placeholder: 'Enter tags, comma-separated...',
    //     isTagsInput: true,
    //   },
    //   hasBackdrop: true,
    //   closeOnBackdropClick: true,
    // })
    // dialogRef.onClose.subscribe((result) => {
    //   if (result && typeof result === 'string') {
    //     const tags = result.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '')
    //     this.updateTags(favorite, tags)
    //   }
    // })
  }

  openTagsDialog(): void {
    // if (this.selectedFavorites.length === 0) return;
    // const initialTags = this.favorites
    //   .filter((fav) => this.selectedFavorites.includes(this.getAdIdAsString(fav.ad)))
    //   .reduce((acc, fav) => {
    //     if (fav.tags) {
    //       fav.tags.forEach((tag) => acc.add(tag))
    //     }
    //     return acc;
    //   }, new Set())
    // const dialogRef = this.dialog.open(NotesDialogComponent, {
    //   context: {
    //     title: `Edit Tags for ${this.selectedFavorites.length} Favorites`,`
    //     notes: Array.from(initialTags).join(', '),
    //     maxLength: 200,
    //     placeholder: 'Enter tags, comma-separated...',
    //     isTagsInput: true,
    //   },
    //   hasBackdrop: true,
    //   closeOnBackdropClick: true,
    // })
    // dialogRef.onClose.subscribe((result) => {
    //   if (result && typeof result === 'string') {
    //     const tags = result.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '')
    //     this.updateTagsBatch(tags)
    //   }
    // })
  }

  updateNotes(favorite: Favorite, notes: string): void {
    // this.favoriteService.updateNotes(this.getAdIdAsString(favorite.ad._id), notes).subscribe({
    //   next: () => {
    //     favorite.notes = notes;
    //     this.notificationService.success('Notes updated')
    //   },
    //   error: () => {
    //     this.notificationService.error('Failed to update notes')
    //   },
    // })
  }

  updateTags(favorite: Favorite, tags: string[]): void {
    // this.favoriteService.updateTags(this.getAdIdAsString(favorite.ad._id), tags).subscribe({
    //   next: () => {
    //     favorite.tags = tags;
    //     this.notificationService.success('Tags updated')
    //     this.loadUserTags() // Refresh tag list
    //   },
    //   error: () => {
    //     this.notificationService.error('Failed to update tags')
    //   },
    // })
  }

  updateTagsBatch(tags: string[]): void {
    // if (this.selectedFavorites.length === 0) return;
    // const adIds = this.selectedFavorites.map(adId => this.getAdIdAsString(adId))
    // let completed = 0;
    // let failed = 0;
    // adIds.forEach((adId) => {
    //   this.favoriteService.updateTags(adId, tags).subscribe({
    //     next: () => {
    //       completed++;
    //       const favorite = this.favorites.find((f) => this.getAdIdAsString(f.ad._id) === adId)
    //       if (favorite) {
    //         favorite.tags = [...tags]
    //       }
    //       if (completed + failed === adIds.length) {
    //         this.notificationService.success(`Updated tags for ${completed} favorites`)`
    //         if (failed > 0) {
    //           this.notificationService.error(`Failed to update tags for ${failed} favorites`)`
    //         }
    //         this.loadUserTags() // Refresh tag list
    //       }
    //     },
    //     error: () => {
    //       failed++;
    //       if (completed + failed === adIds.length) {
    //         this.notificationService.success(`Updated tags for ${completed} favorites`)`
    //         if (failed > 0) {
    //           this.notificationService.error(`Failed to update tags for ${failed} favorites`)`
    //         }
    //       }
    //     },
    //   })
    // })
  }

  updatePriority(favorite: Favorite, priority: 'low' | 'normal' | 'high'): void {
    // this.favoriteService.updatePriority(this.getAdIdAsString(favorite.ad._id), priority).subscribe({
    //   next: () => {
    //     favorite.priority = priority;
    //     this.notificationService.success(`Priority set to ${priority}`)`
    //   },
    //   error: () => {
    //     this.notificationService.error('Failed to update priority')
    //   },
    // })
  }

  setPriorityBatch(priority: 'low' | 'normal' | 'high'): void {
    // if (this.selectedFavorites.length === 0) return;
    // const adIds = this.selectedFavorites.map(adId => this.getAdIdAsString(adId))
    // let completed = 0;
    // let failed = 0;
    // adIds.forEach((adId) => {
    //   this.favoriteService.updatePriority(adId, priority).subscribe({
    //     next: () => {
    //       completed++;
    //       const favorite = this.favorites.find((f) => this.getAdIdAsString(f.ad._id) === adId)
    //       if (favorite) {
    //         favorite.priority = priority;
    //       }
    //       if (completed + failed === adIds.length) {
    //         this.notificationService.success(`Updated priority for ${completed} favorites`)`
    //         if (failed > 0) {
    //           this.notificationService.error(`Failed to update priority for ${failed} favorites`)`
    //         }
    //       }
    //     },
    //     error: () => {
    //       failed++;
    //       if (completed + failed === adIds.length) {
    //         this.notificationService.success(`Updated priority for ${completed} favorites`)`
    //         if (failed > 0) {
    //           this.notificationService.error(`Failed to update priority for ${failed} favorites`)`
    //         }
    //       }
    //     },
    //   })
    // })
  }

  onFavoriteRemoved(isFavorite: boolean, favorite: Favorite): void {
    // if (!isFavorite) {
    //   this.favorites = this.favorites.filter((f) => f.ad._id !== favorite.ad._id)
    //   this.selectedFavorites = this.selectedFavorites.filter(
    //     (id) => id !== this.getAdIdAsString(favorite.ad)
    //   )
    // }
  }

  updateSelectedFavorites(): void {
    // this.selectedFavorites = this.favorites
    //   .filter((fav) => fav.selected)
    //   .map((fav) =>
    //     typeof fav.ad === 'string' ? fav.ad : this.getAdIdAsString(fav.ad._id)
    //   )
  }

  getPriorityClass(favorite: Favorite): string {
    // switch (favorite.priority) {
    //   case 'high': return 'priority-high';
    //   case 'normal': return 'priority-normal';
    //   case 'low': return 'priority-low';
    //   default: return 'priority-normal';
    // }
    return ''; // Placeholder
  }

  getPriorityIcon(priority: string): string {
    // switch (priority) {
    //   case 'high': return 'arrow-up-outline';
    //   case 'normal': return 'minus-outline';
    //   case 'low': return 'arrow-down-outline';
    //   default: return 'minus-outline';
    // }
    return ''; // Placeholder
  }

  toggleTagFilter(tag: string): void {
    // if (this.selectedTagFilters.includes(tag)) {
    //   this.selectedTagFilters = this.selectedTagFilters.filter((t) => t !== tag)
    // } else {
    //   this.selectedTagFilters.push(tag)
    // }
    // this.applyFilters()
  }
}
