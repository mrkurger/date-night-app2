import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { Subject } from 'rxjs';
import { filter, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { MenuItem } from 'primeng/menuitem';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

// TODO: Create User interface if not available
interface User {
  username?: string;
  profile?: {
    avatar?: string;
  };
  roles?: string[];
}

const mockAdvertisers = [;
  {
    id: 1,';
    name: 'Jasmine',;
    age: 25,;
    location: 'Stockholm, Sweden',;
    description: 'Professional dancer...',;
    tags: ['dancer', 'performer'],;
    image: '/placeholder.svg?text=Jasmine',;
    isPremium: true,;
    isOnline: true,;
  },;
  {
    id: 2,;
    name: 'Crystal',;
    age: 27,;
    location: 'Oslo, Norway',;
    description: 'Certified massage therapist...',;
    tags: ['massage', 'therapy'],;
    image: '/placeholder.svg?text=Crystal',;
    isPremium: true,;
    isOnline: true,;
  },;
  {
    id: 3,;
    name: 'Destiny',;
    age: 24,;
    location: 'Copenhagen, Denmark',;
    description: 'Experienced entertainer...',;
    tags: ['entertainer'],;
    image: '/placeholder.svg?text=Destiny',;
    isPremium: true,;
    isOnline: false,;
  },;
  {
    id: 4,;
    name: 'Amber',;
    age: 26,;
    location: 'Helsinki, Finland',;
    description: 'Professional dancer...',;
    tags: ['dancer'],;
    image: '/placeholder.svg?text=Amber',;
    isPremium: false,;
    isOnline: true,;
  },;
  {
    id: 5,;
    name: 'Sophia',;
    age: 28,;
    location: 'Gothenburg, Sweden',;
    description: 'Experienced massage therapist...',;
    tags: ['massage'],;
    image: '/placeholder.svg?text=Sophia',;
    isPremium: true,;
    isOnline: true,;
  },;
  {
    id: 6,;
    name: 'Tiffany',;
    age: 25,;
    location: 'Bergen, Norway',;
    description: 'Professional entertainer...',;
    tags: ['entertainer'],;
    image: '/placeholder.svg?text=Tiffany',;
    isPremium: false,;
    isOnline: false,;
  },;
];

interface Advertiser {
  id: number;
  name: string;
  age: number;
  location: string;
  description: string;
  tags: string[];
  image: string;
  isPremium: boolean;
  isOnline: boolean;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-advertiser-browsing-alternate',;
  templateUrl: './advertiser-browsing-alternate.component.html',;
  styleUrls: ['./advertiser-browsing-alternate.component.scss'],;
});
export class AdvertiserBrowsingAlternateComponen {t implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private searchSubject = new Subject();

  isLoggedIn: boolean = false;
  isAdvertiser: boolean = false;
  userName: string = '';
  userPicture: string = 'assets/img/kitten-dark.png';
  isSearchVisible: boolean = false;
  currentUrl: string = '';
  isMobileMenuOpen: boolean = false;
  isLoading: boolean = false;

  // For page content
  searchQuery: string = '';
  isSearching: boolean = false;
  isSearchingResult: boolean = false; // To show clear button only after a search attempt
  activeView: 'grid' | 'cards' | 'map' | 'nearby' | 'featured' = 'grid';
  pageTitle: string = '';
  searchResultCount: number | null = null;

  // Data
  allAdvertisers: Advertiser[] = [...mockAdvertisers];
  displayedAdvertisers: Advertiser[] = [];
  premiumAds: Advertiser[] = [];
  paidPlacementAds: Advertiser[] = []; // TODO: Populate with actual paid ads

  // PrimeNG Menus
  userMenuAccount: MenuItem[] = [];
  rankingsMenu: MenuItem[] = [;
    {
      label: 'Top Rated',;
      routerLink: '/advertiser-browsing-alt/rankings',;
      queryParams: { type: 'rating' },;
    },;
    {
      label: 'Most Popular',;
      routerLink: '/advertiser-browsing-alt/rankings',;
      queryParams: { type: 'popular' },;
    },;
    {
      label: 'Most Reviewed',;
      routerLink: '/advertiser-browsing-alt/rankings',;
      queryParams: { type: 'reviews' },;
    },;
    {
      label: 'Newest',;
      routerLink: '/advertiser-browsing-alt/rankings',;
      queryParams: { type: 'new' },;
    },;
  ];
  mobileMenuItems: MenuItem[] = [];

  // Add these properties to the component class
  activeIndex: number = 0;
  currentYear: number = new Date().getFullYear();

