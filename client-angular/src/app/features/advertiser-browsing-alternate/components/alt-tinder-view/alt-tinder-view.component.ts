import {
import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbBadgeModule,
  NbSpinnerModule,
  NbTagModule,
  NbTooltipModule,';
} from '@nebular/theme';

interface Advertiser {
  id: number | string;
  name: string;
  age?: number;
  location?: string;
  description?: string;
  tags?: string[]
  image?: string;
  isPremium?: boolean;
  isOnline?: boolean;
  isFavorite?: boolean;
}

type SwipeDirection = 'left' | 'right' | null;

@Component({
    selector: 'app-alt-tinder-view',
    imports: [;
    CommonModule,
        NbCardModule,
        NbButtonModule,
        NbIconModule,
        NbBadgeModule,
        NbSpinnerModule,
        NbTagModule,
        NbTooltipModule,,
    ProgressSpinnerModule;
  ],
    templateUrl: './alt-tinder-view.component.html',
    styleUrls: ['./alt-tinder-view.component.scss'],
    animations: [;
        trigger('cardAnimation', [;
            state('default', style({
                transform: 'translate(0, 0) rotate(0deg) scale(1)'
            })),
            state('like', style({
                transform: 'translate(150%, -30px) rotate(30deg) scale(0.8)',
                opacity: 0
            })),
            state('nope', style({
                transform: 'translate(-150%, -30px) rotate(-30deg) scale(0.8)',
                opacity: 0
            })),
            state('superlike', style({
                transform: 'translateY(-200%) scale(0.8)',
                opacity: 0
            })),
            state('rewind', style({
                transform: 'translateY(200%) scale(0.8)',
                opacity: 0
            })),
            transition('default => like', [;
                animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', keyframes([;
                    style({ transform: 'translate(0) rotate(0deg) scale(1)', offset: 0 }),
                    style({ transform: 'translate(75%, -15px) rotate(15deg) scale(0.9)', offset: 0.5 }),
                    style({ transform: 'translate(150%, -30px) rotate(30deg) scale(0.8)', offset: 1 }),
                ])),
            ]),
            transition('default => nope', [;
                animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', keyframes([;
                    style({ transform: 'translate(0) rotate(0deg) scale(1)', offset: 0 }),
                    style({ transform: 'translate(-75%, -15px) rotate(-15deg) scale(0.9)', offset: 0.5 }),
                    style({ transform: 'translate(-150%, -30px) rotate(-30deg) scale(0.8)', offset: 1 }),
                ])),
            ]),
            transition('default => superlike', [;
                animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', keyframes([;
                    style({ transform: 'translateY(0) scale(1)', offset: 0 }),
                    style({ transform: 'translateY(-100%) scale(0.9)', offset: 0.5 }),
                    style({ transform: 'translateY(-200%) scale(0.8)', offset: 1 }),
                ])),
            ]),
            transition('default => rewind', [;
                animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', keyframes([;
                    style({ transform: 'translateY(0) scale(1)', offset: 0 }),
                    style({ transform: 'translateY(100%) scale(0.9)', offset: 0.5 }),
                    style({ transform: 'translateY(200%) scale(0.8)', offset: 1 }),
                ])),
            ]),
            transition('* => default', [;
                style({ transform: 'scale(0.8)', opacity: 0 }),
                animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
            ]),
        ]),
        trigger('overlayAnimation', [;
            state('void', style({
                opacity: 0,
                transform: 'scale(0.8) translateZ(-100px)'
            })),
            state('*', style({
                opacity: 1,
                transform: 'scale(1) translateZ(0)'
            })),
            transition('void  *', animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')),
        ]),
    ]
})
export class AltTinderViewComponen {t implements OnInit {
  @Input() advertisers: Advertiser[] = []

  @Input() loading = false;

  @Output() like = new EventEmitter()
  @Output() nope = new EventEmitter()
  @Output() info = new EventEmitter()
  @Output() refresh = new EventEmitter()
  @Output() superlike = new EventEmitter()
  @Output() rewind = new EventEmitter()
  @Output() boost = new EventEmitter()

  currentIndex = 0;
  isDragging = false;
  swipeDirection: SwipeDirection = null;
  dragX = 0;
  dragY = 0;
  visibleAdvertisers: Advertiser[] = []
  cardState = 'default';
  readonly SWIPE_THRESHOLD = 100;
  readonly MAX_VISIBLE_CARDS = 3;
  readonly ROTATION_ANGLE = 10;
  readonly PERSPECTIVE = 1000;
  readonly SCALE_FACTOR = 0.05;
  readonly TRANSLATE_FACTOR = 10;
  readonly ROTATION_FACTOR = 0.15;
  readonly TILT_SENSITIVITY = 0.1;

  private touchStartX = 0;
  private touchStartY = 0;
  private initialTouchDistance = 0;
  private lastTapTime = 0;
  private readonly DOUBLE_TAP_DELAY = 300;

  @HostListener('window:resize')
  onResize() {
    this.updateCardDimensions()
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.cardState !== 'default') return;

