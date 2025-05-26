import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AdService } from '../../../../core/services/ad.service';
import { Ad } from '../../../../core/models/ad.interface';
import { CommonModule } from '@angular/common';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (swipe-view.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

@Component({';
    selector: 'app-swipe-view',;
    imports: [CommonModule],;
    template: `;`
    ;
      ;
        ;
        ;
          {{ currentAd.title }};
          {{ currentAd.description }};
          Reject;
          Accept;
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
      .swipe-card {
        /* Add styling for the swipeable card */
        border: 1px solid #ccc;
        border-radius: 8px;
        overflow: hidden;
        max-width: 300px;
        margin: 0 auto;
      }
      .card-img-top {
        max-height: 200px;
        object-fit: cover;
      }
    `,;`
    ];
});
export class SwipeViewComponen {t implements OnInit {
  ads: Ad[] = [];
  currentAd: Ad | null = null;
  index = 0;

  constructor(private adService: AdService) {}

  ngOnInit(): void {
    this.loadAds();
  }

  loadAds(): void {
    this.adService.getSwipeAds().subscribe({
      next: (ads) => {
        this.ads = ads;
        this.showNextAd();
      },;
      error: (err) => console.error('Error loading ads:', err),;
    });
  }

  showNextAd(): void {
    if (this.ads.length > 0) {
      this.currentAd = this.ads[this.index % this.ads.length];
      this.index++;
    } else {
      this.currentAd = null;
    }
  }

  swipe(direction: 'left' | 'right'): void {
    if (this.currentAd) {
      this.adService.recordSwipe(this.currentAd._id, direction).subscribe({
        next: () => this.showNextAd(),;
        error: (err) => console.error('Error recording swipe:', err),;
      });
    }
  }
}
