// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (netflix-view.component)
//
// COMMON CUSTOMIZATIONS:
// - HERO_SECTION_HEIGHT: Height of the hero section (default: 70vh)
//   Related to: netflix-view.component.scss:$hero-section-height
// - CARD_ANIMATION_DURATION: Duration of card hover animations (default: 300ms)
//   Related to: netflix-view.component.scss:$card-animation-duration
// ===================================================
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  QueryList,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad } from '../../core/models/ad.interface';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';

// Import Nebular components
import {
  NbCardModule,
  NbLayoutModule,
  NbButtonModule,
  NbIconModule,
  NbBadgeModule,
  NbToggleModule,
  NbDialogModule,
  NbSelectModule,
  NbFormFieldModule,
  NbInputModule,
  NbUserModule,
  NbTagModule,
  NbSpinnerModule,
  NbDialogService,
} from '@nebular/theme';

@Component({
  selector: 'app-netflix-view',
  templateUrl: './netflix-view.component.html',
  styleUrls: ['./netflix-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    // Add Nebular components
    NbCardModule,
    NbLayoutModule,
    NbButtonModule,
    NbIconModule,
    NbBadgeModule,
    NbToggleModule,
    NbDialogModule,
    NbSelectModule,
    NbFormFieldModule,
    NbInputModule,
    NbUserModule,
    NbTagModule,
    NbSpinnerModule,
  ],
})
export class NetflixViewComponent implements OnInit {
  // Define categories for Netflix-style rows
  categories: string[] = ['Featured', 'New Arrivals', 'Most Popular', 'Nearby', 'Touring'];

  // Store ads by category
  adsByCategory: { [key: string]: Ad[] } = {};

  // Component state
  loading = true;
  error: string | null = null;
  filterForm: FormGroup;
  isAuthenticated = false;

  // For hero section
  featuredAd: Ad | null = null;

  // CardGrid configuration
  cardGridConfig = {
    layout: 'netflix' as 'netflix' | 'grid' | 'masonry',
    gap: 16,
    animated: true,
    itemsPerRow: {
      xs: 2, // Extra small devices (phones)
      sm: 3, // Small devices (tablets)
      md: 4, // Medium devices (small laptops)
      lg: 5, // Large devices (desktops)
      xl: 6, // Extra large devices (large desktops)
    },
  };

  @ViewChild('filtersDialog') filtersDialog!: TemplateRef<any>;

