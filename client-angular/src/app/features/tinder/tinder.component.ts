import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CachingService } from '../../core/services/caching.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-tinder',
  templateUrl: './tinder.component.html',
  styleUrls: ['./tinder.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  animations: [
    trigger('cardState', [
      state('default', style({
        transform: 'none'
      })),
      state('swiped-left', style({
        transform: 'translateX(-150%) rotate(-20deg)',
        opacity: 0
      })),
      state('swiped-right', style({
        transform: 'translateX(150%) rotate(20deg)',
        opacity: 0
      })),
      transition('default => swiped-left', [
        animate('400ms ease-out')
      ]),
      transition('default => swiped-right', [
        animate('400ms ease-out')
      ]),
      transition('swiped-left => default', [
        animate('400ms ease-out')
      ]),
      transition('swiped-right => default', [
        animate('400ms ease-out')
      ])
    ])
  ]
})
export class TinderComponent implements OnInit, AfterViewInit {
  @ViewChild('swipeContainer') swipeContainer: ElementRef;

  ads: any[] = [];
  currentAd: any = null;
  nextAd: any = null;
  loading = false;
  error = '';

  // Swipe tracking
  startX = 0;
  currentX = 0;
  swipeThreshold = 150;
  isDragging = false;
  cardState = 'default';

  // Current media index for carousel
  currentMediaIndex = 0;

  // Preloaded images
  preloadedImages: HTMLImageElement[] = [];

  // Screen size detection
  isMobile = false;

  // Filter form
  filterForm: FormGroup;

  // Norwegian counties for filter
  counties = [
    'Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo',
    'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark',
    'Vestland', 'Viken'
  ];

  constructor(
    private adService: AdService,
    private notificationService: NotificationService,
    private router: Router,
    private cachingService: CachingService,
    private formBuilder: FormBuilder,
    private chatService: ChatService,
    private authService: AuthService
  ) {
    this.filterForm = this.formBuilder.group({
      category: [''],
      location: [''],
      touringOnly: [false]
    });
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadSwipeAds();
  }

  ngAfterViewInit(): void {
    // Add touch and mouse event listeners
    if (this.swipeContainer) {
      const element = this.swipeContainer.nativeElement;

      // Touch events
      element.addEventListener('touchstart', this.onTouchStart.bind(this));
      element.addEventListener('touchmove', this.onTouchMove.bind(this));
      element.addEventListener('touchend', this.onTouchEnd.bind(this));

      // Mouse events
      element.addEventListener('mousedown', this.onMouseDown.bind(this));
      element.addEventListener('mousemove', this.onMouseMove.bind(this));
      element.addEventListener('mouseup', this.onMouseUp.bind(this));
      element.addEventListener('mouseleave', this.onMouseUp.bind(this));
    }
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  loadSwipeAds(): void {
    this.loading = true;
    this.adService.getSwipeAds().subscribe({
      next: (ads) => {
        this.ads = ads.filter(ad => ad.media && ad.media.length > 0);

        if (this.ads.length > 0) {
          this.currentAd = this.ads[0];
          this.currentMediaIndex = 0;

          // Preload next ad images
          if (this.ads.length > 1) {
            this.nextAd = this.ads[1];
            this.preloadImages(this.nextAd);
          }
        } else {
          this.currentAd = null;
          this.error = 'No ads available for swiping';
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load ads for swiping', err);
        this.loading = false;
        this.error = 'Failed to load ads';
        this.notificationService.error('Failed to load ads for swiping');
      }
    });
  }

  preloadImages(ad: any): void {
    if (ad && ad.media) {
      ad.media.forEach((media: any) => {
        if (media.type === 'image' && media.url) {
          const img = new Image();
          img.src = media.url;
          this.preloadedImages.push(img);
        }
      });
    }
  }

  onSwipe(direction: 'left' | 'right'): void {
    if (!this.currentAd) return;

    this.cardState = direction === 'left' ? 'swiped-left' : 'swiped-right';

    // Record swipe after animation
    setTimeout(() => {
      this.recordSwipeAndAdvance(direction);
    }, 400);
  }

  recordSwipeAndAdvance(direction: 'left' | 'right'): void {
    this.adService.recordSwipe(this.currentAd._id, direction).subscribe({
      next: () => {
        // Show match notification if swiped right
        if (direction === 'right') {
          // Simulate a match with 20% probability
          if (Math.random() < 0.2) {
            this.notificationService.success('It\'s a match! 🎉');
          }
        }

        // Move to next ad
        this.ads.shift();
        this.currentAd = this.ads[0];
        this.currentMediaIndex = 0;
        this.cardState = 'default';

        // Preload next ad images
        if (this.ads.length > 1) {
          this.nextAd = this.ads[1];
          this.preloadImages(this.nextAd);
        } else {
          this.nextAd = null;
        }

        // Load more ads if running low
        if (this.ads.length < 3) {
          this.loadMoreAds();
        }
      },
      error: (err) => {
        console.error('Failed to record swipe', err);
        this.notificationService.error('Failed to record your preference');
        this.cardState = 'default';
      }
    });
  }

  loadMoreAds(): void {
    // This would typically call an API with pagination or "load more" functionality
    // For now, we'll just reload the initial set if we're running low
    if (this.ads.length < 3) {
      this.adService.getSwipeAds().subscribe({
        next: (ads) => {
          // Filter out ads we already have
          const newAds = ads.filter(ad =>
            !this.ads.some(existingAd => existingAd._id === ad._id)
          );

          this.ads = [...this.ads, ...newAds];

          // Preload next ad images if we have a new next ad
          if (this.ads.length > 1 && !this.nextAd) {
            this.nextAd = this.ads[1];
            this.preloadImages(this.nextAd);
          }
        },
        error: (err) => console.error('Failed to load more ads', err)
      });
    }
  }

  // Touch event handlers
  onTouchStart(event: TouchEvent): void {
    if (!this.currentAd) return;
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    this.currentX = event.touches[0].clientX;
    this.updateCardPosition();
  }

  onTouchEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.completeSwipe();
  }

  // Mouse event handlers
  onMouseDown(event: MouseEvent): void {
    if (!this.currentAd) return;
    this.startX = event.clientX;
    this.isDragging = true;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.currentX = event.clientX;
    this.updateCardPosition();
  }

  onMouseUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.completeSwipe();
  }

