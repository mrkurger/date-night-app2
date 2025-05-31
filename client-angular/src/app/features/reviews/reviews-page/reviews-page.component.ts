import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../shared/nebular.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ReviewsListComponent, Review } from '../reviews-list/reviews-list.component';
import { ReviewFormComponent, ReviewData } from '../review-form/review-form.component';
import { ReviewsService } from '../../../core/services/reviews.service';
import { AdService } from '../../../core/services/ad.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    ReviewsListComponent,
    ReviewFormComponent,
    ButtonModule,
    CardModule,
  ],
  template: `
    <div class="reviews-page-container">
      <p-card class="reviews-header-card">
        <div class="reviews-header">
          <div class="ad-info">
            <div class="ad-image" *ngIf="adImage">
              <img [src]="adImage" [alt]="adTitle" />
            </div>
            <div class="ad-details">
              <h2 class="ad-title">{{ adTitle }}</h2>
              <a [routerLink]="['/ads', adId]" class="ad-link">
                <i class="pi pi-external-link"></i>
                View Ad
              </a>
            </div>
          </div>
        </div>
      </p-card>

      <p-card class="reviews-section">
        <h3 class="section-title">Reviews ({{ totalReviews }})</h3>

        <div class="review-form-wrapper" *ngIf="!hasReviewed && !showReviewForm">
          <p-button
            label="Write a Review"
            icon="pi pi-plus"
            (click)="showAddReviewForm()"
            [disabled]="!currentUserId"
          >
          </p-button>
        </div>

        <div class="review-form-wrapper" *ngIf="showReviewForm">
          <app-review-form
            [adId]="adId"
            [editingReview]="editingReview"
            (reviewSubmitted)="onReviewSubmitted($event)"
            (cancelled)="onCancelReview()"
          >
          </app-review-form>
        </div>

        <app-reviews-list
          [reviews]="reviews"
          [loading]="loading"
          [currentUserId]="currentUserId"
          [totalReviews]="totalReviews"
          [currentPage]="currentPage"
          [pageSize]="pageSize"
          (pageChange)="onPageChange($event)"
          (editReview)="onEditReview($event)"
          (deleteReview)="onDeleteReview($event)"
          (reactionChange)="onReactionChange($event)"
        >
        </app-reviews-list>
      </p-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .reviews-page-container {
        padding: 2rem;
      }

      .reviews-header-card {
        margin-bottom: 2rem;
      }

      .reviews-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 2rem;
      }

      .ad-info {
        display: flex;
        gap: 1.5rem;
        align-items: center;
      }

      .ad-image {
        width: 120px;
        height: 120px;
        border-radius: var(--border-radius);
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .ad-details {
        .ad-title {
          margin: 0 0 0.5rem;
          color: var(--text-basic-color);
        }

        .ad-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary-color);
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .section-title {
        margin: 0 0 1.5rem;
        color: var(--text-basic-color);
      }

      .review-form-wrapper {
        margin-bottom: 2rem;
      }
    `,
  ],
})
export class ReviewsPageComponent implements OnInit {
  adId = '';
  adTitle = '';
  adImage = '';

  reviews: Review[] = [];
  totalReviews = 0;
  currentPage = 1;
  pageSize = 10;

  loading = false;
  showReviewForm = false;
  editingReview: Review | null = null;

  currentUserId: string | null = null;
  hasReviewed = false;

  constructor(
    private route: ActivatedRoute,
    private reviewsService: ReviewsService,
    private adService: AdService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()?.id;

    this.route.params.subscribe((params) => {
      this.adId = params['id'];
      this.loadAdDetails();
      this.loadReviews();
    });
  }

