// PrimeNG Modules
// Import MenuItem

// Application-specific services and components
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/menuitem';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SidebarModule } from 'primeng/sidebar';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from '../../models/user.model'; // Corrected path
import { AuthService } from '../../services/auth.service'; // Corrected path
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'; // Assuming this is already PrimeNG or will be migrated
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component'; // Assuming this is already PrimeNG or will be migrated

/**
 *
 */
@Component({
  selector: 'app-navigation',
  standalone: true, // Ensure this component is standalone
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbsComponent,
    ThemeToggleComponent,
    // PrimeNG Modules
    SidebarModule,
    PanelMenuModule,
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    TooltipModule,
    PanelModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  @Input() items: MenuItem[] = []; // Changed from NbMenuItem[] to PrimeNG MenuItem[]

  sidebarVisible = true; // Replaces sidebarState
  currentUser: User | null = null;
  userName: string | undefined = 'Guest';
  userAvatar: string | undefined;
  userMenuItems: MenuItem[] = []; // For PrimeNG user menu
  currentYear: number = new Date().getFullYear();

  private readonly destroy$ = new Subject<void>();

  /**
   *
   */
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly themeService: ThemeService, // Keep if theme toggle or logic relies on it
    private readonly notificationService: NotificationService, // Keep if used
    private readonly cdr: ChangeDetectorRef,
  ) {}

  /**
   *
   */
  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      this.userName = user?.username || 'Guest';
      this.userAvatar = user?.profile?.avatar; // Corrected from avatarUrl to avatar
      this.cdr.detectChanges();
      this.updateUserMenuItems();
    });

    // Example menu items - replace with your actual logic for generating menu items
    this.items = [
      { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/dashboard'] },
      { label: 'Ads', icon: 'pi pi-list', routerLink: ['/ads'] },
      // Add more items as needed
    ];

    this.updateUserMenuItems(); // Initialize user menu items
  }

  /**
   *
   */
  updateUserMenuItems(): void {
    if (this.currentUser) {
      this.userMenuItems = [
        { label: 'Profile', icon: 'pi pi-user', routerLink: ['/profile', this.currentUser.id] }, // Corrected from _id to id
        { label: 'Settings', icon: 'pi pi-cog', routerLink: ['/settings'] },
        { separator: true },
        { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() },
      ];
    } else {
      this.userMenuItems = [
        { label: 'Login', icon: 'pi pi-sign-in', routerLink: ['/auth/login'] },
        { label: 'Register', icon: 'pi pi-user-plus', routerLink: ['/auth/register'] },
      ];
    }
  }

  /**
   *
   */
  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  /**
   *
   */
  onMenuItemClick(event: any): void {
    // event.item is the clicked PrimeNG MenuItem
    // Add any specific logic here if routerLink is not sufficient
    // For example, closing the sidebar on mobile after a click
    if (this.sidebarVisible && window.innerWidth < 768) {
      // Example breakpoint
      this.sidebarVisible = false;
    }
    // If the item has a command, it will be executed automatically by PrimeNG.
    // If it has a routerLink, PrimeNG's menu will handle navigation.
  }

  /**
   *
   */
  logout(): void {
    this.authService.logout(); // Assuming logout method exists
    this.router.navigate(['/auth/login']);
  }

  // Placeholder for methods that might be called from the template
  /**
   *
   */
  openSearch(): void {
    console.log('Open search clicked');
    // Implement search functionality, perhaps opening a dialog or navigating
    this.notificationService.showInfo('Search functionality not yet implemented.');
  }

  /**
   *
   */
  openKeyboardShortcuts(): void {
    console.log('Open keyboard shortcuts clicked');
    // Implement keyboard shortcuts display, perhaps a dialog
    this.notificationService.showInfo('Keyboard shortcuts not yet implemented.');
  }

  /**
   *
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