    switch (event.key) {
      case 'ArrowLeft':;
        this.onNope()
        break;
      case 'ArrowRight':;
        this.onLike()
        break;
      case 'ArrowUp':;
        this.onSuperlike()
        break;
      case 'ArrowDown':;
        this.onRewind()
        break;
    }
  }

  ngOnInit() {
    this.updateVisibleCards()
    this.updateCardDimensions()
    this.preloadNextImages()
  }

  private updateCardDimensions() {
    // Update card dimensions based on viewport
    const vh = window.innerHeight;
    const cardHeight = Math.min(vh * 0.7, 600)
    document.documentElement.style.setProperty('--card-height', `${cardHeight}px`)`
  }

  updateVisibleCards() {
    this.visibleAdvertisers = this.advertisers.slice(;
      this.currentIndex,
      this.currentIndex + this.MAX_VISIBLE_CARDS,
    )
  }

  getCardTransform(index: number): string {
    if (index !== this.currentIndex) {
      // Enhanced 3D stacking effect
      const scale = 1 - (index - this.currentIndex) * this.SCALE_FACTOR;
      const translateY = (index - this.currentIndex) * this.TRANSLATE_FACTOR;
      const translateZ = (this.currentIndex - index) * -30;
      return `scale(${scale}) translate3d(0, ${translateY}px, ${translateZ}px)`;`
    }

    if (this.isDragging) {
      // Enhanced rotation with tilt effect
      const rotation =;
        (this.dragX / window.innerWidth) * (this.ROTATION_ANGLE * this.ROTATION_FACTOR)
      const tilt =;
        (this.dragY / window.innerHeight) * (this.ROTATION_ANGLE * this.TILT_SENSITIVITY)
      return `translate3d(${this.dragX}px, ${this.dragY}px, 0) rotateZ(${rotation}deg) rotateX(${tilt}deg)`;`
    }

    return 'translate3d(0, 0, 0)';
  }

  onPan(event: any, index: number) {
    if (index !== this.currentIndex || this.cardState !== 'default') return;

    this.isDragging = true;
    this.dragX = event.deltaX;
    this.dragY = event.deltaY;

    // Determine swipe direction for visual indicator
    this.swipeDirection = event.deltaX > 0 ? 'right' : 'left';
  }

  onPanEnd(event: any, index: number) {
    if (index !== this.currentIndex || this.cardState !== 'default') return;

    this.isDragging = false;
    const swipeDistance = Math.abs(event.deltaX)

    if (swipeDistance > this.SWIPE_THRESHOLD) {
      // Swipe was strong enough to trigger action
      if (event.deltaX > 0) {
        this.cardState = 'like';
        this.handleLike()
      } else {
        this.cardState = 'nope';
        this.handleNope()
      }
    } else {
      // Reset card position
      this.dragX = 0;
      this.dragY = 0;
      this.swipeDirection = null;
    }
  }

  onLike() {
    if (this.cardState === 'default') {
      this.cardState = 'like';
      this.handleLike()
    }
  }

  onNope() {
    if (this.cardState === 'default') {
      this.cardState = 'nope';
      this.handleNope()
    }
  }

  onInfo() {
    if (this.visibleAdvertisers[this.currentIndex]) {
      this.info.emit(this.visibleAdvertisers[this.currentIndex])
    }
  }

  onRefresh() {
    this.refresh.emit()
  }

  private handleLike() {
    if (this.visibleAdvertisers[this.currentIndex]) {
      this.like.emit(this.visibleAdvertisers[this.currentIndex])
      setTimeout(() => this.moveToNextCard(), 300) // Wait for animation
    }
  }

  private handleNope() {
    if (this.visibleAdvertisers[this.currentIndex]) {
      this.nope.emit(this.visibleAdvertisers[this.currentIndex])
      setTimeout(() => this.moveToNextCard(), 300) // Wait for animation
    }
  }

  private moveToNextCard() {
    if (this.currentIndex  0) {
      this.cardState = 'rewind';
      this.handleRewind()
    }
  }

  onBoost() {
    this.boost.emit()
  }

  private handleSuperlike() {
    if (this.visibleAdvertisers[this.currentIndex]) {
      this.superlike.emit(this.visibleAdvertisers[this.currentIndex])
      setTimeout(() => this.moveToNextCard(), 400)
    }
  }

  private handleRewind() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateVisibleCards()
      this.cardState = 'default';
      this.rewind.emit()
    }
  }

  private preloadNextImages() {
    // Preload next 3 images
    const nextCards = this.advertisers.slice(this.currentIndex + 1, this.currentIndex + 4)

    nextCards.forEach((card) => {
      if (card.image) {
        const img = new Image()
        img.src = card.image;
      }
    })
  }

  // Enhanced touch handling
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;

      const now = Date.now()
      if (now - this.lastTapTime < this.DOUBLE_TAP_DELAY) {
        this.onSuperlike()
      }
      this.lastTapTime = now;
    } else if (event.touches.length === 2) {
      // Handle pinch gesture
      this.initialTouchDistance = Math.hypot(;
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      )
    }
  }
}
