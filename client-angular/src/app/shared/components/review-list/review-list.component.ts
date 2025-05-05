// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-list.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Review } from '../../../core/models/review.interface';
import { ReviewService } from '../../../core/services/review.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogService } from '../../../core/services/dialog.service';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    RouterModule,
    StarRatingComponent,
    TimeAgoPipe,
  ],
  template: `
    <div class="reviews-container">
      <h3 class="reviews-title">{{ title }} ({{ reviews.length }})</h3>

      <div *ngIf="reviews.length === 0" class="no-reviews">
        <p>No reviews yet. Be the first to leave a review!</p>
      </div>

      <mat-card *ngFor="let review of reviews" class="review-card">
        <mat-card-header>
          <img
            mat-card-avatar
            [src]="review.reviewer.profileImage || 'assets/images/default-avatar.png'"
            [alt]="review.reviewer.username"
            class="reviewer-avatar"
          />
          <mat-card-title>
            <a [routerLink]="['/profile', review.reviewer._id]">{{ review.reviewer.username }}</a>
          </mat-card-title>
          <mat-card-subtitle>
            <app-star-rating [rating]="review.rating" [readonly]="true"></app-star-rating>
            <span class="review-date">{{ review.createdAt | timeAgo }}</span>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <h4 class="review-title">{{ review.title }}</h4>
          <p class="review-content">{{ review.content }}</p>

          <div class="category-ratings" *ngIf="showCategoryRatings">
            <div class="category-rating" *ngIf="review.categories?.communication">
              <span class="category-label">Communication:</span>
              <app-star-rating
                [rating]="review.categories.communication"
                [readonly]="true"
                [small]="true"
              ></app-star-rating>
            </div>
            <div class="category-rating" *ngIf="review.categories?.appearance">
              <span class="category-label">Appearance:</span>
              <app-star-rating
                [rating]="review.categories.appearance"
                [readonly]="true"
                [small]="true"
              ></app-star-rating>
            </div>
            <div class="category-rating" *ngIf="review.categories?.location">
              <span class="category-label">Location:</span>
              <app-star-rating
                [rating]="review.categories.location"
                [readonly]="true"
                [small]="true"
              ></app-star-rating>
            </div>
            <div class="category-rating" *ngIf="review.categories?.value">
              <span class="category-label">Value:</span>
              <app-star-rating
                [rating]="review.categories.value"
                [readonly]="true"
                [small]="true"
              ></app-star-rating>
            </div>
          </div>

          <div class="verified-badge" *ngIf="review.isVerifiedMeeting">
            <mat-icon>verified</mat-icon>
            <span>Verified Meeting</span>
          </div>
        </mat-card-content>

        <mat-divider *ngIf="review.advertiserResponse"></mat-divider>

        <div class="advertiser-response" *ngIf="review.advertiserResponse">
          <h5>Response from advertiser</h5>
          <p>{{ review.advertiserResponse.content }}</p>
          <small>{{ review.advertiserResponse.date | timeAgo }}</small>
        </div>

        <mat-card-actions align="end">
          <button
            mat-button
            color="primary"
            (click)="markHelpful(review._id)"
            [disabled]="!isAuthenticated || helpfulMarked.includes(review._id)"
          >
            <mat-icon>thumb_up</mat-icon>
            Helpful ({{ review.helpfulVotes }})
          </button>

          <button
            mat-button
            color="warn"
            (click)="openReportDialog(review._id)"
            [disabled]="!isAuthenticated || reportedReviews.includes(review._id)"
          >
            <mat-icon>flag</mat-icon>
            Report
          </button>

          <button
            mat-button
            *ngIf="canRespond(review)"
            color="accent"
            (click)="openResponseDialog(review._id)"
          >
            <mat-icon>reply</mat-icon>
            Respond
          </button>
        </mat-card-actions>
      </mat-card>

      <div class="load-more" *ngIf="hasMoreReviews">
        <button mat-button color="primary" (click)="loadMoreReviews()" [disabled]="loading">
          <mat-icon>more_horiz</mat-icon>
          Load More Reviews
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .reviews-container {
        margin: 20px 0;
      }

      .reviews-title {
        font-size: 1.5rem;
        margin-bottom: 20px;
        color: #333;
      }

      .review-card {
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .reviewer-avatar {
        background-color: #f5f5f5;
      }

      .review-date {
        margin-left: 10px;
        font-size: 0.8rem;
        color: #666;
      }

      .review-title {
        font-weight: 500;
        margin-top: 10px;
        margin-bottom: 5px;
      }

      .review-content {
        white-space: pre-line;
        line-height: 1.5;
      }

      .category-ratings {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-top: 15px;
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 4px;
      }

      .category-rating {
        display: flex;
        align-items: center;
      }

      .category-label {
        margin-right: 5px;
        font-weight: 500;
        min-width: 100px;
      }

      .verified-badge {
        display: flex;
        align-items: center;
        color: #4caf50;
        margin-top: 10px;
      }

      .verified-badge mat-icon {
        margin-right: 5px;
      }

      .advertiser-response {
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 0 0 8px 8px;
      }

      .advertiser-response h5 {
        margin-top: 0;
        color: #333;
      }

      .advertiser-response small {
        color: #666;
      }

      .no-reviews {
        text-align: center;
        padding: 30px;
        background-color: #f9f9f9;
        border-radius: 8px;
        margin-bottom: 20px;
      }

      .load-more {
        text-align: center;
        margin-top: 20px;
      }
    `,
  ],
})
export class ReviewListComponent implements OnInit {
  @Input() advertiserId = '';
  @Input() adId = '';
  @Input() title = 'Reviews';
  @Input() showCategoryRatings = true;
  @Input() limit = 5;

