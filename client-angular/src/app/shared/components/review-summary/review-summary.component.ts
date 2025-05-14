import { NbCardModule } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-summary.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AdvertiserRatings } from '../../../core/models/review.interface';
import { ReviewService } from '../../../core/services/review.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-review-summary',
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbIconModule, NbProgressBarModule, RouterModule, StarRatingComponent, NbCardModule],
  template: `
    <nb-card class="review-summary-card">
      <nb-card-header>
        <h4>{{ title }}</h4>
        <p *ngIf="ratings">{{ ratings.totalReviews }} reviews</p>
      </nb-card-header>

      <nb-card-body>
        <div class="loading-container" *ngIf="loading">
          <nb-progress-bar mode="indeterminate"></nb-progress-bar>
          <p>Loading ratings...</p>
        </div>

        <div class="no-reviews" *ngIf="!loading && (!ratings || ratings.totalReviews === 0)">
          <p>No reviews yet</p>
        </div>

        <div class="ratings-container" *ngIf="!loading && ratings && ratings.totalReviews > 0">
          <div class="overall-rating">
            <div class="rating-value">{{ ratings.averageRating | number: '1.1-1' }}</div>
            <app-star-rating
              [rating]="ratings.averageRating"
              [readonly]="true"
              [showRatingText]="false"
            ></app-star-rating>
            <div class="rating-count">
              {{ ratings.totalReviews }} {{ ratings.totalReviews === 1 ? 'review' : 'reviews' }}
            </div>
          </div>

          <hr />

          <div class="category-ratings" *ngIf="showCategoryRatings">
            <div class="category-rating">
              <span class="category-label">Communication</span>
              <div class="rating-bar-container">
                <div class="rating-bar">
                  <nb-progress-bar
                    [value]="(ratings.communicationAvg / 5) * 100"
                    status="primary"
                  ></nb-progress-bar>
                </div>
                <span class="category-value">{{ ratings.communicationAvg | number: '1.1-1' }}</span>
              </div>
            </div>

            <div class="category-rating">
              <span class="category-label">Appearance</span>
              <div class="rating-bar-container">
                <div class="rating-bar">
                  <nb-progress-bar
                    [value]="(ratings.appearanceAvg / 5) * 100"
                    status="primary"
                  ></nb-progress-bar>
                </div>
                <span class="category-value">{{ ratings.appearanceAvg | number: '1.1-1' }}</span>
              </div>
            </div>

            <div class="category-rating">
              <span class="category-label">Location</span>
              <div class="rating-bar-container">
                <div class="rating-bar">
                  <nb-progress-bar
                    [value]="(ratings.locationAvg / 5) * 100"
                    status="primary"
                  ></nb-progress-bar>
                </div>
                <span class="category-value">{{ ratings.locationAvg | number: '1.1-1' }}</span>
              </div>
            </div>

            <div class="category-rating">
              <span class="category-label">Value</span>
              <div class="rating-bar-container">
                <div class="rating-bar">
                  <nb-progress-bar
                    [value]="(ratings.valueAvg / 5) * 100"
                    status="primary"
                  ></nb-progress-bar>
                </div>
                <span class="category-value">{{ ratings.valueAvg | number: '1.1-1' }}</span>
              </div>
            </div>
          </div>
        </div>
      </nb-card-body>

      <nb-card-footer *ngIf="showWriteReviewButton">
        <button nbButton status="primary" (click)="writeReviewClicked.emit()">
          Write a Review
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      .review-summary-card {
        margin-bottom: 20px;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-md);
      }

      .loading-container {
        padding: 20px 0;
        text-align: center;
      }

      .loading-container p {
        margin-top: 10px;
        color: var(--text-hint-color);
      }

      .no-reviews {
        padding: 20px;
        text-align: center;
        color: var(--text-hint-color);
      }

      .ratings-container {
        padding: 10px 0;
      }

      .overall-rating {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px 0;
      }

      .rating-value {
        font-size: 2.5rem;
        font-weight: 500;
        color: var(--text-basic-color);
        line-height: 1;
      }

      .rating-count {
        margin-top: 5px;
        color: var(--text-hint-color);
        font-size: 0.9rem;
      }

      .category-ratings {
        padding: 15px 0;
      }

      .category-rating {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }

      .category-label {
        flex: 0 0 100px;
        font-weight: 500;
        color: var(--text-basic-color);
      }

      .rating-bar-container {
        flex: 1;
        display: flex;
        align-items: center;
      }

      .rating-bar {
        flex: 1;
        margin-right: 10px;
      }

      .category-value {
        width: 30px;
        text-align: right;
        font-weight: 500;
        color: var(--text-basic-color);
      }
    `,
  ],
})
export class ReviewSummaryComponent implements OnInit {
  @Input() advertiserId = '';
  @Input() title = 'Ratings & Reviews';
  @Input() showCategoryRatings = true;
  @Input() showWriteReviewButton = true;
  @Input() writeReviewClicked = new EventEmitter<void>();
  @Output() ratingClick = new EventEmitter<number>();

  ratings: AdvertiserRatings | null = null;
  loading = false;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadRatings();
  }

  ngOnChanges(): void {
    if (this.advertiserId) {
      this.loadRatings();
    }
  }

  private loadRatings(): void {
    if (!this.advertiserId) return;

    this.loading = true;

    this.reviewService.getReviewStats(this.advertiserId).subscribe({
      next: (stats) => {
        this.ratings = {
          averageRating: stats.averageRating,
          communicationAvg: stats.categoryAverages.communication,
          appearanceAvg: stats.categoryAverages.appearance,
          locationAvg: stats.categoryAverages.location,
          valueAvg: stats.categoryAverages.value,
          totalReviews: stats.totalReviews,
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ratings:', error);
        this.loading = false;
      },
    });
  }
}
