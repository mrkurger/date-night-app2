import { Input, OnInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (favorites-page.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { firstValueFrom } from 'rxjs';
import { AppSortComponent } from '../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { AppSortHeaderComponent } from '../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { AppSortEvent } from '../../../shared/components/custom-nebular-components/nb-sort/nb-sort.module';

// Import NebularModule directly for standalone components
import { NebularModule } from '../../../shared/nebular.module';

/**
 * Interface for saved filter presets
 */
interface FilterPreset {
  name: string;
  filters: FavoriteFilterOptions;
  dateFrom: Date | null;
  dateTo: Date | null;
  selectedTagFilters: string[];
}

/**
 * Enhanced favorites page component with filtering, sorting, and batch operations
 */
@Component({
  selector: 'app-favorites-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NebularModule,

    // These components are imported but not used in the template
    // FavoriteButtonComponent,
    // LoadingSpinnerComponent,
    // AppSortComponent,
    // AppSortHeaderComponent,
  ],
  template: `
    <div class="favorites-page">
      <div class="favorites-header">
        <h1 class="page-title">My Favorites</h1>

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
        <div class="filters-header">
          <h3>Filters</h3>
          <button nbButton ghost (click)="toggleAdvancedFilters()">
            {{ showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters' }}
            <nb-icon [icon]="showAdvancedFilters ? 'chevron-up-outline' : 'chevron-down-outline'">
            </nb-icon>
          </button>
        </div>

        <div class="basic-filters">
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

          <div class="tags-filter" *ngIf="userTags && userTags.length > 0">
            <label class="label">Filter by tag:</label>
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
        </div>

        <div class="advanced-filters" *ngIf="showAdvancedFilters">
          <div class="filter-row">
            <nb-select
              fullWidth
              [(ngModel)]="filterOptions.priority"
              (selectedChange)="applyFilters()"
              placeholder="Priority"
            >
              <nb-option [value]="undefined">Any</nb-option>
              <nb-option value="high">
                <nb-icon icon="arrow-up-outline" class="priority-icon high"></nb-icon>
                High
              </nb-option>
              <nb-option value="normal">
                <nb-icon icon="minus-outline" class="priority-icon normal"></nb-icon>
                Normal
              </nb-option>
              <nb-option value="low">
                <nb-icon icon="arrow-down-outline" class="priority-icon low"></nb-icon>
                Low
              </nb-option>
            </nb-select>
          </div>

          <div class="filter-row">
            <nb-select
              fullWidth
              [(ngModel)]="filterOptions.category"
              (selectedChange)="applyFilters()"
              placeholder="Category"
            >
              <nb-option [value]="undefined">Any</nb-option>
              <nb-option *ngFor="let category of categories" [value]="category.value">
                {{ category.label }}
              </nb-option>
            </nb-select>
          </div>

          <div class="filter-row">
            <nb-select
              fullWidth
              [(ngModel)]="filterOptions.county"
              (selectedChange)="onCountyChange()"
              placeholder="County"
            >
              <nb-option [value]="undefined">Any</nb-option>
              <nb-option *ngFor="let county of counties" [value]="county">
                {{ county }}
              </nb-option>
            </nb-select>
          </div>

          <div class="filter-row" *ngIf="filterOptions.county">
            <nb-select
              fullWidth
              [(ngModel)]="filterOptions.city"
              (selectedChange)="applyFilters()"
              placeholder="City"
            >
              <nb-option [value]="undefined">Any</nb-option>
              <nb-option *ngFor="let city of cities" [value]="city">
                {{ city }}
              </nb-option>
            </nb-select>
          </div>

          <div class="filter-row">
            <nb-form-field>
              <nb-icon nbPrefix icon="calendar-outline"></nb-icon>
              <input
                nbInput
                fullWidth
                [nbDatepicker]="dateFrom"
                [(ngModel)]="filterOptions.dateFrom"
                (ngModelChange)="onDateChange()"
                placeholder="From date"
              />
              <nb-datepicker #dateFrom></nb-datepicker>
            </nb-form-field>

            <nb-form-field>
              <nb-icon nbPrefix icon="calendar-outline"></nb-icon>
              <input
                nbInput
                fullWidth
                [nbDatepicker]="dateTo"
                [(ngModel)]="filterOptions.dateTo"
                (ngModelChange)="onDateChange()"
                placeholder="To date"
              />
              <nb-datepicker #dateTo></nb-datepicker>
            </nb-form-field>
          </div>

          <div class="filter-row">
            <nb-form-field>
              <nb-icon nbPrefix icon="pricetags-outline"></nb-icon>
              <input
                nbInput
                fullWidth
                type="number"
                [(ngModel)]="filterOptions.priceMin"
                (ngModelChange)="applyFilters()"
                placeholder="Min price"
              />
            </nb-form-field>

            <nb-form-field>
              <nb-icon nbPrefix icon="pricetags-outline"></nb-icon>
              <input
                nbInput
                fullWidth
                type="number"
                [(ngModel)]="filterOptions.priceMax"
                (ngModelChange)="applyFilters()"
                placeholder="Max price"
              />
            </nb-form-field>
          </div>
        </div>

        <div class="active-filters" *ngIf="isFiltered">
          <h4>Active Filters:</h4>
          <nb-tag-list>
            <nb-tag
              *ngIf="filterOptions.search"
              (remove)="clearSearchFilter()"
              removable
              status="primary"
            >
              Search: {{ filterOptions.search }}
            </nb-tag>

            <nb-tag
              *ngIf="filterOptions.priority"
              (remove)="clearPriorityFilter()"
              removable
              status="primary"
            >
              Priority: {{ filterOptions.priority | titlecase }}
            </nb-tag>

            <nb-tag
              *ngIf="filterOptions.category"
              (remove)="clearCategoryFilter()"
              removable
              status="primary"
            >
              Category: {{ getCategoryLabel(filterOptions.category) }}
            </nb-tag>

            <nb-tag
              *ngIf="filterOptions.county"
              (remove)="clearCountyFilter()"
              removable
              status="primary"
            >
              County: {{ filterOptions.county }}
            </nb-tag>

            <nb-tag
              *ngIf="filterOptions.city"
              (remove)="clearCityFilter()"
              removable
              status="primary"
            >
              City: {{ filterOptions.city }}
            </nb-tag>

            <nb-tag
              *ngIf="filterOptions.priceMin || filterOptions.priceMax"
              (remove)="clearPriceFilter()"
              removable
              status="primary"
            >
              Price: {{ getPriceRangeLabel() }}
            </nb-tag>

            <nb-tag
              *ngIf="filterOptions.dateFrom || filterOptions.dateTo"
              (remove)="clearDateFilter()"
              removable
              status="primary"
            >
              Date: {{ getDateRangeLabel() }}
            </nb-tag>

            <nb-tag
              *ngFor="let tag of selectedTagFilters"
              (remove)="removeTagFilter(tag)"
              removable
              status="primary"
            >
              Tag: {{ tag }}
            </nb-tag>
          </nb-tag-list>

          <button nbButton ghost size="small" (click)="resetFilters()">
            Clear all filters
            <nb-icon icon="close-outline"></nb-icon>
          </button>
        </div>
      </div>

      <div class="favorites-content">
        <nb-card *ngIf="loading">
          <nb-card-body>
            <nb-spinner size="large"></nb-spinner>
          </nb-card-body>
        </nb-card>

        <nb-alert *ngIf="error" status="danger">
          Failed to load favorites. Please try again later.
        </nb-alert>

        <nb-alert *ngIf="!loading && (!favorites || favorites.length === 0)" status="info">
          You haven't added any favorites yet.
        </nb-alert>

        <nb-list *ngIf="!loading && favorites && favorites.length > 0">
          <nb-list-item *ngFor="let favorite of favorites">
            <div class="favorite-item">
              <nb-checkbox
                [(ngModel)]="favorite.selected"
                (ngModelChange)="updateSelectedFavorites()"
              ></nb-checkbox>

              <div class="favorite-content">
                <div class="favorite-header">
                  <h3>
                    <a [routerLink]="['/ads', getAdIdAsString(favorite.ad)]">
                      {{
                        favorite.ad && typeof favorite.ad !== 'string'
                          ? favorite.ad.title
                          : 'View Ad'
                      }}
                    </a>
                  </h3>

                  <div class="favorite-actions">
                    <button
                      nbButton
                      ghost
                      size="small"
                      [nbContextMenu]="[
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
            </div>
          </nb-list-item>
        </nb-list>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: var(--padding);
      }

      .favorites-page {
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
      }

      .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--margin);

        h3 {
          margin: 0;
          color: var(--text-basic-color);
        }
      }

      .basic-filters {
        display: grid;
        gap: var(--spacing);
        margin-bottom: var(--margin);
      }

      .advanced-filters {
        display: grid;
        gap: var(--spacing);
        padding-top: var(--padding);
        border-top: 1px solid var(--divider-color);
      }

      .filter-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing);
      }

      .active-filters {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--spacing);
        padding-top: var(--padding);
        border-top: 1px solid var(--divider-color);

        h4 {
          margin: 0;
          color: var(--text-basic-color);
        }
      }

      .favorite-item {
        display: flex;
        gap: var(--spacing);
        width: 100%;
      }

      .favorite-content {
        flex: 1;
      }

      .favorite-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--margin);

        h3 {
          margin: 0;
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
        margin-bottom: var(--margin);
      }

      .favorite-tags {
        margin-bottom: var(--margin);
      }

      .favorite-notes {
        margin: 0;
        color: var(--text-hint-color);
        font-style: italic;
      }

      .priority-icon {
        &.high {
          color: var(--color-danger-default);
        }

        &.normal {
          color: var(--color-warning-default);
        }

        &.low {
          color: var(--color-success-default);
        }
      }

      nb-checkbox {
        margin-top: var(--spacing-xs);
      }

      nb-tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-xs);
      }

      nb-spinner {
        margin: var(--margin) auto;
      }

      nb-alert {
        margin-bottom: var(--margin);
      }

      nb-list-item {
        padding: var(--card-padding);
        border-radius: var(--card-border-radius);
        background-color: var(--card-background-color);
        margin-bottom: var(--margin);
        box-shadow: var(--shadow);

        &:last-child {
          margin-bottom: 0;
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
    search: '',
    sort: 'newest',
  };
  selectedTagFilters: string[] = [];
  showAdvancedFilters = false;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  counties: string[] = [];
  cities: string[] = [];
  filterPresets: FilterPreset[] = [];
  categories = [
    { value: 'escort', label: 'Escort' },
    { value: 'massage', label: 'Massage' },
    { value: 'companion', label: 'Companion' },
    { value: 'dancer', label: 'Dancer' },
    { value: 'other', label: 'Other' },
  ];
  private searchSubject = new Subject<string>();

  batchActions = [
    {
      title: 'Remove Selected',
      icon: 'trash-2-outline',
      data: 'remove',
    },
    {
      title: 'Add Tags to Selected',
      icon: 'pricetags-outline',
      data: 'tags',
    },
    {
      title: 'Set High Priority',
      icon: 'arrow-up-outline',
      data: 'priority-high',
    },
    {
      title: 'Set Normal Priority',
      icon: 'minus-outline',
      data: 'priority-normal',
    },
    {
      title: 'Set Low Priority',
      icon: 'arrow-down-outline',
      data: 'priority-low',
    },
  ];

  constructor(
    private favoriteService: FavoriteService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilters());
  }

  ngOnInit(): void {
    this.loadFavorites();
    this.loadUserTags();
    this.loadLocationData();
    this.loadFilterPresets();

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
      (favorites) => {
        this.favorites = favorites.map((favorite) => ({
          ...favorite,
          selected: false,
        }));
        this.loading = false;
      },
      (error) => {
        console.error('Error loading favorites:', error);
        this.error = true;
        this.loading = false;
        this.notificationService.error('Failed to load favorites. Please try again.');
      },
    );
  }

  /**
   * Load user's tags for filtering
   */
  loadUserTags(): void {
    this.favoriteService.getUserTags().subscribe(
      (tags) => {
        this.userTags = tags;
      },
      (error) => {
        console.error('Error loading tags:', error);
      },
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
      search: '',
      sort: 'newest',
    };
    this.selectedTagFilters = [];
    this.dateFrom = null;
    this.dateTo = null;
    this.loadFavorites();
  }

  /**
   * Toggle advanced filters visibility
   */
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  /**
   * Load location data for filtering
   */
  loadLocationData(): void {
    // In a real application, this would come from an API
    this.counties = ['Los Angeles', 'New York', 'Miami-Dade', 'Cook', 'Harris'];
    this.cities = [];
  }

  /**
   * Handle county selection change
   */
  onCountyChange(): void {
    if (this.filterOptions.county) {
      // In a real application, this would be an API call to get cities for the selected county
      switch (this.filterOptions.county) {
        case 'Los Angeles':
          this.cities = ['Los Angeles', 'Long Beach', 'Pasadena', 'Santa Monica'];
          break;
        case 'New York':
          this.cities = ['New York City', 'Buffalo', 'Rochester', 'Yonkers'];
          break;
        case 'Miami-Dade':
          this.cities = ['Miami', 'Miami Beach', 'Coral Gables', 'Hialeah'];
          break;
        case 'Cook':
          this.cities = ['Chicago', 'Evanston', 'Oak Park', 'Schaumburg'];
          break;
        case 'Harris':
          this.cities = ['Houston', 'Pasadena', 'Spring', 'Baytown'];
          break;
        default:
          this.cities = [];
      }
    } else {
      this.cities = [];
      this.filterOptions.city = undefined;
    }
    this.applyFilters();
  }

  /**
   * Handle date range change
   */
  onDateChange(): void {
    if (this.dateFrom) {
      this.filterOptions.dateFrom = this.dateFrom;
    } else {
      delete this.filterOptions.dateFrom;
    }

    if (this.dateTo) {
      this.filterOptions.dateTo = this.dateTo;
    } else {
      delete this.filterOptions.dateTo;
    }

    this.applyFilters();
  }

  /**
   * Save current filter settings as a preset
   */
  saveFilterPreset(): void {
    this.dialogService
      .openNotesDialog({
        title: 'Save Filter Preset',
        notes: '',
        placeholder: 'Enter a name for this filter preset',
      })
      .subscribe((name) => {
        if (name) {
          const preset: FilterPreset = {
            name,
            filters: { ...this.filterOptions },
            dateFrom: this.dateFrom,
            dateTo: this.dateTo,
            selectedTagFilters: [...this.selectedTagFilters],
          };

          // In a real application, this would be saved to the server
          this.filterPresets = [...this.filterPresets, preset];
          localStorage.setItem('favoriteFilterPresets', JSON.stringify(this.filterPresets));
          this.notificationService.success(`Filter preset "${name}" saved`);
        }
      });
  }

  /**
   * Load saved filter presets
   */
  loadFilterPresets(): void {
    const savedPresets = localStorage.getItem('favoriteFilterPresets');
    if (savedPresets) {
      try {
        this.filterPresets = JSON.parse(savedPresets);
      } catch (error) {
        console.error('Error parsing filter presets:', error);
        this.filterPresets = [];
      }
    }
  }

  /**
   * Apply a saved filter preset
   */
  loadFilterPreset(preset: FilterPreset): void {
    this.filterOptions = { ...preset.filters };
    this.selectedTagFilters = [...preset.selectedTagFilters];
    this.dateFrom = preset.dateFrom ? new Date(preset.dateFrom) : null;
    this.dateTo = preset.dateTo ? new Date(preset.dateTo) : null;
    this.applyFilters();
    this.notificationService.success(`Filter preset "${preset.name}" applied`);
  }

  /**
   * Get the label for a category value
   */
  getCategoryLabel(value: string): string {
    const category = this.categories.find((c) => c.value === value);
    return category ? category.label : value;
  }

  /**
   * Get a formatted label for the price range
   */
  getPriceRangeLabel(): string {
    if (this.filterOptions.priceMin !== undefined && this.filterOptions.priceMax !== undefined) {
      return `$${this.filterOptions.priceMin} - $${this.filterOptions.priceMax}`;
    } else if (this.filterOptions.priceMin !== undefined) {
      return `$${this.filterOptions.priceMin}+`;
    } else if (this.filterOptions.priceMax !== undefined) {
      return `Up to $${this.filterOptions.priceMax}`;
    }
    return '';
  }

  /**
   * Get a formatted label for the date range
   */
  getDateRangeLabel(): string {
    const formatDate = (date: Date | null): string => {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    };

    if (this.filterOptions.dateFrom && this.filterOptions.dateTo) {
      return `${formatDate(this.filterOptions.dateFrom as Date)} - ${formatDate(
        this.filterOptions.dateTo as Date,
      )}`;
    } else if (this.filterOptions.dateFrom) {
      return `After ${formatDate(this.filterOptions.dateFrom as Date)}`;
    } else if (this.filterOptions.dateTo) {
      return `Before ${formatDate(this.filterOptions.dateTo as Date)}`;
    }
    return '';
  }

  /**
   * Clear the search filter
   */
  clearSearchFilter(): void {
    delete this.filterOptions.search;
    this.applyFilters();
  }

  /**
   * Clear the priority filter
   */
  clearPriorityFilter(): void {
    delete this.filterOptions.priority;
    this.applyFilters();
  }

  /**
   * Clear the category filter
   */
  clearCategoryFilter(): void {
    delete this.filterOptions.category;
    this.applyFilters();
  }

  /**
   * Clear the county filter
   */
  clearCountyFilter(): void {
    delete this.filterOptions.county;
    delete this.filterOptions.city;
    this.cities = [];
    this.applyFilters();
  }

  /**
   * Clear the city filter
   */
  clearCityFilter(): void {
    delete this.filterOptions.city;
    this.applyFilters();
  }

  /**
   * Clear the price filter
   */
  clearPriceFilter(): void {
    delete this.filterOptions.priceMin;
    delete this.filterOptions.priceMax;
    this.applyFilters();
  }

  /**
   * Clear the date filter
   */
  clearDateFilter(): void {
    delete this.filterOptions.dateFrom;
    delete this.filterOptions.dateTo;
    this.dateFrom = null;
    this.dateTo = null;
    this.applyFilters();
  }

  /**
   * Remove a specific tag filter
   */
  removeTagFilter(tag: string): void {
    this.selectedTagFilters = this.selectedTagFilters.filter((t) => t !== tag);
    this.applyFilters();
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
      !!this.filterOptions.priority ||
      this.filterOptions.priceMin !== undefined ||
      this.filterOptions.priceMax !== undefined ||
      !!this.filterOptions.dateFrom ||
      !!this.filterOptions.dateTo ||
      this.selectedTagFilters.length > 0 ||
      this.filterOptions.sort !== 'newest'
    );
  }

  /**
   * Update the selected favorites array when checkboxes change
   */
  updateSelectedFavorites(): void {
    this.selectedFavorites = this.favorites
      .filter((favorite) => favorite.selected)
      .map((favorite) => this.getAdIdAsString(favorite.ad._id));
  }

  /**
   * Remove a single favorite
   */
  removeFavorite(adId: string | { city: string; county: string }): void {
    this.favoriteService.removeFavorite(adId).subscribe(
      () => {
        this.favorites = this.favorites.filter(
          (favorite) => this.getAdIdAsString(favorite.ad._id) !== adId,
        );
        this.notificationService.success('Removed from favorites');
      },
      (error) => {
        console.error('Error removing favorite:', error);
        this.notificationService.error('Failed to remove from favorites');
      },
    );
  }

  /**
   * Remove multiple favorites in a batch operation
   */
  removeFavoritesBatch(): void {
    if (this.selectedFavorites.length === 0) return;

    this.favoriteService.removeFavoritesBatch(this.selectedFavorites).subscribe(
      (result) => {
        // Remove the favorites from the local array
        this.favorites = this.favorites.filter(
          (favorite) => !this.selectedFavorites.includes(this.getAdIdAsString(favorite.ad._id)),
        );
        this.selectedFavorites = [];
        this.notificationService.success(`Removed ${result.removed} items from favorites`);
      },
      (error) => {
        console.error('Error removing favorites batch:', error);
        this.notificationService.error('Failed to remove items from favorites');
      },
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
      .subscribe((notes) => {
        if (notes !== undefined) {
          this.favoriteService.updateNotes(this.getAdIdAsString(favorite.ad._id), notes).subscribe(
            () => {
              // Update local state
              favorite.notes = notes;
              this.notificationService.success('Notes updated successfully');
            },
            (error) => {
              console.error('Error updating notes:', error);
              this.notificationService.error('Failed to update notes');
            },
          );
        }
      });
  }

  /**
   * Open dialog to edit tags for a single favorite
   */
  openTagsDialogForSingle(favorite: Favorite): void {
    // Get all user tags for suggestions
    this.favoriteService.getUserTags().subscribe((tags) => {
      const suggestedTags = tags
        .map((tag) => tag.tag)
        .filter((tag) => !favorite.tags.includes(tag));

      this.dialogService
        .openTagsDialog({
          title: 'Edit Tags',
          tags: favorite.tags || [],
          suggestedTags,
          maxTags: 10,
        })
        .subscribe((updatedTags) => {
          if (updatedTags) {
            this.favoriteService
              .updateTags(this.getAdIdAsString(favorite.ad._id), updatedTags)
              .subscribe(
                () => {
                  // Update local state
                  favorite.tags = updatedTags;
                  this.notificationService.success('Tags updated successfully');
                },
                (error) => {
                  console.error('Error updating tags:', error);
                  this.notificationService.error('Failed to update tags');
                },
              );
          }
        });
    });
  }

  /**
   * Open dialog to add tags to multiple favorites
   */
  openTagsDialog(): void {
    if (this.selectedFavorites.length === 0) return;

    // Get all user tags for suggestions
    this.favoriteService.getUserTags().subscribe((tags) => {
      const suggestedTags = tags.map((tag) => tag.tag);

      this.dialogService
        .openTagsDialog({
          title: `Add Tags to ${this.selectedFavorites.length} Favorites`,
          tags: [],
          suggestedTags,
          maxTags: 10,
        })
        .subscribe((newTags) => {
          if (newTags && newTags.length > 0) {
            // For each selected favorite, add the new tags
            const updatePromises = this.selectedFavorites.map((adId) => {
              const favorite = this.favorites.find((f) => f.ad._id === adId);
              if (!favorite) return null;

              // Combine existing tags with new tags, removing duplicates
              const existingTags = favorite.tags || [];
              const combinedTags = [...new Set([...existingTags, ...newTags])];

              return firstValueFrom(this.favoriteService.updateTags(adId, combinedTags));
            });

            // Wait for all updates to complete
            Promise.all(updatePromises)
              .then(() => {
                // Update local state
                this.favorites.forEach((favorite) => {
                  if (this.selectedFavorites.includes(this.getAdIdAsString(favorite.ad._id))) {
                    const existingTags = favorite.tags || [];
                    favorite.tags = [...new Set([...existingTags, ...newTags])];
                  }
                });
                this.notificationService.success(
                  `Tags added to ${this.selectedFavorites.length} favorites`,
                );
              })
              .catch((error) => {
                console.error('Error updating tags batch:', error);
                this.notificationService.error('Failed to update tags for some favorites');
              });
          }
        });
    });
  }

  /**
   * Update priority for a single favorite
   */
  updatePriority(favorite: Favorite, priority: 'low' | 'normal' | 'high'): void {
    this.favoriteService.updatePriority(this.getAdIdAsString(favorite.ad._id), priority).subscribe(
      () => {
        // Update local state
        favorite.priority = priority;
        this.notificationService.success(`Priority set to ${priority}`);
      },
      (error) => {
        console.error('Error updating priority:', error);
        this.notificationService.error('Failed to update priority');
      },
    );
  }

  /**
   * Set priority for multiple favorites in a batch operation
   */
  setPriorityBatch(priority: 'low' | 'normal' | 'high'): void {
    if (this.selectedFavorites.length === 0) return;

    const updatePromises = this.selectedFavorites.map((adId) =>
      firstValueFrom(this.favoriteService.updatePriority(adId, priority)),
    );

    Promise.all(updatePromises)
      .then(() => {
        // Update local state
        this.favorites.forEach((favorite) => {
          if (this.selectedFavorites.includes(this.getAdIdAsString(favorite.ad._id))) {
            favorite.priority = priority;
          }
        });
        this.notificationService.success(
          `Priority set to ${priority} for ${this.selectedFavorites.length} favorites`,
        );
      })
      .catch((error) => {
        console.error('Error updating priority batch:', error);
        this.notificationService.error('Failed to update priority for some favorites');
      });
  }

  /**
   * Toggle notifications for a favorite
   */
  toggleNotifications(favorite: Favorite): void {
    this.favoriteService.toggleNotifications(this.getAdIdAsString(favorite.ad._id)).subscribe(
      () => {
        // Update local state
        favorite.notificationsEnabled = !favorite.notificationsEnabled;
        this.notificationService.success(
          `Notifications ${favorite.notificationsEnabled ? 'enabled' : 'disabled'}`,
        );
      },
      (error) => {
        console.error('Error toggling notifications:', error);
        this.notificationService.error('Failed to update notification settings');
      },
    );
  }

  /**
   * Handle favorite removal from the favorite button component
   */
  onFavoriteRemoved(removed: boolean, favorite: Favorite): void {
    if (removed) {
      this.favorites = this.favorites.filter((f) => f._id !== favorite._id);
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
        return 'arrow-up-outline';
      case 'low':
        return 'arrow-down-outline';
      default:
        return 'minus-outline';
    }
  }

  /**
   * Convert ad ID to string regardless of its type
   */
  getAdIdAsString(adId: any): string {
    if (!adId) return '';
    if (typeof adId === 'string') return adId;
    if (adId._id) return adId._id;
    return JSON.stringify(adId);
  }

  toggleTagFilter(tag: string): void {
    const index = this.selectedTagFilters.indexOf(tag);
    if (index === -1) {
      this.selectedTagFilters.push(tag);
    } else {
      this.selectedTagFilters.splice(index, 1);
    }
    this.applyFilters();
  }
}
