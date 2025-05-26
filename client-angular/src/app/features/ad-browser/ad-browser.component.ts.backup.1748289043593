// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-browser.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { AdService } from '../../core/services/ad.service';
import { CommonModule } from '@angular/common';
import { Ad } from '../../core/models/ad.model';
import { NebularModule } from '../../../app/shared/nebular.module';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbSpinnerModule,
  NbLayoutModule,
} from '@nebular/theme';

@Component({
    selector: 'app-ad-browser',
    templateUrl: './ad-browser.component.html',
    styleUrls: ['./ad-browser.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [NebularModule, CommonModule,
        NbCardModule,
        NbButtonModule,
        NbIconModule,
        NbSpinnerModule,
        NbLayoutModule,
    ]
})
export class AdBrowserComponent implements OnInit {
  ads: Ad[] = [];
  currentIndex = 0;
  loading = false;
  error: string | null = null;
  favorites: string[] = []; // Array of ad IDs

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
      next: (response) => {
        this.ads = response.ads;
        this.loading = false;
      },
      error: (_err) => {
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

  getCurrentAd(): Ad | undefined {
    return this.ads[this.currentIndex];
  }

  toggleFavorite(ad: Ad): void {
    const index = this.favorites.findIndex((favId) => favId === ad._id);
    if (index === -1) {
      this.favorites.push(ad._id);
    } else {
      this.favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  isFavorite(ad: Ad): boolean {
    return this.favorites.includes(ad._id);
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
          error: (_err) => {
            this.error = 'Failed to find nearby ads';
            this.loading = false;
          },
        });
      },
      (_error) => {
        this.error = 'Unable to retrieve your location';
      },
    );
  }

  viewAdDetails(adId: string): void {
    this.router.navigate(['/ad-details', adId]);
  }
}
