import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { NebularModule } from '../../shared/nebular.module';

import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface Review {
  _id: string;
  adId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  anonymous: boolean;
  createdAt: string;
  updatedAt: string;
  helpful: number;
  unhelpful: number;
  userReaction?: 'helpful' | 'unhelpful' | null;
}

@Component({
    selector: 'app-reviews-list',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, RouterModule, NebularModule],
    template: `
    <div class="reviews-list-container">
      <!-- Loading State -->
      <div class="loading-container" *ngIf="loading">
        <nb-spinner status="primary"></nb-spinner>
        <p>Loading reviews...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && reviews.length === 0">
        <nb-icon icon="message-square-outline" class="empty-icon"></nb-icon>
        <h3>No Reviews Yet</h3>
        <p>Be the first to share your experience!</p>
      </div>

      <!-- Reviews List -->
      <div class="reviews-list" *ngIf="!loading && reviews.length > 0">
        <nb-card *ngFor="let review of reviews" class="review-item">
          <nb-card-header>
            <div class="review-header">
              <div class="user-info">
                <nb-user
                  *ngIf="!review.anonymous"
                  [name]="review.userName"
                  [picture]="review.userAvatar || '/assets/img/default-avatar.png'"
                  size="medium"
                ></nb-user>
                <nb-user
                  *ngIf="review.anonymous"
                  name="Anonymous User"
                  icon="person-outline"
                  size="medium"
                ></nb-user>
                <span class="review-date">{{ formatDate(review.createdAt) }}</span>
              </div>

              <!-- Review Actions -->
              <div class="review-actions" *ngIf="isReviewAuthor(review) || canManage">
                <button
                  nbButton
                  ghost
                  [nbContextMenu]="reviewActions"
                  [nbContextMenuTag]="review._id"
                  aria-label="Review actions"
                >
                  <nb-icon icon="more-vertical-outline"></nb-icon>
                </button>
              </div>
            </div>
          </nb-card-header>

          <nb-card-body>
            <!-- Review Content -->
            <div class="review-content">
              <div class="rating">
                <div class="stars">
                  <nb-icon
                    *ngFor="let star of getStars(review.rating)"
                    [icon]="star ? 'star' : 'star-outline'"
                    [status]="star ? 'warning' : 'basic'"
                  ></nb-icon>
                </div>
                <nb-badge [text]="review.rating + '/5'" status="primary"></nb-badge>
              </div>

              <h3 class="review-title">{{ review.title }}</h3>
              <p class="review-text">{{ review.content }}</p>

              <!-- Ad Info (if showing) -->
              <div class="ad-info" *ngIf="showAdInfo">
                <a [routerLink]="['/ad-details', review.adId]" class="ad-link">
                  View Ad
                  <nb-icon icon="external-link-outline"></nb-icon>
                </a>
              </div>

              <!-- Review Feedback -->
              <div class="review-feedback">
                <button
                  nbButton
                  ghost
                  size="small"
                  [status]="review.userReaction === 'helpful' ? 'success' : 'basic'"
                  (click)="onReactionClick(review._id, 'helpful')"
                >
                  <nb-icon icon="thumbs-up-outline"></nb-icon>
                </button>
                <button
                  nbButton
                  ghost
                  size="small"
                  [status]="review.userReaction === 'unhelpful' ? 'danger' : 'basic'"
                  (click)="onReactionClick(review._id, 'unhelpful')"
                >
                  <nb-icon icon="thumbs-down-outline"></nb-icon>
                  Not Helpful ({{ review.unhelpful }})
                </button>
              </div>
            </div>
          </nb-card-body>
        </nb-card>
      </div>

      <!-- Pagination -->
      <div class="pagination-container" *ngIf="showPagination && totalPages > 1 && !loading">
        <div class="pagination">
          <button
            nbButton
            ghost
            [disabled]="currentPage === 1"
            (click)="changePage(currentPage - 1)"
            aria-label="Previous page"
          >
            <nb-icon icon="arrow-left"></nb-icon>
          </button>

          <ng-container *ngFor="let page of pageNumbers">
            <ng-container *ngIf="page !== -1; else ellipsis">
              <button
                nbButton
                [ghost]="page !== currentPage"
                [status]="page === currentPage ? 'primary' : 'basic'"
                (click)="changePage(page)"
                [attr.aria-current]="page === currentPage ? 'page' : null"
              >
                {{ page }}
              </button>
            </ng-container>
            <ng-template #ellipsis>
              <span class="ellipsis">...</span>
            </ng-template>
          </ng-container>

          <button
            nbButton
            ghost
            [disabled]="currentPage === totalPages"
            (click)="changePage(currentPage + 1)"
            aria-label="Next page"
          >
            <nb-icon icon="arrow-right"></nb-icon>
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [
        `
      :host {
        display: block;
      }

      .reviews-list-container {
        padding: 2rem;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        gap: 1rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;

        .empty-icon {
          font-size: 3rem;
          color: var(--text-hint-color);
          margin-bottom: 1rem;
        }

        h3 {
          margin-bottom: 0.5rem;
          color: var(--text-basic-color);
        }

        p {
          color: var(--text-hint-color);
        }
      }

      .reviews-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .review-date {
        color: var(--text-hint-color);
        font-size: 0.875rem;
      }

      .review-content {
        .rating {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .review-title {
          margin-bottom: 0.5rem;
          color: var(--text-basic-color);
        }

        .review-text {
          color: var(--text-basic-color);
          margin-bottom: 1.5rem;
        }
      }

      .ad-info {
        margin-bottom: 1rem;

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

      .review-feedback {
        display: flex;
        gap: 1rem;
      }

      .pagination-container {
        margin-top: 2rem;
        display: flex;
        justify-content: center;
      }

      .pagination {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .ellipsis {
        color: var(--text-hint-color);
        padding: 0 0.5rem;
      }
    `,
    ]
})
export class ReviewsListComponent implements OnInit {
  @Input() reviews: Review[] = [];
  @Input() loading = false;
  @Input() showAdInfo = false;
  @Input() canManage = false;
  @Input() showPagination = true;
  @Input() totalReviews = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;

  @Output() pageChange = new EventEmitter<number>();
  @Output() editReview = new EventEmitter<Review>();
  @Output() deleteReview = new EventEmitter<string>();
  @Output() reactionChange = new EventEmitter<{
    reviewId: string;
    reaction: 'helpful' | 'unhelpful' | null;
  }>();

  currentUserId: string | null = null;
  reviewActions = [
    { title: 'Edit Review', icon: 'edit-outline', action: 'edit' },
    { title: 'Delete Review', icon: 'trash-2-outline', action: 'delete' },
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
  }

  /**
   * Get the total number of pages
   */
  get totalPages(): number {
    return Math.ceil(this.totalReviews / this.pageSize);
  }

  /**
   * Get an array of page numbers for pagination
   */
  get pageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible pages
      let start = Math.max(2, this.currentPage - 1);
      let end = Math.min(this.totalPages - 1, this.currentPage + 1);

      // Adjust if we're near the beginning or end
      if (this.currentPage <= 2) {
        end = 4;
      } else if (this.currentPage >= this.totalPages - 1) {
        start = this.totalPages - 3;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < this.totalPages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Always show last page
      pages.push(this.totalPages);
    }

    return pages;
  }

  /**
   * Change the current page
   */
  changePage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  /**
   * Format the date to a readable string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Check if the current user is the author of a review
   */
  isReviewAuthor(review: Review): boolean {
    return this.currentUserId === review.userId;
  }

  /**
   * Handle edit review action
   */
  onEditReview(review: Review): void {
    this.editReview.emit(review);
  }

  /**
   * Handle delete review action
   */
  onDeleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.deleteReview.emit(reviewId);
    }
  }

  /**
   * Handle helpful/unhelpful reaction
   */
  onReactionClick(reviewId: string, reaction: 'helpful' | 'unhelpful'): void {
    const review = this.reviews.find((r) => r._id === reviewId);
    if (!review) return;

    // Toggle the reaction
    const newReaction = review.userReaction === reaction ? null : reaction;
    this.reactionChange.emit({ reviewId, reaction: newReaction });
  }

  /**
   * Get star array for rating display
   */
  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < rating ? 1 : 0));
  }
}
