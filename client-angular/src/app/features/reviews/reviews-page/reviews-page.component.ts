import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ReviewsListComponent, Review } from '../reviews-list/reviews-list.component';
import { ReviewFormComponent, ReviewData } from '../review-form/review-form.component';
import { ReviewsService } from '../../../core/services/reviews.service';
import { AdService } from '../../../core/services/ad.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    ReviewsListComponent,
    ReviewFormComponent,
  ],
  templateUrl: './reviews-page.component.html',
  styleUrls: ['./reviews-page.component.scss'],
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
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();

    this.route.params.subscribe(params => {
      this.adId = params['id'];
      this.loadAdDetails();
      this.loadReviews();
    });
  }

  /**
   * Load ad details
   */
  loadAdDetails(): void {
    if (!this.adId) return;

    this.adService
      .getAdById(this.adId)
      .pipe(
        catchError(error => {
          console.error('Error loading ad details:', error);
          this.notificationService.error('Failed to load ad details');
          return of(null);
        })
      )
      .subscribe(ad => {
        if (ad) {
          this.adTitle = ad.title;
          this.adImage = ad.images && ad.images.length > 0 ? ad.images[0] : '';
        }
      });
  }

  /**
   * Load reviews for the ad
   */
  loadReviews(): void {
    if (!this.adId) return;

    this.loading = true;

    this.reviewsService
      .getAdReviews(this.adId, this.currentPage, this.pageSize)
      .pipe(
        tap(response => {
          this.reviews = response.reviews;
          this.totalReviews = response.total;
          this.currentPage = response.page;

          // Check if the current user has already reviewed this ad
          if (this.currentUserId) {
            this.hasReviewed = this.reviews.some(review => review.userId === this.currentUserId);
          }
        }),
        catchError(error => {
          console.error('Error loading reviews:', error);
          this.notificationService.error('Failed to load reviews');
          return of(null);
        }),
        tap(() => {
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * Handle page change in the reviews list
   */
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadReviews();
  }

  /**
   * Show the review form
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
   * Show the edit review form
   */
  onEditReview(review: Review): void {
    this.editingReview = review;
    this.showReviewForm = true;
  }

  /**
   * Handle review submission
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
          catchError(error => {
            console.error('Error updating review:', error);
            this.notificationService.error('Failed to update review');
            return of(null);
          })
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
          catchError(error => {
            console.error('Error submitting review:', error);
            this.notificationService.error('Failed to submit review');
            return of(null);
          })
        )
        .subscribe();
    }
  }

  /**
   * Handle review deletion
   */
  onDeleteReview(reviewId: string): void {
    this.reviewsService
      .deleteReview(reviewId)
      .pipe(
        tap(() => {
          this.notificationService.success('Review deleted successfully');
          this.loadReviews();
        }),
        catchError(error => {
          console.error('Error deleting review:', error);
          this.notificationService.error('Failed to delete review');
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Handle review reaction change
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
        catchError(error => {
          console.error('Error rating review:', error);
          this.notificationService.error('Failed to rate review');
          return of(null);
        })
      )
      .subscribe();
  }

  /**
   * Cancel review form
   */
  onCancelReview(): void {
    this.showReviewForm = false;
    this.editingReview = null;
  }
}
