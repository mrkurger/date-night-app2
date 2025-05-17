import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { Subscription } from 'rxjs';
import { NebularModule } from './shared/nebular.module';
import { WebSocketFallbackService } from './core/services/websocket-fallback.service';
import {
  NbSidebarService,
  NbLayoutModule,
  NbSidebarModule,
  NbMenuModule,
  NbActionsModule,
  NbUserModule,
  NbButtonModule,
  NbIconModule,
} from '@nebular/theme';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NebularModule,
    ThemeToggleComponent,
    NbLayoutModule,
    NbSidebarModule,
    NbMenuModule,
    NbActionsModule,
    NbUserModule,
    NbButtonModule,
    NbIconModule,
  ],
  template: `
    <nb-layout>
      <nb-layout-header fixed>
        <div class="header-container">
          <div class="left">
            <button nbButton ghost (click)="toggleSidebar()">
              <nb-icon icon="menu-outline"></nb-icon>
            </button>
            <a class="app-title" routerLink="/">DateNight.io</a>
          </div>
          <div class="right">
            <nb-actions size="small">
              <nb-action icon="search-outline"></nb-action>
              <nb-action>
                <app-theme-toggle mode="icon-only"></app-theme-toggle>
              </nb-action>
              <nb-action>
                <nb-user
                  [name]="'John Doe'"
                  [picture]="'assets/images/default-avatar.png'"
                ></nb-user>
              </nb-action>
            </nb-actions>
          </div>
        </div>
      </nb-layout-header>

      <nb-sidebar state="collapsed">
        <nb-menu [items]="menuItems"></nb-menu>
      </nb-sidebar>

      <nb-layout-column>
        <div class="main-content">
          <router-outlet></router-outlet>
        </div>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <div class="footer-container">
          <div class="footer-content">
            <div class="footer-section">
              <h3 class="footer-heading">About DateNight.io</h3>
              <p class="footer-text">
                Find your perfect match and plan amazing dates with our innovative dating platform.
              </p>
            </div>
            <div class="footer-section">
              <h3 class="footer-heading">Quick Links</h3>
              <ul class="footer-links">
                <li><a routerLink="/browse">Browse</a></li>
                <li><a routerLink="/matches">Matches</a></li>
                <li><a routerLink="/profile">Profile</a></li>
                <li><a routerLink="/settings">Settings</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3 class="footer-heading">Connect With Us</h3>
              <div class="social-links">
                <a href="#" class="social-link" target="_blank" rel="noopener">
                  <nb-icon icon="facebook-outline"></nb-icon>
                </a>
                <a href="#" class="social-link" target="_blank" rel="noopener">
                  <nb-icon icon="twitter-outline"></nb-icon>
                </a>
                <a href="#" class="social-link" target="_blank" rel="noopener">
                  <nb-icon icon="instagram-outline"></nb-icon>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nb-layout-footer>
    </nb-layout>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;
  menuItems = [
    {
      title: 'Home',
      icon: 'home-outline',
      link: '/',
    },
    {
      title: 'Browse',
      icon: 'search-outline',
      link: '/browse',
    },
    {
      title: 'Matches',
      icon: 'heart-outline',
      link: '/matches',
    },
    {
      title: 'Messages',
      icon: 'message-square-outline',
      link: '/messages',
    },
    {
      title: 'Profile',
      icon: 'person-outline',
      link: '/profile',
    },
    {
      title: 'Settings',
      icon: 'settings-2-outline',
      link: '/settings',
    },
  ];

  constructor(
    private themeService: ThemeService,
    private sidebarService: NbSidebarService,
    private webSocketFallbackService: WebSocketFallbackService,
  ) {}

  ngOnInit() {
    // Initialize WebSocket fallback service
    this.webSocketFallbackService.initialize();

    // Subscribe to theme changes
    this.subscription = this.themeService.theme$.subscribe((theme) => {
      // Theme service will handle the actual theme switching
      this.themeService.setTheme(theme);
    });

    // Initialize theme from saved preference
    const savedTheme = this.themeService.getCurrentTheme();
    this.themeService.setTheme(savedTheme || 'system');
  }

  toggleSidebar() {
    this.sidebarService.toggle(true, 'left');
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Restore original WebSocket
    this.webSocketFallbackService.restoreOriginalWebSocket();
  }
}
