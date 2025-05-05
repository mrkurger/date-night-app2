// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (tinder-card.component)
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
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelComponent } from '../components/label/label.component';

/**
 * Interface for media items in the Tinder card
 */
export interface TinderCardMedia {
  url: string;
  type: 'image' | 'video';
}

/**
 * Interface for action buttons in the Tinder card
 */
export interface TinderCardAction {
  id: string;
  icon: string;
  tooltip?: string;
  color?: string;
}

/**
 * Emerald Tinder Card Component
 *
 * A card component for Tinder-style swiping interfaces with gesture support
 */
@Component({
  selector: 'emerald-tinder-card',
  standalone: true,
  imports: [CommonModule, LabelComponent],
  templateUrl: './tinder-card.component.html',
  styleUrls: ['./tinder-card.component.scss'],
})
export class TinderCardComponent implements AfterViewInit, OnDestroy {
  /**
   * Title of the card
   */
  @Input() title = '';

  /**
   * Subtitle of the card (e.g., location)
   */
  @Input() subtitle = '';

  /**
   * Description text
   */
  @Input() description = '';

  /**
   * Array of media items (images/videos)
   */
  @Input() media: TinderCardMedia[] = [];

  /**
   * Array of tags to display
   */
  @Input() tags: string[] = [];

  /**
   * ID of the item represented by this card
   */
  @Input() itemId = '';

  /**
   * Age to display next to the title
   */
  @Input() age = '';

  /**
   * Whether the card is swipeable
   */
  @Input() swipeable = true;

  /**
   * Array of action buttons to display
   */
  @Input() actions: TinderCardAction[] = [];

  /**
   * Current state of the card ('', 'like', 'dislike')
   */
  @Input() state: '' | 'like' | 'dislike' = '';

  /**
   * Emitted when the card is swiped
   */
  @Output() swipe = new EventEmitter<{ direction: 'left' | 'right'; itemId: string }>();

  /**
   * Emitted when an action button is clicked
   */
  @Output() actionClick = new EventEmitter<{ id: string; itemId: string }>();

  /**
   * Emitted when the media is changed
   */
  @Output() mediaChange = new EventEmitter<number>();

  /**
   * Current media index
   */
  currentMediaIndex = 0;

  /**
   * Private properties for gesture handling
   */
  private startX = 0;
  private startY = 0;
  private moveX = 0;
  private moveY = 0;
  private touchListeners: (() => void)[] = [];

  constructor(private elementRef: ElementRef) {}

  /**
   * Initialize gesture handling after view is initialized
   */
  ngAfterViewInit(): void {
    if (this.swipeable) {
      this.initializeGestures();
    }
  }

  /**
   * Clean up event listeners when component is destroyed
   */
  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  /**
   * Initialize touch and mouse gesture handling
   */
  private initializeGestures(): void {
    const element = this.elementRef.nativeElement;
    const card = element.querySelector('.emerald-tinder-card');

    if (!card) return;

    // Touch events
    const touchStartListener = (e: TouchEvent) => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    };

    const touchMoveListener = (e: TouchEvent) => {
      this.moveX = e.touches[0].clientX - this.startX;
      this.moveY = e.touches[0].clientY - this.startY;
      this.handleMove(card);
    };

    const touchEndListener = () => {
      this.handleEnd(card);
    };

    // Mouse events
    const mouseDownListener = (e: MouseEvent) => {
      this.startX = e.clientX;
      this.startY = e.clientY;
      card.style.cursor = 'grabbing';

      document.addEventListener('mousemove', mouseMoveListener);
      document.addEventListener('mouseup', mouseUpListener);
    };

    const mouseMoveListener = (e: MouseEvent) => {
      this.moveX = e.clientX - this.startX;
      this.moveY = e.clientY - this.startY;
      this.handleMove(card);
    };

    const mouseUpListener = () => {
      card.style.cursor = '';
      this.handleEnd(card);
      document.removeEventListener('mousemove', mouseMoveListener);
      document.removeEventListener('mouseup', mouseUpListener);
    };

    // Add event listeners
    card.addEventListener('touchstart', touchStartListener);
    card.addEventListener('touchmove', touchMoveListener);
    card.addEventListener('touchend', touchEndListener);
    card.addEventListener('mousedown', mouseDownListener);

    // Store listeners for cleanup
    this.touchListeners = [
      () => card.removeEventListener('touchstart', touchStartListener),
      () => card.removeEventListener('touchmove', touchMoveListener),
      () => card.removeEventListener('touchend', touchEndListener),
      () => card.removeEventListener('mousedown', mouseDownListener),
    ];
  }

  /**
   * Handle move events (touch/mouse)
   */
  private handleMove(card: HTMLElement): void {
    const rotation = this.moveX * 0.1;
    card.style.transform = `translate(${this.moveX}px, ${this.moveY}px) rotate(${rotation}deg)`;

    // Update card state based on swipe direction
    if (this.moveX > 50) {
      this.state = 'like';
    } else if (this.moveX < -50) {
      this.state = 'dislike';
    } else {
      this.state = '';
    }
  }

  /**
   * Handle end events (touchend/mouseup)
   */
  private handleEnd(card: HTMLElement): void {
    // If swiped far enough, trigger the swipe action
    if (this.moveX > 100) {
      this.onSwipe('right');
    } else if (this.moveX < -100) {
      this.onSwipe('left');
    } else {
      // Reset card position with animation
      card.style.transition = 'transform 0.3s ease';
      card.style.transform = 'translate(0, 0) rotate(0deg)';
      setTimeout(() => {
        card.style.transition = '';
      }, 300);
      this.state = '';
    }

    // Reset values
    this.startX = 0;
    this.startY = 0;
    this.moveX = 0;
    this.moveY = 0;
  }

  /**
   * Remove all event listeners
   */
  private removeEventListeners(): void {
    this.touchListeners.forEach((remove) => remove());
  }

  /**
   * Handle swipe action
   */
  onSwipe(direction: 'left' | 'right'): void {
    this.swipe.emit({ direction, itemId: this.itemId });
  }

  /**
   * Handle action button click
   */
  onActionClick(id: string): void {
    this.actionClick.emit({ id, itemId: this.itemId });
  }

  /**
   * Navigate to previous media
   */
  prevMedia(event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.media || this.media.length <= 1) return;

    this.currentMediaIndex = (this.currentMediaIndex - 1 + this.media.length) % this.media.length;
    this.mediaChange.emit(this.currentMediaIndex);
  }

  /**
   * Navigate to next media
   */
  nextMedia(event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.media || this.media.length <= 1) return;

    this.currentMediaIndex = (this.currentMediaIndex + 1) % this.media.length;
    this.mediaChange.emit(this.currentMediaIndex);
  }

  /**
   * Set media to specific index
   */
  setMediaIndex(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.media || index >= this.media.length) return;

    this.currentMediaIndex = index;
    this.mediaChange.emit(this.currentMediaIndex);
  }

  /**
   * Get current media URL
   */
  getCurrentMediaUrl(): string {
    if (!this.media || this.media.length === 0) {
      return '/assets/images/default-profile.jpg';
    }
    return this.media[this.currentMediaIndex].url;
  }

  /**
   * Check if current media is video
   */
  isCurrentMediaVideo(): boolean {
    if (!this.media || this.media.length === 0) {
      return false;
    }
    return this.media[this.currentMediaIndex].type === 'video';
  }

  /**
   * Get array of indices for media dots
   */
  getMediaDots(): number[] {
    if (!this.media) return [];
    return Array(this.media.length)
      .fill(0)
      .map((_, i) => i);
  }
}
