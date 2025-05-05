// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains a demo component to showcase user preferences
//
// COMMON CUSTOMIZATIONS:
// - MOCK_ADS: Sample ad data for demonstration (default: see below)
// ===================================================
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  UserPreferencesService,
  ContentDensity,
  CardSize,
} from '../../core/services/user-preferences.service';
import { AdCardComponent } from '../../shared/components/ad-card/ad-card.component';
import { Subscription } from 'rxjs';
import { Ad } from '../../core/models/ad.interface';

// Mock data for demonstration
const MOCK_ADS: Ad[] = [
  {
    _id: '1',
    title: 'Professional Photographer',
    description:
      'Experienced photographer specializing in portrait and event photography. Available for bookings throughout the city. Packages start at $200 for a 2-hour session.',
    category: 'Photography',
    price: 200,
    location: { city: 'New York', county: 'NY' },
    images: ['/assets/img/sample/photo1.jpg', '/assets/img/sample/photo2.jpg'],
    media: [
      { type: 'image', url: '/assets/img/sample/photo1.jpg' },
      { type: 'image', url: '/assets/img/sample/photo2.jpg' },
    ],
    advertiser: {
      _id: 'user123',
      username: 'John Smith',
    },
    userId: 'user123',
    isActive: true,
    isFeatured: true,
    isTrending: false,
    isTouring: false,
    viewCount: 245,
    clickCount: 32,
    inquiryCount: 8,
    createdAt: '2023-04-15T10:30:00Z',
    updatedAt: '2023-04-15T10:30:00Z',
  },
  {
    _id: '2',
    title: 'Makeup Artist',
    description:
      'Professional makeup artist with 5+ years of experience. Specializing in wedding makeup, photoshoots, and special events. Using high-quality products for long-lasting results.',
    category: 'Beauty',
    price: 150,
    location: {
      city: 'Los Angeles',
      county: 'CA',
    },
    images: [
      { url: '/assets/img/sample/makeup1.jpg', type: 'image' },
      { url: '/assets/img/sample/makeup2.jpg', type: 'image' },
    ],
    media: [
      { type: 'image', url: '/assets/img/sample/makeup1.jpg' },
      { type: 'image', url: '/assets/img/sample/makeup2.jpg' },
    ],
    advertiser: {
      _id: 'user456',
      username: 'Sarah Johnson',
    },
    userId: 'user456',
    isActive: true,
    isFeatured: false,
    isTrending: true,
    isTouring: false,
    viewCount: 189,
    clickCount: 27,
    inquiryCount: 5,
    createdAt: '2023-04-10T14:20:00Z',
    updatedAt: '2023-04-10T14:20:00Z',
  },
  {
    _id: '3',
    title: 'Live Band for Events',
    description:
      'Versatile 5-piece band available for weddings, corporate events, and private parties. Extensive repertoire covering multiple genres including jazz, pop, rock, and R&B.',
    category: 'Music',
    price: 800,
    location: {
      city: 'Chicago',
      county: 'IL',
    },
    images: [
      { url: '/assets/img/sample/band1.jpg', type: 'image' },
      { url: '/assets/img/sample/band2.jpg', type: 'image' },
    ],
    media: [
      { type: 'image', url: '/assets/img/sample/band1.jpg' },
      { type: 'image', url: '/assets/img/sample/band2.jpg' },
    ],
    advertiser: {
      _id: 'user789',
      username: 'The Harmonics',
    },
    userId: 'user789',
    isActive: true,
    isFeatured: false,
    isTrending: false,
    isTouring: true,
    viewCount: 312,
    clickCount: 45,
    inquiryCount: 12,
    createdAt: '2023-04-05T09:15:00Z',
    updatedAt: '2023-04-05T09:15:00Z',
    tourDates: {
      start: '2023-05-01T00:00:00Z',
      end: '2023-07-31T00:00:00Z',
      cities: ['Chicago, IL', 'Detroit, MI', 'Cleveland, OH', 'Indianapolis, IN'],
    },
  },
  {
    _id: '4',
    title: 'Event Planner',
    description:
      'Full-service event planning for weddings, corporate events, and special occasions. Attention to detail and personalized service to make your event memorable.',
    category: 'Events',
    price: 500,
    location: {
      city: 'Miami',
      county: 'FL',
    },
    images: [
      { url: '/assets/img/sample/event1.jpg', type: 'image' },
      { url: '/assets/img/sample/event2.jpg', type: 'image' },
    ],
    media: [
      { type: 'image', url: '/assets/img/sample/event1.jpg' },
      { type: 'image', url: '/assets/img/sample/event2.jpg' },
    ],
    advertiser: {
      _id: 'user101',
      username: 'Elegant Events',
    },
    userId: 'user101',
    isActive: true,
    isFeatured: true,
    isTrending: true,
    isTouring: false,
    viewCount: 278,
    clickCount: 39,
    inquiryCount: 15,
    createdAt: '2023-04-12T11:45:00Z',
    updatedAt: '2023-04-12T11:45:00Z',
  },
];

