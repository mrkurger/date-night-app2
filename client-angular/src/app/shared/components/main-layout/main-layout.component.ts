// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (main-layout.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdService } from '../../../core/services/ad.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Ad } from '../../../core/models/ad.interface';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @Input() activeView: 'netflix' | 'tinder' | 'list' = 'netflix';

  isAuthenticated = false;
  isMenuCollapsed = false;
  premiumAds: Ad[] = [];
  loading = true;
  isDarkMode = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private adService: AdService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Check authentication status
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.isAuthenticated = !!user;
      })
    );

    // Load premium ads for the sidebar
    this.loadPremiumAds();

    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.isDarkMode$.subscribe(isDarkMode => {
        this.isDarkMode = isDarkMode;
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadPremiumAds(): void {
    this.loading = true;
    this.subscriptions.push(
      this.adService.getFeaturedAds().subscribe({
        next: ads => {
          this.premiumAds = ads.slice(0, 5); // Show top 5 premium ads
          this.loading = false;
        },
        error: err => {
          console.error('Error loading premium ads:', err);
          this.loading = false;
        },
      })
    );
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  getMediaUrl(ad: Ad): string {
    if (ad.media && Array.isArray(ad.media) && ad.media.length > 0) {
      if ('url' in ad.media[0]) {
        return ad.media[0].url;
      }
    }

    if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
      // Handle both string[] and object[] formats
      if (typeof ad.images[0] === 'string') {
        return ad.images[0] as string;
      } else if (typeof ad.images[0] === 'object' && 'url' in ad.images[0]) {
        return (ad.images[0] as { url: string }).url;
      }
    }
    return '/assets/images/default-profile.jpg';
  }

  /**
   * Toggle between light and dark theme
   * This method is kept for backward compatibility but is no longer needed
   * as the ThemeToggleComponent now handles theme changes directly
   * @param value The new theme value (true for dark, false for light)
   * @deprecated Use ThemeToggleComponent instead
   */
  onThemeChange(value: boolean): void {
    this.themeService.setTheme(value ? 'dark' : 'light');
  }
}
