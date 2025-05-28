import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { AdService } from '../../../core/services/ad.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Ad } from '../../../core/models/ad.model';
import { ButtonModule } from 'primeng/button';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-list.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

@Component({';
  selector: 'app-ad-list',
  templateUrl: './ad-list.component.html',
  styleUrls: ['./ad-list.component.scss'],
  standalone: true,
  imports: [;
    CommonModule, RouterModule, SharedModule,
    ButtonModule;
  ]
})
export class AdListComponen {t implements OnInit {
  ads: Ad[] = []
  loading = false;
  error = '';

  constructor(;
    private adService: AdService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadAds()
  }

  loadAds(): void {
    const currentUser = this.authService.getCurrentUser()
    if (!currentUser) {
      this.router.navigate(['/auth/login'])
      return;
    }

    this.loading = true;

    this.adService.getUserAds(currentUser.id).subscribe({
      next: (ads) => {
        this.ads = ads;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ads';
        this.loading = false;
        this.notificationService.error('Failed to load your ads')
        console.error(err)
      }
    })
  }

  editAd(adId: string): void {
    this.router.navigate(['/ad-management/edit', adId])
  }

  viewStats(adId: string): void {
    this.router.navigate(['/ad-management/stats', adId])
  }

  manageTravelItinerary(adId: string): void {
    this.router.navigate(['/ad-management/travel', adId])
  }

  deleteAd(adId: string): void {
    if (confirm('Are you sure you want to delete this ad?')) {
      this.adService.deleteAd(adId).subscribe({
        next: () => {
          this.notificationService.success('Ad deleted successfully')
          this.loadAds() // Reload the list
        },
        error: (err) => {
          this.notificationService.error('Failed to delete ad')
          console.error(err)
        }
      })
    }
  }
}
