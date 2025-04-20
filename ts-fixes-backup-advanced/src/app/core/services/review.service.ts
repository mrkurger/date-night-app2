import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Removed unused catchError import
import { environment } from '../../../environments/environment';
import { Review } from '../models/review.interface';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new review
   * @param reviewData Review data
   */
  createReview(reviewData: any): Observable<any> {
    return this.http.post(this.apiUrl, reviewData);
  }

  /**
   * Get reviews for an advertiser
   * @param advertiserId Advertiser ID
   * @param page Page number
   * @param limit Items per page
   * @param sort Sort option (newest, oldest, highest, lowest, helpful)
   */
  getAdvertiserReviews(
    advertiserId: string,
    page = 1,
    limit = 10,
    sort = 'newest'
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/advertiser/${advertiserId}?page=${page}&limit=${limit}&sort=${sort}`
    );
  }

  /**
   * Get reviews for an advertiser (typed version)
   * @param advertiserId Advertiser ID
   * @param page Page number
   * @param limit Items per page
   * @param sort Sort option (newest, oldest, highest, lowest, helpful)
   */
  getReviewsByAdvertiser(
    advertiserId: string,
    page = 1,
    limit = 10,
    sort = 'newest'
  ): Observable<{ reviews: Review[]; totalPages: number; totalReviews: number }> {
    return this.http.get<{ reviews: Review[]; totalPages: number; totalReviews: number }>(
      `${this.apiUrl}/advertiser/${advertiserId}?page=${page}&limit=${limit}&sort=${sort}`
    );
  }

  /**
   * Get reviews for an ad
   * @param adId Ad ID
   * @param page Page number
   * @param limit Items per page
   * @param sort Sort option (newest, oldest, highest, lowest, helpful)
   */
  getReviewsByAd(
    adId: string,
    page = 1,
    limit = 10,
    sort = 'newest'
  ): Observable<{ reviews: Review[]; totalPages: number; totalReviews: number }> {
    return this.http.get<{ reviews: Review[]; totalPages: number; totalReviews: number }>(
      `${this.apiUrl}/ad/${adId}?page=${page}&limit=${limit}&sort=${sort}`
    );
  }

  /**
   * Get a specific review
   * @param reviewId Review ID
   */
  getReview(reviewId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${reviewId}`);
  }

  /**
   * Update a review
   * @param reviewId Review ID
   * @param reviewData Updated review data
   */
  updateReview(reviewId: string, reviewData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reviewId}`, reviewData);
  }

  /**
   * Delete a review
   * @param reviewId Review ID
   */
  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }

  /**
   * Mark a review as helpful
   * @param reviewId Review ID
   */
  markReviewHelpful(reviewId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reviewId}/helpful`, {});
  }

  /**
   * Report a review
   * @param reviewId Review ID
   * @param reason Reason for report
   */
  reportReview(reviewId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reviewId}/report`, { reason });
  }

  /**
   * Respond to a review (for advertisers)
   * @param reviewId Review ID
   * @param content Response content
   */
  respondToReview(reviewId: string, content: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reviewId}/respond`, { content });
  }

  /**
   * Get top-rated advertisers
   * @param limit Number of advertisers to return
   * @param minReviews Minimum number of reviews required
   */
  getTopRatedAdvertisers(limit = 10, minReviews = 3): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/top-rated/advertisers?limit=${limit}&minReviews=${minReviews}`
    );
  }

  /**
   * Admin: Get pending reviews
   * @param page Page number
   * @param limit Items per page
   */
  getPendingReviews(page = 1, limit = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/pending?page=${page}&limit=${limit}`);
  }

  /**
   * Admin: Approve a review
   * @param reviewId Review ID
   */
  approveReview(reviewId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/approve/${reviewId}`, {});
  }

  /**
   * Admin: Reject a review
   * @param reviewId Review ID
   * @param moderationNotes Moderation notes
   */
  rejectReview(reviewId: string, moderationNotes: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/reject/${reviewId}`, { moderationNotes });
  }

  /**
   * Get review statistics for an advertiser
   * @param advertiserId Advertiser ID
   */
  getReviewStats(advertiserId: string): Observable<{
    averageRating: number;
    totalReviews: number;
    categoryAverages: {
      communication: number;
      appearance: number;
      location: number;
      value: number;
    };
  }> {
    return this.http.get<{
      averageRating: number;
      totalReviews: number;
      categoryAverages: {
        communication: number;
        appearance: number;
        location: number;
        value: number;
      };
    }>(`${this.apiUrl}/stats/${advertiserId}`);
  }
}
