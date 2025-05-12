// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (carousel.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Emerald Carousel Component
 *
 * A wrapper for the Emerald.js Carousel component.
 * This component displays a carousel of images or other content.
 *
 * Documentation: https://docs-emerald.condorlabs.io/Carousel
 */
@Component({
  selector: 'emerald-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() items: CarouselItem[] = [];
  @Input() showDots = true;
  @Input() showArrows = true;
  @Input() autoPlay = false;
  @Input() autoPlayInterval = 5000; // in milliseconds
  @Input() aspectRatio: '1:1' | '4:3' | '16:9' | '21:9' = '16:9';
  @Input() thumbnails = false;

  @Output() itemChange = new EventEmitter<number>();

  currentIndex = 0;
  autoPlayTimer: any;

  ngOnInit(): void {
    if (this.autoPlay && this.items.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  /**
   * Navigate to the next item
   */
  next(event?: Event): void {
    if (event) event.stopPropagation();

    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.itemChange.emit(this.currentIndex);
    this.resetAutoPlay();
  }

  /**
   * Navigate to the previous item
   */
  prev(event?: Event): void {
    if (event) event.stopPropagation();

    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.itemChange.emit(this.currentIndex);
    this.resetAutoPlay();
  }

  /**
   * Navigate to a specific item
   */
  goTo(index: number, event?: Event): void {
    if (event) event.stopPropagation();

    this.currentIndex = index;
    this.itemChange.emit(this.currentIndex);
    this.resetAutoPlay();
  }

  /**
   * Start auto play
   */
  private startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.autoPlayInterval);
  }

  /**
   * Stop auto play
   */
  private stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  /**
   * Reset auto play timer
   */
  private resetAutoPlay(): void {
    if (this.autoPlay) {
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }

  /**
   * Handle image loading error
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/img/default-profile.jpg';
  }
}

/**
 * Carousel Item Interface
 */
export interface CarouselItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}
