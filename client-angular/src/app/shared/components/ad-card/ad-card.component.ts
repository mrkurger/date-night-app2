// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-card.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ad } from '../../../core/models/ad.interface';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-ad-card',
  templateUrl: './ad-card.component.html',
  styleUrls: ['./ad-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
})
export class AdCardComponent {
  @Input() ad!: Ad;
  @Input() layout: 'grid' | 'list' | 'compact' = 'grid';
  @Input() showActions = true;
  @Input() showDescription = true;
  @Input() showBadges = true;
  @Input() showLocation = true;
  @Input() isFeatured = false;
  @Input() isNew = false;
  @Input() isTrending = false;

  @Output() viewDetails = new EventEmitter<string>();
  @Output() like = new EventEmitter<string>();
  @Output() chat = new EventEmitter<string>();
  @Output() share = new EventEmitter<string>();

  /**
   * Get the primary image URL for the ad
   */
  getPrimaryImage(): string {
    if (this.ad.images && this.ad.images.length > 0) {
      return this.ad.images[0];
    }

    if (this.ad.media && this.ad.media.length > 0) {
      const image = this.ad.media.find(m => m.type === 'image');
      if (image) {
        return image.url;
      }
    }

    return '/assets/img/default-profile.jpg';
  }

  /**
   * Get the secondary image URL for the ad
   */
  getSecondaryImage(): string | null {
    if (this.ad.images && this.ad.images.length > 1) {
      return this.ad.images[1];
    }

    if (this.ad.media && this.ad.media.length > 1) {
      const images = this.ad.media.filter(m => m.type === 'image');
      if (images.length > 1) {
        return images[1].url;
      }
    }

    return null;
  }

  /**
   * Get the total number of images for the ad
   */
  getImageCount(): number {
    if (this.ad.images && this.ad.images.length > 0) {
      return this.ad.images.length;
    }

    if (this.ad.media) {
      return this.ad.media.filter(m => m.type === 'image').length;
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
   * Get a truncated description
   */
  getTruncatedDescription(maxLength = 120): string {
    if (!this.ad.description) return '';

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
    this.viewDetails.emit(this.ad._id);
  }

  /**
   * Handle like click
   */
  onLike(event: Event): void {
    event.stopPropagation();
    this.like.emit(this.ad._id);
  }

  /**
   * Handle chat click
   */
  onChat(event: Event): void {
    event.stopPropagation();
    this.chat.emit(this.ad._id);
  }

  /**
   * Handle share click
   */
  onShare(event: Event): void {
    event.stopPropagation();
    this.share.emit(this.ad._id);
  }
}
