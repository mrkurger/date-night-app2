import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  NbMenuModule,
  NbSidebarModule,
  NbLayoutModule,
  NbButtonModule,
  NbIconModule,
  NbContextMenuModule,
  NbUserModule,
  NbActionsModule,
  NbMenuItem,
} from '@nebular/theme';
import { AuthService } from '../../services/auth.service';
import { MenuStateService } from '../../services/menu-state.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbMenuModule,
    NbSidebarModule,
    NbLayoutModule,
    NbButtonModule,
    NbIconModule,
    NbContextMenuModule,
    NbUserModule,
    NbActionsModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  items: NbMenuItem[] = [
    {
      title: 'Home',
      icon: 'home-outline',
      link: '/',
      home: true,
      id: 'home',
    },
    {
      title: 'Browse',
      icon: 'search-outline',
      link: '/browse',
      id: 'browse',
    },
    {
      title: 'My Ads',
      icon: 'file-text-outline',
      link: '/my-ads',
      id: 'my-ads',
    },
    {
      title: 'Messages',
      icon: 'message-circle-outline',
      link: '/chat',
      id: 'chat',
    },
    {
      title: 'Favorites',
      icon: 'heart-outline',
      link: '/favorites',
      id: 'favorites',
    },
    {
      title: 'Demos',
      icon: 'layers-outline',
      id: 'demos',
      children: [
        {
          title: 'Design System',
          link: '/design-system',
          id: 'design-system',
        },
        {
          title: 'Style Guide',
          link: '/style-guide',
          id: 'style-guide',
        },
        {
          title: 'Accessibility',
          link: '/accessibility',
          id: 'accessibility',
        },
        {
          title: 'Micro-interactions',
          link: '/micro-interactions',
          id: 'micro-interactions',
        },
        {
          title: 'Preferences Demo',
          link: '/preferences-demo',
          id: 'preferences-demo',
        },
        {
          title: 'Advertiser Browsing (Alt)',
          link: '/advertiser-browsing-alt',
          id: 'advertiser-browsing-alt',
        },
      ],
    },
  ];

  sidebarState: 'expanded' | 'collapsed' | 'compacted' = 'expanded';

  userItems = [
    { title: 'Profile', icon: 'person-outline', link: '/profile' },
    { title: 'Settings', icon: 'settings-outline', link: '/settings' },
    { title: 'Logout', icon: 'log-out-outline' },
  ];

  adminItems = [
    { title: 'Admin Dashboard', icon: 'shield-outline', link: '/admin' },
    { title: 'Telemetry', icon: 'activity-outline', link: '/telemetry' },
  ];

  isLoggedIn = false;
  isAdmin = false;
  userProfile: {
    username?: string;
    profileImage?: string;
    roles?: string[];
  } | null = null;

  constructor(
    private authService: AuthService,
    private menuStateService: MenuStateService,
  ) {}

  ngOnInit() {
    // Load saved menu state
    const savedState = this.menuStateService.getCurrentState();
    this.sidebarState = savedState.sidebarState;

    // Restore expanded items
    savedState.expandedItems.forEach((itemId) => {
      const item = this.findMenuItem(this.items, itemId);
      if (item) {
        item.expanded = true;
      }
    });

    // Set selected item if exists
    if (savedState.selectedItem) {
      const item = this.findMenuItem(this.items, savedState.selectedItem);
      if (item) {
        item.selected = true;
      }
    }

    // Subscribe to menu item selections
    this.menuStateService.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.sidebarState = state.sidebarState;
    });

    this.authService.isAuthenticated().subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;

      if (isLoggedIn) {
        this.authService.getCurrentUser().subscribe((user) => {
          this.userProfile = user;
          this.isAdmin = user?.roles?.includes('admin') || false;

          // Add admin items if user is admin
          if (this.isAdmin) {
            this.items = [...this.items, ...this.adminItems];
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle sidebar state
   */
  toggleSidebar() {
    const newState =
      this.sidebarState === 'expanded'
        ? 'compacted'
        : this.sidebarState === 'compacted'
          ? 'collapsed'
          : 'expanded';

    this.menuStateService.updateSidebarState(newState);
  }

  /**
   * Handle menu item click
   */
  onMenuItemClick(item: NbMenuItem) {
    if (item.id) {
      // Update selected item
      this.menuStateService.setSelectedItem(item.id);

      // Update expanded state if item has children
      if (item.children?.length) {
        this.menuStateService.toggleMenuItem(item.id);
      }
    }
  }

  /**
   * Find menu item by ID (recursive)
   */
  private findMenuItem(items: NbMenuItem[], id: string): NbMenuItem | null {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children?.length) {
        const found = this.findMenuItem(item.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  onUserMenuSelect(event: any): void {
    if (event && event.title === 'Logout') {
      this.authService.logout();
    }
  }
}
