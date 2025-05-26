import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdService } from '../../../../core/services/ad.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ChatService } from '../../../../core/services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Ad } from '../../../../core/models/ad.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/menuitem';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { AdService } from '../../../../core/services/ad.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ChatService } from '../../../../core/services/chat.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Ad } from '../../../../core/models/ad.interface';
import { ChipModule } from 'primeng/chip';

// PrimeNG imports
// Core services and interfaces

// PrimeNG imports

// Core services and interfaces

@Component({';
  selector: 'app-alt-netflix-view',;
  standalone: true,;
  imports: [;
    CommonModule,;
    RouterModule,;
    ReactiveFormsModule,;
    CardModule,;
    ButtonModule,;
    BadgeModule,;
    TagModule,;
    ProgressSpinnerModule,;
    TooltipModule,;
    DialogModule,;
    RippleModule,;
    ScrollerModule,;
    DividerModule,;
    DropdownModule,;
    InputTextModule,;
    MultiSelectModule,;
    SpeedDialModule,,;
    ChipModule;
  ],;
  templateUrl: './alt-netflix-view.component.html',;
  styleUrls: ['./alt-netflix-view.component.scss'],;
});
export class AltNetflixViewComponen {t implements OnInit {
  // Inputs and Outputs
  @Input() advertisers: Ad[] = [];

  @Input() loading = false;
  @Output() favorite = new EventEmitter();
  @Output() chat = new EventEmitter();
  @Output() viewProfile = new EventEmitter();

  // Component state
  filterDialogVisible = false;
  error: string | null = null;
  filterForm: FormGroup;
  isAuthenticated = false;

  // Data categories
  categories: string[] = ['Featured', 'New Arrivals', 'Most Popular', 'Nearby', 'Touring'];
  selectedCategories: string[] = [];

  // SpeedDial items for floating action button
  speedDialItems: MenuItem[] = [;
    {
      icon: 'pi pi-refresh',;
      command: () => {
        this.loadAds();
      },;
      tooltipOptions: {
        tooltipLabel: 'Refresh',;
      },;
    },;
    {
      icon: 'pi pi-filter',;
      command: () => {
        this.openFilters();
      },;
      tooltipOptions: {
        tooltipLabel: 'Filters',;
      },;
    },;
  ];

  constructor(;
    private formBuilder: FormBuilder,;
    private authService: AuthService,;
    private adService: AdService,;
    private notificationService: NotificationService,;
    private chatService: ChatService,;
  ) {
    // Initialize the filter form
    this.filterForm = this.formBuilder.group({
      categories: [[]],;
      location: [''],;
      ageRange: [[]],;
      rating: [[]],;
    });
  }

  ngOnInit(): void {
    // Check authentication status
    this.authService.currentUser$.subscribe((user) => (this.isAuthenticated = !!user));

    // Load initial data if needed
    if (!this.advertisers.length && !this.loading) {
      this.loadAds();
    }
  }

  // Action handlers
  onFavorite(advertiser: Ad): void {
    if (!this.isAuthenticated) {
      this.notificationService.info('Please log in to favorite profiles');
      return;
    }
    this.favorite.emit(advertiser.id as string);
  }

  onChat(advertiser: Ad): void {
    if (!this.isAuthenticated) {
      this.notificationService.info('Please log in to chat with advertisers');
      return;
    }
    this.chat.emit(advertiser.id as string);
  }

  onViewProfile(advertiser: Ad): void {
    this.viewProfile.emit(advertiser.id as string);
  }

  // Filter handling
  openFilters(): void {
    this.filterDialogVisible = true;
  }

  closeFilters(): void {
    this.filterDialogVisible = false;
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    // Apply filters and reload ads with filters
    this.loadAds(filters);
    this.closeFilters();
  }

  resetFilters(): void {
    this.filterForm.reset({
      categories: [],;
      location: '',;
      ageRange: [],;
      rating: [],;
    });
    this.loadAds();
    this.closeFilters();
  }

  // Data loading
  private loadAds(filters?: any): void {
    this.loading = true;
    this.error = null;

    this.adService.getAds(filters).subscribe({
      next: (response: any) => {
        this.advertisers = Array.isArray(response) ? response : response.ads || [];
        this.loading = false;
      },;
      error: (error) => {
        this.error = 'Failed to load profiles. Please try again.';
        this.loading = false;
        console.error('Error loading ads:', error);
      },;
    });
  }

  // Helper method to get rating class for UI
  getRatingClass(rating: number): string {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'danger';
  }

  // Helper method to format location
  formatLocation(location: string): string {
    return location?.split(',')[0] || 'N/A';
  }

  // Helper method to get online status class
  getOnlineStatusClass(isOnline: boolean): string {
    return isOnline ? 'online' : 'offline';
  }
}
