
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (netflix-view.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
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
  selector: 'app-netflix-view',
  templateUrl: './netflix-view.component.html',
  styleUrls: ['./netflix-view.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MainLayoutComponent]
})
export class NetflixViewComponent implements OnInit, AfterViewInit {
  @ViewChildren('rowContainer') rowContainers!: QueryList<ElementRef>;

  categories: string[] = ['Featured', 'New Arrivals', 'Most Popular', 'Nearby', 'Touring'];
  adsByCategory: { [key: string]: Ad[] } = {};
  loading = true;
  error: string | null = null;
  filterForm: FormGroup;
  isAuthenticated = false;

  // For hero section
  featuredAd: Ad | null = null;

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
    this.loadAds();
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  ngAfterViewInit(): void {
    // Initialize any carousel behaviors after view is initialized
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
                  const newArrivals = [...allAds].sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0);
                    const dateB = new Date(b.createdAt || 0);
                    return dateB.getTime() - dateA.getTime();
                  }).slice(0, 10);
                  this.adsByCategory['New Arrivals'] = newArrivals;

                  // Set Nearby (for now, just random selection)
                  this.adsByCategory['Nearby'] = this.shuffleArray([...allAds]).slice(0, 10);

                  // Set Touring (filter by isTouring flag)
                  const touringAds = allAds.filter(ad => ad.isTouring).slice(0, 10);
                  this.adsByCategory['Touring'] = touringAds.length > 0 ?
                    touringAds : this.shuffleArray([...allAds]).slice(0, 10);
                } else {
                  // If no ads found, set empty arrays for remaining categories
                  this.categories.forEach(category => {
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
              }
            });
          },
          error: (err) => {
            console.error('Error loading trending ads:', err);
            // Continue loading other categories even if trending fails
            this.adsByCategory['Most Popular'] = [];
            // Pass an empty array since allAds is not defined in this scope
            this.loadRemainingCategories([]);
          }
        });
      },
      error: (err) => {
        console.error('Error loading featured ads:', err);
        // Continue loading other categories even if featured fails
        this.adsByCategory['Featured'] = [];
        this.loadTrendingAndRemainingAds();
      }
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
      }
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
        }
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
      const newArrivals = [...allAds].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 10);
      this.adsByCategory['New Arrivals'] = newArrivals;

      // Set Nearby (for now, just random selection)
      this.adsByCategory['Nearby'] = this.shuffleArray([...allAds]).slice(0, 10);

      // Set Touring (filter by isTouring flag)
      const touringAds = allAds.filter(ad => ad.isTouring).slice(0, 10);
      this.adsByCategory['Touring'] = touringAds.length > 0 ?
        touringAds : this.shuffleArray([...allAds]).slice(0, 10);
    } else {
      // If no ads found, set empty arrays for remaining categories
      this.categories.forEach(category => {
        if (!this.adsByCategory[category]) {
          this.adsByCategory[category] = [];
        }
      });
    }

    this.loading = false;
  }

  // Helper method to shuffle array for demo purposes
  private shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  scrollRow(category: string, direction: 'left' | 'right'): void {
    const rowIndex = this.categories.indexOf(category);
    if (rowIndex === -1) return;

    const container = this.rowContainers.toArray()[rowIndex].nativeElement;
    const scrollAmount = container.clientWidth * 0.8;
    const newScrollPosition = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  }

  viewAdDetails(adId: string): void {
    // Navigate to ad details page
    window.location.href = `/ad-details/${adId}`;
  }

  likeAd(adId: string, event?: Event): void {
    if (event) event.stopPropagation();

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
      }
    });
  }

  startChat(adId: string, event?: Event): void {
    if (event) event.stopPropagation();

    if (!this.isAuthenticated) {
      this.notificationService.error('Please log in to start a chat');
      return;
    }

    this.chatService.createAdRoom(adId).subscribe({
      next: (room) => {
        window.location.href = `/chat/${room._id}`;
      },
      error: (err) => {
        this.notificationService.error('Failed to start chat');
        console.error('Error starting chat:', err);
      }
    });
  }

  getMediaUrl(ad: Ad): string {
    if (ad.images && ad.images.length > 0) {
      return ad.images[0];
    }
    return '/assets/images/default-profile.jpg';
  }

  applyFilters(): void {
    // Apply filters logic
    this.loadAds();
  }

  openFilters(): void {
    // Open filters modal
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

  // Add method to close modal for completeness
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
}