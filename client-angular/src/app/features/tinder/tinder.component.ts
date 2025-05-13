import { NbToggleModule } from '@nebular/theme';
import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (tinder.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbDialogModule,
  NbDialogService,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbToggleModule,
  NbSpinnerModule,
} from '@nebular/theme';

import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad } from '../../core/models/ad.interface';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';
import { TinderCardComponent } from '../../shared/components/tinder-card/tinder-card.component';

@Component({
  selector: 'app-tinder',
  templateUrl: './tinder.component.html',
  styleUrls: ['./tinder.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbDialogModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbToggleModule,
    NbSpinnerModule,
    MainLayoutComponent,
    TinderCardComponent,
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
  cardState: 'default' | 'like' | 'dislike' | 'superlike' = 'default';

  /**
   * Loading state
   */
  loading = false;

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
  counties: string[] = [];

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
    private formBuilder: FormBuilder,
    private router: Router,
    private dialogService: NbDialogService,
  ) {
    // Initialize filter form
    this.filterForm = this.formBuilder.group({
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
    this.authService.currentUser$.subscribe((user) => {
      this.isAuthenticated = !!user;
    });

    // Load available counties for location filter
    this.loadCounties();
  }

  /**
   * Load ads for swiping
   */
  loadSwipeAds(): void {
    this.loading = true;
    this.error = null;

    const filters = this.filterForm.value;
    this.adService.getAds(filters).subscribe({
      next: (response) => {
        this.ads = response.ads;
        this.currentAd = this.ads[0] || null;
        this.nextAd = this.ads[1] || null;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profiles';
        this.loading = false;
        console.error('Error loading ads:', err);
      },
    });
  }

  /**
   * Load available counties for location filter
   */
  private loadCounties(): void {
    this.adService.getCounties().subscribe({
      next: (counties) => {
        this.counties = counties;
      },
      error: (err) => {
        console.error('Error loading counties:', err);
      },
    });
  }

  /**
   * Get formatted location string
   */
  getLocationString(ad: Ad): string {
    return `${ad.location.city}, ${ad.location.county}`;
  }

  /**
   * Get card media array
   */
  getCardMedia(ad: Ad): { type: 'image' | 'video'; url: string; thumbnail?: string }[] {
    return ad.media.map((media) => ({
      type: media.type as 'image' | 'video',
      url: media.url,
      thumbnail: media.thumbnail,
    }));
  }

  /**
   * Get ad ID as string
   */
  getAdIdAsString(id: any): string {
    return id.toString();
  }

  /**
   * Handle card swipe
   */
  onSwipe(event: { direction: 'left' | 'right' | 'up'; itemId: string }): void {
    if (!this.currentAd) return;

    switch (event.direction) {
      case 'right':
        this.likeAd(this.currentAd._id);
        break;
      case 'left':
        this.dislikeAd(this.currentAd._id);
        break;
      case 'up':
        this.superlikeAd(this.currentAd._id);
        break;
    }
  }

  /**
   * Handle card action click
   */
  onCardAction(event: { action: string; itemId: string }): void {
    if (!this.currentAd) return;

    switch (event.action) {
      case 'like':
        this.likeAd(this.currentAd._id);
        break;
      case 'dislike':
        this.dislikeAd(this.currentAd._id);
        break;
      case 'superlike':
        this.superlikeAd(this.currentAd._id);
        break;
    }
  }

  /**
   * Handle media change
   */
  onMediaChange(event: { index: number; media: any }): void {
    // Handle media change if needed
  }

  /**
   * Like an ad
   */
  private likeAd(adId: string): void {
    this.cardState = 'like';
    this.adService.likeAd(adId).subscribe({
      next: () => {
        this.notificationService.success('Profile liked!');
        this.nextCard();
      },
      error: (err) => {
        this.notificationService.error('Failed to like profile');
        console.error('Error liking ad:', err);
        this.cardState = 'default';
      },
    });
  }

  /**
   * Dislike an ad
   */
  private dislikeAd(adId: string): void {
    this.cardState = 'dislike';
    this.adService.dislikeAd(adId).subscribe({
      next: () => {
        this.nextCard();
      },
      error: (err) => {
        console.error('Error disliking ad:', err);
        this.cardState = 'default';
      },
    });
  }

  /**
   * Superlike an ad
   */
  private superlikeAd(adId: string): void {
    this.cardState = 'superlike';
    this.adService.superlikeAd(adId).subscribe({
      next: () => {
        this.notificationService.success('Profile super liked!');
        this.nextCard();
      },
      error: (err) => {
        this.notificationService.error('Failed to super like profile');
        console.error('Error super liking ad:', err);
        this.cardState = 'default';
      },
    });
  }

  /**
   * Move to next card
   */
  private nextCard(): void {
    setTimeout(() => {
      this.ads = this.ads.slice(1);
      this.currentAd = this.ads[0] || null;
      this.nextAd = this.ads[1] || null;
      this.cardState = 'default';

      if (!this.currentAd) {
        this.loadSwipeAds();
      }
    }, 300);
  }

  /**
   * Open filters dialog
   */
  openFilters(dialog: any): void {
    this.dialogService.open(dialog, {
      context: {},
      hasBackdrop: true,
      closeOnBackdropClick: true,
    });
  }

  /**
   * Close filters dialog
   */
  closeFilters(): void {
    // Dialog will be closed automatically by Nebular
  }

  /**
   * Reset filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      category: '',
      location: '',
      touringOnly: false,
    });
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    this.loadSwipeAds();
    this.closeFilters();
  }
}
