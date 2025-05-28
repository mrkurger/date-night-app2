import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core'; // Removed extra comma
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { AppSortEvent } from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.module';
import { IAd, IAdCreateDTO, IAdUpdateDTO } from '../models/ad.interface'; // Corrected interface names
// Removed problematic import for AppSortComponent, AppSortHeaderComponent as it was malformed and likely unused for basic service functionality

export interface GetAdsResponse {
  // Consider renaming to IGetAdsResponse for consistency
  ads: IAd[]; // Corrected to IAd
  total: number;
}

/**
 *
 */
@Injectable({
  providedIn: 'root',
})
export class AdService {
  // Corrected class name
  private readonly apiUrl = environment.apiUrl + '/ads';

  /**
   *
   */
  constructor(private readonly http: HttpClient) {} // Added readonly

  /**
   *
   */
  getAds(filters?: any): Observable<GetAdsResponse> {
    return this.http.get<GetAdsResponse>(`${this.apiUrl}`, { params: filters }).pipe(
      catchError(this.handleError.bind(this)), // Bind this to handleError
    );
  }

  private getMockAds(): IAd[] {
    const mockAds: IAd[] = [];
    const categories = ['Escort', 'Massage', 'Striptease'];
    const locations = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'];
    const names = [
      // Corrected array initialization
      'Sofia',
      'Emma',
      'Isabella',
      'Olivia',
      'Mia',
      'Amelia',
      'Ava',
      'Ella',
      'Sophia',
      'Charlotte',
    ]; // Corrected array initialization
    const descriptions = [
      // Corrected array initialization
      'Professional and discreet service. Available for outcalls and incalls.',
      'Offering a luxurious and unforgettable experience. Book in advance.',
      "New in town! Limited time only. Don\'t miss your chance.", // Escaped single quote
      'VIP service with a personal touch. 100% satisfaction guaranteed.',
      'Experienced and passionate. Let me take care of all your needs.',
      'Elite companion available for dinner dates and private meetings.',
      'Touring this week only! Book your appointment now.',
      'Exclusive service for discerning gentlemen. References required.',
      'Independent provider with a warm personality and stunning looks.',
      'High-class service with attention to detail. No rush experience.',
    ]; // Corrected array initialization

    const profileImages = [
      // Corrected array initialization
      '/assets/img/profile1.jpg',
      '/assets/img/profile2.jpg',
      '/assets/img/profile3.jpg',
      '/assets/img/profile4.jpg',
      '/assets/img/profile5.jpg',
      '/assets/img/profile6.jpg',
      '/assets/img/profile7.jpg',
      '/assets/img/profile8.jpg',
      '/assets/img/profile9.jpg',
      '/assets/img/profile10.jpg',
    ]; // Corrected array initialization

    for (let i = 1; i <= 10; i++) {
      // Corrected loop condition and increment
      const isFeatured = Math.random() > 0.7;
      const isTrending = Math.random() > 0.7;
      const isTouring = Math.random() > 0.7;
      const age = Math.floor(Math.random() * 15) + 20;

      const profileImageIndex = (i - 1) % profileImages.length;
      const profileImage = profileImages[profileImageIndex];

      const secondImageIndex = (profileImageIndex + 1) % profileImages.length;
      const secondImage = profileImages[secondImageIndex];

      mockAds.push({
        _id: `mock${i}`,
        id: `mock${i}`,
        title: `${names[i % names.length]} - ${age} years old`,
        description: descriptions[i % descriptions.length],
        category: categories[i % categories.length],
        price: Math.floor(Math.random() * 1000) + 500,
        location: {
          city: locations[i % locations.length],
          county: 'N/A',
        },
        images: [profileImage, secondImage],
        media: [
          { type: 'image', url: profileImage },
          { type: 'image', url: secondImage },
        ],
        advertiser: {
          _id: `user${i}`,
          username: names[i % names.length],
          profileImage: profileImage,
        },
        userId: `user${i}`,
        advertiserName: names[i % names.length],
        advertiserImage: profileImage,
        isActive: true,
        isFeatured,
        isTrending,
        isTouring,
        isVerified: Math.random() > 0.5,
        isAdvertiserOnline: Math.random() > 0.5,
        viewCount: Math.floor(Math.random() * 1000),
        clickCount: Math.floor(Math.random() * 500),
        inquiryCount: Math.floor(Math.random() * 100),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        tourDates: isTouring
          ? {
              start: new Date().toISOString(),
              end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              cities: [locations[i % locations.length], locations[(i + 1) % locations.length]],
            }
          : undefined,
        tags: ['Tag1', 'Tag2', categories[i % categories.length]],
        views: Math.floor(Math.random() * 1000),
        age,
        cardState: 'initial',
        reviews: [],
        services: [],
      });
    }
    return mockAds;
  }

  /**
   *
   */
  getAdById(id: string): Observable<IAd> {
    // if (environment.useMockData) { // Assuming useMockData might not exist on environment
    //   const mockAd = this.getMockAds().find(ad => ad.id === id || ad._id === id);
    //   if (mockAd) {
    //     return of(mockAd);
    //   }
    // }
    return this.http.get<IAd>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this)), // Bind this to handleError
    );
  }

  /**
   *
   */
  createAd(adData: IAdCreateDTO): Observable<IAd> {
    return this.http.post<IAd>(this.apiUrl, adData).pipe(
      catchError(this.handleError.bind(this)), // Bind this to handleError
    );
  }

  /**
   *
   */
  updateAd(id: string, adData: IAdUpdateDTO): Observable<IAd> {
    return this.http.put<IAd>(`${this.apiUrl}/${id}`, adData).pipe(
      catchError(this.handleError.bind(this)), // Bind this to handleError
    );
  }

  /**
   *
   */
  deleteAd(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError.bind(this)), // Bind this to handleError
    );
  }

  /**
   *
   */
  getSortedAds(sortEvent: AppSortEvent, filters?: any): Observable<GetAdsResponse> {
    const params: any = { ...filters };
    if (sortEvent && sortEvent.direction) {
      // Assuming AppSortEvent has 'column' and 'direction'
      // If AppSortEvent structure is different, this needs adjustment
      params.sort = (sortEvent as any).column; // Added type assertion if 'column' is not directly on AppSortEvent
      params.order = sortEvent.direction;
    }
    return this.getAds(params);
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