@Component({
  selector: 'app-preferences-demo',
  template: `
    <div class="preferences-demo-container">
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-card-title>User Preferences Demo</mat-card-title>
          <mat-card-subtitle>Customize your viewing experience</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="settings-form">
            <mat-form-field appearance="fill">
              <mat-label>Default View Type</mat-label>
              <mat-select [(ngModel)]="defaultViewType" (selectionChange)="onViewTypeChange()">
                <mat-option value="netflix">Netflix Style</mat-option>
                <mat-option value="tinder">Tinder Style</mat-option>
                <mat-option value="list">List View</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>Content Density</mat-label>
              <mat-select [(ngModel)]="contentDensity" (selectionChange)="onContentDensityChange()">
                <mat-option *ngFor="let option of contentDensityOptions" [value]="option.value">
                  {{ option.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>Card Size</mat-label>
              <mat-select [(ngModel)]="cardSize" (selectionChange)="onCardSizeChange()">
                <mat-option *ngFor="let option of cardSizeOptions" [value]="option.value">
                  {{ option.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button color="primary" (click)="resetPreferences()">Reset to Defaults</button>
        </mat-card-actions>
      </mat-card>

      <div class="demo-section">
        <h2>Preview</h2>
        <p class="demo-description">
          Current settings: {{ defaultViewType | titlecase }} view,
          {{ getContentDensityLabel() }} density, {{ getCardSizeLabel() }} cards
        </p>

        <div class="cards-container" [ngClass]="'layout-' + defaultViewType">
          <app-ad-card
            *ngFor="let ad of mockAds"
            [ad]="ad"
            [layout]="defaultViewType === 'list' ? 'list' : 'grid'"
            (viewDetails)="onViewDetails($event)"
            (like)="onLike($event)"
            (chat)="onChat($event)"
          ></app-ad-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .preferences-demo-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }

      .settings-card {
        margin-bottom: 24px;
      }

      .settings-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      mat-form-field {
        min-width: 200px;
        flex: 1;
      }

      .demo-section {
        margin-top: 32px;
      }

      .demo-description {
        margin-bottom: 24px;
        color: #666;
      }

      .cards-container {
        display: grid;
        gap: 24px;
      }

      .layout-netflix,
      .layout-tinder {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }

      .layout-list {
        grid-template-columns: 1fr;
      }

      @media (max-width: 768px) {
        .settings-form {
          flex-direction: column;
        }

        .layout-netflix,
        .layout-tinder {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    AdCardComponent,
  ],
})
export class PreferencesDemoComponent implements OnInit, OnDestroy {
  // User preferences
  defaultViewType: 'netflix' | 'tinder' | 'list' = 'netflix';
  contentDensity: ContentDensity['value'] = 'comfortable';
  cardSize: CardSize['value'] = 'medium';

  // Options for select inputs
  contentDensityOptions: ContentDensity[] = [];
  cardSizeOptions: CardSize[] = [];

  // Mock data
  mockAds = MOCK_ADS;

  private subscriptions: Subscription[] = [];

  constructor(private userPreferencesService: UserPreferencesService) {
    this.contentDensityOptions = this.userPreferencesService.contentDensityOptions;
    this.cardSizeOptions = this.userPreferencesService.cardSizeOptions;
  }

  ngOnInit(): void {
    // Load initial preferences
    const preferences = this.userPreferencesService.getPreferences();
    this.defaultViewType = preferences.defaultViewType;
    this.contentDensity = preferences.contentDensity;
    this.cardSize = preferences.cardSize;

    // Subscribe to preference changes
    this.subscriptions.push(
      this.userPreferencesService.preferences$.subscribe((prefs) => {
        this.defaultViewType = prefs.defaultViewType;
        this.contentDensity = prefs.contentDensity;
        this.cardSize = prefs.cardSize;
      }),
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Handle view type change
   */
  onViewTypeChange(): void {
    this.userPreferencesService.setDefaultViewType(this.defaultViewType);
  }

  /**
   * Handle content density change
   */
  onContentDensityChange(): void {
    this.userPreferencesService.setContentDensity(this.contentDensity);
  }

  /**
   * Handle card size change
   */
  onCardSizeChange(): void {
    this.userPreferencesService.setCardSize(this.cardSize);
  }

  /**
   * Reset preferences to defaults
   */
  resetPreferences(): void {
    this.userPreferencesService.resetPreferences();
  }

  /**
   * Get the label for the current content density
   */
  getContentDensityLabel(): string {
    const option = this.contentDensityOptions.find((opt) => opt.value === this.contentDensity);
    return option ? option.label : '';
  }

  /**
   * Get the label for the current card size
   */
  getCardSizeLabel(): string {
    const option = this.cardSizeOptions.find((opt) => opt.value === this.cardSize);
    return option ? option.label : '';
  }

  /**
   * Handle view details click
   */
  onViewDetails(adId: string): void {
    console.log('View details for ad:', adId);
  }

  /**
   * Handle like click
   */
  onLike(adId: string): void {
    console.log('Like ad:', adId);
  }

  /**
   * Handle chat click
   */
  onChat(adId: string): void {
    console.log('Chat about ad:', adId);
  }
}
