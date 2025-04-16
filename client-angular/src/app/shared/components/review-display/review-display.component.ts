import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

export interface Review {
  _id: string;
  reviewer: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  advertiser: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  ad?: {
    _id: string;
    title: string;
  };
  rating: number;
  title: string;
  content: string;
  categories?: {
    communication?: number;
    appearance?: number;
    location?: number;
    value?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedMeeting?: boolean;
  meetingDate?: string;
  advertiserResponse?: {
    content: string;
    date: string;
  };
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-review-display',
  standalone: true,
  imports: [
    CommonModule,
    StarRatingComponent,
    TimeAgoPipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './review-display.component.html',
  styleUrls: ['./review-display.component.scss'],
})
export class ReviewDisplayComponent {
  @Input() review!: Review;
  @Input() isCurrentUserReviewer = false;
  @Input() isCurrentUserAdvertiser = false;
  @Input() showAdvertiserInfo = true;
  @Input() showActions = true;

  @Output() markHelpful = new EventEmitter<string>();
  @Output() reportReview = new EventEmitter<string>();
  @Output() respondToReview = new EventEmitter<string>();
  @Output() editReview = new EventEmitter<string>();
  @Output() deleteReview = new EventEmitter<string>();

  /**
   * Get the average category rating
   */
  getCategoryAverage(): number {
    if (!this.review.categories) {
      return this.review.rating;
    }

    const categories = this.review.categories;
    const values = [
      categories.communication,
      categories.appearance,
      categories.location,
      categories.value,
    ].filter(val => val !== undefined && val > 0) as number[];

    if (values.length === 0) {
      return this.review.rating;
    }

    const sum = values.reduce((total, val) => total + val, 0);
    return sum / values.length;
  }

  /**
   * Check if a category has a rating
   */
  hasCategoryRating(category: string): boolean {
    return !!(
      this.review.categories &&
      this.review.categories[category as keyof typeof this.review.categories] &&
      this.review.categories[category as keyof typeof this.review.categories]! > 0
    );
  }

  /**
   * Get a category rating
   */
  getCategoryRating(category: string): number {
    if (!this.review.categories) {
      return 0;
    }

    return this.review.categories[category as keyof typeof this.review.categories] || 0;
  }

  /**
   * Handle mark as helpful action
   */
  onMarkHelpful(): void {
    this.markHelpful.emit(this.review._id);
  }

  /**
   * Handle report review action
   */
  onReportReview(): void {
    this.reportReview.emit(this.review._id);
  }

  /**
   * Handle respond to review action
   */
  onRespondToReview(): void {
    this.respondToReview.emit(this.review._id);
  }

  /**
   * Handle edit review action
   */
  onEditReview(): void {
    this.editReview.emit(this.review._id);
  }

  /**
   * Handle delete review action
   */
  onDeleteReview(): void {
    this.deleteReview.emit(this.review._id);
  }
}
