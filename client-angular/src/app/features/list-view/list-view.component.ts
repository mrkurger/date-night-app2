// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (list-view.component)
//
// COMMON CUSTOMIZATIONS:
// - DEFAULT_VIEW_MODE: Default view mode for the list (default: 'grid')
//   Valid values: 'grid', 'list', 'compact'
// - DEFAULT_SORT: Default sort option (default: 'newest')
//   Valid values: 'newest', 'oldest', 'nameAsc', 'nameDesc', 'popularityDesc'
// - DEFAULT_PAGE_SIZE: Default number of items per page (default: 20)
//   Valid values: 10, 20, 50, 100
// - ENABLE_SAVED_FILTERS: Enable saved filter functionality (default: true)
// ===================================================
import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Ad } from '../../core/models/ad.interface';
import { AdCardComponent } from '../../shared/components/ad-card/ad-card.component';

// Material Imports
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Import Emerald components
import { AppCardComponent } from '../../shared/emerald/components/app-card/app-card.component';
import { CardGridComponent } from '../../shared/emerald/components/card-grid/card-grid.component';
import { PagerComponent } from '../../shared/emerald/components/pager/pager.component';
import { PageHeaderComponent } from '../../shared/emerald/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../shared/emerald/components/skeleton-loader/skeleton-loader.component';
import { FloatingActionButtonComponent } from '../../shared/emerald/components/floating-action-button/floating-action-button.component';

// Interfaces
interface SortOption {
  value: string;
  label: string;
  direction?: 'asc' | 'desc';
}

interface HeaderAction {
  id: string;
  label: string;
  icon?: string;
  type?: 'primary' | 'secondary' | 'danger';
  primary?: boolean;
}

interface FilterItem {
  key: string;
  value: any;
  label: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filter: any;
}

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    AdCardComponent,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    // Emerald components
    AppCardComponent,
    CardGridComponent,
    PagerComponent,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    FloatingActionButtonComponent,
  ],
})
export class ListViewComponent implements OnInit, AfterViewInit {
  // View template references
  @ViewChild('saveFilterDialog') saveFilterDialog!: TemplateRef<any>;

  // Data
  ads: Ad[] = [];
  filteredAds: Ad[] = [];
  loading = true;
  error: string | null = null;
  filterForm: FormGroup;
  isAuthenticated = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 20; // Default page size
  totalPages = 1;

  // Sorting
  sortOptions: SortOption[] = [
    { value: 'newest', label: 'Newest First', direction: 'desc' },
    { value: 'oldest', label: 'Oldest First', direction: 'asc' },
    { value: 'nameAsc', label: 'Name (A-Z)', direction: 'asc' },
    { value: 'nameDesc', label: 'Name (Z-A)', direction: 'desc' },
    { value: 'popularityDesc', label: 'Most Popular', direction: 'desc' },
  ];
  currentSort = 'newest';

  // Search debouncing
  private searchTimeout: ReturnType<typeof setTimeout>;

  // View options
  viewMode: 'grid' | 'list' | 'compact' = 'grid';

  // Filter sidebar
  filterSidebarOpen = false;
  activeFilterCount = 0;

  // Header actions
  headerActions: HeaderAction[] = [
    { id: 'new-ad', label: 'Create Ad', icon: 'add', type: 'primary' },
    { id: 'refresh', label: 'Refresh', icon: 'refresh' },
    { id: 'help', label: 'Help', icon: 'help_outline' },
  ];

  // Floating action button
  fabMenuItems = [
    { icon: 'fa-plus', label: 'Create Ad', action: 'create' },
    { icon: 'fa-heart', label: 'View Favorites', action: 'favorites' },
    { icon: 'fa-history', label: 'Recent Ads', action: 'recent' },
  ];

  // Saved filters
  savedFilters: SavedFilter[] = [];
  newFilterName = '';

  constructor(
    private adService: AdService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog
  ) {
    // Initialize form with nested structure for advanced filtering
    this.filterForm = this.fb.group({
      searchQuery: [''],
      categories: this.fb.group({
        escort: [false],
        massage: [false],
        striptease: [false],
      }),
      location: [[]],
      dateRange: this.fb.group({
        from: [null],
        to: [null],
      }),
      status: this.fb.group({
        online: [false],
        touring: [false],
        verified: [false],
      }),
    });

    // Load saved filters from localStorage
    this.loadSavedFilters();
  }

