import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { ChatService } from './core/services/chat.service';
import { CsrfService } from './core/services/csrf.service';
import { PlatformService } from './core/services/platform.service';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.new.html',
  styleUrls: ['./app.component.new.css'],
  standalone: true,
  imports: [CommonModule, RouterOutlet, NotificationComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isAdvertiser = false;
  username = '';
  unreadMessages = 0;
  notificationCount = 0;

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
    private titleService: Title,
    private metaService: Meta
  ) {
    // Set default meta tags for SEO
    this.titleService.setTitle('Date Night App - Find Your Perfect Match');
    this.metaService.addTags([
      { name: 'description', content: 'Date Night App helps you find your perfect match for a memorable date night experience.' },
      { name: 'keywords', content: 'dating, date night, match, social, relationships' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Date Night App - Find Your Perfect Match' },
      { property: 'og:description', content: 'Date Night App helps you find your perfect match for a memorable date night experience.' },
      { property: 'og:type', content: 'website' }
    ]);
  }

  ngOnInit(): void {
    // Only run browser-specific code when in browser environment
    this.platformService.runInBrowser(() => {
      // Initialize CSRF protection
      this.csrfService.initializeCsrf().subscribe();

      this.authSubscription = this.authService.currentUser$.subscribe((user: any) => {
        this.isAuthenticated = !!user;

        if (user) {
          this.username = user.username;
          this.isAdvertiser = user.role === 'advertiser' || user.role === 'admin';

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
}
