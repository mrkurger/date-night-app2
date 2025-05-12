// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (tinder-card.component)
//
// COMMON CUSTOMIZATIONS:
// - SWIPE_THRESHOLD: Minimum distance to trigger swipe (default: 100)
//   Related to: tinder-card.component.scss:$swipe-threshold
// - ROTATION_FACTOR: Rotation angle per pixel swiped (default: 0.1)
//   Related to: tinder-card.component.scss:$rotation-factor
// ===================================================
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbBadgeModule,
  NbUserModule,
  NbTagModule,
} from '@nebular/theme';

export interface TinderCardMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface TinderCardAction {
  id: string;
  icon: string;
  label: string;
  color?: string;
}

export type TinderCardState = 'default' | 'like' | 'dislike' | 'superlike';

@Component({
  selector: 'app-tinder-card',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbBadgeModule,
    NbUserModule,
    NbTagModule,
  ],
  template: `
    <nb-card
      #card
      class="tinder-card"
      [class.swiping]="isSwiping"
      [class.like]="state === 'like'"
      [class.dislike]="state === 'dislike'"
      [class.superlike]="state === 'superlike'"
      [style.transform]="transform"
      (mousedown)="onMouseDown($event)"
      (touchstart)="onTouchStart($event)"
    >
      <nb-card-header>
        <div class="card-header-content">
          <nb-user
            [name]="title"
            [title]="subtitle"
            [picture]="currentMedia?.thumbnail || currentMedia?.url"
            size="large"
          >
          </nb-user>
          <div class="age-badge">
            <nb-badge [text]="age" status="primary" position="top right"></nb-badge>
          </div>
        </div>
      </nb-card-header>

      <nb-card-body>
        <div class="media-container" (click)="onMediaClick()">
          <img
            *ngIf="currentMedia?.type === 'image'"
            [src]="currentMedia.url"
            [alt]="title"
            class="media-content"
          />
          <video
            *ngIf="currentMedia?.type === 'video'"
            [src]="currentMedia.url"
            controls
            class="media-content"
          ></video>

          <!-- Media Navigation -->
          <div class="media-navigation" *ngIf="media.length > 1">
            <button
              nbButton
              ghost
              size="small"
              (click)="previousMedia(); $event.stopPropagation()"
              [disabled]="currentMediaIndex === 0"
            >
              <nb-icon icon="arrow-ios-back-outline"></nb-icon>
            </button>
            <div class="media-indicators">
              <div
                *ngFor="let m of media; let i = index"
                class="media-indicator"
                [class.active]="i === currentMediaIndex"
              ></div>
            </div>
            <button
              nbButton
              ghost
              size="small"
              (click)="nextMedia(); $event.stopPropagation()"
              [disabled]="currentMediaIndex === media.length - 1"
            >
              <nb-icon icon="arrow-ios-forward-outline"></nb-icon>
            </button>
          </div>
        </div>

        <div class="card-content">
          <h2>{{ title }}</h2>
          <p class="subtitle">{{ subtitle }}</p>
          <p class="description">{{ description }}</p>

          <div class="tags" *ngIf="tags && tags.length > 0">
            <nb-tag
              *ngFor="let tag of tags"
              [text]="tag"
              status="primary"
              appearance="outline"
              size="small"
            >
            </nb-tag>
          </div>
        </div>
      </nb-card-body>

      <nb-card-footer>
        <div class="action-buttons">
          <button
            nbButton
            status="danger"
            shape="round"
            size="large"
            (click)="onActionClick('dislike')"
          >
            <nb-icon icon="close-outline"></nb-icon>
          </button>
          <button
            nbButton
            status="info"
            shape="round"
            size="large"
            (click)="onActionClick('superlike')"
          >
            <nb-icon icon="star-outline"></nb-icon>
          </button>
          <button
            nbButton
            status="success"
            shape="round"
            size="large"
            (click)="onActionClick('like')"
          >
            <nb-icon icon="heart-outline"></nb-icon>
          </button>
        </div>
      </nb-card-footer>

      <!-- Swipe Overlays -->
      <div class="swipe-overlay like-overlay" [style.opacity]="likeOpacity">
        <nb-icon icon="heart" status="success"></nb-icon>
        <span>LIKE</span>
      </div>
      <div class="swipe-overlay dislike-overlay" [style.opacity]="dislikeOpacity">
        <nb-icon icon="close" status="danger"></nb-icon>
        <span>NOPE</span>
      </div>
      <div class="swipe-overlay superlike-overlay" [style.opacity]="superlikeOpacity">
        <nb-icon icon="star" status="info"></nb-icon>
        <span>SUPER LIKE</span>
      </div>
    </nb-card>
  `,
  styleUrls: ['./tinder-card.component.scss'],
})
export class TinderCardComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() description: string = '';
  @Input() media: TinderCardMedia[] = [];
  @Input() tags: string[] = [];
  @Input() itemId: string = '';
  @Input() age: string = '';
  @Input() state: TinderCardState = 'default';
  @Input() swipeable: boolean = true;

  @Output() swipe = new EventEmitter<{ direction: 'left' | 'right' | 'up'; itemId: string }>();
  @Output() actionClick = new EventEmitter<{ action: string; itemId: string }>();
  @Output() mediaChange = new EventEmitter<{ index: number; media: TinderCardMedia }>();

  @ViewChild('card') cardElement!: ElementRef;

  currentMediaIndex = 0;
  currentMedia: TinderCardMedia | null = null;
  transform = '';
  isSwiping = false;
  startX = 0;
  startY = 0;
  currentX = 0;
  currentY = 0;
  likeOpacity = 0;
  dislikeOpacity = 0;
  superlikeOpacity = 0;

  private readonly SWIPE_THRESHOLD = 100;
  private readonly ROTATION_FACTOR = 0.1;

  constructor() {}

  ngAfterViewInit(): void {
    if (this.media.length > 0) {
      this.currentMedia = this.media[0];
    }

    // Add event listeners for mouse and touch events
    if (this.swipeable) {
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
      document.addEventListener('mouseup', this.onMouseUp.bind(this));
      document.addEventListener('touchmove', this.onTouchMove.bind(this));
      document.addEventListener('touchend', this.onTouchEnd.bind(this));
    }
  }

  ngOnDestroy(): void {
    // Remove event listeners
    if (this.swipeable) {
      document.removeEventListener('mousemove', this.onMouseMove.bind(this));
      document.removeEventListener('mouseup', this.onMouseUp.bind(this));
      document.removeEventListener('touchmove', this.onTouchMove.bind(this));
      document.removeEventListener('touchend', this.onTouchEnd.bind(this));
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.swipeable) return;
    this.startSwiping(event.clientX, event.clientY);
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.swipeable) return;
    const touch = event.touches[0];
    this.startSwiping(touch.clientX, touch.clientY);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isSwiping) return;
    this.updateSwipe(event.clientX, event.clientY);
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isSwiping) return;
    const touch = event.touches[0];
    this.updateSwipe(touch.clientX, touch.clientY);
  }

  onMouseUp(): void {
    this.endSwiping();
  }

  onTouchEnd(): void {
    this.endSwiping();
  }

  private startSwiping(x: number, y: number): void {
    this.isSwiping = true;
    this.startX = x;
    this.startY = y;
    this.currentX = x;
    this.currentY = y;
  }

  private updateSwipe(x: number, y: number): void {
    if (!this.isSwiping) return;

    this.currentX = x;
    this.currentY = y;

    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    const rotation = deltaX * this.ROTATION_FACTOR;

    this.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;

    // Update overlay opacities
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const maxDelta = Math.max(absX, absY);
    const opacity = Math.min(maxDelta / this.SWIPE_THRESHOLD, 1);

    if (deltaX > 0) {
      this.likeOpacity = opacity;
      this.dislikeOpacity = 0;
      this.superlikeOpacity = 0;
    } else if (deltaX < 0) {
      this.likeOpacity = 0;
      this.dislikeOpacity = opacity;
      this.superlikeOpacity = 0;
    } else if (deltaY < 0) {
      this.likeOpacity = 0;
      this.dislikeOpacity = 0;
      this.superlikeOpacity = opacity;
    }
  }

  private endSwiping(): void {
    if (!this.isSwiping) return;

    const deltaX = this.currentX - this.startX;
    const deltaY = this.currentY - this.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > this.SWIPE_THRESHOLD || absY > this.SWIPE_THRESHOLD) {
      // Determine swipe direction
      if (absX > absY) {
        // Horizontal swipe
        this.swipe.emit({
          direction: deltaX > 0 ? 'right' : 'left',
          itemId: this.itemId,
        });
      } else {
        // Vertical swipe (only upward swipe is considered)
        if (deltaY < 0) {
          this.swipe.emit({
            direction: 'up',
            itemId: this.itemId,
          });
        }
      }
    }

    // Reset state
    this.isSwiping = false;
    this.transform = '';
    this.likeOpacity = 0;
    this.dislikeOpacity = 0;
    this.superlikeOpacity = 0;
  }

  onActionClick(action: string): void {
    this.actionClick.emit({ action, itemId: this.itemId });
  }

  onMediaClick(): void {
    // Handle media click (e.g., open fullscreen view)
  }

  previousMedia(): void {
    if (this.currentMediaIndex > 0) {
      this.currentMediaIndex--;
      this.currentMedia = this.media[this.currentMediaIndex];
      this.mediaChange.emit({
        index: this.currentMediaIndex,
        media: this.currentMedia,
      });
    }
  }

  nextMedia(): void {
    if (this.currentMediaIndex < this.media.length - 1) {
      this.currentMediaIndex++;
      this.currentMedia = this.media[this.currentMediaIndex];
      this.mediaChange.emit({
        index: this.currentMediaIndex,
        media: this.currentMedia,
      });
    }
  }
}
