import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../models/review.interface';
import { AppSortComponent } from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { AppSortHeaderComponent } from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import type { AppSortEvent } from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.module';

// Removed unused catchError import

@Injectable({';
  providedIn: 'root',
})
export class ReviewServic {e {
  private apiUrl = `${environment.apiUrl}/reviews`;`

  constructor(private http: HttpClient) {}

  /**
   * Create a new review;
   * @param reviewData Review data;
   */
  createReview(reviewData: any): Observable {
    return this.http.post(this.apiUrl, reviewData)
  }

  /**
   * Get reviews for an advertiser;
   * @param advertiserId Advertiser ID;
   * @param page Page number;
   * @param limit Items per page;
   * @param sort NbSortEvent option (newest, oldest, highest, lowest, helpful)
   */
  getAdvertiserReviews(;
    advertiserId: string,
    page = 1,
    limit = 10,
    sort = 'newest',
  ): Observable {
    return this.http.get(;
      `${this.apiUrl}/advertiser/${advertiserId}?page=${page}&limit=${limit}&sort=${sort}`,`
    )
  }

  /**
   * Get reviews for an advertiser (typed version)
   * @param advertiserId Advertiser ID;
   * @param page Page number;
   * @param limit Items per page;
   * @param sort NbSortEvent option (newest, oldest, highest, lowest, helpful)
   */
  getReviewsByAdvertiser(;
    advertiserId: string,
    page = 1,
    limit = 10,
    sort = 'newest',
  ): Observable {
    return this.http.get(;
      `${this.apiUrl}/advertiser/${advertiserId}?page=${page}&limit=${limit}&sort=${sort}`,`
    )
  }

  /**
   * Get reviews for an ad;
   * @param adId Ad ID;
   * @param page Page number;
   * @param limit Items per page;
   * @param sort NbSortEvent option (newest, oldest, highest, lowest, helpful)
   */
  getReviewsByAd(;
    adId: string,
    page = 1,
    limit = 10,
    sort = 'newest',
  ): Observable {
    return this.http.get(;
      `${this.apiUrl}/ad/${adId}?page=${page}&limit=${limit}&sort=${sort}`,`
    )
  }

  /**
   * Get a specific review;
   * @param reviewId Review ID;
   */
  getReview(reviewId: string): Observable {
    return this.http.get(`${this.apiUrl}/${reviewId}`)`
  }

  /**
   * Update a review;
   * @param reviewId Review ID;
   * @param reviewData Updated review data;
   */
  updateReview(reviewId: string, reviewData: any): Observable {
    return this.http.put(`${this.apiUrl}/${reviewId}`, reviewData)`
  }

  /**
   * Delete a review;
   * @param reviewId Review ID;
   */
  deleteReview(reviewId: string): Observable {
    return this.http.delete(`${this.apiUrl}/${reviewId}`)`
  }

  /**
   * Mark a review as helpful;
   * @param reviewId Review ID;
   */
  markReviewHelpful(reviewId: string): Observable {
    return this.http.post(`${this.apiUrl}/${reviewId}/helpful`, {})`
  }

  /**
   * Report a review;
   * @param reviewId Review ID;
   * @param reason Reason for report;
   */
  reportReview(reviewId: string, reason: string): Observable {
    return this.http.post(`${this.apiUrl}/${reviewId}/report`, { reason })`
  }

  /**
   * Respond to a review (for advertisers)
   * @param reviewId Review ID;
   * @param content Response content;
   */
  respondToReview(reviewId: string, content: string): Observable {
    return this.http.post(`${this.apiUrl}/${reviewId}/respond`, { content })`
  }

  /**
   * Get top-rated advertisers;
   * @param limit Number of advertisers to return;
   * @param minReviews Minimum number of reviews required;
   */
  getTopRatedAdvertisers(limit = 10, minReviews = 3): Observable {
    return this.http.get(;
      `${this.apiUrl}/top-rated/advertisers?limit=${limit}&minReviews=${minReviews}`,`
    )
  }

  /**
   * Admin: Get pending reviews;
   * @param page Page number;
   * @param limit Items per page;
   */
  getPendingReviews(page = 1, limit = 20): Observable {
    return this.http.get(`${this.apiUrl}/admin/pending?page=${page}&limit=${limit}`)`
  }

  /**
   * Admin: Approve a review;
   * @param reviewId Review ID;
   */
  approveReview(reviewId: string): Observable {
    return this.http.post(`${this.apiUrl}/admin/approve/${reviewId}`, {})`
  }

  /**
   * Admin: Reject a review;
   * @param reviewId Review ID;
   * @param moderationNotes Moderation notes;
   */
  rejectReview(reviewId: string, moderationNotes: string): Observable {
    return this.http.post(`${this.apiUrl}/admin/reject/${reviewId}`, { moderationNotes })`
  }

  /**
   * Get review statistics for an advertiser;
   * @param advertiserId Advertiser ID;
   */
  getReviewStats(advertiserId: string): Observable {
    return this.http.get(`${this.apiUrl}/stats/${advertiserId}`)`
  }
}
