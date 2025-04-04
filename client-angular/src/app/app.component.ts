import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { ChatService } from './core/services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.new.html',
  styleUrls: ['./app.component.new.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isAdvertiser = false;
  username = '';
  unreadMessages = 0;
  notificationCount = 0;

  private authSubscription: Subscription;
  private chatSubscription: Subscription;
  private notificationSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;

      if (user) {
        this.username = user.username;
        this.isAdvertiser = user.role === 'advertiser' || user.role === 'admin';

        // Initialize chat service if authenticated
        this.chatService.initialize();

        // Subscribe to unread messages
        this.chatSubscription = this.chatService.unreadMessages$.subscribe(count => {
          this.unreadMessages = count;
        });

        // Subscribe to notifications
        this.notificationSubscription = this.notificationService.notificationCount$.subscribe(count => {
          this.notificationCount = count;
        });
      }
    });
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
