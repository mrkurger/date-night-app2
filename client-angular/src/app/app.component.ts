import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { ChatService } from './core/services/chat.service';
import { CsrfService } from './core/services/csrf.service';
import { NotificationComponent } from './shared/components/notification/notification.component';

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
    private csrfService: CsrfService
  ) {}

  ngOnInit(): void {
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
