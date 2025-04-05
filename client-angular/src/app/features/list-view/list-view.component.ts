import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad } from '../../core/models/ad.interface';

// Declare Bootstrap types for TypeScript
declare var bootstrap: any;

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule]
})
export class ListViewComponent implements OnInit, AfterViewInit {
  ads: Ad[] = [];
  filteredAds: Ad[] = [];
  loading = true;
  error: string | null = null;
  filterForm: FormGroup;
  isAuthenticated = false;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Sorting
  sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'nameAsc', label: 'Name (A-Z)' },
    { value: 'nameDesc', label: 'Name (Z-A)' }
  ];
  currentSort = 'newest';

  // Search debouncing
  private searchTimeout: ReturnType<typeof setTimeout>;
  
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
      touringOnly: [false],
      searchQuery: ['']
    });
  }

  ngOnInit(): void {
    this.loadAds();
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    // Subscribe to filter form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  /**
   * After the view is initialized, set up the carousels for ads with multiple images
   */
  ngAfterViewInit(): void {
    this.initializeCarousels();
  }

  /**
   * Initialize Bootstrap carousels for ads with multiple images
   * This needs to be called after the view is initialized and whenever the list of ads changes
   */
  private initializeCarousels(): void {
    setTimeout(() => {
      // Find all carousel elements and initialize them with Bootstrap
      const carouselElements = document.querySelectorAll('.carousel');
      carouselElements.forEach(carouselEl => {
        // Initialize Bootstrap carousel with options
        new bootstrap.Carousel(carouselEl, {
          interval: 5000,  // Auto-cycle every 5 seconds
          wrap: true,      // Cycle continuously
          keyboard: true,  // React to keyboard events
          pause: 'hover',  // Pause on mouse enter
          touch: true      // Allow touch swipe
        });
      });
    }, 100); // Small delay to ensure DOM is ready
  }
  
  /**
   * Loads advertisements from the server and maps the data to match template expectations.
   *
   * This method:
   * 1. Fetches ads from the AdService
   * 2. Maps server data properties to UI-specific properties:
   *    - Maps 'viewCount' to 'views' for template compatibility
   *    - Ensures 'tags' is always defined (as an empty array if not present)
   * 3. Applies any active filters
   * 4. Updates loading state
   */
  loadAds(): void {
    this.loading = true;
    this.error = null;

    this.adService.getAds().subscribe({
      next: (ads) => {
        // Map server data to match template expectations
        this.ads = ads.map(ad => ({
          ...ad,
          // Map viewCount to views for template compatibility
          views: ad.viewCount,
          // Ensure tags is defined (even if empty)
          tags: ad.tags || []
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ads. Please try again.';
        this.loading = false;
        console.error('Error loading ads:', err);
      }
    });
  }
  
  applyFilters(): void {
    const filters = this.filterForm.value;
    
    // Apply filters
    this.filteredAds = this.ads.filter(ad => {
      // Category filter
      if (filters.category && ad.category !== filters.category) {
        return false;
      }
      
      // Location filter
      if (filters.location && ad.location !== filters.location) {
        return false;
      }
      
      // Touring filter
      if (filters.touringOnly && !ad.isTouring) {
        return false;
      }
      
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = ad.title.toLowerCase().includes(query);
        const matchesDescription = ad.description.toLowerCase().includes(query);
        const matchesLocation = ad.location?.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDescription && !matchesLocation) {
          return false;
        }
      }
      
      return true;
    });
    
    // Apply sorting
    this.sortAds();
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredAds.length / this.itemsPerPage);
    this.currentPage = 1;

    // Initialize carousels for the filtered ads after a short delay
    // to ensure the DOM has been updated
    setTimeout(() => this.initializeCarousels(), 100);
  }
  
  sortAds(): void {
    switch (this.currentSort) {
      case 'newest':
        this.filteredAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        this.filteredAds.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'nameAsc':
        this.filteredAds.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'nameDesc':
        this.filteredAds.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
  }
  
  changeSort(sortValue: string): void {
    this.currentSort = sortValue;
    this.sortAds();
  }
  
  getCurrentPageAds(): Ad[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAds.slice(startIndex, endIndex);
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPaginationArray(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a subset of pages with current page in the middle
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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
  
  /**
   * Gets the media URL for an ad
   * Prioritizes the first image in the ad's images array
   * Falls back to default profile image if no images are available
   */
  getMediaUrl(ad: Ad): string {
    if (ad.images && ad.images.length > 0) {
      return ad.images[0];
    }
    return '/assets/img/default-profile.jpg';
  }

  /**
   * Handles image loading errors by setting a fallback image
   * This ensures that the UI doesn't break if an image fails to load
   */
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/img/profile1.jpg'; // Use the first profile image as fallback
    // Log the error for debugging purposes
    console.warn('Image failed to load, using fallback image:', imgElement.alt);
  }
  
  clearFilters(): void {
    this.filterForm.reset({
      category: '',
      location: '',
      touringOnly: false,
      searchQuery: ''
    });
  }
  
  /**
   * Handles search input changes with debouncing to prevent excessive filter operations.
   * Waits 300ms after the last keystroke before applying filters.
   */
  onSearchChange(): void {
    // Debounce search to avoid too many filter operations
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
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

  // This line is no longer needed as we've properly declared searchTimeout above
}