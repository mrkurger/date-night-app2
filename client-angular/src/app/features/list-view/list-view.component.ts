// ===================================================
// LIST VIEW COMPONENT
// ===================================================
// This file contains the list view component logic
// using Nebular components and services
// ===================================================

import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

// Import NebularModule which contains all Nebular components
import { NebularModule } from '../../../app/shared/nebular.module';
import { NbDialogService } from '@nebular/theme';

import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { Ad } from '../../core/models/ad.interface';

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
  key: string;_value: any;
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, NebularModule],
})
export class ListViewComponent implements OnInit, AfterViewInit {
  // View template references
  @ViewChild('saveFilterDialog') saveFilterDialog!: TemplateRef<any>;

  // Data
  ads: Ad[] = [];
  filteredAds: Ad[] = [];
  loading = true;_error: string | null = null;
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

  // Sort menu items for NbMenu
  sortMenuItems = this.sortOptions.map((option) => ({
    title: option.label,_data: { value: option.value },
  }));

  // Search debouncing
  private searchTimeout: ReturnType<typeof setTimeout>;

  // View options
  viewMode: 'grid' | 'list' | 'compact' = 'grid';

  // Filter sidebar
  filterSidebarOpen = false;
  activeFilterCount = 0;

  // Header actions
  headerActions: HeaderAction[] = [
    { id: 'new-ad', label: 'Create Ad', icon: 'plus-outline', type: 'primary' },
    { id: 'refresh', label: 'Refresh', icon: 'refresh-outline' },
    { id: 'help', label: 'Help', icon: 'question-mark-circle-outline' },
  ];

  // Saved filters
  savedFilters: SavedFilter[] = [];
  newFilterName = '';

  constructor(
    private adService: AdService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private authService: AuthService,
    private userPreferencesService: UserPreferencesService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: NbDialogService,
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

    // Load user preferences for view mode
    const preferences = this.userPreferencesService.getPreferences();

    // Set default view mode from user preferences
    if (preferences.defaultViewType === 'list') {
      this.viewMode = 'list';
    } else if (preferences.defaultViewType === 'tinder') {
      this.viewMode = 'compact';
    } else {
      this.viewMode = 'grid';
    }
  }

