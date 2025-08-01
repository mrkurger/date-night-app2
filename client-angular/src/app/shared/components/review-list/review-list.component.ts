import { Input } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Review } from '../../../core/models/review.interface';
import { ReviewService } from '../../../core/services/review.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogService } from '../../../core/services/dialog.service';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-list.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

@Component({';
  selector: 'app-review-list',
  standalone: true,
  imports: [;
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbTagModule,
    NbTooltipModule,
    RouterModule,
    StarRatingComponent,
    TimeAgoPipe,
  ],
  template: `;`
    ;
      ;
      ;

      ;
        No reviews yet. Be the first to leave a review!;
      ;

      ;
        ;
          ;
          ;
            {{ review.reviewer.username }}
          ;
          ;
            ;
            {{ review.createdAt | timeAgo }}
          ;
        ;

        ;
          {{ review.title }}
          {{ review.content }}

          ;
            ;
              Communication:;
              ;
            ;
            ;
              Appearance:;
              ;
            ;
            ;
              Location:;
              ;
            ;
            ;
              Value:;
              ;
            ;
          ;

          ;
            ;
            Verified Meeting;
          ;
        ;

        ;

        ;
          Response from advertiser;
          {{ review.advertiserResponse.content }}
          {{ review.advertiserResponse.date | timeAgo }}
        ;

        ;
          ;
            ;
            Helpful ({{ review.helpfulVotes }})
          ;

          ;
            ;
            Report;
          ;

          ;
            ;
            Respond;
          ;
        ;
      ;

      ;
        ;
          ;
          Load More Reviews;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)
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
    `,`
  ],
})
export class ReviewListComponen {t implements OnInit {
  @Input() advertiserId = '';
  @Input() adId = '';
  @Input() title = 'Reviews';
  @Input() showCategoryRatings = true;
  @Input() limit = 5;

  reviews: Review[] = []
  loading = false;
  hasMoreReviews = false;
  page = 1;
  helpfulMarked: string[] = []
  reportedReviews: string[] = []
  private currentUserId: string | null = null;
  private userSub: Subscription | null = null;

  constructor(;
    private reviewService: ReviewService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.loadReviews()
    this.loadHelpfulMarked()
    this.loadReportedReviews()
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user ? user.id : null;
    })
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe()
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated()
  }

  loadReviews(): void {
    this.loading = true;

    let request;
    if (this.advertiserId) {
      request = this.reviewService.getReviewsByAdvertiser(this.advertiserId, this.page, this.limit)
    } else if (this.adId) {
      request = this.reviewService.getReviewsByAd(this.adId, this.page, this.limit)
    } else {
      this.loading = false;
      return;
    }

    request.subscribe({
      next: (data) => {
        if (this.page === 1) {
          this.reviews = data.reviews;
        } else {
          this.reviews = [...this.reviews, ...data.reviews]
        }
        this.hasMoreReviews = data.totalPages > this.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error)
        this.notificationService.error('Failed to load reviews')
        this.loading = false;
      },
    })
  }

  loadMoreReviews(): void {
    this.page++;
    this.loadReviews()
  }

  markHelpful(reviewId: string): void {
    if (!this.isAuthenticated) {
      this.notificationService.info('Please log in to mark reviews as helpful')
      return;
    }

    this.reviewService.markReviewHelpful(reviewId).subscribe({
      next: () => {
        // Update the review in the list
        const reviewIndex = this.reviews.findIndex((r) => r._id === reviewId)
        if (reviewIndex !== -1) {
          this.reviews[reviewIndex].helpfulVotes++;
        }

        // Add to local storage to prevent multiple votes
        this.helpfulMarked.push(reviewId)
        localStorage.setItem('helpfulReviews', JSON.stringify(this.helpfulMarked))

        this.notificationService.success('Review marked as helpful')
      },
      error: (error) => {
        console.error('Error marking review as helpful:', error)
        this.notificationService.error('Failed to mark review as helpful')
      },
    })
  }

  openReportDialog(reviewId: string): void {
    if (!this.isAuthenticated) {
      this.notificationService.info('Please log in to report reviews')
      return;
    }

    this.dialogService.reportReview(reviewId).subscribe((reason) => {
      if (reason) {
        this.reportReview(reviewId, reason)
      }
    })
  }

  reportReview(reviewId: string, reason: string): void {
    this.reviewService.reportReview(reviewId, reason).subscribe({
      next: () => {
        // Add to local storage to prevent multiple reports
        this.reportedReviews.push(reviewId)
        localStorage.setItem('reportedReviews', JSON.stringify(this.reportedReviews))

        this.notificationService.success('Review reported successfully')
      },
      error: (error) => {
        console.error('Error reporting review:', error)
        this.notificationService.error('Failed to report review')
      },
    })
  }

  openResponseDialog(reviewId: string): void {
    const review = this.reviews.find((r) => r._id === reviewId)
    if (!review) return;

    this.dialogService;
      .respondToReview(reviewId, review.title, review.content)
      .subscribe((response) => {
        if (response) {
          this.respondToReview(reviewId,_response))
        }
      })
  }

  respondToReview(reviewId: string,_response: string): void {
    this.reviewService.respondToReview(reviewId,_response)).subscribe({
      next: () => {
        // Update the review in the list
        const reviewIndex = this.reviews.findIndex((r) => r._id === reviewId)
        if (reviewIndex !== -1) {
          this.reviews[reviewIndex].advertiserResponse = {
            content: response,
            date: new Date(),
          }
        }

        this.notificationService.success('Response added successfully')
      },
      error: (error) => {
        console.error('Error responding to review:', error)
        this.notificationService.error('Failed to add response')
      },
    })
  }

  canRespond(review: Review): boolean {
    if (!this.isAuthenticated || !this.currentUserId) {
      return false;
    }
    // Check if the current user is the advertiser and hasn't responded yet
    return this.currentUserId === review.advertiser._id && !review.advertiserResponse;
  }

  private loadHelpfulMarked(): void {
    const stored = localStorage.getItem('helpfulReviews')
    if (stored) {
      try {
        this.helpfulMarked = JSON.parse(stored)
      } catch {
        this.helpfulMarked = []
      }
    }
  }

  private loadReportedReviews(): void {
    const stored = localStorage.getItem('reportedReviews')
    if (stored) {
      try {
        this.reportedReviews = JSON.parse(stored)
      } catch {
        this.reportedReviews = []
      }
    }
  }
}
