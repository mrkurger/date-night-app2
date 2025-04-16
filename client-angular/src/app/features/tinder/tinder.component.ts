// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (tinder.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad } from '../../core/models/ad.interface';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';

// Import Emerald components
import {
  TinderCardComponent,
  TinderCardMedia,
  FloatingActionButtonComponent,
  SkeletonLoaderComponent,
  ToggleComponent,
  LabelComponent,
} from '../../shared/emerald';

@Component({
  selector: 'app-tinder',
  templateUrl: './tinder.component.html',
  styleUrls: ['./tinder.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    TinderCardComponent,
    FloatingActionButtonComponent,
    SkeletonLoaderComponent,
    ToggleComponent,
    LabelComponent,
  ],
})
export class TinderComponent implements OnInit {
  /**
   * Array of all ads available for swiping
   */
  ads: Ad[] = [];

  /**
   * Current ad being displayed
   */
  currentAd: Ad | null = null;

  /**
   * Next ad in the queue (for preloading)
   */
  nextAd: Ad | null = null;

  /**
   * Current state of the card ('', 'like', 'dislike')
   */
  cardState: '' | 'like' | 'dislike' = '';

  /**
   * Loading state
   */
  loading = true;

  /**
   * Error message
   */
  error: string | null = null;

  /**
   * Filter form
   */
  filterForm: FormGroup;

  /**
   * Available counties for location filter
   */
  counties: string[] = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Tromsø'];

  /**
   * Authentication state
   */
  isAuthenticated = false;

  /**
   * Constructor
   */
  constructor(
    private adService: AdService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Initialize filter form
    this.filterForm = this.fb.group({
      category: [''],
      location: [''],
      touringOnly: [false],
    });
  }

  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Load ads
    this.loadSwipeAds();

    // Check authentication status
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  /**
   * Load ads for swiping
   */
  loadSwipeAds(): void {
    this.loading = true;
    this.error = null;
    this.cardState = '';

    // Get filter values
    const filters = this.filterForm.value;

    this.adService.getSwipeAds(filters).subscribe({
      next: ads => {
        if (ads && ads.length > 0) {
          this.ads = ads;
          this.currentAd = ads[0];
          this.nextAd = ads.length > 1 ? ads[1] : null;
        } else {
          this.currentAd = null;
          this.nextAd = null;
          this.ads = [];
        }
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load ads. Please try again.';
        this.loading = false;
        console.error('Error loading swipe ads:', err);
      },
    });
  }

  /**
   * Handle swipe event from TinderCard component
   * @param event Swipe event with direction and itemId
   */
  onSwipe(event: { direction: 'left' | 'right'; itemId: string }): void {
    if (!this.currentAd) return;

    const direction = event.direction;
    const currentAdId = this.currentAd._id;

    // Set card state for animation
    this.cardState = direction === 'right' ? 'like' : 'dislike';

    // Record the swipe
    this.adService.recordSwipe(currentAdId, direction).subscribe({
      next: () => {
        // Show notification for right swipes (likes)
        if (direction === 'right') {
          this.notificationService.success('Added to your favorites');
        }
      },
      error: err => {
        console.error('Error recording swipe:', err);
      },
    });

    // Move to the next card after animation
    setTimeout(() => {
      // Remove the current ad from the array
      this.ads = this.ads.filter(ad => ad._id !== currentAdId);

      // Set the next ad as current
      this.currentAd = this.nextAd;

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

  /**
   * Handle media change event from TinderCard component
   * @param index New media index
   */
  onMediaChange(index: number): void {
    // This method can be used to track media changes if needed
    console.log('Media changed to index:', index);
  }

  /**
   * Handle card action click
   * @param event Action event with id and itemId
   */
  onCardAction(event: { id: string; itemId: string }): void {
    if (!this.currentAd) return;

    switch (event.id) {
      case 'info':
        this.viewAdDetails();
        break;
      case 'chat':
        this.startChat();
        break;
      default:
        console.warn('Unknown action:', event.id);
    }
  }

  /**
   * Navigate to ad details page
   */
  viewAdDetails(): void {
    if (!this.currentAd) return;
    this.router.navigateByUrl(`/ad-details/${this.currentAd._id}`);
  }

  /**
   * Start a chat with the advertiser
   */
  startChat(): void {
    if (!this.currentAd) return;

    if (!this.isAuthenticated) {
      this.notificationService.error('Please log in to start a chat');
      return;
    }

    this.chatService.createAdRoom(this.currentAd._id).subscribe({
      next: room => {
        this.router.navigateByUrl(`/chat/${room._id}`);
      },
      error: err => {
        this.notificationService.error('Failed to start chat');
        console.error('Error starting chat:', err);
      },
    });
  }

  /**
   * Convert ad media to TinderCardMedia format
   * @param ad The ad to convert media from
   * @returns Array of TinderCardMedia objects
   */
  getCardMedia(ad: Ad): TinderCardMedia[] {
    if (!ad.media || ad.media.length === 0) {
      // If no media, return a default image
      return [{ url: '/assets/images/default-profile.jpg', type: 'image' }];
    }

    // Convert ad.media to TinderCardMedia format
    return ad.media.map(item => ({
      url: item.url,
      type: item.type === 'image' || item.type === 'video' ? item.type : 'image',
    }));
  }

  /**
   * Open filters modal
   */
  openFilters(): void {
    const modal = document.getElementById('filtersModal');
    if (modal) {
      try {
        // Try to use Bootstrap's modal API if available
        // @ts-ignore
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          // @ts-ignore
          const bsModal = new bootstrap.Modal(modal);
          bsModal.show();
        } else {
          // Fallback implementation if Bootstrap is not available
          modal.classList.add('show');
          modal.style.display = 'block';
          document.body.classList.add('modal-open');

          // Create backdrop if it doesn't exist
          let backdrop = document.querySelector('.modal-backdrop');
          if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
          }
        }
      } catch (error) {
        console.error('Error opening modal:', error);
        // Simple fallback
        modal.style.display = 'block';
      }
    }
  }

  /**
   * Close filters modal
   */
  closeFilters(): void {
    const modal = document.getElementById('filtersModal');
    if (modal) {
      try {
        // Try to use Bootstrap's modal API if available
        // @ts-ignore
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          // @ts-ignore
          const bsModal = bootstrap.Modal.getInstance(modal);
          if (bsModal) {
            bsModal.hide();
          }
        } else {
          // Fallback implementation if Bootstrap is not available
          modal.classList.remove('show');
          modal.style.display = 'none';
          document.body.classList.remove('modal-open');

          // Remove backdrop
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.parentNode?.removeChild(backdrop);
          }
        }
      } catch (error) {
        console.error('Error closing modal:', error);
        // Simple fallback
        modal.style.display = 'none';
      }
    }
  }

  /**
   * Apply filters and reload ads
   */
  applyFilters(): void {
    this.loadSwipeAds();
    this.closeFilters();
    this.notificationService.success('Filters applied');
  }

  /**
   * Reset filters to default values
   */
  resetFilters(): void {
    this.filterForm.reset({
      category: '',
      location: '',
      touringOnly: false,
    });
  }
}