  ngOnInit(): void {
    // Check authentication status
    this.isAuthenticated = this.authService.isAuthenticated();

    // Load initial data
    this.loadAds();

    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.updateActiveFilterCount();
      this.applyFilters();
    });
  }

  ngAfterViewInit(): void {
    // Any post-view initialization
  }

  loadAds(): void {
    this.loading = true;
    this.error = null;

    this.adService.getAds().subscribe({
      next: (response) => {
        this.ads = response.ads.map((ad) => ({
          ...ad,
          createdAt: ad.createdAt || new Date().toISOString(),
          category: ad.category || 'Uncategorized',
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ads. Please try again later.';
        this.loading = false;
        this.notificationService.error('Error', this.error);
      },
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.ads];

    // Apply search filter
    if (filters.searchQuery) {
      const search = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ad) =>
          ad.title.toLowerCase().includes(search) || ad.description.toLowerCase().includes(search),
      );
    }

    // Apply category filters
    if (Object.values(filters.categories).some((value) => value)) {
      filtered = filtered.filter((ad) =>
        Object.entries(filters.categories).some(
          ([category, isSelected]) =>
            isSelected && ad.category.toLowerCase() === category.toLowerCase(),
        ),
      );
    }

    // Apply location filter
    if (filters.location && filters.location.length > 0) {
      filtered = filtered.filter((ad) => filters.location.includes(ad.location));
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter((ad) => {
        const adDate = new Date(ad.createdAt);
        const fromDate = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
        const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : null;

        if (fromDate && toDate) {
          return adDate >= fromDate && adDate <= toDate;
        } else if (fromDate) {
          return adDate >= fromDate;
        } else if (toDate) {
          return adDate <= toDate;
        }

        return true;
      });
    }

    // Apply status filters
    if (Object.values(filters.status).some((value) => value)) {
      filtered = filtered.filter((ad) => {
        if (filters.status.online && !ad.isAdvertiserOnline) return false;
        if (filters.status.touring && !ad.isTouring) return false;
        if (filters.status.verified && !ad.isVerified) return false;
        return true;
      });
    }

    this.filteredAds = filtered;
    this.sortAds();
    this.updatePagination();
  }

  sortAds(): void {
    this.filteredAds.sort((a, b) => {
      switch (this.currentSort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'nameAsc':
          return a.title.localeCompare(b.title);
        case 'nameDesc':
          return b.title.localeCompare(a.title);
        case 'popularityDesc':
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });
  }

  changeSort(sortValue: string): void {
    this.currentSort = sortValue;
    this.sortAds();
  }

  getCurrentSortLabel(): string {
    return this.sortOptions.find((option) => option.value === this.currentSort)?.label || '';
  }

  getCurrentPageAds(): Ad[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAds.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  changePageSize(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAds.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  setViewMode(mode: 'grid' | 'list' | 'compact'): void {
    this.viewMode = mode;
    this.userPreferencesService.updatePreferences({
      defaultViewType: mode === 'compact' ? 'tinder' : mode === 'grid' ? 'list' : mode,
    });
  }

  viewAdDetails(adId: string): void {
    this.router.navigate(['/ads', adId]);
  }

  shareAd(adId: any): void {
    // Implement share functionality
    this.notificationService.info('Share', 'Sharing functionality coming soon!');
  }

  likeAd(adId: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.isAuthenticated) {
      this.notificationService.warning('Authentication Required', 'Please log in to like ads');
      return;
    }

    // Implement like functionality
    this.notificationService.success('Success', 'Ad added to favorites!');
  }

  startChat(adId: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.isAuthenticated) {
      this.notificationService.warning('Authentication Required', 'Please log in to start a chat');
      return;
    }

    const adIdStr = typeof adId === 'string' ? adId : adId._id || '';
    const ad = this.ads.find((a) => a._id === adIdStr);
    if (ad) {
      this.chatService.createAdRoom(adIdStr).subscribe({
        next: (room) => {
          this.router.navigate(['/chat'], { queryParams: { id: room.id } });
        },
        error: (err) => {
          this.notificationService.error('Error', 'Failed to start chat. Please try again later.');
        },
      });
    }
  }

  clearFilters(): void {
    this.filterForm.patchValue({
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

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  toggleFilterSidebar(): void {
    this.filterSidebarOpen = !this.filterSidebarOpen;
  }

  updateActiveFilterCount(): void {
    const filters = this.filterForm.value;
    let count = 0;

    if (filters.searchQuery) count++;
    if (Object.values(filters.categories).some((value) => value)) count++;
    if (filters.location && filters.location.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (Object.values(filters.status).some((value) => value)) count++;

    this.activeFilterCount = count;
  }

  hasActiveFilters(): boolean {
    return this.activeFilterCount > 0;
  }

  getActiveFilters(): FilterItem[] {
    const filters: FilterItem[] = [];
    const formValue = this.filterForm.value;

    if (formValue.searchQuery) {
      filters.push({
        key: 'search',
        value: formValue.searchQuery,
        label: `Search: ${formValue.searchQuery}`,
      });
    }

    Object.entries(formValue.categories).forEach(([category, isSelected]) => {
      if (isSelected) {
        filters.push({
          key: `category-${category}`,
          value: category,
          label: `Category: ${category}`,
        });
      }
    });

    if (formValue.location && formValue.location.length > 0) {
      filters.push({
        key: 'location',
        value: formValue.location,
        label: `Location: ${formValue.location.join(', ')}`,
      });
    }

    if (formValue.dateRange.from || formValue.dateRange.to) {
      const fromDate = formValue.dateRange.from
        ? new Date(formValue.dateRange.from).toLocaleDateString()
        : '';
      const toDate = formValue.dateRange.to
        ? new Date(formValue.dateRange.to).toLocaleDateString()
        : '';
      filters.push({
        key: 'dateRange',
        value: { from: formValue.dateRange.from, to: formValue.dateRange.to },
        label: `Date: ${fromDate} - ${toDate}`,
      });
    }

    Object.entries(formValue.status).forEach(([status, isSelected]) => {
      if (isSelected) {
        filters.push({
          key: `status-${status}`,
          value: status,
          label: `Status: ${status}`,
        });
      }
    });

    return filters;
  }

  removeFilter(filter: FilterItem): void {
    const formValue = this.filterForm.value;

    if (filter.key === 'search') {
      this.filterForm.patchValue({ searchQuery: '' });
    } else if (filter.key.startsWith('category-')) {
      const category = filter.value;
      this.filterForm.patchValue({
        categories: {
          ...formValue.categories,
          [category]: false,
        },
      });
    } else if (filter.key === 'location') {
      this.filterForm.patchValue({ location: [] });
    } else if (filter.key === 'dateRange') {
      this.filterForm.patchValue({
        dateRange: {
          from: null,
          to: null,
        },
      });
    } else if (filter.key.startsWith('status-')) {
      const status = filter.value;
      this.filterForm.patchValue({
        status: {
          ...formValue.status,
          [status]: false,
        },
      });
    }
  }

  onHeaderActionClick(action: HeaderAction): void {
    switch (action.id) {
      case 'new-ad':
        this.router.navigate(['/ads/create']);
        break;
      case 'refresh':
        this.loadAds();
        break;
      case 'help':
        // Implement help functionality
        this.notificationService.info('Help', 'Help documentation coming soon!');
        break;
    }
  }

  // Dialog reference for the currently open dialog
  private currentDialogRef: any = null;

  // Close dialog without a value
  closeDialog(): void {
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
    }
  }

  // Close dialog with a value
  closeDialogWithValue(value: any): void {
    if (this.currentDialogRef) {
      this.currentDialogRef.close(value);
    }
  }

  saveCurrentFilter(): void {
    this.currentDialogRef = this.dialog.open(this.saveFilterDialog);
    this.currentDialogRef.onClose.subscribe((name) => {
      if (name) {
        const filter: SavedFilter = {
          id: Date.now().toString(),
          name,
          filter: this.filterForm.value,
        };

        this.savedFilters.push(filter);
        this.saveSavedFilters();
        this.notificationService.success('Success', 'Filter saved successfully!');
      }
    });
  }

  loadSavedFilter(filterId: string): void {
    const filter = this.savedFilters.find((f) => f.id === filterId);
    if (filter) {
      this.filterForm.patchValue(filter.filter);
      this.applyFilters();
    }
  }

  private saveSavedFilters(): void {
    localStorage.setItem('savedFilters', JSON.stringify(this.savedFilters));
  }

  private loadSavedFilters(): void {
    const saved = localStorage.getItem('savedFilters');
    if (saved) {
      this.savedFilters = JSON.parse(saved);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, this.currentPage - halfVisible);
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
