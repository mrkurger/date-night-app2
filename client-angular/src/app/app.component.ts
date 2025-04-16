// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (app.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { ChatService } from './core/services/chat.service';
import { CsrfService } from './core/services/csrf.service';
import { PlatformService } from './core/services/platform.service';
import { PwaService } from './core/services/pwa.service';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { DebugInfoComponent } from './shared/components/debug-info/debug-info.component';
import { AlertNotificationsComponent } from './shared/components/alert-notifications/alert-notifications.component';
import { Meta, Title } from '@angular/platform-browser';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationComponent,
    DebugInfoComponent,
    AlertNotificationsComponent,
    NgIf,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isAdvertiser = false;
  isAdmin = false;
  username = '';
  unreadMessages = 0;
  notificationCount = 0;
  deferredPrompt: any;
  showInstallPrompt = false;

  private authSubscription: Subscription = new Subscription();
  private chatSubscription: Subscription = new Subscription();
  private notificationSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private csrfService: CsrfService,
    private platformService: PlatformService,
    private pwaService: PwaService,
    private titleService: Title,
    private metaService: Meta
  ) {
    // Set default meta tags for SEO
    this.titleService.setTitle('Date Night App - Find Your Perfect Match');
    this.metaService.addTags([
      {
        name: 'description',
        content:
          'Date Night App helps you find your perfect match for a memorable date night experience.',
      },
      { name: 'keywords', content: 'dating, date night, match, social, relationships' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Date Night App - Find Your Perfect Match' },
      {
        property: 'og:description',
        content:
          'Date Night App helps you find your perfect match for a memorable date night experience.',
      },
      { property: 'og:type', content: 'website' },
    ]);

    // Listen for beforeinstallprompt event to enable PWA installation
    this.platformService.runInBrowser(() => {
      window.addEventListener('beforeinstallprompt', e => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        this.deferredPrompt = e;
        // Show the install button
        this.showInstallPrompt = true;
      });
    });
  }

  ngOnInit(): void {
    // Only run browser-specific code when in browser environment
    this.platformService.runInBrowser(() => {
      // Initialize CSRF protection
      this.csrfService.initializeCsrf().subscribe();

      // Check for PWA updates
      this.pwaService.checkForUpdates().then(hasUpdate => {
        if (hasUpdate) {
          console.log('New version available');
        }
      });

      this.authSubscription = this.authService.currentUser$.subscribe((user: any) => {
        this.isAuthenticated = !!user;

        if (user) {
          this.username = user.username;
          this.isAdvertiser = user.role === 'advertiser' || user.role === 'admin';
          this.isAdmin = user.role === 'admin';

          // Initialize chat service if authenticated
          this.initializeChat();

          // Mock implementation for unread messages until the service is fully implemented
          // This will be replaced with the actual subscription once the service is ready
          this.unreadMessages = Math.floor(Math.random() * 5);
          this.notificationCount = Math.floor(Math.random() * 3);
        }
      });
    });
  }

  /**
   * Initialize chat service
   * Loads chat rooms and unread counts
   */
  private initializeChat(): void {
    // Load chat rooms
    this.chatService.getRooms().subscribe();

    // Mock implementation for unread counts
    // This will be replaced with the actual call once the service is ready
    // this.chatService.getUnreadCounts().subscribe();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }

    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.notificationService.success('You have been logged out successfully');

    // Reset counters
    this.unreadMessages = 0;
    this.notificationCount = 0;
  }

  /**
   * Install PWA app
   * Shows the installation prompt
   */
  installPwa(): void {
    if (!this.deferredPrompt) {
      console.log('Installation prompt not available');
      return;
    }

    // Show the prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.notificationService.success('App installation started!');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferred prompt variable
      this.deferredPrompt = null;
      this.showInstallPrompt = false;
    });
  }
}
