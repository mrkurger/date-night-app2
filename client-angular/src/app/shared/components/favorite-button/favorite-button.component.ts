// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (favorite-button.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogService } from '../../../core/services/dialog.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      [color]="isFavorite ? 'warn' : ''"
      [matTooltip]="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      (click)="toggleFavorite()"
      [disabled]="loading"
      [class.favorite-button]="true"
      [class.is-favorite]="isFavorite"
      [class.button-small]="small"
      [class.button-large]="large"
    >
      <mat-icon>{{ isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
    </button>
  `,
  styles: [
    `
      .favorite-button {
        transition: transform 0.2s ease;
      }

      .favorite-button:hover {
        transform: scale(1.1);
      }

      .is-favorite mat-icon {
        color: #f44336;
      }

      .button-small {
        width: 30px;
        height: 30px;
        line-height: 30px;
      }

      .button-small mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
      }

      .button-large {
        width: 48px;
        height: 48px;
        line-height: 48px;
      }

      .button-large mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        line-height: 28px;
      }
    `,
  ],
})
export class FavoriteButtonComponent implements OnInit, OnDestroy {
  @Input() adId = '';
  @Input() adTitle = '';
  @Input() small = false;
  @Input() large = false;

  @Output() favoriteChanged = new EventEmitter<boolean>();

  isFavorite = false;
  loading = false;
  private subscription: Subscription | null = null;

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkFavoriteStatus();
  }

  ngOnChanges(): void {
    if (this.adId) {
      this.checkFavoriteStatus();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleFavorite(): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.info('Please log in to save favorites');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    if (!this.adId) {
      this.notificationService.error('Ad ID is required');
      return;
    }

    this.loading = true;

    if (this.isFavorite) {
      this.favoriteService.removeFavorite(this.adId).subscribe({
        next: () => {
          this.isFavorite = false;
          this.favoriteChanged.emit(false);
          this.notificationService.success('Removed from favorites');
          this.loading = false;
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          this.notificationService.error('Failed to remove from favorites');
          this.loading = false;
        },
      });
    } else {
      // If we have the ad title, open the dialog to add details
      if (this.adTitle) {
        this.dialogService.addToFavorites(this.adId, this.adTitle).subscribe((result) => {
          if (result) {
            this.favoriteService
              .addFavorite(
                this.adId,
                result.notes,
                result.notificationsEnabled,
                result.tags,
                result.priority,
              )
              .subscribe({
                next: () => {
                  this.isFavorite = true;
                  this.favoriteChanged.emit(true);
                  this.notificationService.success('Added to favorites');
                  this.loading = false;
                },
                error: (error) => {
                  console.error('Error adding favorite:', error);
                  this.notificationService.error('Failed to add to favorites');
                  this.loading = false;
                },
              });
          } else {
            // User canceled the dialog
            this.loading = false;
          }
        });
      } else {
        // Simple add without dialog (fallback for backward compatibility)
        this.favoriteService.addFavorite(this.adId).subscribe({
          next: () => {
            this.isFavorite = true;
            this.favoriteChanged.emit(true);
            this.notificationService.success('Added to favorites');
            this.loading = false;
          },
          error: (error) => {
            console.error('Error adding favorite:', error);
            this.notificationService.error('Failed to add to favorites');
            this.loading = false;
          },
        });
      }
    }
  }

  private checkFavoriteStatus(): void {
    if (!this.adId || !this.authService.isAuthenticated()) {
      return;
    }

    this.loading = true;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = this.favoriteService.isFavorite(this.adId).subscribe({
      next: (isFavorite) => {
        this.isFavorite = isFavorite;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error checking favorite status:', error);
        this.loading = false;
      },
    });
  }
}
