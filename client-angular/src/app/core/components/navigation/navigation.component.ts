import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  NbDialogService,
} from '@nebular/theme';
import { AuthService } from '../../services/auth.service';
import { MenuStateService } from '../../services/menu-state.service';
import { SearchService } from '../../services/search.service';
import { KeyboardShortcutsService } from '../../services/keyboard-shortcuts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppMenuItem } from '../../models/menu.model';
import { BreadcrumbsComponent } from '../../../shared/components/breadcrumbs/breadcrumbs.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { KeyboardShortcutsHelpComponent } from '../../../shared/components/keyboard-shortcuts-help/keyboard-shortcuts-help.component';

@Component({
  selector: 'app-navigation',
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbsComponent,
    ThemeToggleComponent,
    NbMenuModule,
    NbUserModule,
    NbActionsModule,
    NbContextMenuModule,
    NbIconModule,
    NbButtonModule,
    NbLayoutModule,
    NbSidebarModule,
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

  sidebarState: 'expanded' | 'collapsed' | 'compacted' = 'expanded';

  userItems = [
    { title: 'Profile', icon: 'person-outline', link: '/profile' },
    { title: 'Settings', icon: 'settings-2-outline', link: '/settings' },
    { title: 'Notifications', icon: 'bell-outline', link: '/notifications' },
    { title: 'Help', icon: 'question-mark-circle-outline', link: '/help' },
    { title: 'Logout', icon: 'log-out-outline', data: { action: 'logout' } },
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
    private dialogService: NbDialogService,
    private keyboardShortcuts: KeyboardShortcutsService,
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
      this.showKeyboardShortcuts();
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
  onMenuItemClick($event: any) {
    const item = $event as AppMenuItem;
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
   * Placeholder for showing keyboard shortcuts.
   * To be implemented or connected to the actual dialog.
   */
  showKeyboardShortcuts(): void {
    // TODO: Implement opening the keyboard shortcuts dialog
    // For now, it's called by this.keyboardShortcuts.register({ key: '?' }, ...)
    // but the template also had (click)="showKeyboardShortcuts()" which caused an error.
    // This method ensures the component class has the property.
    console.log('showKeyboardShortcuts called');
    this.dialogService.open(KeyboardShortcutsHelpComponent);
  }

  /**
   * Handle user menu item selection
   */
  onUserMenuSelect($event: any): void {
    const eventData = $event as { item: NbMenuItem };
    if (eventData.item.data?.action === 'logout') {
      this.authService.logout();
    }
  }
}