  reviews: Review[] = [];
  loading = false;
  hasMoreReviews = false;
  page = 1;
  helpfulMarked: string[] = [];
  reportedReviews: string[] = [];

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loadReviews();
    this.loadHelpfulMarked();
    this.loadReportedReviews();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUserId(): string | undefined {
    return this.authService.currentUser?.id;
  }

  loadReviews(): void {
    this.loading = true;

    let request;
    if (this.advertiserId) {
      request = this.reviewService.getReviewsByAdvertiser(this.advertiserId, this.page, this.limit);
    } else if (this.adId) {
      request = this.reviewService.getReviewsByAd(this.adId, this.page, this.limit);
    } else {
      this.loading = false;
      return;
    }

    request.subscribe({
      next: (data) => {
        if (this.page === 1) {
          this.reviews = data.reviews;
        } else {
          this.reviews = [...this.reviews, ...data.reviews];
        }
        this.hasMoreReviews = data.totalPages > this.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.notificationService.error('Failed to load reviews');
        this.loading = false;
      },
    });
  }

  loadMoreReviews(): void {
    this.page++;
    this.loadReviews();
  }

  markHelpful(reviewId: string): void {
    if (!this.isAuthenticated) {
      this.notificationService.info('Please log in to mark reviews as helpful');
      return;
    }

    this.reviewService.markReviewHelpful(reviewId).subscribe({
      next: () => {
        // Update the review in the list
        const reviewIndex = this.reviews.findIndex((r) => r._id === reviewId);
        if (reviewIndex !== -1) {
          this.reviews[reviewIndex].helpfulVotes++;
        }

        // Add to local storage to prevent multiple votes
        this.helpfulMarked.push(reviewId);
        localStorage.setItem('helpfulReviews', JSON.stringify(this.helpfulMarked));

        this.notificationService.success('Review marked as helpful');
      },
      error: (error) => {
        console.error('Error marking review as helpful:', error);
        this.notificationService.error('Failed to mark review as helpful');
      },
    });
  }

  openReportDialog(reviewId: string): void {
    if (!this.isAuthenticated) {
      this.notificationService.info('Please log in to report reviews');
      return;
    }

    this.dialogService.reportReview(reviewId).subscribe((reason) => {
      if (reason) {
        this.reportReview(reviewId, reason);
      }
    });
  }

  reportReview(reviewId: string, reason: string): void {
    this.reviewService.reportReview(reviewId, reason).subscribe({
      next: () => {
        // Add to local storage to prevent multiple reports
        this.reportedReviews.push(reviewId);
        localStorage.setItem('reportedReviews', JSON.stringify(this.reportedReviews));

        this.notificationService.success('Review reported successfully');
      },
      error: (error) => {
        console.error('Error reporting review:', error);
        this.notificationService.error('Failed to report review');
      },
    });
  }

  openResponseDialog(reviewId: string): void {
    const review = this.reviews.find((r) => r._id === reviewId);
    if (!review) return;

    this.dialogService
      .respondToReview(reviewId, review.title, review.content)
      .subscribe((response) => {
        if (response) {
          this.respondToReview(reviewId, response);
        }
      });
  }

  respondToReview(reviewId: string, response: string): void {
    this.reviewService.respondToReview(reviewId, response).subscribe({
      next: () => {
        // Update the review in the list
        const reviewIndex = this.reviews.findIndex((r) => r._id === reviewId);
        if (reviewIndex !== -1) {
          this.reviews[reviewIndex].advertiserResponse = {
            content: response,
            date: new Date(),
          };
        }

        this.notificationService.success('Response added successfully');
      },
      error: (error) => {
        console.error('Error responding to review:', error);
        this.notificationService.error('Failed to add response');
      },
    });
  }

  canRespond(review: Review): boolean {
    if (!this.isAuthenticated || !this.currentUserId) {
      return false;
    }

    // Check if the current user is the advertiser and hasn't responded yet
    return this.currentUserId === review.advertiser._id && !review.advertiserResponse;
  }

  private loadHelpfulMarked(): void {
    const stored = localStorage.getItem('helpfulReviews');
    if (stored) {
      try {
        this.helpfulMarked = JSON.parse(stored);
      } catch {
        this.helpfulMarked = [];
      }
    }
  }

  private loadReportedReviews(): void {
    const stored = localStorage.getItem('reportedReviews');
    if (stored) {
      try {
        this.reportedReviews = JSON.parse(stored);
      } catch {
        this.reportedReviews = [];
      }
    }
  }
}
