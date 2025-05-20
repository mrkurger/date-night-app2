import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
// ThemeToggleComponent is not used in the template
import { Subscription } from 'rxjs';
import { WebSocketFallbackService } from './core/services/websocket-fallback.service';
import { NavigationComponent } from './core/components/navigation/navigation.component';
import { NbIconLibraries } from '@nebular/theme';
import { NebularModule } from './shared/nebular.module';

@Component({
    selector: 'app-root',
    imports: [RouterModule, NebularModule, NavigationComponent],
    template: `
    <app-navigation>
      <router-outlet></router-outlet>
    </app-navigation>
  `,
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;

  constructor(
    private themeService: ThemeService,
    private webSocketFallbackService: WebSocketFallbackService,
    private iconLibraries: NbIconLibraries,
  ) {
    // Register custom SVG icons
    // Assumes SVG files are in 'assets/icons/custom/'
    // e.g., apple.svg, microsoft.svg
    this.iconLibraries.registerSvgPack('custom', {
      apple:
        '<svg viewBox="0 0 24 24"><path d="M17.228 13.912c-.008.217-.008.438-.008.655 0 2.507.835 4.332 2.507 5.535a5.086 5.086 0 0 1-2.226 1.402c-.94.484-1.957.543-2.927.543-.827 0-1.892-.234-3.002-.702-.99-.41-1.98-.82-3.021-.82-.962 0-1.918.347-2.842.766a4.68 4.68 0 0 1-2.356-1.763c-1.597-2.09-2.927-6.058-.931-8.727.99-.27 2.13-.41 3.28-.41.862 0 1.9.208 2.936.616.97.384 1.902.757 2.973.757.904 0 1.875-.279 2.764-.68.13-.058.217-.076.305-.095.27-.049.54-.089.809-.11.418-.04.854-.062 1.307-.062.19 0 .38.002.569.006l.018.002c.004 0 .01 0 .012-.002zM14.984 6.042c.843-1.035 1.353-2.328 1.24-3.64-.89.06-2.05.608-2.913 1.613-.75.874-1.343 2.12-1.231 3.368.996.102 2.061-.498 2.904-1.34z" fill="currentColor"/></svg>',
      microsoft:
        '<svg viewBox="0 0 24 24"><path d="M11.4 21.9h-9.7v-9.7h9.7v9.7zm10.3 0h-9.7v-9.7h9.7v9.7zm-10.3-10.3h-9.7v-9.7h9.7v9.7zm10.3 0h-9.7v-9.7h9.7v9.7z" fill="currentColor"/></svg>',
      // Add other custom icons here
    });
    // Make Eva icons the default pack
    this.iconLibraries.setDefaultPack('eva');
  }

  ngOnInit() {
    // Initialize WebSocket fallback service
    this.webSocketFallbackService.initialize();

    // Subscribe to theme changes
    this.subscription = this.themeService.theme$.subscribe((_theme) => {
      // Theme service already handles the actual theme switching
      // Using _theme naming convention to indicate intentionally unused parameter
    });

    // Initialize theme from saved preference
    const savedTheme = this.themeService.getCurrentTheme();
    if (savedTheme === 'system') {
      // For 'system' theme, use the system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeService.setTheme(prefersDark ? 'dark' : 'default');
    } else if (savedTheme) {
      this.themeService.setTheme(savedTheme);
    } else {
      this.themeService.setTheme('default');
    }
  }

  // No longer needed as sidebar is handled by NavigationComponent

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Restore original WebSocket
    this.webSocketFallbackService.restoreOriginalWebSocket();
  }
}
