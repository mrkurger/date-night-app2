// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (favorites-page.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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
    MatDatepickerModule,
    MatNativeDateModule,
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
        <div class="filters-header">
          <h3>Filters</h3>
          <button mat-button color="primary" (click)="toggleAdvancedFilters()">
            {{ showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters' }}
            <mat-icon>{{ showAdvancedFilters ? 'expand_less' : 'expand_more' }}</mat-icon>
          </button>
        </div>

        <div class="basic-filters">
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
        </div>

        <div class="advanced-filters" *ngIf="showAdvancedFilters">
          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>Priority</mat-label>
              <mat-select [(ngModel)]="filterOptions.priority" (selectionChange)="applyFilters()">
                <mat-option [value]="undefined">Any</mat-option>
                <mat-option value="high">High</mat-option>
                <mat-option value="normal">Normal</mat-option>
                <mat-option value="low">Low</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="filterOptions.category" (selectionChange)="applyFilters()">
                <mat-option [value]="undefined">Any</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category.value">
                  {{ category.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="filter-row">
            <mat-form-field appearance="outline">
              <mat-label>County</mat-label>
              <mat-select [(ngModel)]="filterOptions.county" (selectionChange)="onCountyChange()">
                <mat-option [value]="undefined">Any</mat-option>
                <mat-option *ngFor="let county of counties" [value]="county">
                  {{ county }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <mat-select [(ngModel)]="filterOptions.city" (selectionChange)="applyFilters()">
                <mat-option [value]="undefined">Any</mat-option>
                <mat-option *ngFor="let city of cities" [value]="city">
                  {{ city }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="filter-row">
            <div class="price-range">
              <span class="range-label">Price Range:</span>
              <div class="price-inputs">
                <mat-form-field appearance="outline">
                  <mat-label>Min</mat-label>
                  <input
                    matInput
                    type="number"
                    [(ngModel)]="filterOptions.priceMin"
                    (change)="applyFilters()"
                    min="0"
                  />
                </mat-form-field>
                <span class="range-separator">to</span>
                <mat-form-field appearance="outline">
                  <mat-label>Max</mat-label>
                  <input
                    matInput
                    type="number"
                    [(ngModel)]="filterOptions.priceMax"
                    (change)="applyFilters()"
                    min="0"
                  />
                </mat-form-field>
              </div>
            </div>
          </div>

          <div class="filter-row">
            <div class="date-range">
              <span class="range-label">Date Added:</span>
              <div class="date-inputs">
                <mat-form-field appearance="outline">
                  <mat-label>From</mat-label>
                  <input
                    matInput
                    [matDatepicker]="fromPicker"
                    [(ngModel)]="dateFrom"
                    (dateChange)="onDateChange()"
                  />
                  <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromPicker></mat-datepicker>
                </mat-form-field>
                <span class="range-separator">to</span>
                <mat-form-field appearance="outline">
                  <mat-label>To</mat-label>
                  <input
                    matInput
                    [matDatepicker]="toPicker"
                    [(ngModel)]="dateTo"
                    (dateChange)="onDateChange()"
                  />
                  <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                  <mat-datepicker #toPicker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
          </div>

          <div class="filter-actions">
            <button mat-button color="primary" (click)="saveFilterPreset()">
              <mat-icon>save</mat-icon>
              Save Filter Preset
            </button>
            <button mat-button [matMenuTriggerFor]="presetMenu" *ngIf="filterPresets.length > 0">
              <mat-icon>filter_list</mat-icon>
              Load Preset
            </button>
            <mat-menu #presetMenu="matMenu">
              <button
                mat-menu-item
                *ngFor="let preset of filterPresets"
                (click)="loadFilterPreset(preset)"
              >
                {{ preset.name }}
              </button>
            </mat-menu>
          </div>
        </div>

        <div class="filter-summary" *ngIf="isFiltered">
          <div class="active-filters">
            <span class="filter-label">Active filters:</span>
            <mat-chip-set>
              <mat-chip *ngIf="filterOptions.search" (removed)="clearSearchFilter()">
                Search: {{ filterOptions.search }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip *ngIf="filterOptions.priority" (removed)="clearPriorityFilter()">
                Priority: {{ filterOptions.priority | titlecase }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip *ngIf="filterOptions.category" (removed)="clearCategoryFilter()">
                Category: {{ getCategoryLabel(filterOptions.category) }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip *ngIf="filterOptions.county" (removed)="clearCountyFilter()">
                County: {{ filterOptions.county }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip *ngIf="filterOptions.city" (removed)="clearCityFilter()">
                City: {{ filterOptions.city }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip
                *ngIf="filterOptions.priceMin !== undefined || filterOptions.priceMax !== undefined"
                (removed)="clearPriceFilter()"
              >
                Price: {{ getPriceRangeLabel() }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip
                *ngIf="filterOptions.dateFrom || filterOptions.dateTo"
                (removed)="clearDateFilter()"
              >
                Date: {{ getDateRangeLabel() }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
              <mat-chip *ngFor="let tag of selectedTagFilters" (removed)="removeTagFilter(tag)">
                Tag: {{ tag }}
                <button matChipRemove>
                  <mat-icon>cancel</mat-icon>
                </button>
              </mat-chip>
            </mat-chip-set>
          </div>
          <button mat-button color="primary" (click)="resetFilters()">
            <mat-icon>clear</mat-icon>
            Clear All Filters
          </button>
        </div>
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
        margin-bottom: 24px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        background-color: #f9f9f9;
      }

      .filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .filters-header h3 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }

      .basic-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 16px;
        align-items: flex-start;
      }

      .advanced-filters {
        background-color: #f0f0f0;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 16px;
      }

      .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 16px;
      }

      .filter-row mat-form-field {
        flex: 1;
        min-width: 200px;
      }

      .price-range,
      .date-range {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .range-label {
        font-weight: 500;
        color: #666;
        margin-bottom: 8px;
      }

      .price-inputs,
      .date-inputs {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .price-inputs mat-form-field,
      .date-inputs mat-form-field {
        flex: 1;
      }

      .range-separator {
        color: #666;
        margin: 0 8px;
      }

      .filter-actions {
        display: flex;
        gap: 16px;
        margin-top: 16px;
      }

      .filter-summary {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
      }

      .active-filters {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
      }

      .filter-label {
        font-weight: 500;
        color: #666;
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

  constructor(
    private favoriteService: FavoriteService,
    private dialogService: DialogService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
    this.loadUserTags();
    this.loadLocationData();
    this.loadFilterPresets();

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
        placeholder: 'Enter a name for this filter preset',
        existingNotes: '',
      })
      .subscribe(name => {
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
    const category = this.categories.find(c => c.value === value);
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
        this.filterOptions.dateTo as Date
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
    this.selectedTagFilters = this.selectedTagFilters.filter(t => t !== tag);
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
    // Get all user tags for suggestions
    this.favoriteService.getUserTags().subscribe(tags => {
      const suggestedTags = tags.map(tag => tag.tag).filter(tag => !favorite.tags.includes(tag));

      this.dialogService
        .openTagsDialog({
          title: 'Edit Tags',
          tags: favorite.tags || [],
          suggestedTags,
          maxTags: 10,
        })
        .subscribe(updatedTags => {
          if (updatedTags) {
            this.favoriteService.updateTags(favorite.ad._id, updatedTags).subscribe(
              () => {
                // Update local state
                favorite.tags = updatedTags;
                this.notificationService.success('Tags updated successfully');
              },
              error => {
                console.error('Error updating tags:', error);
                this.notificationService.error('Failed to update tags');
              }
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
    this.favoriteService.getUserTags().subscribe(tags => {
      const suggestedTags = tags.map(tag => tag.tag);

      this.dialogService
        .openTagsDialog({
          title: `Add Tags to ${this.selectedFavorites.length} Favorites`,
          tags: [],
          suggestedTags,
          maxTags: 10,
        })
        .subscribe(newTags => {
          if (newTags && newTags.length > 0) {
            // For each selected favorite, add the new tags
            const updatePromises = this.selectedFavorites.map(adId => {
              const favorite = this.favorites.find(f => f.ad._id === adId);
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
                this.favorites.forEach(favorite => {
                  if (this.selectedFavorites.includes(favorite.ad._id)) {
                    const existingTags = favorite.tags || [];
                    favorite.tags = [...new Set([...existingTags, ...newTags])];
                  }
                });
                this.notificationService.success(
                  `Tags added to ${this.selectedFavorites.length} favorites`
                );
              })
              .catch(error => {
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
    if (this.selectedFavorites.length === 0) return;

    const updatePromises = this.selectedFavorites.map(adId =>
      firstValueFrom(this.favoriteService.updatePriority(adId, priority))
    );

    Promise.all(updatePromises)
      .then(() => {
        // Update local state
        this.favorites.forEach(favorite => {
          if (this.selectedFavorites.includes(favorite.ad._id)) {
            favorite.priority = priority;
          }
        });
        this.notificationService.success(
          `Priority set to ${priority} for ${this.selectedFavorites.length} favorites`
        );
      })
      .catch(error => {
        console.error('Error updating priority batch:', error);
        this.notificationService.error('Failed to update priority for some favorites');
      });
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