  // Update card position during drag
  updateCardPosition(): void {
    if (!this.swipeContainer) return;

    const card = this.swipeContainer.nativeElement.querySelector('.swipe-card');
    if (!card) return;

    const deltaX = this.currentX - this.startX;
    const rotation = deltaX * 0.1; // Rotate slightly while dragging

    card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

    // Adjust opacity of like/dislike indicators
    const likeIndicator = card.querySelector('.like-indicator');
    const dislikeIndicator = card.querySelector('.dislike-indicator');

    if (likeIndicator && dislikeIndicator) {
      if (deltaX > 0) {
        likeIndicator.style.opacity = Math.min(deltaX / this.swipeThreshold, 1);
        dislikeIndicator.style.opacity = 0;
      } else if (deltaX < 0) {
        dislikeIndicator.style.opacity = Math.min(Math.abs(deltaX) / this.swipeThreshold, 1);
        likeIndicator.style.opacity = 0;
      } else {
        likeIndicator.style.opacity = 0;
        dislikeIndicator.style.opacity = 0;
      }
    }
  }

  // Complete the swipe action
  completeSwipe(): void {
    if (!this.swipeContainer) return;

    const card = this.swipeContainer.nativeElement.querySelector('.swipe-card');
    if (!card) return;

    const deltaX = this.currentX - this.startX;

    if (Math.abs(deltaX) >= this.swipeThreshold) {
      // Swipe was strong enough to count
      const direction = deltaX > 0 ? 'right' : 'left';
      this.onSwipe(direction);
    } else {
      // Reset card position with animation
      card.style.transition = 'transform 0.3s ease';
      card.style.transform = 'translateX(0) rotate(0deg)';

      // Reset indicators
      const likeIndicator = card.querySelector('.like-indicator');
      const dislikeIndicator = card.querySelector('.dislike-indicator');

      if (likeIndicator && dislikeIndicator) {
        likeIndicator.style.opacity = 0;
        dislikeIndicator.style.opacity = 0;
      }

      // Remove transition after animation completes
      setTimeout(() => {
        card.style.transition = '';
      }, 300);
    }
  }

  // Navigate through media carousel
  nextMedia(): void {
    if (!this.currentAd || !this.currentAd.media || this.currentAd.media.length <= 1) return;

    this.currentMediaIndex = (this.currentMediaIndex + 1) % this.currentAd.media.length;
  }

  prevMedia(): void {
    if (!this.currentAd || !this.currentAd.media || this.currentAd.media.length <= 1) return;

    this.currentMediaIndex = (this.currentMediaIndex - 1 + this.currentAd.media.length) % this.currentAd.media.length;
  }

  // View ad details
  viewAdDetails(): void {
    if (!this.currentAd) return;
    this.router.navigate(['/ad-details', this.currentAd._id]);
  }

  // Start a chat with the advertiser
  startChat(): void {
    if (!this.currentAd) return;

    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.notificationService.info('Please log in to start a chat');
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: `/ad-details/${this.currentAd._id}` }
        });
        return;
      }

      this.chatService.createAdRoom(this.currentAd._id).subscribe({
        next: (room) => {
          this.router.navigate(['/chat'], { queryParams: { roomId: room._id } });
        },
        error: (err) => {
          console.error('Failed to create chat room', err);
          this.notificationService.error('Failed to start chat. Please try again.');
        }
      });
    });
  }

  // Get current media URL
  getCurrentMediaUrl(): string {
    if (!this.currentAd || !this.currentAd.media || this.currentAd.media.length === 0) {
      return '/assets/images/default-profile.jpg';
    }

    return this.currentAd.media[this.currentMediaIndex].url;
  }

  // Check if current media is a video
  isCurrentMediaVideo(): boolean {
    if (!this.currentAd || !this.currentAd.media || this.currentAd.media.length === 0) {
      return false;
    }

    return this.currentAd.media[this.currentMediaIndex].type === 'video';
  }

  // Get media indicator dots
  getMediaDots(): number[] {
    if (!this.currentAd || !this.currentAd.media) return [];
    return Array(this.currentAd.media.length).fill(0).map((_, i) => i);
  }

  // Open filters modal
  openFilters(): void {
    const modalElement = document.getElementById('filtersModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Apply filters and reload ads
  applyFilters(): void {
    this.loadSwipeAds();
  }

  // Load ads with current filters
  loadSwipeAds(): void {
    this.loading = true;
    this.error = '';

    const filters = this.filterForm.value;

    this.adService.getSwipeAds(filters).subscribe({
      next: (ads) => {
        this.ads = ads.filter(ad => ad.media && ad.media.length > 0);

        if (this.ads.length > 0) {
          this.currentAd = this.ads[0];
          this.currentMediaIndex = 0;
          this.cardState = 'default';

          // Preload next ad images
          if (this.ads.length > 1) {
            this.nextAd = this.ads[1];
            this.preloadImages(this.nextAd);
          }
        } else {
          this.currentAd = null;
          this.error = 'No ads available for swiping';
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load ads for swiping', err);
        this.loading = false;
        this.error = 'Failed to load ads';
        this.notificationService.error('Failed to load ads for swiping');
      }
    });
  }
}
