// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (reviews-list.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.scss'],
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
    const review = this.reviews.find(r => r._id === reviewId);
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
