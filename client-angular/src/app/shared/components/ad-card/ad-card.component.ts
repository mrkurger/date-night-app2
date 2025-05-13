import { NbIconModule } from '@nebular/theme';
import { NbBadgeModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-card.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ad } from '../../../core/models/ad.interface';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';
import { Subscription } from 'rxjs';
import {
  NbIconModule,
  NbButtonModule,
  NbTooltipModule,
  NbBadgeModule,
  NbCardModule,
} from '@nebular/theme';

@Component({
  selector: 'app-ad-card',
  template: `
    <nb-card [ngClass]="[size, density]" class="ad-card">
      <nb-card-header>
        <div class="ad-header">
          <div class="ad-badges">
            <nb-badge *ngIf="isFeatured" text="Featured" status="primary"></nb-badge>
            <nb-badge *ngIf="isNew" text="New" status="success"></nb-badge>
            <nb-badge *ngIf="isTrending" text="Trending" status="warning"></nb-badge>
          </div>
          <span class="ad-price">{{ ad?.price | currency }}</span>
        </div>
      </nb-card-header>
      <nb-card-body>
        <div class="ad-images">
          <img [src]="getPrimaryImage()" [alt]="ad?.title" class="primary-image" />
          <img
            *ngIf="getSecondaryImage()"
            [src]="getSecondaryImage()"
            [alt]="ad?.title"
            class="secondary-image"
          />
          <span *ngIf="getImageCount() > 1" class="image-count">+{{ getImageCount() - 1 }}</span>
        </div>
        <h3 class="ad-title">{{ ad?.title }}</h3>
        <p class="ad-description">{{ ad?.description }}</p>
        <div class="ad-location">
          <nb-icon icon="pin-outline"></nb-icon>
          <span>{{ ad?.location }}</span>
        </div>
      </nb-card-body>
      <nb-card-footer>
        <div class="ad-actions">
          <button nbButton ghost size="small" (click)="onLike($event)">
            <nb-icon [icon]="isFavorite ? 'heart' : 'heart-outline'"></nb-icon>
          </button>
          <button nbButton ghost size="small" (click)="onShare($event)">
            <nb-icon icon="share-outline"></nb-icon>
          </button>
        </div>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ad-card {
        height: 100%;
        transition: transform 0.2s ease-in-out;
      }

      .ad-card:hover {
        transform: translateY(-4px);
      }

      /* Header styles */
      .ad-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .ad-badges {
        display: flex;
        gap: 0.5rem;
      }

      .ad-price {
        font-weight: 600;
        color: var(--text-primary-color);
      }

      /* Image styles */
      .ad-images {
        position: relative;
        overflow: hidden;
        height: 200px;
        margin-bottom: 1rem;
      }

      .primary-image,
      .secondary-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.3s ease-in-out;
      }

      .secondary-image {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
      }

      .ad-images:hover .secondary-image {
        opacity: 1;
      }

      .image-count {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: var(--border-radius);
        font-size: 0.875rem;
      }

      /* Content styles */
      .ad-title {
        margin: 0 0 0.5rem;
        font-size: var(--text-heading-6-font-size);
        color: var(--text-basic-color);
      }

      .ad-description {
        margin: 0 0 1rem;
        font-size: var(--text-paragraph-font-size);
        color: var(--text-hint-color);
      }

      .ad-location {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-hint-color);
        font-size: 0.875rem;
      }

      /* Action styles */
      .ad-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      /* Size variants */
      :host-context(.size-sm) .ad-images {
        height: 160px;
      }

      :host-context(.size-md) .ad-images {
        height: 200px;
      }

      :host-context(.size-lg) .ad-images {
        height: 240px;
      }

      /* Density variants */
      :host-context(.density-compact) {
        .ad-description {
          margin-bottom: 0.5rem;
        }
      }

      :host-context(.density-comfortable) {
        .ad-description {
          margin-bottom: 1rem;
        }
      }

      :host-context(.density-spacious) {
        .ad-description {
          margin-bottom: 1.5rem;
        }
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbIconModule,
    NbButtonModule,
    NbTooltipModule,
    NbBadgeModule,
    NbCardModule,
  ],
})
export class AdCardComponent implements OnInit, OnDestroy {
  @Input() ad!: Ad;
  @Input() layout: 'grid' | 'list' | 'compact' | 'netflix' | 'tinder' = 'grid';
  @Input() showActions = true;
  @Input() showDescription = true;
  @Input() showBadges = true;
  @Input() showLocation = true;
  @Input() isFeatured = false;
  @Input() isNew = false;
  @Input() isTrending = false;
  @Input() cardSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() contentDensity: 'comfortable' | 'compact' | 'condensed' = 'comfortable';
  @Input() isFavorite = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';

  @Output() viewDetails = new EventEmitter<string>();
  @Output() like = new EventEmitter<string>();
  @Output() chat = new EventEmitter<string>();
  @Output() share = new EventEmitter<string>();

  private subscriptions: Subscription[] = [];

  constructor(private userPreferencesService: UserPreferencesService) {}

  ngOnInit(): void {
    // Load initial preferences if not provided as inputs
    if (!this.cardSize || !this.contentDensity) {
      const preferences = this.userPreferencesService.getPreferences();
      if (!this.cardSize) this.cardSize = preferences.cardSize;
      if (!this.contentDensity) this.contentDensity = preferences.contentDensity;

      // Subscribe to preference changes only if not provided as inputs
      this.subscriptions.push(
        this.userPreferencesService.preferences$.subscribe((prefs) => {
          if (!this.cardSize) this.cardSize = prefs.cardSize;
          if (!this.contentDensity) this.contentDensity = prefs.contentDensity;
        }),
      );
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Get the primary image URL for the ad
   */
  getPrimaryImage(): string {
    if (this.ad.images && Array.isArray(this.ad.images) && this.ad.images.length > 0) {
      // Handle both string[] and object[] formats
      if (typeof this.ad.images[0] === 'string') {
        return this.ad.images[0] as string;
      } else if (typeof this.ad.images[0] === 'object' && 'url' in this.ad.images[0]) {
        return (this.ad.images[0] as { url: string }).url;
      }
    }

    if (this.ad.media && Array.isArray(this.ad.media) && this.ad.media.length > 0) {
      const image = this.ad.media.find((m) => 'type' in m && m.type === 'image');
      if (image && 'url' in image) {
        return image.url;
      }
    }

    return '/assets/img/default-profile.jpg';
  }

  /**
   * Get the secondary image URL for the ad
   */
  getSecondaryImage(): string | null {
    if (this.ad.images && Array.isArray(this.ad.images) && this.ad.images.length > 1) {
      // Handle both string[] and object[] formats
      if (typeof this.ad.images[1] === 'string') {
        return this.ad.images[1] as string;
      } else if (typeof this.ad.images[1] === 'object' && 'url' in this.ad.images[1]) {
        return (this.ad.images[1] as { url: string }).url;
      }
    }

    if (this.ad.media && Array.isArray(this.ad.media) && this.ad.media.length > 1) {
      const images = this.ad.media.filter((m) => 'type' in m && m.type === 'image');
      if (images.length > 1 && 'url' in images[1]) {
        return images[1].url;
      }
    }

    return null;
  }

  /**
   * Get the total number of images for the ad
   */
  getImageCount(): number {
    if (this.ad.images && Array.isArray(this.ad.images) && this.ad.images.length > 0) {
      return this.ad.images.length;
    }

    if (this.ad.media && Array.isArray(this.ad.media)) {
      return this.ad.media.filter((m) => 'type' in m && m.type === 'image').length;
    }

    return 0;
  }

  /**
   * Handle image loading error
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/img/default-profile.jpg';
  }

  /**
   * Format the price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  }

  /**
   * Get a truncated description based on content density
   */
  getTruncatedDescription(): string {
    if (!this.ad.description) return '';

    // Set max length based on content density
    let maxLength = 120;

    switch (this.contentDensity) {
      case 'comfortable':
        maxLength = 120;
        break;
      case 'compact':
        maxLength = 80;
        break;
      case 'condensed':
        maxLength = 40;
        break;
    }

    if (this.ad.description.length <= maxLength) {
      return this.ad.description;
    }

    return this.ad.description.substring(0, maxLength) + '...';
  }

  /**
   * Get the time since the ad was created
   */
  getTimeSince(): string {
    if (!this.ad.createdAt) return '';

    const now = new Date();
    const created = new Date(this.ad.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }

    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  }

  /**
   * Handle view details click
   */
  onViewDetails(): void {
    // Convert complex _id to string if needed
    const adId = typeof this.ad._id === 'string' ? this.ad._id : JSON.stringify(this.ad._id);
    this.viewDetails.emit(adId);
  }

  /**
   * Handle like click
   */
  onLike(event: Event): void {
    event.stopPropagation();
    // Convert complex _id to string if needed
    const adId = typeof this.ad._id === 'string' ? this.ad._id : JSON.stringify(this.ad._id);
    this.like.emit(adId);
  }

  /**
   * Handle chat click
   */
  onChat(event: Event): void {
    event.stopPropagation();
    // Convert complex _id to string if needed
    const adId = typeof this.ad._id === 'string' ? this.ad._id : JSON.stringify(this.ad._id);
    this.chat.emit(adId);
  }

  /**
   * Handle share click
   */
  onShare(event: Event): void {
    event.stopPropagation();
    // Convert complex _id to string if needed
    const adId = typeof this.ad._id === 'string' ? this.ad._id : JSON.stringify(this.ad._id);
    this.share.emit(adId);
  }
}
