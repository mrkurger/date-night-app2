import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SidebarModule } from 'primeng/sidebar';
import { Subscription } from 'rxjs';

import { ThemeService } from './core/services/theme.service';
import { WebSocketFallbackService } from './core/services/websocket-fallback.service';
import { NavigationComponent } from './shared/components/navigation/navigation.component';

import { ToolbarModule } from 'primeng/toolbar';

/**
 *
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterModule,
    NavigationComponent,
    ButtonModule,
    CardModule,
    ProgressSpinnerModule,
    SidebarModule,
    MenuModule,
    AvatarModule,
    PanelModule,
    ToolbarModule,
    PanelMenuModule,
  ],
  template: ` <router-outlet></router-outlet> `,
  styleUrls: ['./app.component.scss'],
  standalone: true,
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;

  /**
   *
   */
  constructor(
    private readonly themeService: ThemeService,
    private readonly webSocketFallbackService: WebSocketFallbackService,
  ) {}

  /**
   *
   */
  ngOnInit() {
    // Initialize WebSocket fallback service
    this.webSocketFallbackService.initialize();

    // Subscribe to theme changes
    this.subscription = this.themeService.theme$.subscribe((theme) => {
      // Set data-theme attribute on document for PrimeNG theming
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    });

    // Initialize theme from saved preference
    const savedTheme = this.themeService.getCurrentTheme();
    if (savedTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeService.setTheme(prefersDark ? 'dark' : 'default');
    } else if (savedTheme) {
      this.themeService.setTheme(savedTheme);
    } else {
      this.themeService.setTheme('default');
    }
  }

  /**
   *
   */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Restore original WebSocket
    this.webSocketFallbackService.restoreOriginalWebSocket();
  }
}
