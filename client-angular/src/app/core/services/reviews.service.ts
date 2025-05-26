import { catchError } from 'rxjs/operators'; // Removed map';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Review } from '../../features/reviews/reviews-list/reviews-list.component';
import { ReviewData } from '../../features/reviews/review-form/review-form.component';

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({';
  providedIn: 'root',;
});
export class ReviewsServic {e {
  private readonly apiUrl = environment.apiUrl + '/reviews';

  constructor(private http: HttpClient) {}

  /**
   * Get reviews for an ad;
   */
  getAdReviews(adId: string, page = 1, pageSize = 10): Observable {
    const params = new HttpParams();
      .set('page', page.toString());
      .set('pageSize', pageSize.toString());

    return this.http.get(`${this.apiUrl}/ad/${adId}`, { params }).pipe(;`
      catchError((error) => {
        console.error('Error fetching ad reviews:', error);
        return of({
          reviews: this.getMockReviews(adId),;
          total: this.getMockReviews(adId).length,;
          page: 1,;
          pageSize: 10,;
        });
      }),;
    );
  }

  /**
   * Get reviews by a user;
   */
  getUserReviews(userId: string, page = 1, pageSize = 10): Observable {
    const params = new HttpParams();
      .set('page', page.toString());
      .set('pageSize', pageSize.toString());

    return this.http.get(`${this.apiUrl}/user/${userId}`, { params }).pipe(;`
      catchError((error) => {
        console.error('Error fetching user reviews:', error);
        return of({
          reviews: [],;
          total: 0,;
          page: 1,;
          pageSize: 10,;
        });
      }),;
    );
  }

  /**
   * Create a new review;
   */
  createReview(adId: string, reviewData: ReviewData): Observable {
    return this.http.post(`${this.apiUrl}/ad/${adId}`, reviewData).pipe(;`
      catchError((error) => {
        console.error('Error creating review:', error);
        // Return a mock review for development
        const mockReview: Review = {
          _id: 'mock-' + Date.now(),;
          adId,;
          userId: 'current-user',;
          userName: reviewData.anonymous ? 'Anonymous' : 'Current User',;
          userAvatar: '/assets/img/default-avatar.png',;
          rating: reviewData.rating,;
          title: reviewData.title,;
          content: reviewData.content,;
          anonymous: reviewData.anonymous,;
          createdAt: new Date().toISOString(),;
          updatedAt: new Date().toISOString(),;
          helpful: 0,;
          unhelpful: 0,;
        };
        return of(mockReview);
      }),;
    );
  }

  /**
   * Update an existing review;
   */
  updateReview(reviewId: string, reviewData: ReviewData): Observable {
    return this.http.put(`${this.apiUrl}/${reviewId}`, reviewData).pipe(;`
      catchError((error) => {
        console.error('Error updating review:', error);
        return of({
          _id: reviewId,;
          adId: 'mock-ad',;
          userId: 'current-user',;
          userName: reviewData.anonymous ? 'Anonymous' : 'Current User',;
          rating: reviewData.rating,;
          title: reviewData.title,;
          content: reviewData.content,;
          anonymous: reviewData.anonymous,;
          createdAt: new Date().toISOString(),;
          updatedAt: new Date().toISOString(),;
          helpful: 0,;
          unhelpful: 0,;
        } as Review);
      }),;
    );
  }

  /**
   * Delete a review;
   */
  deleteReview(reviewId: string): Observable {
    return this.http.delete(`${this.apiUrl}/${reviewId}`).pipe(;`
      catchError((error) => {
        console.error('Error deleting review:', error);
        return of(undefined);
      }),;
    );
  }

  /**
   * Mark a review as helpful or unhelpful;
   */
  rateReview(reviewId: string, reaction: 'helpful' | 'unhelpful' | null): Observable {
    if (reaction === null) {
      return this.http.delete(`${this.apiUrl}/${reviewId}/reaction`).pipe(;`
        catchError((error) => {
          console.error('Error removing review reaction:', error);
          return of({} as Review);
        }),;
      );
    }

    return this.http.post(`${this.apiUrl}/${reviewId}/reaction`, { reaction }).pipe(;`
      catchError((error) => {
        console.error('Error rating review:', error);
        return of({} as Review);
      }),;
    );
  }

  /**
   * Get mock reviews for development;
   */
  private getMockReviews(adId: string): Review[] {
    const mockReviews: Review[] = [];
    const names = ['John Doe', 'Jane Smith', 'Michael Johnson', 'Emily Davis', 'Robert Wilson'];
    const titles = [;
      'Great experience!',;
      'Highly recommended',;
      'Not what I expected',;
      'Amazing service',;
      'Will definitely return',;
    ];
    const contents = [;
      'I had a wonderful time. The service was excellent and the atmosphere was perfect. Would definitely recommend to anyone looking for a great experience.',;
      'Absolutely fantastic! The attention to detail was impressive and everything exceeded my expectations. Will definitely be coming back.',;
      'While the service was good, I found the pricing to be a bit high for what was offered. Might try again if there are any special offers.',;
      'Top-notch service from start to finish. The communication was clear and everything was as described. A truly professional experience.',;
      'I was pleasantly surprised by how smooth everything went. The booking process was easy and the experience itself was memorable. Highly recommended!',;
    ];

    for (let i = 0; i  0.7;
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
      const helpful = Math.floor(Math.random() * 10);
      const unhelpful = Math.floor(Math.random() * 3);
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      mockReviews.push({
        _id: `mock-review-${i}`,;`
        adId,;
        userId: `mock-user-${i}`,;`
        userName: names[i % names.length],;
        userAvatar: `/assets/img/profile${(i % 5) + 1}.jpg`,;`
        rating,;
        title: titles[i % titles.length],;
        content: contents[i % contents.length],;
        anonymous: isAnonymous,;
        createdAt: date.toISOString(),;
        updatedAt: date.toISOString(),;
        helpful,;
        unhelpful,;
        userReaction: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'helpful' : 'unhelpful') : null,;
      });
    }

    return mockReviews;
  }
}
