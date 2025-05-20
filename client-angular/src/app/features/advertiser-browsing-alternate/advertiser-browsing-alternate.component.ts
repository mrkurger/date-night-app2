import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NbMenuItem, NbSidebarService, NbTabComponent } from '@nebular/theme';
import { filter, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.interface';

// Mock data (similar to React component)
const mockAdvertisers = [
  {
    id: 1,
    name: 'Jasmine',
    age: 25,
    location: 'Stockholm, Sweden',
    description: 'Professional dancer...',
    tags: ['dancer', 'performer'],
    image: '/placeholder.svg?text=Jasmine',
    isPremium: true,
    isOnline: true,
  },
  {
    id: 2,
    name: 'Crystal',
    age: 27,
    location: 'Oslo, Norway',
    description: 'Certified massage therapist...',
    tags: ['massage', 'therapy'],
    image: '/placeholder.svg?text=Crystal',
    isPremium: true,
    isOnline: true,
  },
  {
    id: 3,
    name: 'Destiny',
    age: 24,
    location: 'Copenhagen, Denmark',
    description: 'Experienced entertainer...',
    tags: ['entertainer'],
    image: '/placeholder.svg?text=Destiny',
    isPremium: true,
    isOnline: false,
  },
  {
    id: 4,
    name: 'Amber',
    age: 26,
    location: 'Helsinki, Finland',
    description: 'Professional dancer...',
    tags: ['dancer'],
    image: '/placeholder.svg?text=Amber',
    isPremium: false,
    isOnline: true,
  },
  {
    id: 5,
    name: 'Sophia',
    age: 28,
    location: 'Gothenburg, Sweden',
    description: 'Experienced massage therapist...',
    tags: ['massage'],
    image: '/placeholder.svg?text=Sophia',
    isPremium: true,
    isOnline: true,
  },
  {
    id: 6,
    name: 'Tiffany',
    age: 25,
    location: 'Bergen, Norway',
    description: 'Professional entertainer...',
    tags: ['entertainer'],
    image: '/placeholder.svg?text=Tiffany',
    isPremium: false,
    isOnline: false,
  },
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
    selector: 'app-advertiser-browsing-alternate',
    templateUrl: './advertiser-browsing-alternate.component.html',
    styleUrls: ['./advertiser-browsing-alternate.component.scss'],
    standalone: false
})
export class AdvertiserBrowsingAlternateComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private searchSubject = new Subject<string>();

  isLoggedIn: boolean = false;
  isAdvertiser: boolean = false;
  userName: string = '';
  userPicture: string = 'assets/img/kitten-dark.png';
  isSearchVisible: boolean = false; // For header search toggle
  currentUrl: string = '';
  isMobileMenuOpen: boolean = false;

  // For page content
  searchQuery: string = '';
  isSearching: boolean = false;
  isSearchingResult: boolean = false; // To show clear button only after a search attempt
  activeView: 'grid' | 'cards' | 'map' | 'nearby' | 'featured' = 'grid';
  pageTitle: string = '';
  searchResultCount: number | null = null;

  allAdvertisers: Advertiser[] = [...mockAdvertisers];
  displayedAdvertisers: Advertiser[] = [];
  premiumAds: Advertiser[] = [];
  // paidPlacementAds: Advertiser[] = []; // For sidebar

  userMenuAccount: NbMenuItem[] = [];
  rankingsMenu: NbMenuItem[] = [
    { title: 'Top Rated', link: '/advertiser-browsing-alt/rankings?type=rating' },
    { title: 'Most Popular', link: '/advertiser-browsing-alt/rankings?type=popular' },
    { title: 'Most Reviewed', link: '/advertiser-browsing-alt/rankings?type=reviews' },
    { title: 'Newest', link: '/advertiser-browsing-alt/rankings?type=new' },
  ];
  mobileMenuItems: NbMenuItem[] = [];

  // Add new properties for handling advertiser interactions
  isLoading = false;

  constructor(
    private router: Router,
    private sidebarService: NbSidebarService,
    private authService: AuthService,
  ) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.ngUnsubscribe),
      )
      .subscribe((event) => {
        this.currentUrl = event.urlAfterRedirects;
      });
  }

  ngOnInit(): void {
    this.authService
      .isAuthenticated()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((isAuth) => {
        this.isLoggedIn = isAuth;
        if (isAuth) {
          this.authService
            .getCurrentUser()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((user: User | null) => {
              if (user) {
                this.userName = user.username || 'User';
                this.userPicture = user.profile?.avatar || 'assets/img/kitten-dark.png';
                this.isAdvertiser =
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
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.ngUnsubscribe))
      .subscribe((query) => {
        this.performSearch(query);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  updateUserMenus(): void {
    this.userMenuAccount = [
      {
        title: 'Profile',
        icon: 'person-outline',
        link: '/advertiser-browsing-alt/user-profile',
        hidden: !this.isLoggedIn,
      },
      {
        title: 'Wallet',
        icon: 'credit-card-outline',
        link: '/advertiser-browsing-alt/wallet',
        hidden: !this.isLoggedIn,
      },
    ];
    if (this.isLoggedIn && this.isAdvertiser) {
      this.userMenuAccount.push({
        title: 'Dashboard',
        icon: 'layout-outline',
        link: '/advertiser-browsing-alt/advertiser-dashboard',
      });
    }
    if (this.isLoggedIn) {
      this.userMenuAccount.push({
        title: 'Logout',
        icon: 'log-out-outline',
        data: { id: 'logout' },
      });
    }
    if (!this.isLoggedIn) {
      this.userMenuAccount = [];
    }
  }

  updateMobileMenuItems(): void {
    this.mobileMenuItems = [
      { title: 'Browse', link: '/advertiser-browsing-alt/browse', icon: 'search-outline' },
      { title: 'Favorites', link: '/advertiser-browsing-alt/favorites', icon: 'heart-outline' },
      {
        title: 'Rankings',
        icon: 'bar-chart-outline',
        expanded: false,
        children: this.rankingsMenu.map((item) => ({ ...item })), // Copy rankings menu for mobile
      },
    ];
    if (this.isLoggedIn) {
      if (this.isAdvertiser) {
        this.mobileMenuItems.push({
          title: 'Dashboard',
          icon: 'layout-outline',
          link: '/advertiser-browsing-alt/advertiser-dashboard',
        });
      }
      this.mobileMenuItems.push({
        title: 'Profile',
        icon: 'person-outline',
        link: '/advertiser-browsing-alt/user-profile',
      });
      this.mobileMenuItems.push({
        title: 'Wallet',
        icon: 'credit-card-outline',
        link: '/advertiser-browsing-alt/wallet',
      });
      this.mobileMenuItems.push({
        title: 'Logout',
        icon: 'log-out-outline',
        data: { id: 'logout' },
      });
    } else {
      this.mobileMenuItems.push({ title: 'Log In', icon: 'log-in-outline', link: '/auth/login' });
      this.mobileMenuItems.push({
        title: 'Sign Up',
        icon: 'person-add-outline',
        link: '/auth/signup',
      });
    }
    this.mobileMenuItems = [...this.mobileMenuItems];
  }

  handleUserMenuClick(event: { item: NbMenuItem }): void {
    if (event.item.data && event.item.data.id === 'logout') {
      this.authService.logout().subscribe(() => {
        // Navigation handled by AuthService or can be done here
      });
    } else if (event.item.link) {
      this.router.navigate([event.item.link]);
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
    this.sidebarService.toggle(this.isMobileMenuOpen, 'alt-mobile-menu');
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
    this.pageTitle = `Search results for "${query}"`;

    // Simulate API call delay
    setTimeout(() => {
      if (!query || query.trim() === '') {
        this.displayedAdvertisers = this.allAdvertisers.filter((ad) => !ad.isPremium);
        this.searchResultCount = null;
        this.pageTitle = ''; // Or 'All Advertisers'
      } else {
        const qLower = query.toLowerCase();
        const results = this.allAdvertisers.filter(
          (ad) =>
            !ad.isPremium &&
            (ad.name.toLowerCase().includes(qLower) ||
              ad.description.toLowerCase().includes(qLower) ||
              ad.location.toLowerCase().includes(qLower) ||
              ad.tags.some((tag) => tag.toLowerCase().includes(qLower))),
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

  onViewChange(event: { tabTitle: string }): void {
    const newView = event.tabTitle.toLowerCase() as typeof this.activeView;
    if (['grid', 'cards', 'map', 'nearby', 'featured'].includes(newView)) {
      this.activeView = newView;
      // Potentially reload data or change display based on view
    }
  }

  filterAndDisplayAds(): void {
    this.isLoading = true;
    // Simulate API call delay
    setTimeout(() => {
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        this.displayedAdvertisers = this.allAdvertisers.filter(
          (ad) =>
            ad.name.toLowerCase().includes(query) ||
            ad.location?.toLowerCase().includes(query) ||
            ad.description?.toLowerCase().includes(query) ||
            ad.tags?.some((tag) => tag.toLowerCase().includes(query)),
        );
        this.searchResultCount = this.displayedAdvertisers.length;
        this.pageTitle = `Search Results for "${this.searchQuery}"`;
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
        ...this.displayedAdvertisers[index],
        isFavorite: !this.displayedAdvertisers[index].isFavorite,
      };
      // TODO: Call favorite service to persist changes
    }
  }

  onAdvertiserChat(advertiser: Advertiser): void {
    // Navigate to chat or open chat widget
    this.router.navigate(['/chat'], {
      queryParams: {
        advertiserId: advertiser.id,
      },
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
        ...this.displayedAdvertisers[index],
        isFavorite: true,
      };
      // TODO: Call favorite/like service to persist changes
      // TODO: Show notification or feedback
    }
  }

  onAdvertiserNope(advertiser: Advertiser): void {
    // Handle nope/reject action
    // TODO: Update user preferences or filtering based on rejection
    // TODO: Show notification or feedback
  }

  onRefreshAdvertisers(): void {
    // Reload advertisers list
    this.isLoading = true;
    // Simulate API call delay
    setTimeout(() => {
      // For now, just shuffle the existing list
      this.displayedAdvertisers = [...this.allAdvertisers]
        .sort(() => Math.random() - 0.5)
        .filter((ad) => !ad.isPremium);
      this.isLoading = false;
    }, 1000);
  }

  // TODO: Add loadMore for infinite scroll if implementing full NetflixView functionality
  // TODO: Implement actual API calls instead of mock data
  // TODO: Implement logic for selectedLocation and its impact on filtering
}