  /**
   * Load ad details;
   */
  loadAdDetails(): void {
    if (!this.adId) return;

    this.adService
      .getAdById(this.adId)
      .pipe(
        catchError((error) => {
          console.error('Error loading ad details:', error);
          this.notificationService.error('Failed to load ad details');
          return of(null);
        }),
      )
      .subscribe((ad) => {
        if (ad) {
          this.adTitle = ad.title || '';

          // Handle images safely
          if (ad.images && Array.isArray(ad.images) && ad.images.length > 0) {
            if (typeof ad.images[0] === 'string') {
              this.adImage = ad.images[0];
            } else if (typeof ad.images[0] === 'object' && 'url' in ad.images[0]) {
              this.adImage = (ad.images[0] as { url: string }).url;
            } else {
              this.adImage = '';
            }
          } else {
            this.adImage = '';
          }
        }
      });
  }

  /**
   * Load reviews for the ad;
   */
  loadReviews(): void {
    if (!this.adId) return;

    this.loading = true;

    this.reviewsService
      .getAdReviews(this.adId, this.currentPage, this.pageSize)
      .pipe(
        tap((response) => {
          this.reviews = response.reviews;
          this.totalReviews = response.total;
          this.currentPage = response.page;

          // Check if the current user has already reviewed this ad
          if (this.currentUserId) {
            this.hasReviewed = this.reviews.some((review) => review.userId === this.currentUserId);
          }
        }),
        catchError((error) => {
          console.error('Error loading reviews:', error);
          this.notificationService.error('Failed to load reviews');
          return of(null);
        }),
        tap(() => {
          this.loading = false;
        }),
      )
      .subscribe();
  }

  /**
   * Handle page change in the reviews list;
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReviews();
  }

  /**
   * Show the review form;
   */
  showAddReviewForm(): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.info('Please log in to write a review');
      return;
    }

    this.editingReview = null;
    this.showReviewForm = true;
  }

  /**
   * Show the edit review form;
   */
  onEditReview(review: Review): void {
    this.editingReview = review;
    this.showReviewForm = true;
  }

  /**
   * Handle review submission;
   */
  onReviewSubmitted(reviewData: ReviewData): void {
    if (this.editingReview) {
      // Update existing review
      this.reviewsService
        .updateReview(this.editingReview._id, reviewData)
        .pipe(
          tap(() => {
            this.notificationService.success('Review updated successfully');
            this.showReviewForm = false;
            this.editingReview = null;
            this.loadReviews();
          }),
          catchError((error) => {
            console.error('Error updating review:', error);
            this.notificationService.error('Failed to update review');
            return of(null);
          }),
        )
        .subscribe();
    } else {
      // Create new review
      this.reviewsService
        .createReview(this.adId, reviewData)
        .pipe(
          tap(() => {
            this.notificationService.success('Review submitted successfully');
            this.showReviewForm = false;
            this.loadReviews();
          }),
          catchError((error) => {
            console.error('Error submitting review:', error);
            this.notificationService.error('Failed to submit review');
            return of(null);
          }),
        )
        .subscribe();
    }
  }

  /**
   * Handle review deletion;
   */
  onDeleteReview(reviewId: string): void {
    this.reviewsService
      .deleteReview(reviewId)
      .pipe(
        tap(() => {
          this.notificationService.success('Review deleted successfully');
          this.loadReviews();
        }),
        catchError((error) => {
          console.error('Error deleting review:', error);
          this.notificationService.error('Failed to delete review');
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Handle review reaction change;
   */
  onReactionChange(event: { reviewId: string; reaction: 'helpful' | 'unhelpful' | null }): void {
    if (!this.authService.isAuthenticated()) {
      this.notificationService.info('Please log in to rate reviews');
      return;
    }

    this.reviewsService
      .rateReview(event.reviewId, event.reaction)
      .pipe(
        tap(() => {
          // Update the review in the list
          this.loadReviews();
        }),
        catchError((error) => {
          console.error('Error rating review:', error);
          this.notificationService.error('Failed to rate review');
          return of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Cancel review form;
   */
  onCancelReview(): void {
    this.showReviewForm = false;
    this.editingReview = null;
  }
}
