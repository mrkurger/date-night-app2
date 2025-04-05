import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad } from '../../core/models/ad.interface';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';

@Component({
  selector: 'app-tinder',
  templateUrl: './tinder.component.html',
  styleUrls: ['./tinder.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MainLayoutComponent]
})
export class TinderComponent implements OnInit, AfterViewInit {
  @ViewChild('swipeContainer') swipeContainer!: ElementRef;

  ads: Ad[] = [];
  currentAd: Ad | null = null;
  nextAd: Ad | null = null;
  currentMediaIndex = 0;
  cardState = '';
  loading = true;
  error: string | null = null;
  filterForm: FormGroup;
  counties: string[] = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand'];

  constructor(
    private adService: AdService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      location: [''],
      touringOnly: [false]
    });
  }

  ngOnInit(): void {
    this.loadSwipeAds();
  }

  ngAfterViewInit(): void {
    if (this.swipeContainer) {
      this.initializeSwipeEvents();
    }
  }

  loadSwipeAds(): void {
    this.loading = true;
    this.error = null;

    // Get filter values
    const filters = this.filterForm.value;

    this.adService.getSwipeAds(filters).subscribe({
      next: (ads) => {
        if (ads && ads.length > 0) {
          this.ads = ads;
          this.currentAd = ads[0];
          this.nextAd = ads.length > 1 ? ads[1] : null;
          this.currentMediaIndex = 0;
        } else {
          this.currentAd = null;
          this.nextAd = null;
          this.ads = [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ads. Please try again.';
        this.loading = false;
        console.error('Error loading swipe ads:', err);
      }
    });
  }

  initializeSwipeEvents(): void {
    const element = this.swipeContainer.nativeElement;
    let startX = 0;
    let startY = 0;
    let moveX = 0;
    let moveY = 0;

    // Touch start event
    element.addEventListener('touchstart', (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    // Touch move event
    element.addEventListener('touchmove', (e: TouchEvent) => {
      if (!this.currentAd) return;

      moveX = e.touches[0].clientX - startX;
      moveY = e.touches[0].clientY - startY;

      const rotation = moveX * 0.1; // Rotate slightly based on swipe distance

      // Apply transform to the card
      const card = element.querySelector('.swipe-card');
      if (card) {
        card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg)`;

        // Show like/dislike indicators based on swipe direction
        if (moveX > 50) {
          this.cardState = 'like';
        } else if (moveX < -50) {
          this.cardState = 'dislike';
        } else {
          this.cardState = '';
        }
      }
    });

    // Touch end event
    element.addEventListener('touchend', () => {
      if (!this.currentAd) return;

      // If swiped far enough, trigger the swipe action
      if (moveX > 100) {
        this.onSwipe('right');
      } else if (moveX < -100) {
        this.onSwipe('left');
      } else {
        // Reset card position with animation
        const card = element.querySelector('.swipe-card');
        if (card) {
          card.style.transition = 'transform 0.3s ease';
          card.style.transform = 'translate(0, 0) rotate(0deg)';
          setTimeout(() => {
            card.style.transition = '';
          }, 300);
        }
        this.cardState = '';
      }

      // Reset values
      startX = 0;
      startY = 0;
      moveX = 0;
      moveY = 0;
    });

    // Mouse events for desktop
    element.addEventListener('mousedown', (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      element.style.cursor = 'grabbing';

      const handleMouseMove = (e: MouseEvent) => {
        if (!this.currentAd) return;

        moveX = e.clientX - startX;
        moveY = e.clientY - startY;

        const rotation = moveX * 0.1;

        const card = element.querySelector('.swipe-card');
        if (card) {
          card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rotation}deg)`;

          if (moveX > 50) {
            this.cardState = 'like';
          } else if (moveX < -50) {
            this.cardState = 'dislike';
          } else {
            this.cardState = '';
          }
        }
      };

      const handleMouseUp = () => {
        element.style.cursor = '';

        if (!this.currentAd) return;

        if (moveX > 100) {
          this.onSwipe('right');
        } else if (moveX < -100) {
          this.onSwipe('left');
        } else {
          const card = element.querySelector('.swipe-card');
          if (card) {
            card.style.transition = 'transform 0.3s ease';
            card.style.transform = 'translate(0, 0) rotate(0deg)';
            setTimeout(() => {
              card.style.transition = '';
            }, 300);
          }
          this.cardState = '';
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        startX = 0;
        startY = 0;
        moveX = 0;
        moveY = 0;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  }

  onSwipe(direction: 'left' | 'right'): void {
    if (!this.currentAd) return;

    const currentAdId = this.currentAd._id;

    // Animate the card off screen
    const card = this.swipeContainer.nativeElement.querySelector('.swipe-card');
    if (card) {
      const xOffset = direction === 'right' ? window.innerWidth : -window.innerWidth;
      card.style.transition = 'transform 0.5s ease';
      card.style.transform = `translate(${xOffset}px, 0) rotate(${direction === 'right' ? 30 : -30}deg)`;
    }

    // Record the swipe
    this.adService.recordSwipe(currentAdId, direction).subscribe({
      next: () => {
        // Show notification for right swipes (likes)
        if (direction === 'right') {
          this.notificationService.success('Added to your favorites');
        }
      },
      error: (err) => {
        console.error('Error recording swipe:', err);
      }
    });

    // Move to the next card after animation
    setTimeout(() => {
      // Remove the current ad from the array
      this.ads = this.ads.filter(ad => ad._id !== currentAdId);

      // Set the next ad as current
      this.currentAd = this.nextAd;
      this.currentMediaIndex = 0;

      // Set the next ad in queue
      this.nextAd = this.ads.length > 1 ? this.ads[1] : null;

      // Reset card state
      this.cardState = '';

      // If we're out of ads, show empty state
      if (this.ads.length === 0) {
        this.currentAd = null;
        this.nextAd = null;
      }
    }, 500);
  }

  prevMedia(): void {
    if (!this.currentAd || !this.currentAd.media || this.currentAd.media.length <= 1) return;

    this.currentMediaIndex = (this.currentMediaIndex - 1 + this.currentAd.media.length) % this.currentAd.media.length;
  }

  nextMedia(): void {
    if (!this.currentAd || !this.currentAd.media || this.currentAd.media.length <= 1) return;

    this.currentMediaIndex = (this.currentMediaIndex + 1) % this.currentAd.media.length;
  }

  getCurrentMediaUrl(): string {
    if (!this.currentAd || !this.currentAd.media || this.currentAd.media.length === 0) {
      return '/assets/images/default-profile.jpg';
    }

    return this.currentAd.media[this.currentMediaIndex].url;
  }

  isCurrentMediaVideo(): boolean {
    if (!this.currentAd || !this.currentAd.media || this.currentAd.media.length === 0) {
      return false;
    }

    const media = this.currentAd.media[this.currentMediaIndex];
    return media.type === 'video';
  }

  getMediaDots(): number[] {
    if (!this.currentAd || !this.currentAd.media) return [];
    return Array(this.currentAd.media.length).fill(0).map((_, i) => i);
  }

  viewAdDetails(): void {
    if (!this.currentAd) return;
    window.location.href = `/ad-details/${this.currentAd._id}`;
  }

  startChat(): void {
    if (!this.currentAd) return;

    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.notificationService.error('Please log in to start a chat');
        return;
      }

      this.chatService.createAdRoom(this.currentAd!._id).subscribe({
        next: (room) => {
          window.location.href = `/chat/${room._id}`;
        },
        error: (err) => {
          this.notificationService.error('Failed to start chat');
          console.error('Error starting chat:', err);
        }
      });
    });
  }

  openFilters(): void {
    const modal = document.getElementById('filtersModal');
    if (modal) {
      // Using Bootstrap's modal API
      // @ts-ignore
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  applyFilters(): void {
    this.loadSwipeAds();
  }
}
