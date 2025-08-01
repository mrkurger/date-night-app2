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
import { NebularModule } from '../../../app/shared/nebular.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ad } from '../../core/models/ad.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,';
} from '@angular/core';

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
  NbSelectModule,
} from '@nebular/theme';

// Import Hammer types
declare let Hammer: any;

interface HammerManager {
  destroy(): void;
  get(recognizer: string): any;
  on(event: string, callback: (event: any) => void): void;
}

@Component({
  selector: 'app-tinder-card',
  templateUrl: './tinder-card.component.html',
  styleUrls: ['./tinder-card.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule,
    RouterModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbBadgeModule,
    NbTagModule,
  ]
})
export class TinderCardComponen {t implements OnInit, AfterViewInit, OnDestroy {
  @Input() ad!: Ad;

  @Output() swiped = new EventEmitter()
  @Output() viewDetails = new EventEmitter()
  @Output() startChat = new EventEmitter()

  @ViewChild('card') cardElement!: ElementRef;

  currentMediaIndex = 0;
  cardState: 'default' | 'swiping' | 'swiped-left' | 'swiped-right' = 'default';

  private hammerManager: HammerManager | null = null;
  private initialX = 0;
  private initialY = 0;
  private isDragging = false;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Initialize card position and gesture handling
    this.initializeGestureHandling()
  }

  private initializeGestureHandling(): void {
    // Add gesture handling initialization logic here
    // Will be implemented when needed
  }

  ngAfterViewInit(): void {
    this.initializeSwipeGesture()
  }

  ngOnDestroy(): void {
    if (this.hammerManager) {
      this.hammerManager.destroy()
    }
  }

  private initializeSwipeGesture(): void {
    // Check if Hammer is available (should be imported in angular.json)
    if (typeof Hammer !== 'undefined') {
      const hammer = new Hammer(this.cardElement.nativeElement)
      hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL })

      hammer.on('panstart', (event) => {
        this.isDragging = true;
        this.cardState = 'swiping';
        this.initialX = event.center.x;
        this.initialY = event.center.y;
      })

      hammer.on('panmove', (event) => {
        if (!this.isDragging) return;

        const card = this.cardElement.nativeElement;
        const deltaX = event.center.x - this.initialX;
        const deltaY = event.center.y - this.initialY;
        const rotation = deltaX * 0.1; // Rotate slightly based on drag distance

        card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;`

        // Show like/dislike indicators based on drag direction
        if (deltaX > 50) {
          this.showLikeIndicator()
        } else if (deltaX  {
        if (!this.isDragging) return;
        this.isDragging = false;

        const deltaX = event.center.x - this.initialX;
        const threshold = 100; // Minimum distance to trigger a swipe

        if (deltaX > threshold) {
          this.onSwipe('right')
        } else if (deltaX  {
        this.isDragging = true;
        this.cardState = 'swiping';
        this.initialX = e.clientX;
        this.initialY = e.clientY;
      }

      const onMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.initialX;
        const deltaY = e.clientY - this.initialY;
        const rotation = deltaX * 0.1;

        card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;`

        if (deltaX > 50) {
          this.showLikeIndicator()
        } else if (deltaX  {
        if (!this.isDragging) return;
        this.isDragging = false;

        const deltaX = e.clientX - this.initialX;
        const threshold = 100;

        if (deltaX > threshold) {
          this.onSwipe('right')
        } else if (deltaX  {
          card.removeEventListener('mousedown', onMouseDown)
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)
        },
      } as any;
    }
  }

  onSwipe(direction: 'left' | 'right'): void {
    this.cardState = direction === 'left' ? 'swiped-left' : 'swiped-right';

    // Emit the swipe event after animation completes
    setTimeout(() => {
      this.swiped.emit({ direction, adId: this.ad._id })
    }, 300)
  }

  resetCard(): void {
    const card = this.cardElement.nativeElement;
    card.style.transform = '';
    this.cardState = 'default';
    this.resetIndicators()
  }

  showLikeIndicator(): void {
    const likeIndicator = this.cardElement.nativeElement.querySelector('.like-indicator')
    const dislikeIndicator = this.cardElement.nativeElement.querySelector('.dislike-indicator')

    if (likeIndicator && dislikeIndicator) {
      likeIndicator.style.opacity = '1';
      likeIndicator.style.transform = 'translateY(-50%) rotate(20deg) scale(1)';
      dislikeIndicator.style.opacity = '0';
      dislikeIndicator.style.transform = 'translateY(-50%) rotate(-20deg) scale(0)';
    }
  }

  showDislikeIndicator(): void {
    const likeIndicator = this.cardElement.nativeElement.querySelector('.like-indicator')
    const dislikeIndicator = this.cardElement.nativeElement.querySelector('.dislike-indicator')

    if (likeIndicator && dislikeIndicator) {
      likeIndicator.style.opacity = '0';
      likeIndicator.style.transform = 'translateY(-50%) rotate(20deg) scale(0)';
      dislikeIndicator.style.opacity = '1';
      dislikeIndicator.style.transform = 'translateY(-50%) rotate(-20deg) scale(1)';
    }
  }

  resetIndicators(): void {
    const likeIndicator = this.cardElement.nativeElement.querySelector('.like-indicator')
    const dislikeIndicator = this.cardElement.nativeElement.querySelector('.dislike-indicator')

    if (likeIndicator && dislikeIndicator) {
      likeIndicator.style.opacity = '0';
      likeIndicator.style.transform = 'translateY(-50%) rotate(20deg) scale(0)';
      dislikeIndicator.style.opacity = '0';
      dislikeIndicator.style.transform = 'translateY(-50%) rotate(-20deg) scale(0)';
    }
  }

  nextMedia(): void {
    if (this.ad.media && this.ad.media.length > 0) {
      this.currentMediaIndex = (this.currentMediaIndex + 1) % this.ad.media.length;
    }
  }

  prevMedia(): void {
    if (this.ad.media && this.ad.media.length > 0) {
      this.currentMediaIndex =;
        (this.currentMediaIndex - 1 + this.ad.media.length) % this.ad.media.length;
    }
  }

  getCurrentMediaUrl(): string {
    if (this.ad.media && this.ad.media.length > 0) {
      return this.ad.media[this.currentMediaIndex].url;
    }
    return '/assets/images/default-profile.jpg';
  }

  isCurrentMediaVideo(): boolean {
    if (this.ad.media && this.ad.media.length > 0) {
      const media = this.ad.media[this.currentMediaIndex]
      return media.type === 'video';
    }
    return false;
  }

  getMediaDots(): number[] {
    if (this.ad.media && this.ad.media.length > 0) {
      return Array(this.ad.media.length)
        .fill(0)
        .map((_, i) => i)
    }
    return []
  }

  onViewDetails(event: Event): void {
    event.stopPropagation()
    this.viewDetails.emit(this.ad._id)
  }

  onStartChat(event: Event): void {
    event.stopPropagation()
    this.startChat.emit(this.ad._id)
  }
}
