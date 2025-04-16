
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (app-card.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ad } from '../../../../core/models/ad.interface';

/**
 * Emerald AppCard Component
 * 
 * A wrapper for the Emerald.js AppCard component.
 * This component displays an advertiser card with various layouts and features.
 * 
 * Documentation: https://docs-emerald.condorlabs.io/AppCard
 */
@Component({
  selector: 'emerald-app-card',
  templateUrl: './app-card.component.html',
  styleUrls: ['./app-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class AppCardComponent implements OnInit {
  @Input() ad!: Ad;
  @Input() layout: 'tinder' | 'netflix' | 'list' = 'netflix';
  @Input() showActions = true;
  @Input() showDescription = true;
  @Input() isOnline = false; // Whether the advertiser is online or offline
  
  @Output() viewDetails = new EventEmitter<string>();
  @Output() like = new EventEmitter<string>();
  @Output() chat = new EventEmitter<string>();
  @Output() share = new EventEmitter<string>();
  @Output() swiped = new EventEmitter<{ direction: 'left' | 'right', adId: string }>();
  
  // Background image URL for the card
  backgroundImageUrl = '';
  
  // Current media index for carousel
  currentMediaIndex = 0;
  
  constructor() { }
  
  /**
   * Get the number of media items in the ad
   * @returns The number of media items
   */
  getMediaCount(): number {
    if (!this.ad || !this.ad.media) {
      return 0;
    }
    return this.ad.media.length;
  }
  
  /**
   * Format a price value with currency symbol and thousands separator
   * @param price The price to format
   * @returns Formatted price string
   */
  formatPrice(price: number): string {
    // Round to nearest integer and format with $ and commas
    return '$' + Math.round(price).toLocaleString('en-US');
  }
  
  /**
   * Get a truncated version of the description
   * @param maxLength Maximum length of the description
   * @returns Truncated description with ellipsis
   */
  getTruncatedDescription(maxLength: number): string {
    if (!this.ad || !this.ad.description) {
      return '';
    }
    
    if (this.ad.description.length <= maxLength) {
      return this.ad.description;
    }
    
    return this.ad.description.substring(0, maxLength) + '...';
  }
  
  ngOnInit(): void {
    this.backgroundImageUrl = this.getPrimaryImage();
  }
  
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
   * Get the current media URL for the carousel
   */
  getCurrentMediaUrl(): string {
    if (this.ad.media && this.ad.media.length > 0) {
      return this.ad.media[this.currentMediaIndex].url;
    }
    
    if (this.ad.images && this.ad.images.length > 0) {
      return this.ad.images[this.currentMediaIndex];
    }
    
    return '/assets/img/default-profile.jpg';
  }
  
  /**
   * Navigate to the next media item in the carousel
   */
  nextMedia(event: Event): void {
    event.stopPropagation();
    
    if (this.ad.media && this.ad.media.length > 0) {
      this.currentMediaIndex = (this.currentMediaIndex + 1) % this.ad.media.length;
      this.backgroundImageUrl = this.getCurrentMediaUrl();
    } else if (this.ad.images && this.ad.images.length > 0) {
      this.currentMediaIndex = (this.currentMediaIndex + 1) % this.ad.images.length;
      this.backgroundImageUrl = this.getCurrentMediaUrl();
    }
  }
  
  /**
   * Navigate to the previous media item in the carousel
   */
  prevMedia(event: Event): void {
    event.stopPropagation();
    
    if (this.ad.media && this.ad.media.length > 0) {
      this.currentMediaIndex = (this.currentMediaIndex - 1 + this.ad.media.length) % this.ad.media.length;
      this.backgroundImageUrl = this.getCurrentMediaUrl();
    } else if (this.ad.images && this.ad.images.length > 0) {
      this.currentMediaIndex = (this.currentMediaIndex - 1 + this.ad.images.length) % this.ad.images.length;
      this.backgroundImageUrl = this.getCurrentMediaUrl();
    }
  }
  
  /**
   * Get the total number of media items
   */
  getMediaCount(): number {
    if (this.ad.media && this.ad.media.length > 0) {
      return this.ad.media.length;
    }
    
    if (this.ad.images && this.ad.images.length > 0) {
      return this.ad.images.length;
    }
    
    return 0;
  }
  
  /**
   * Get an array of indices for the media dots
   */
  getMediaDots(): number[] {
    return Array(this.getMediaCount()).fill(0).map((_, i) => i);
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
      minimumFractionDigits: 0
    }).format(price);
  }
  
  /**
   * Get a truncated description
   */
  getTruncatedDescription(maxLength: number = 120): string {
    if (!this.ad.description) return '';
    
    if (this.ad.description.length <= maxLength) {
      return this.ad.description;
    }
    
    return this.ad.description.substring(0, maxLength) + '...';
  }
  
  /**
   * Handle view details click
   */
  onViewDetails(event?: Event): void {
    if (event) event.stopPropagation();
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
  
  /**
   * Handle swipe action
   */
  onSwipe(direction: 'left' | 'right', event?: Event): void {
    if (event) event.stopPropagation();
    this.swiped.emit({ direction, adId: this.ad._id });
  }
}