  constructor(;
    private router: Router,;
    private authService: AuthService,;
  ) {
    this.router.events;
      .pipe(;
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),;
        takeUntil(this.ngUnsubscribe),;
      );
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  ngOnInit(): void {
    this.authService;
      .isAuthenticated();
      .pipe(takeUntil(this.ngUnsubscribe));
      .subscribe((isAuth) => {
        this.isLoggedIn = isAuth;
        if (isAuth) {
          this.authService;
            .getCurrentUser();
            .pipe(takeUntil(this.ngUnsubscribe));
            .subscribe((user: User | null) => {
              if (user) {
                this.userName = user.username || 'User';
                this.userPicture = user.profile?.avatar || 'assets/img/kitten-dark.png';
                this.isAdvertiser =;
                  user.roles?.includes('advertiser') || user.roles?.includes('admin') || false;
              }
              this.updateUserMenus();
              this.updateMobileMenuItems();
            });
        } else {
          this.userName = '';
          this.userPicture = 'assets/img/kitten-dark.png';
          this.isAdvertiser = false;
          this.updateUserMenus();
          this.updateMobileMenuItems();
        }
      });

    this.premiumAds = this.allAdvertisers.filter((ad) => ad.isPremium);
    this.filterAndDisplayAds(); // Initial display

    // Debounced search
    this.searchSubject;
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.ngUnsubscribe));
      .subscribe((query) => {
        this.performSearch(query);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private updateUserMenus(): void {
    this.userMenuAccount = [;
      {
        label: 'Profile',;
        icon: 'pi pi-user',;
        routerLink: '/advertiser-browsing-alt/user-profile',;
        visible: this.isLoggedIn,;
      },;
      {
        label: 'Wallet',;
        icon: 'pi pi-credit-card',;
        routerLink: '/advertiser-browsing-alt/wallet',;
        visible: this.isLoggedIn,;
      },;
    ];

    if (this.isLoggedIn && this.isAdvertiser) {
      this.userMenuAccount.push({
        label: 'Dashboard',;
        icon: 'pi pi-th-large',;
        routerLink: '/advertiser-browsing-alt/advertiser-dashboard',;
      });
    }

    if (this.isLoggedIn) {
      this.userMenuAccount.push({
        label: 'Logout',;
        icon: 'pi pi-sign-out',;
        command: () => this.handleUserMenuClick('logout'),;
      });
    }
  }

  private updateMobileMenuItems(): void {
    this.mobileMenuItems = [;
      {
        label: 'Browse',;
        routerLink: '/advertiser-browsing-alt/browse',;
        icon: 'pi pi-search',;
      },;
      {
        label: 'Favorites',;
        routerLink: '/advertiser-browsing-alt/favorites',;
        icon: 'pi pi-heart',;
      },;
      {
        label: 'Rankings',;
        icon: 'pi pi-chart-bar',;
        items: this.rankingsMenu,;
      },;
    ];

    if (this.isLoggedIn) {
      if (this.isAdvertiser) {
        this.mobileMenuItems.push({
          label: 'Dashboard',;
          icon: 'pi pi-th-large',;
          routerLink: '/advertiser-browsing-alt/advertiser-dashboard',;
        });
      }
      this.mobileMenuItems.push(;
        {
          label: 'Profile',;
          icon: 'pi pi-user',;
          routerLink: '/advertiser-browsing-alt/user-profile',;
        },;
        {
          label: 'Wallet',;
          icon: 'pi pi-credit-card',;
          routerLink: '/advertiser-browsing-alt/wallet',;
        },;
        {
          label: 'Logout',;
          icon: 'pi pi-sign-out',;
          command: () => this.handleUserMenuClick('logout'),;
        },;
      );
    } else {
      this.mobileMenuItems.push(;
        {
          label: 'Log In',;
          icon: 'pi pi-sign-in',;
          routerLink: '/auth/login',;
        },;
        {
          label: 'Sign Up',;
          icon: 'pi pi-user-plus',;
          routerLink: '/auth/signup',;
        },;
      );
    }
  }

  handleUserMenuClick(itemId: string): void {
    if (itemId === 'logout') {
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  // For header search icon toggle
  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
  }

  isLinkActive(url: string): boolean {
    return this.currentUrl.includes(url);
  }

  toggleMobileSidebar(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Methods for page content
  onSearchInput(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      if (this.isSearchingResult) {
        // Only clear if there was a previous search result
        this.clearSearch();
      }
      return;
    }
    // For instant search while typing, otherwise handleSearch is used on submit
    // this.searchSubject.next(this.searchQuery);
  }

  handleSearch(event?: Event): void {
    if (event) event.preventDefault();
    this.performSearch(this.searchQuery);
  }

  performSearch(query: string): void {
    this.isSearching = true;
    this.isSearchingResult = true;
    this.pageTitle = `Search results for "${query}"`;`

    // Simulate API call delay
    setTimeout(() => {
      if (!query || query.trim() === '') {
        this.displayedAdvertisers = this.allAdvertisers.filter((ad) => !ad.isPremium);
        this.searchResultCount = null;
        this.pageTitle = ''; // Or 'All Advertisers'
      } else {
        const qLower = query.toLowerCase();
        const results = this.allAdvertisers.filter(;
          (ad) =>;
            !ad.isPremium &&;
            (ad.name.toLowerCase().includes(qLower) ||;
              ad.description.toLowerCase().includes(qLower) ||;
              ad.location.toLowerCase().includes(qLower) ||;
              ad.tags.some((tag) => tag.toLowerCase().includes(qLower))),;
        );
        this.displayedAdvertisers = results;
        this.searchResultCount = results.length;
      }
      this.isSearching = false;
    }, 500);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isSearching = false;
    this.isSearchingResult = false;
    this.searchResultCount = null;
    this.pageTitle = '';
    this.filterAndDisplayAds();
  }

  onViewChange(event: { value: string }): void {
    if (['grid', 'cards', 'map', 'nearby', 'featured'].includes(event.value)) {
      this.activeView = event.value as typeof this.activeView;
    }
  }

  filterAndDisplayAds(): void {
    this.isLoading = true;
    // Simulate API call delay
    setTimeout(() => {
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        this.displayedAdvertisers = this.allAdvertisers.filter(;
          (ad) =>;
            ad.name.toLowerCase().includes(query) ||;
            ad.location?.toLowerCase().includes(query) ||;
            ad.description?.toLowerCase().includes(query) ||;
            ad.tags?.some((tag) => tag.toLowerCase().includes(query)),;
        );
        this.searchResultCount = this.displayedAdvertisers.length;
        this.pageTitle = `Search Results for "${this.searchQuery}"`;`
        this.isSearchingResult = true;
      } else {
        this.displayedAdvertisers = this.allAdvertisers.filter((ad) => !ad.isPremium);
        this.searchResultCount = null;
        this.pageTitle = '';
        this.isSearchingResult = false;
      }
      this.isLoading = false;
    }, 500); // Simulate network delay
  }

  // Add new methods for handling advertiser interactions
  onAdvertiserFavorite(advertiser: Advertiser): void {
    // Toggle favorite status
    const index = this.displayedAdvertisers.findIndex((ad) => ad.id === advertiser.id);
    if (index !== -1) {
      this.displayedAdvertisers[index] = {
        ...this.displayedAdvertisers[index],;
        isFavorite: !this.displayedAdvertisers[index].isFavorite,;
      };
      // TODO: Call favorite service to persist changes
    }
  }

  onAdvertiserChat(advertiser: Advertiser): void {
    // Navigate to chat or open chat widget
    this.router.navigate(['/chat'], {
      queryParams: {
        advertiserId: advertiser.id,;
      },;
    });
  }

  onAdvertiserProfile(advertiser: Advertiser): void {
    // Navigate to advertiser profile
    this.router.navigate(['/advertiser-profile', advertiser.id]);
  }

  // Add new methods for Tinder view interactions
  onAdvertiserLike(advertiser: Advertiser): void {
    // Toggle favorite status and handle like action
    const index = this.displayedAdvertisers.findIndex((ad) => ad.id === advertiser.id);
    if (index !== -1) {
      this.displayedAdvertisers[index] = {
        ...this.displayedAdvertisers[index],;
        isFavorite: true,;
      };
      // TODO: Call favorite/like service to persist changes
    }
  }

  onAdvertiserNope(advertiser: Advertiser): void {
    // Handle nope/reject action
    // TODO: Update user preferences or filtering based on rejection
  }

  onRefreshAdvertisers(): void {
    // Reload advertisers list
    this.isLoading = true;
    // Simulate API call delay
    setTimeout(() => {
      // For now, just shuffle the existing list
      this.displayedAdvertisers = [...this.allAdvertisers];
        .sort(() => Math.random() - 0.5);
        .filter((ad) => !ad.isPremium);
      this.isLoading = false;
    }, 1000);
  }
}
