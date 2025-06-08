import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../services/auth.service';
import { MenuStateService } from '../../services/menu-state.service';
import { SearchService } from '../../services/search.service';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { DialogService } from '../../services/dialog.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppMenuItem } from '../../models/menu.model';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    SidebarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    TooltipModule,
    BreadcrumbsComponent,
    ThemeToggleComponent
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  items: AppMenuItem[] = [
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

  adminItems = [
    { title: 'Admin Dashboard', icon: 'shield-outline', link: '/admin', id: 'admin' },
    { title: 'Telemetry', icon: 'activity-outline', link: '/telemetry', id: 'telemetry' },
    {
      title: 'User Management',
      icon: 'people-outline',
      link: '/admin/users',
      id: 'user-management',
    },
    {
      title: 'Content Moderation',
      icon: 'edit-2-outline',
      link: '/admin/moderation',
      id: 'moderation',
    },
  ];

  // Convert AppMenuItem to PrimeNG MenuItem format
  menuItems: MenuItem[] = [];
  userMenuItems: MenuItem[] = [];

  sidebarVisible: boolean = true;
  sidebarState: 'expanded' | 'collapsed' | 'compacted' = 'expanded';

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
    private searchService: SearchService,
    private router: Router,
    private dialogService: DialogService,
    private keyboardShortcuts: KeyboardShortcutsService,
  ) {
    this.convertMenuItems();
  }

  /**
   * Convert AppMenuItem to PrimeNG MenuItem format
   */
  private convertMenuItems() {
    this.menuItems = this.items.map(item => this.convertAppMenuItemToPrimeNG(item));
    
    this.userMenuItems = [
      { label: 'Profile', icon: 'pi pi-user', command: () => this.router.navigate(['/profile']) },
      { label: 'Settings', icon: 'pi pi-cog', command: () => this.router.navigate(['/settings']) },
      { label: 'Notifications', icon: 'pi pi-bell', command: () => this.router.navigate(['/notifications']) },
      { label: 'Help', icon: 'pi pi-question-circle', command: () => this.router.navigate(['/help']) },
      { separator: true },
      { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authService.logout() },
    ];
  }

  /**
   * Convert single AppMenuItem to PrimeNG MenuItem
   */
  private convertAppMenuItemToPrimeNG(item: AppMenuItem): MenuItem {
    const menuItem: MenuItem = {
      label: item.title,
      icon: this.convertIconToPrimeNG(item.icon),
      command: item.link ? () => this.router.navigate([item.link]) : undefined,
    };

    if (item.children && item.children.length > 0) {
      menuItem.items = item.children.map(child => this.convertAppMenuItemToPrimeNG(child));
    }

    return menuItem;
  }

  /**
   * Convert Nebular icons to PrimeIcons
   */
  private convertIconToPrimeNG(nebularIcon?: string): string {
    const iconMap: Record<string, string> = {
      'home-outline': 'pi pi-home',
      'search-outline': 'pi pi-search',
      'file-text-outline': 'pi pi-file-text',
      'message-circle-outline': 'pi pi-comments',
      'heart-outline': 'pi pi-heart',
      'layers-outline': 'pi pi-clone',
      'shield-outline': 'pi pi-shield',
      'activity-outline': 'pi pi-chart-line',
      'people-outline': 'pi pi-users',
      'edit-2-outline': 'pi pi-pencil',
      'menu-2-outline': 'pi pi-bars',
      'menu-arrow-outline': 'pi pi-angle-left',
      'keyboard-outline': 'pi pi-desktop',
    };

    return iconMap[nebularIcon || ''] || 'pi pi-circle';
  }

  ngOnInit() {
    // Load saved menu state
    const savedState = this.menuStateService.getCurrentState();
    this.sidebarState = savedState.sidebarState;
    this.sidebarVisible = savedState.sidebarState !== 'collapsed';

    // Subscribe to menu item selections
    this.menuStateService.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.sidebarState = state.sidebarState;
      this.sidebarVisible = state.sidebarState !== 'collapsed';
    });

    // Subscribe to auth state
    this.authService.isAuthenticated().subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;

      if (isLoggedIn) {
        this.authService.getCurrentUser().subscribe((user) => {
          this.userProfile = user;
          this.isAdmin = user?.roles?.includes('admin') || false;

          // Add admin items if user is admin
          if (this.isAdmin) {
            this.items = [...this.items, ...this.adminItems];
            this.convertMenuItems(); // Re-convert with admin items
          }
        });
      }
    });

    // Register keyboard shortcuts
    this.registerKeyboardShortcuts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.keyboardShortcuts.destroy();
  }

  /**
   * Register keyboard shortcuts
   */
  private registerKeyboardShortcuts() {
    // Show keyboard shortcuts help
    this.keyboardShortcuts.register({ key: '?' }, () => {
      this.dialogService.open(KeyboardShortcutsHelpComponent);
    });

    // Navigation shortcuts
    this.keyboardShortcuts.register({ key: 'g', shift: true, ctrl: true }, () => {
      this.router.navigate(['/']);
    });

    this.keyboardShortcuts.register({ key: 'p', shift: true, ctrl: true }, () => {
      this.router.navigate(['/profile']);
    });

    this.keyboardShortcuts.register({ key: 's', shift: true, ctrl: true }, () => {
      this.router.navigate(['/settings']);
    });

    // View shortcuts
    this.keyboardShortcuts.register({ key: '\\' }, () => {
      this.toggleSidebar();
    });

    this.keyboardShortcuts.register({ key: 't' }, () => {
      const currentState = this.menuStateService.getCurrentState();
      this.menuStateService.updateTheme(currentState.theme === 'dark' ? 'default' : 'dark');
    });

    // Search shortcut is handled by the search dialog component
  }

  /**
   * Toggle sidebar state
   */
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    const newState = this.sidebarVisible ? 'expanded' : 'collapsed';
    this.menuStateService.updateSidebarState(newState);
  }

  /**
   * Handle menu item click (for PrimeNG MenuItem)
   */
  onMenuItemClick(event: any) {
    // PrimeNG handles the command automatically
    // Additional logic can be added here if needed
  }

  /**
   * Open search dialog
   */
  openSearch() {
    this.searchService.openSearch().subscribe((result) => {
      if (result) {
        this.router.navigateByUrl(result.link);
      }
    });
  }

  /**
   * Show keyboard shortcuts help
   */
  showKeyboardShortcuts() {
    // TODO: Implement with PrimeNG dialog service
    console.log('Keyboard shortcuts help');
  }

  /**
   * Find menu item by ID (recursive)
   */
  private findMenuItem(items: AppMenuItem[], id: string): AppMenuItem | null {
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

  /**
   * Handle user menu item selection
   */
  onUserMenuSelect(event: { item: AppMenuItem }): void {
    if (event.item.data?.action === 'logout') {
      this.authService.logout();
    }
  }
}