  constructor(
    private adService: AdService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private dialogService: NbDialogService,
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      location: [''],
      touringOnly: [false],
    });
  }

  /**
   * Initialize the component
   * - Load ads from the service
   * - Check authentication status
   */
  ngOnInit(): void {
    // Load ads for all categories
    this.loadAds();

    // Subscribe to authentication state
    this.authService.currentUser$.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  loadAds(): void {
    this.loading = true;
    this.error = null;

    // First, try to get featured ads
    this.adService.getFeaturedAds().subscribe({
      next: (featuredAds) => {
        if (featuredAds && featuredAds.length > 0) {
          this.adsByCategory['Featured'] = featuredAds;
          // Set a featured ad for the hero section
          this.featuredAd = featuredAds[0];
        } else {
          this.adsByCategory['Featured'] = [];
        }

        // Then get trending ads
        this.adService.getTrendingAds().subscribe({
          next: (trendingAds) => {
            this.adsByCategory['Most Popular'] = trendingAds;

            // Get all ads for other categories
            this.adService.getAds().subscribe({
              next: (allAds) => {
                if (allAds && allAds.length > 0) {
                  // If we don't have a featured ad yet, set one from all ads
                  if (!this.featuredAd && allAds.length > 0) {
                    this.featuredAd = allAds[Math.floor(Math.random() * allAds.length)];
                  }

                  // Set New Arrivals (sort by creation date)
                  const newArrivals = [...allAds]
                    .sort((a, b) => {
                      const dateA = new Date(a.createdAt || 0);
                      const dateB = new Date(b.createdAt || 0);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .slice(0, 10);
                  this.adsByCategory['New Arrivals'] = newArrivals;

                  // Set Nearby (for now, just random selection)
                  this.adsByCategory['Nearby'] = this.shuffleArray([...allAds]).slice(0, 10);

                  // Set Touring (filter by isTouring flag)
                  const touringAds = allAds.filter((ad) => ad.isTouring).slice(0, 10);
                  this.adsByCategory['Touring'] =
                    touringAds.length > 0
                      ? touringAds
                      : this.shuffleArray([...allAds]).slice(0, 10);
                } else {
                  // If no ads found, set empty arrays for remaining categories
                  this.categories.forEach((category) => {
                    if (!this.adsByCategory[category]) {
                      this.adsByCategory[category] = [];
                    }
                  });
                }

                this.loading = false;
              },
              error: (err) => {
                this.error = 'Failed to load ads. Please try again.';
                this.loading = false;
                console.error('Error loading all ads:', err);
              },
            });
          },
          error: (err) => {
            console.error('Error loading trending ads:', err);
            // Continue loading other categories even if trending fails
            this.adsByCategory['Most Popular'] = [];
            // Pass an empty array since allAds is not defined in this scope
            this.loadRemainingCategories([]);
          },
        });
      },
      error: (err) => {
        console.error('Error loading featured ads:', err);
        // Continue loading other categories even if featured fails
        this.adsByCategory['Featured'] = [];
        this.loadTrendingAndRemainingAds();
      },
    });
  }

  private loadTrendingAndRemainingAds(): void {
    this.adService.getTrendingAds().subscribe({
      next: (trendingAds) => {
        this.adsByCategory['Most Popular'] = trendingAds;
        this.loadRemainingCategories();
      },
      error: (err) => {
        console.error('Error loading trending ads:', err);
        this.adsByCategory['Most Popular'] = [];
        this.loadRemainingCategories();
      },
    });
  }

  private loadRemainingCategories(existingAds?: Ad[]): void {
    if (existingAds && existingAds.length > 0) {
      this.processAllAds(existingAds);
    } else {
      this.adService.getAds().subscribe({
        next: (allAds) => {
          this.processAllAds(allAds);
        },
        error: (err) => {
          this.error = 'Failed to load ads. Please try again.';
          this.loading = false;
          console.error('Error loading all ads:', err);
        },
      });
    }
  }

  private processAllAds(allAds: Ad[]): void {
    if (allAds && allAds.length > 0) {
      // If we don't have a featured ad yet, set one from all ads
      if (!this.featuredAd && allAds.length > 0) {
        this.featuredAd = allAds[Math.floor(Math.random() * allAds.length)];
      }

      // Set New Arrivals (sort by creation date)
      const newArrivals = [...allAds]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10);
      this.adsByCategory['New Arrivals'] = newArrivals;

      // Set Nearby (for now, just random selection)
      this.adsByCategory['Nearby'] = this.shuffleArray([...allAds]).slice(0, 10);

      // Set Touring (filter by isTouring flag)
      const touringAds = allAds.filter((ad) => ad.isTouring).slice(0, 10);
      this.adsByCategory['Touring'] =
        touringAds.length > 0 ? touringAds : this.shuffleArray([...allAds]).slice(0, 10);
    } else {
      // If no ads found, set empty arrays for remaining categories
      this.categories.forEach((category) => {
        if (!this.adsByCategory[category]) {
          this.adsByCategory[category] = [];
        }
      });
    }

    this.loading = false;
  }

  /**
   * Helper method to shuffle array for demo purposes
   * @param array The array to shuffle
   * @returns A new shuffled array
   */
  private shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /**
   * Navigate to ad details page
   * @param adId The ID of the ad to view
   */
  viewAdDetails(adId: string): void {
    // Navigate to ad details page using Angular Router
    this.router.navigateByUrl(`/ad-details/${adId}`);
  }

  /**
   * Add an ad to favorites
   * @param adId The ID of the ad to like
   * @param event Optional event to stop propagation
   */
  likeAd(adId: string, event?: Event): void {
    if (event) event.stopPropagation();

    // Check if user is authenticated
    if (!this.isAuthenticated) {
      this.notificationService.error('Please log in to like ads');
      return;
    }

    // Using recordSwipe with 'right' direction as a like action
    this.adService.recordSwipe(adId, 'right').subscribe({
      next: () => {
        this.notificationService.success('Added to your favorites');
      },
      error: (err) => {
        this.notificationService.error('Failed to like ad');
        console.error('Error liking ad:', err);
      },
    });
  }

  /**
   * Start a chat with an advertiser
   * @param adId The ID of the ad to chat about
   * @param event Optional event to stop propagation
   */
  startChat(adId: string, event?: Event): void {
    if (event) event.stopPropagation();

    // Check if user is authenticated
    if (!this.isAuthenticated) {
      this.notificationService.error('Please log in to start a chat');
      return;
    }

    // Create a chat room and navigate to it
    this.chatService.createAdRoom(adId).subscribe({
      next: (room) => {
        this.router.navigateByUrl(`/chat/${room._id}`);
      },
      error: (err) => {
        this.notificationService.error('Failed to start chat');
        console.error('Error starting chat:', err);
      },
    });
  }

  /**
   * Handle actions from the hero section
   * @param action The action object from the PageHeader component
   * @param adId The ID of the ad
   */
  onHeroAction(action: any, adId: string): void {
    switch (action.id) {
      case 'view':
        this.viewAdDetails(adId);
        break;
      case 'favorite':
        this.likeAd(adId);
        break;
      case 'chat':
        this.startChat(adId);
        break;
      default:
        console.warn('Unknown action:', action.id);
    }
  }

  /**
   * Handle actions from card components
   * @param event The action event from the AppCard component
   * @param adId The ID of the ad
   */
  onCardAction(event: { id: string; itemId?: string }, adId: string): void {
    // Use the itemId from the event if available, otherwise use the provided adId
    const targetAdId = event.itemId || adId;

    switch (event.id) {
      case 'view':
        this.viewAdDetails(targetAdId);
        break;
      case 'favorite':
        this.likeAd(targetAdId);
        break;
      case 'chat':
        this.startChat(targetAdId);
        break;
      default:
        console.warn('Unknown card action:', event.id);
    }
  }

  /**
   * Get the media URL for an ad
   * @param ad The ad object
   * @returns The URL of the first image or a default image
   */
  getMediaUrl(ad: Ad): string {
    if (!ad) {
      return '/assets/images/default-profile.jpg';
    }

    if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
      // Handle both string[] and object[] formats
      if (typeof ad.images[0] === 'string') {
        return ad.images[0] as string;
      } else if (typeof ad.images[0] === 'object' && 'url' in ad.images[0]) {
        return (ad.images[0] as { url: string }).url;
      }
    }
    return '/assets/images/default-profile.jpg';
  }

  /**
   * Get a formatted location string from an ad
   * @param ad The ad object
   * @returns A formatted location string
   */
  getLocationString(ad: Ad): string {
    if (!ad || !ad.location) {
      return '';
    }

    return `${ad.location.city}, ${ad.location.county}`;
  }

  /**
   * Get the advertiser image for an ad
   * @param ad The ad object
   * @returns The advertiser image URL or a default image
   */
  getAdvertiserImage(ad: Ad): string {
    if (!ad) {
      return '/assets/images/default-profile.jpg';
    }

    if (ad.advertiserImage) {
      return ad.advertiserImage;
    }

    if (typeof ad.advertiser === 'object' && ad.advertiser?.profileImage) {
      return ad.advertiser.profileImage;
    }

    return '/assets/images/default-profile.jpg';
  }

  /**
   * Get the advertiser name for an ad
   * @param ad The ad object
   * @returns The advertiser name or a default name
   */
  getAdvertiserName(ad: Ad): string {
    if (!ad) {
      return 'Unknown';
    }

    if (ad.advertiserName) {
      return ad.advertiserName;
    }

    if (typeof ad.advertiser === 'object' && ad.advertiser?.username) {
      return ad.advertiser.username;
    }

    return 'Unknown';
  }

  /**
   * Apply filters and reload ads
   */
  applyFilters(): void {
    // TODO: Implement filter logic based on filterForm values
    // For now, just reload all ads
    this.loadAds();

    // Show success notification
    this.notificationService.success('Filters applied');
  }

  /**
   * Open the filters modal
   */
  openFilters(): void {
    this.dialogService.open(this.filtersDialog, {
      context: {},
      hasBackdrop: true,
      closeOnBackdropClick: true,
      closeOnEsc: true,
    });
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

    // Apply the reset filters
    this.applyFilters();
  }

  /**
   * Convert ad ID to string regardless of its type
   */
  getAdIdAsString(adId: string | { city: string; county: string }): string {
    return typeof adId === 'string' ? adId : JSON.stringify(adId);
  }
}
