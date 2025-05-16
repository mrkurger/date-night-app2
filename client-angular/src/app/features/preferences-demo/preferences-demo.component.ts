

import { OnDestroy } from '@angular/core';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbLayoutModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule
} from '@nebular/theme';

import { OnInit } from '@angular/core';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains a demo component to showcase user preferences
//
// COMMON CUSTOMIZATIONS:
// - MOCK_ADS: Sample ad data for demonstration (default: see below)
// ===================================================
import { CommonModule } from '@angular/common';
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
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbSelectModule,
    NbFormFieldModule,
    NbLayoutModule,
    AdCardComponent
  ],
  template: `
    <div class="preferences-demo-container">
      <nb-card class="settings-card">
        <nb-card-header>
          <h3>User Preferences Demo</h3>
          <p class="subtitle">Customize your viewing experience</p>
        </nb-card-header>
        <nb-card-body>
          <div class="settings-form">
            <nb-form-field>
              <label>Default View Type</label>
              <nb-select
                fullWidth
                [(ngModel)]="defaultViewType"
                (selectedChange)="onViewTypeChange()"
                placeholder="Select view type"
              >
                <nb-option value="netflix">Netflix Style</nb-option>
                <nb-option value="tinder">Tinder Style</nb-option>
                <nb-option value="list">List View</nb-option>
              </nb-select>
            </nb-form-field>

            <nb-form-field>
              <label>Content Density</label>
              <nb-select
                fullWidth
                [(ngModel)]="contentDensity"
                (selectedChange)="onContentDensityChange()"
                placeholder="Select content density"
              >
                <nb-option *ngFor="let option of contentDensityOptions" [value]="option.value">
                  {{ option.label }}
                </nb-option>
              </nb-select>
            </nb-form-field>

            <nb-form-field>
              <label>Card Size</label>
              <nb-select
                fullWidth
                [(ngModel)]="cardSize"
                (selectedChange)="onCardSizeChange()"
                placeholder="Select card size"
              >
                <nb-option *ngFor="let option of cardSizeOptions" [value]="option.value">
                  {{ option.label }}
                </nb-option>
              </nb-select>
            </nb-form-field>

            <div class="settings-info">
              <p>
                Current Settings:
                <span class="setting-value">{{ getContentDensityLabel() }}</span> density,
                <span class="setting-value">{{ getCardSizeLabel() }}</span> cards
              </p>
            </div>

            <button nbButton status="basic" (click)="resetPreferences()">
              <nb-icon icon="refresh-outline"></nb-icon>
              Reset to Defaults
            </button>
          </div>
        </nb-card-body>
      </nb-card>

      <!-- Preview Section -->
      <nb-card class="preview-card">
        <nb-card-header>
          <h3>Preview</h3>
          <p class="subtitle">See how your content will look with these settings</p>
        </nb-card-header>
        <nb-card-body>
          <div class="preview-grid" [class]="contentDensity + ' ' + cardSize">
            <app-ad-card
              *ngFor="let ad of mockAds"
              [ad]="ad"
              [cardSize]="cardSize"
              [contentDensity]="contentDensity"
              (viewDetails)="onViewDetails($event)"
              (like)="onLike($event)"
              (chat)="onChat($event)"
            ></app-ad-card>
          </div>
        </nb-card-body>
      </nb-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .preferences-demo-container {
        padding: 2rem;
        display: grid;
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .subtitle {
        color: var(--text-hint-color);
        margin: 0;
      }

      .settings-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .settings-info {
        padding: 1rem;
        background-color: var(--background-basic-color-2);
        border-radius: var(--border-radius);
        color: var(--text-basic-color);

        .setting-value {
          color: var(--text-primary-color);
          font-weight: 600;
        }
      }

      .preview-grid {
        display: grid;
        gap: 1.5rem;

        &.compact {
          gap: 1rem;
        }

        &.comfortable {
          gap: 2rem;
        }

        &.spacious {
          gap: 2.5rem;
        }

        &.small {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        }

        &.medium {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        &.large {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }
      }
    `,
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
    // eslint-disable-next-line no-console
    console.log('View details for ad:', adId);
  }

  /**
   * Handle like click
   */
  onLike(adId: string): void {
    // eslint-disable-next-line no-console
    console.log('Like ad:', adId);
  }

  /**
   * Handle chat click
   */
  onChat(adId: string): void {
    // eslint-disable-next-line no-console
    console.log('Chat about ad:', adId);
  }
}
