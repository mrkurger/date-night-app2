// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-browser.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdService } from '../../core/services/ad.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';

@Component({
  selector: 'app-ad-browser',
  templateUrl: './ad-browser.component.html',
  styleUrls: ['./ad-browser.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule],
})
export class AdBrowserComponent implements OnInit {
  ads: any[] = [];
  currentIndex = 0;
  loading = false;
  error: string | null = null;
  favorites: any[] = [];

  constructor(
    private adService: AdService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadAds();
    const favs = localStorage.getItem('favorites');
    if (favs) {
      this.favorites = JSON.parse(favs);
    }
  }

  loadAds(): void {
    this.loading = true;
    this.adService.getAds().subscribe({
      next: (data) => {
        this.ads = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ads';
        this.loading = false;
      },
    });
  }

  swipeLeft(): void {
    if (this.currentIndex < this.ads.length) {
      this.currentIndex++;
    }
  }

  swipeRight(): void {
    if (this.currentIndex < this.ads.length) {
      this.toggleFavorite(this.ads[this.currentIndex]);
      this.currentIndex++;
    }
  }

  getCurrentAd(): any {
    return this.ads[this.currentIndex];
  }

  toggleFavorite(ad: any): void {
    const index = this.favorites.findIndex((fav) => fav._id === ad._id);
    if (index === -1) {
      this.favorites.push(ad);
    } else {
      this.favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  isFavorite(ad: any): boolean {
    return this.favorites.some((fav) => fav._id === ad._id);
  }

  searchNearby(): void {
    if (!navigator.geolocation) {
      this.error = 'Geolocation not supported';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this.loading = true;
        this.adService.searchNearby(lon, lat, 10000).subscribe({
          next: (data) => {
            this.ads = data;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Failed to find nearby ads';
            this.loading = false;
          },
        });
      },
      (error) => {
        this.error = 'Unable to retrieve your location';
      },
    );
  }

  viewAdDetails(adId: string): void {
    this.router.navigate(['/ad-details', adId]);
  }
}
