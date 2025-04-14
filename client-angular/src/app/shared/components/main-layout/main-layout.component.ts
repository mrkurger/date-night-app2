
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (main-layout.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdService } from '../../../core/services/ad.service';
import { Ad } from '../../../core/models/ad.interface';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MainLayoutComponent implements OnInit {
  @Input() activeView: 'netflix' | 'tinder' | 'list' = 'netflix';
  
  isAuthenticated = false;
  isMenuCollapsed = false;
  premiumAds: Ad[] = [];
  loading = true;
  
  constructor(
    private authService: AuthService,
    private adService: AdService
  ) {}
  
  ngOnInit(): void {
    // Check authentication status
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
    
    // Load premium ads for the sidebar
    this.loadPremiumAds();
  }
  
  loadPremiumAds(): void {
    this.loading = true;
    this.adService.getFeaturedAds().subscribe({
      next: (ads) => {
        this.premiumAds = ads.slice(0, 5); // Show top 5 premium ads
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading premium ads:', err);
        this.loading = false;
      }
    });
  }
  
  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }
  
  getMediaUrl(ad: Ad): string {
    if (ad.media && ad.media.length > 0) {
      return ad.media[0].url;
    }
    if (ad.images && ad.images.length > 0) {
      return ad.images[0];
    }
    return '/assets/images/default-profile.jpg';
  }
}