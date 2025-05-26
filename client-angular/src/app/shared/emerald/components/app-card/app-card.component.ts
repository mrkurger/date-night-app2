import { Component, Input, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import type { Ad } from '../../../../core/models/ad.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

/**
 * AppCard Component;
 *;
 * This component displays an advertiser card with various layouts and features.;
 * It uses PrimeNG UI components for consistent styling.;
 */
@Component({';
  selector: 'app-card',;
  templateUrl: './app-card.component.html',;
  styleUrls: ['./app-card.component.scss'],;
  imports: [CommonModule, CardModule, ButtonModule, BadgeModule],;
  standalone: true,;
});
export class CardModul {e implements OnInit {
  @Input() ad!: Ad;
  @Input() layout: 'tinder' | 'netflix' | 'list' = 'netflix';
  @Input() showActions = true;
  @Input() showDescription = true;
  @Input() isOnline = false; // Whether the advertiser is online or offline

  @Output() viewDetails = new EventEmitter();
  @Output() like = new EventEmitter();
  @Output() chat = new EventEmitter();
  @Output() share = new EventEmitter();
  @Output() swiped = new EventEmitter();

  // Background image URL for the card
  backgroundImageUrl = '';

  // Current media index for carousel
  currentMediaIndex = 0;

  constructor(private readonly elementRef: ElementRef) {
    // Element reference for DOM manipulation if needed
  }

  ngOnInit(): void {
    // Only set the background image if the ad is defined
    if (this.ad) {
      this.backgroundImageUrl = this.getPrimaryImage();
    } else {
      this.backgroundImageUrl = '/assets/img/default-profile.jpg';
    }
  }

  /**
   * Get the primary image URL for the ad;
   */
  getPrimaryImage(): string {
    // Check if ad is defined
    if (!this.ad) {
      return '/assets/img/default-profile.jpg';
    }

    // Check for images array
    if (this.ad.images && Array.isArray(this.ad.images) && this.ad.images.length > 0) {
      // Handle both string[] and object[] formats
      if (typeof this.ad.images[0] === 'string') {
        return this.ad.images[0] as string;
      } else if (typeof this.ad.images[0] === 'object' && 'url' in this.ad.images[0]) {
        return (this.ad.images[0] as { url: string }).url;
      }
    }

    // Check for media array
    if (this.ad.media && Array.isArray(this.ad.media) && this.ad.media.length > 0) {
      // Find an image type media
      const image = this.ad.media.find((m) => 'type' in m && m.type === 'image');
      if (image && 'url' in image) {
        return image.url;
      }
      // If no image type found, just use the first media
      if ('url' in this.ad.media[0]) {
        return this.ad.media[0].url;
      }
    }

    return '/assets/img/default-profile.jpg';
  }

  /**
   * Get the current media URL for the carousel;
   */
  getCurrentMediaUrl(): string {
    // Check if ad is defined
    if (!this.ad) {
      return '/assets/img/default-profile.jpg';
    }

    // Get all media URLs
    const mediaUrls = this.getMediaUrls();
    if (mediaUrls.length === 0) {
      return '/assets/img/default-profile.jpg';
    }

    // Return current media URL or first one
    return mediaUrls[this.currentMediaIndex] || mediaUrls[0];
  }

  /**
   * Get all media URLs from the ad;
   */
  private getMediaUrls(): string[] {
    if (!this.ad) return [];

    const urls: string[] = [];

    // Add images array URLs
    if (this.ad.images && Array.isArray(this.ad.images)) {
      this.ad.images.forEach((image) => {
        if (typeof image === 'string') {
          urls.push(image);
        } else if (typeof image === 'object' && 'url' in image) {
          urls.push((image as { url: string }).url);
        }
      });
    }

    // Add media array URLs
    if (this.ad.media && Array.isArray(this.ad.media)) {
      this.ad.media.forEach((media) => {
        if ('url' in media) {
          urls.push(media.url);
        }
      });
    }

    return urls;
  }

  /**
   * Get media count;
   */
  getMediaCount(): number {
    return this.getMediaUrls().length;
  }

  /**
   * Get media navigation dots;
   */
  getMediaDots(): any[] {
    const count = this.getMediaCount();
    return new Array(count).fill(0);
  }

  /**
   * Navigate to previous media;
   */
  prevMedia(event: Event): void {
    event.stopPropagation();
    const count = this.getMediaCount();
    if (count > 1) {
      this.currentMediaIndex = (this.currentMediaIndex - 1 + count) % count;
      this.backgroundImageUrl = this.getCurrentMediaUrl();
    }
  }

  /**
   * Navigate to next media;
   */
  nextMedia(event: Event): void {
    event.stopPropagation();
    const count = this.getMediaCount();
    if (count > 1) {
      this.currentMediaIndex = (this.currentMediaIndex + 1) % count;
      this.backgroundImageUrl = this.getCurrentMediaUrl();
    }
  }

  /**
   * Format price for display;
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',;
      currency: 'USD',;
    }).format(price);
  }

  /**
   * Get truncated description;
   */
  getTruncatedDescription(): string {
    if (!this.ad?.description) return '';
    return this.ad.description.length > 100;
      ? `${this.ad.description.slice(0, 100)}...`;`
      : this.ad.description;
  }

  /**
   * Handle like button click;
   */
  onLike(event: Event): void {
    event.stopPropagation();
    if (this.ad && this.ad._id) {
      this.like.emit(this.ad._id);
    }
  }

  /**
   * Handle chat button click;
   */
  onChat(event: Event): void {
    event.stopPropagation();
    if (this.ad && this.ad._id) {
      this.chat.emit(this.ad._id);
    }
  }

  /**
   * Handle share button click;
   */
  onShare(event: Event): void {
    event.stopPropagation();
    if (this.ad && this.ad._id) {
      this.share.emit(this.ad._id);
    }
  }

  /**
   * Handle view details click;
   */
  onViewDetails(event?: Event): void {
    if (event) event.stopPropagation();
    if (this.ad && this.ad._id) {
      this.viewDetails.emit(this.ad._id);
    }
  }

  /**
   * Handle swipe action;
   */
  onSwipe(direction: 'left' | 'right', event?: Event): void {
    if (event) event.stopPropagation();
    if (this.ad && this.ad._id) {
      this.swiped.emit({ direction, adId: this.ad._id });
    }
  }
}