  ngOnInit(): void {
    this.loadAds();
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });

    // Subscribe to filter form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.updateActiveFilterCount();
    });
  }

  /**
   * After the view is initialized, set up any necessary DOM interactions
   */
  ngAfterViewInit(): void {
    // Any post-view initialization code
  }

  /**
   * Loads advertisements from the server and maps the data to match template expectations.
   */
  loadAds(): void {
    this.loading = true;
    this.error = null;

    this.adService.getAds().subscribe({
      next: ads => {
        // Map server data to match template expectations
        this.ads = ads.map(ad => ({
          ...ad,
          // Map viewCount to views for template compatibility
          views: ad.viewCount,
          // Ensure tags is defined (even if empty)
          tags: ad.tags || [],
          // Add isAdvertiserOnline property if not present
          isAdvertiserOnline: ad.isAdvertiserOnline || Math.random() > 0.5, // Random for demo
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load ads. Please try again.';
        this.loading = false;
        console.error('Error loading ads:', err);
      },
    });
  }

  /**
   * Apply all active filters to the ads list
   */
  applyFilters(): void {
    const filters = this.filterForm.value;

    // Apply filters
    this.filteredAds = this.ads.filter(ad => {
      // Category filters
      if (filters.categories) {
        const categorySelected =
          filters.categories.escort || filters.categories.massage || filters.categories.striptease;

        if (categorySelected) {
          const categoryMatches =
            (filters.categories.escort && ad.category === 'Escort') ||
            (filters.categories.massage && ad.category === 'Massage') ||
            (filters.categories.striptease && ad.category === 'Striptease');

          if (!categoryMatches) return false;
        }
      }

      // Location filter
      if (filters.location && filters.location.length > 0) {
        if (!ad.location || !filters.location.includes(ad.location)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        if (filters.dateRange.from && ad.createdAt) {
          const fromDate = new Date(filters.dateRange.from);
          const adDate = new Date(ad.createdAt);
          if (adDate < fromDate) return false;
        }

        if (filters.dateRange.to && ad.createdAt) {
          const toDate = new Date(filters.dateRange.to);
          const adDate = new Date(ad.createdAt);
          if (adDate > toDate) return false;
        }
      }

      // Status filters
      if (filters.status) {
        if (filters.status.online && !ad.isAdvertiserOnline) {
          return false;
        }

        if (filters.status.touring && !ad.isTouring) {
          return false;
        }

        if (filters.status.verified && !ad.isVerified) {
          return false;
        }
      }

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = ad.title.toLowerCase().includes(query);
        const matchesDescription = ad.description.toLowerCase().includes(query);
        const matchesLocation = ad.location?.toLowerCase().includes(query);
        const matchesTags = ad.tags.some(tag => tag.toLowerCase().includes(query));

        if (!matchesTitle && !matchesDescription && !matchesLocation && !matchesTags) {
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

    // Update active filter count
    this.updateActiveFilterCount();
  }

  /**
   * Sort the filtered ads based on the current sort option
   */
  sortAds(): void {
    switch (this.currentSort) {
      case 'newest':
        this.filteredAds.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        this.filteredAds.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'nameAsc':
        this.filteredAds.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'nameDesc':
        this.filteredAds.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'popularityDesc':
        this.filteredAds.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }
  }

  /**
   * Change the current sort option
   */
  changeSort(sortValue: string): void {
    this.currentSort = sortValue;
    this.sortAds();
  }

  /**
   * Get the label for the current sort option
   */
  getCurrentSortLabel(): string {
    const option = this.sortOptions.find(opt => opt.value === this.currentSort);
    return option ? option.label : 'Sort';
  }

  /**
   * Get the ads for the current page
   */
  getCurrentPageAds(): Ad[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAds.slice(startIndex, endIndex);
  }

  /**
   * Navigate to a specific page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Change the number of items displayed per page
   */
  changePageSize(size: number): void {
    this.itemsPerPage = size;
    this.totalPages = Math.ceil(this.filteredAds.length / this.itemsPerPage);

    // Adjust current page if it's now out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  /**
   * Set the view mode (grid, list, or compact)
   */
  setViewMode(mode: 'grid' | 'list' | 'compact'): void {
    this.viewMode = mode;
  }

  /**
   * Get the number of columns based on the current view mode
   */
  getColumnsForViewMode(): number {
    switch (this.viewMode) {
      case 'list':
        return 1;
      case 'grid':
        return 3;
      case 'compact':
        return 4;
      default:
        return 3;
    }
  }

  /**
   * Navigate to ad details page
   */
  viewAdDetails(adId: string): void {
    this.router.navigate(['/ad-details', adId]);
  }

  /**
   * Share an ad with others
   */
  shareAd(adId: string): void {
    if (navigator.share) {
      // Use Web Share API if available
      navigator
        .share({
          title: 'Check out this profile on DateNight.io',
          text: 'I found an interesting profile you might like',
          url: `${window.location.origin}/ad-details/${adId}`,
        })
        .catch(err => {
          console.error('Error sharing:', err);
        });
    } else {
      // Fallback: copy link to clipboard
      const url = `${window.location.origin}/ad-details/${adId}`;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.notificationService.success('Link copied to clipboard');
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
          this.notificationService.error('Failed to copy link');
        });
    }
  }

  /**
   * Like an ad
   */
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
      error: err => {
        this.notificationService.error('Failed to like ad');
        console.error('Error liking ad:', err);
      },
    });
  }

  /**
   * Start a chat with an advertiser
   */
  startChat(adId: string, event?: Event): void {
    if (event) event.stopPropagation();

    if (!this.isAuthenticated) {
      this.notificationService.error('Please log in to start a chat');
      return;
    }

    this.chatService.createAdRoom(adId).subscribe({
      next: room => {
        this.router.navigate(['/chat', room._id]);
      },
      error: err => {
        this.notificationService.error('Failed to start chat');
        console.error('Error starting chat:', err);
      },
    });
  }

  /**
   * Clear all active filters
   */
  clearFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      categories: {
        escort: false,
        massage: false,
        striptease: false,
      },
      location: [],
      dateRange: {
        from: null,
        to: null,
      },
      status: {
        online: false,
        touring: false,
        verified: false,
      },
    });

    this.applyFilters();
  }

  /**
   * Handle search input changes with debouncing
   */
  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  /**
   * Toggle the filter sidebar
   */
  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
  }

  /**
   * Update the count of active filters
   */
  updateActiveFilterCount(): void {
    const filters = this.filterForm.value;
    let count = 0;

    // Count category filters
    if (filters.categories) {
      if (filters.categories.escort) count++;
      if (filters.categories.massage) count++;
      if (filters.categories.striptease) count++;
    }

    // Count location filters
    if (filters.location && filters.location.length > 0) {
      count += filters.location.length;
    }

    // Count date range filters
    if (filters.dateRange) {
      if (filters.dateRange.from) count++;
      if (filters.dateRange.to) count++;
    }

    // Count status filters
    if (filters.status) {
      if (filters.status.online) count++;
      if (filters.status.touring) count++;
      if (filters.status.verified) count++;
    }

    // Count search query
    if (filters.searchQuery) count++;

    this.activeFilterCount = count;
  }

  /**
   * Check if there are any active filters
   */
  hasActiveFilters(): boolean {
    return this.activeFilterCount > 0;
  }

  /**
   * Get a list of active filters for display
   */
  getActiveFilters(): FilterItem[] {
    const filters = this.filterForm.value;
    const activeFilters: FilterItem[] = [];

    // Add category filters
    if (filters.categories) {
      if (filters.categories.escort) {
        activeFilters.push({ key: 'categories.escort', value: true, label: 'Category: Escort' });
      }
      if (filters.categories.massage) {
        activeFilters.push({ key: 'categories.massage', value: true, label: 'Category: Massage' });
      }
      if (filters.categories.striptease) {
        activeFilters.push({
          key: 'categories.striptease',
          value: true,
          label: 'Category: Striptease',
        });
      }
    }

    // Add location filters
    if (filters.location && filters.location.length > 0) {
      filters.location.forEach((loc: string) => {
        activeFilters.push({ key: 'location', value: loc, label: `Location: ${loc}` });
      });
    }

    // Add date range filters
    if (filters.dateRange) {
      if (filters.dateRange.from) {
        const fromDate = new Date(filters.dateRange.from).toLocaleDateString();
        activeFilters.push({
          key: 'dateRange.from',
          value: filters.dateRange.from,
          label: `From: ${fromDate}`,
        });
      }
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to).toLocaleDateString();
        activeFilters.push({
          key: 'dateRange.to',
          value: filters.dateRange.to,
          label: `To: ${toDate}`,
        });
      }
    }

    // Add status filters
    if (filters.status) {
      if (filters.status.online) {
        activeFilters.push({ key: 'status.online', value: true, label: 'Online Now' });
      }
      if (filters.status.touring) {
        activeFilters.push({ key: 'status.touring', value: true, label: 'Touring' });
      }
      if (filters.status.verified) {
        activeFilters.push({ key: 'status.verified', value: true, label: 'Verified' });
      }
    }

    // Add search query
    if (filters.searchQuery) {
      activeFilters.push({
        key: 'searchQuery',
        value: filters.searchQuery,
        label: `Search: ${filters.searchQuery}`,
      });
    }

    return activeFilters;
  }

  /**
   * Remove a specific filter
   */
  removeFilter(filter: FilterItem): void {
    // Handle nested form controls
    if (filter.key.includes('.')) {
      const [group, control] = filter.key.split('.');

      // Handle array values in location
      if (group === 'location') {
        const currentLocations = [...this.filterForm.get('location')!.value];
        const index = currentLocations.indexOf(filter.value);
        if (index !== -1) {
          currentLocations.splice(index, 1);
          this.filterForm.get('location')!.setValue(currentLocations);
        }
      } else {
        // Handle nested form groups
        const formGroup = this.filterForm.get(group) as FormGroup;
        if (formGroup) {
          formGroup.get(control)?.setValue(filter.key.startsWith('dateRange') ? null : false);
        }
      }
    } else {
      // Handle top-level form controls
      this.filterForm.get(filter.key)?.setValue('');
    }

    this.applyFilters();
  }

  /**
   * Handle header action clicks
   */
  onHeaderActionClick(action: HeaderAction): void {
    switch (action.id) {
      case 'new-ad':
        this.router.navigate(['/ad-management/create']);
        break;
      case 'refresh':
        this.loadAds();
        break;
      case 'help':
        this.notificationService.info('Help information will be displayed here');
        break;
    }
  }

  /**
   * Handle floating action button click
   */
  onFabClick(): void {
    this.router.navigate(['/ad-management/create']);
  }

  /**
   * Handle floating action button menu item click
   */
  onFabMenuItemClick(item: any): void {
    switch (item.action) {
      case 'create':
        this.router.navigate(['/ad-management/create']);
        break;
      case 'favorites':
        this.loadSavedFilter('favorite');
        break;
      case 'recent':
        this.loadSavedFilter('recent');
        break;
    }
  }

  /**
   * Save the current filter configuration
   */
  saveCurrentFilter(): void {
    const dialogRef = this.dialog.open(this.saveFilterDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newFilter: SavedFilter = {
          id: Date.now().toString(),
          name: result,
          filter: this.filterForm.value,
        };

        this.savedFilters.push(newFilter);
        this.saveSavedFilters();
        this.notificationService.success(`Filter "${result}" saved successfully`);
      }
    });
  }

  /**
   * Load a saved filter
   */
  loadSavedFilter(filterId: string): void {
    // Handle predefined filters
    if (filterId === 'favorite') {
      this.clearFilters();
      this.filterForm.patchValue({
        status: { verified: true },
      });
      this.applyFilters();
      return;
    }

    if (filterId === 'recent') {
      this.clearFilters();
      this.filterForm.patchValue({
        dateRange: {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      });
      this.applyFilters();
      return;
    }

    // Handle custom saved filters
    const savedFilter = this.savedFilters.find(f => f.id === filterId);
    if (savedFilter) {
      this.filterForm.patchValue(savedFilter.filter);
      this.applyFilters();
      this.notificationService.success(`Filter "${savedFilter.name}" loaded`);
    }
  }

  /**
   * Save filters to localStorage
   */
  private saveSavedFilters(): void {
    localStorage.setItem('savedFilters', JSON.stringify(this.savedFilters));
  }

  /**
   * Load filters from localStorage
   */
  private loadSavedFilters(): void {
    const savedFilters = localStorage.getItem('savedFilters');
    if (savedFilters) {
      this.savedFilters = JSON.parse(savedFilters);
    }
  }
}
