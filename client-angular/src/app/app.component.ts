import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { Subscription } from 'rxjs';
import { WebSocketFallbackService } from './core/services/websocket-fallback.service';
import { NavigationComponent } from './shared/components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  imports: [RouterModule, NavigationComponent],
  template: `
    <app-navigation>
      <router-outlet></router-outlet>
    </app-navigation>
  `,
  styleUrls: ['./app.component.scss'],
  standalone: true,
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;

  constructor(
    private themeService: ThemeService,
    private webSocketFallbackService: WebSocketFallbackService,
  ) {}

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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Restore original WebSocket
    this.webSocketFallbackService.restoreOriginalWebSocket();
  }
}
