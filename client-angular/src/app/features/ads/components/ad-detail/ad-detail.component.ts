// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-detail.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdService } from '../../../../core/services/ad.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/material.module';
import { UserService } from '../../../../core/services/user.service';
import { ChatService } from '../../../../core/services/chat.service';
import { FavoriteButtonComponent } from '../../../../shared/components/favorite-button/favorite-button.component';

@Component({
  selector: 'app-ad-detail',
  templateUrl: './ad-detail.component.html',
  styles: [
    `
      .ad-detail-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .mat-card {
        margin-bottom: 20px;
      }
      .ad-images {
        max-width: 100%;
        margin-bottom: 15px;
      }
      .ad-title {
        font-size: 24px;
        margin-bottom: 15px;
      }
      .ad-description {
        margin-bottom: 20px;
      }
      .ad-info {
        margin: 20px 0;
      }
      .action-buttons {
        margin-top: 20px;
      }
      .favorite-action {
        display: flex;
        align-items: center;
        margin-left: 16px;
      }
      .favorite-label {
        margin-left: 8px;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, MaterialModule, FavoriteButtonComponent],
})
export class AdDetailComponent implements OnInit {
  ad: any;
  loading = true;
  error: string | null = null;
  private isFavorited = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AdService,
    private userService: UserService,
    private chatService: ChatService,
  ) {}

  ngOnInit(): void {
    const adId = this.route.snapshot.paramMap.get('id');
    if (!adId) {
      this.error = 'Ad ID missing';
      this.loading = false;
      return;
    }

    this.loadAd(adId);
    this.checkFavoriteStatus(adId);
  }

  private loadAd(adId: string): void {
    this.adService.getAdById(adId).subscribe({
      next: (ad) => {
        this.ad = ad;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ad details';
        this.loading = false;
        console.error(err);
      },
    });
  }

  private checkFavoriteStatus(adId: string): void {
    this.userService.checkFavorite(adId).subscribe({
      next: (isFavorited) => (this.isFavorited = isFavorited),
      error: (err) => console.error('Error checking favorite status:', err),
    });
  }

  startChat(): void {
    if (!this.userService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.chatService.createOrGetChatRoom(this.ad.advertiser).subscribe({
      next: (roomId) => this.router.navigate(['/chat', roomId]),
      error: (err) => {
        console.error('Error starting chat:', err);
        this.error = 'Failed to start chat';
      },
    });
  }

  /**
   * Handle favorite status change from the favorite button component
   * @param isFavorite New favorite status
   */
  onFavoriteChanged(isFavorite: boolean): void {
    this.isFavorited = isFavorite;
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use the favorite button component instead
   */
  toggleFavorite(): void {
    if (!this.userService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    const method = this.isFavorited ? 'removeFavorite' : 'addFavorite';
    this.userService[method](this.ad._id).subscribe({
      next: () => (this.isFavorited = !this.isFavorited),
      error: (err) => console.error('Error toggling favorite:', err),
    });
  }

  isFavorite(): boolean {
    return this.isFavorited;
  }
}
