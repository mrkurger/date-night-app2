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
import { NebularModule } from '../../nebular.module';

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
  selector: 'nb-tinder-card',
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
      [class.liked]="isLiked"
      [class.disliked]="isDisliked"
      [ngStyle]="cardStyle"
    >
      <div class="like-indicator" [class.visible]="showLikeIndicator">
        <nb-icon icon="heart" status="success"></nb-icon>
        <span>LIKE</span>
      </div>
      <div class="dislike-indicator" [class.visible]="showDislikeIndicator">
        <nb-icon icon="close" status="danger"></nb-icon>
        <span>NOPE</span>
      </div>

      <div class="media-container">
        <div class="media-item" [ngStyle]="mediaStyle">
          <ng-container [ngSwitch]="currentMedia.type">
            <img
              *ngSwitchCase="'image'"
              [src]="currentMedia.url"
              [alt]="title"
              class="media-content"
            />
            <video
              *ngSwitchCase="'video'"
              [src]="currentMedia.url"
              [poster]="currentMedia.thumbnail"
              controls
              class="media-content"
            ></video>
          </ng-container>
        </div>

        <div class="media-navigation" *ngIf="media.length > 1">
          <div class="media-dots">
            <span
              *ngFor="let m of media; let i = index"
              class="media-dot"
              [class.active]="i === currentMediaIndex"
              (click)="setMediaIndex(i)"
            ></span>
          </div>
          <button
            nbButton
            ghost
            class="media-nav-button prev"
            (click)="previousMedia()"
            *ngIf="currentMediaIndex > 0"
          >
            <nb-icon icon="chevron-left"></nb-icon>
          </button>
          <button
            nbButton
            ghost
            class="media-nav-button next"
            (click)="nextMedia()"
            *ngIf="currentMediaIndex < media.length - 1"
          >
            <nb-icon icon="chevron-right"></nb-icon>
          </button>
        </div>
      </div>

      <nb-card-body>
        <div class="card-header">
          <h2 class="title">{{ title }}</h2>
          <span class="age" *ngIf="age">{{ age }}</span>
        </div>
        <div class="subtitle" *ngIf="subtitle">{{ subtitle }}</div>
        <p class="description" *ngIf="description">{{ description }}</p>
        <div class="tags" *ngIf="tags && tags.length">
          <nb-tag
            *ngFor="let tag of tags"
            [text]="tag"
            appearance="filled"
            status="primary"
            size="small"
          ></nb-tag>
        </div>
      </nb-card-body>

      <nb-card-footer>
        <button nbButton ghost status="danger" (click)="onDislike()">
          <nb-icon icon="close-outline"></nb-icon>
        </button>
        <button nbButton ghost status="success" (click)="onLike()">
          <nb-icon icon="heart-outline"></nb-icon>
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
      }

      .tinder-card {
        position: relative;
        border-radius: var(--border-radius);
        overflow: hidden;
        transition: transform 0.3s ease;
        transform-origin: center center;
        user-select: none;
        touch-action: none;

        &.swiping {
          transition: none;
        }

        &.liked {
          .like-indicator {
            opacity: 1;
          }
        }

        &.disliked {
          .dislike-indicator {
            opacity: 1;
          }
        }
      }

      .like-indicator,
      .dislike-indicator {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;

        nb-icon {
          font-size: 48px;
          margin-bottom: 8px;
        }

        span {
          font-size: 24px;
          font-weight: bold;
          text-transform: uppercase;
        }
      }

      .like-indicator {
        right: 24px;
        color: var(--color-success-500);
      }

      .dislike-indicator {
        left: 24px;
        color: var(--color-danger-500);
      }

      .media-container {
        position: relative;
        width: 100%;
        padding-bottom: 100%;
      }

      .media-item {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .media-content {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .media-navigation {
        position: absolute;
        bottom: 16px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .media-dots {
        display: flex;
        gap: 8px;
      }

      .media-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.3s ease;

        &.active {
          background-color: var(--color-primary-500);
          transform: scale(1.2);
        }
      }

      .media-nav-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        padding: 8px;

        &.prev {
          left: 16px;
        }

        &.next {
          right: 16px;
        }

        nb-icon {
          color: white;
        }
      }

      nb-card-body {
        padding: 16px;
      }

      .card-header {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 8px;
      }

      .title {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
        color: var(--text-basic-color);
      }

      .age {
        font-size: 20px;
        color: var(--text-hint-color);
      }

      .subtitle {
        font-size: 16px;
        color: var(--text-hint-color);
        margin-bottom: 12px;
      }

      .description {
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-basic-color);
        margin-bottom: 16px;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      nb-card-footer {
        display: flex;
        justify-content: space-around;
        padding: 16px;
        background-color: var(--background-basic-color-1);

        button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          nb-icon {
            font-size: 24px;
          }
        }
      }
    `,
  ],
})
export class TinderCardComponent implements AfterViewInit, OnDestroy {
  @Input() media: TinderCardMedia[] = [];
  @Input() title = '';
  @Input() age?: number;
  @Input() subtitle?: string;
  @Input() description?: string;
  @Input() tags: string[] = [];

  @Output() like = new EventEmitter<void>();
  @Output() dislike = new EventEmitter<void>();
  @Output() superlike = new EventEmitter<void>();

  @ViewChild('card') cardElement!: ElementRef;

  currentMediaIndex = 0;
  isSwiping = false;
  isLiked = false;
  isDisliked = false;
  showLikeIndicator = false;
  showDislikeIndicator = false;
  cardStyle: any = {};
  mediaStyle: any = {};

  private startX = 0;
  private startY = 0;
  private initialX = 0;
  private initialY = 0;
  private xOffset = 0;
  private yOffset = 0;
  private swipeThreshold = 100;

  get currentMedia(): TinderCardMedia {
    return this.media[this.currentMediaIndex];
  }

  ngAfterViewInit(): void {
    this.setupTouchEvents();
  }

  ngOnDestroy(): void {
    this.removeTouchEvents();
  }

  private setupTouchEvents(): void {
    const element = this.cardElement.nativeElement;
    element.addEventListener('mousedown', this.dragStart.bind(this));
    element.addEventListener('mousemove', this.drag.bind(this));
    element.addEventListener('mouseup', this.dragEnd.bind(this));
    element.addEventListener('touchstart', this.dragStart.bind(this));
    element.addEventListener('touchmove', this.drag.bind(this));
    element.addEventListener('touchend', this.dragEnd.bind(this));
  }

  private removeTouchEvents(): void {
    const element = this.cardElement.nativeElement;
    element.removeEventListener('mousedown', this.dragStart.bind(this));
    element.removeEventListener('mousemove', this.drag.bind(this));
    element.removeEventListener('mouseup', this.dragEnd.bind(this));
    element.removeEventListener('touchstart', this.dragStart.bind(this));
    element.removeEventListener('touchmove', this.drag.bind(this));
    element.removeEventListener('touchend', this.dragEnd.bind(this));
  }

  private dragStart(e: MouseEvent | TouchEvent): void {
    if (e instanceof MouseEvent) {
      this.startX = e.clientX;
      this.startY = e.clientY;
    } else {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }

    this.initialX = this.xOffset;
    this.initialY = this.yOffset;
    this.isSwiping = true;
  }

  private drag(e: MouseEvent | TouchEvent): void {
    if (!this.isSwiping) return;

    e.preventDefault();

    let currentX: number;
    let currentY: number;

    if (e instanceof MouseEvent) {
      currentX = e.clientX;
      currentY = e.clientY;
    } else {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    }

    this.xOffset = currentX - this.startX;
    this.yOffset = currentY - this.startY;

    const rotate = this.xOffset * 0.1;
    this.cardStyle = {
      transform: `translate(${this.xOffset}px, ${this.yOffset}px) rotate(${rotate}deg)`,
    };

    this.showLikeIndicator = this.xOffset > this.swipeThreshold;
    this.showDislikeIndicator = this.xOffset < -this.swipeThreshold;
  }

  private dragEnd(): void {
    this.initialX = this.xOffset;
    this.initialY = this.yOffset;

    if (this.xOffset > this.swipeThreshold) {
      this.onLike();
    } else if (this.xOffset < -this.swipeThreshold) {
      this.onDislike();
    } else {
      this.resetCard();
    }

    this.isSwiping = false;
  }

  private resetCard(): void {
    this.cardStyle = {
      transform: 'translate(0px, 0px) rotate(0deg)',
      transition: 'transform 0.3s ease',
    };
    this.xOffset = 0;
    this.yOffset = 0;
    this.showLikeIndicator = false;
    this.showDislikeIndicator = false;
  }

  onLike(): void {
    this.isLiked = true;
    this.cardStyle = {
      transform: 'translate(150%, 0) rotate(40deg)',
      transition: 'transform 0.3s ease',
    };
    setTimeout(() => this.like.emit(), 300);
  }

  onDislike(): void {
    this.isDisliked = true;
    this.cardStyle = {
      transform: 'translate(-150%, 0) rotate(-40deg)',
      transition: 'transform 0.3s ease',
    };
    setTimeout(() => this.dislike.emit(), 300);
  }

  setMediaIndex(index: number): void {
    this.currentMediaIndex = index;
  }

  previousMedia(): void {
    if (this.currentMediaIndex > 0) {
      this.currentMediaIndex--;
    }
  }

  nextMedia(): void {
    if (this.currentMediaIndex < this.media.length - 1) {
      this.currentMediaIndex++;
    }
  }
}
