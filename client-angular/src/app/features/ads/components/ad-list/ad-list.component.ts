import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-list.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { AdService } from '../../../../core/services/ad.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-ad-list',
    templateUrl: './ad-list.component.html',
    styles: [
        `
      .ad-list-container {
        padding: 20px;
      }
      .ad-card {
        margin-bottom: 20px;
        border: 1px solid #eee;
        border-radius: 5px;
        padding: 15px;
      }
      .ad-title {
        font-size: 18px;
        margin-bottom: 10px;
      }
      .ad-price {
        font-weight: bold;
        color: #28a745;
      }
      .ad-location {
        color: #6c757d;
        font-size: 14px;
      }
      .filter-section {
        margin-bottom: 20px;
      }
    `,
    ],
    imports: [CommonModule, RouterLink]
})
export class AdListComponent implements OnInit {
  ads: any[] = [];
  loading = false;_error: string | null = null;

  constructor(private adService: AdService) {}

  ngOnInit(): void {
    this.loadAds();
  }

  loadAds(): void {
    this.loading = true;
    this.adService.getAds().subscribe({
      next: (response) => {
        this.ads = response.ads;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ads';
        this.loading = false;
      },
    });
  }
}
