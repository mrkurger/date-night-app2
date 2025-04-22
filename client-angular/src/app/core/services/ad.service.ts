import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Ad, AdCreateDTO, AdUpdateDTO } from '../models/ad.interface';

@Injectable({
  providedIn: 'root',
})
export class AdService {
  private readonly apiUrl = environment.apiUrl + '/ads';

  constructor(private http: HttpClient) {}

  getAds(filters?: any): Observable<Ad[]> {
    return this.http.get<Ad[]>(this.apiUrl, { params: filters }).pipe(
      catchError(error => {
        console.error('Error fetching ads from API:', error);
        return of(this.getMockAds());
      })
    );
  }

  // Commented out to avoid duplicate implementation
  // getSwipeAds(filters?: any): Observable<Ad[]> {
  //   // This method is specifically for the Tinder component
  //   // It could have special filtering or sorting logic in the future
  //   return this.getAds(filters);
  // }

  // Commented out to avoid duplicate implementation
  // recordSwipe(adId: string, direction: 'left' | 'right'): Observable<any> {
  //   // In a real app, this would send the swipe data to the server
  //   // For now, we'll just simulate a successful response
  //   console.log(`Recorded ${direction} swipe for ad ${adId}`);
  //   return of({ success: true });
  // }

  // Generate mock ads for development and testing
  private getMockAds(): Ad[] {
    const mockAds: Ad[] = [];
    const categories = ['Escort', 'Massage', 'Striptease'];
    const locations = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'];
    const names = [
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
    ];
    const descriptions = [
      'Professional and discreet service. Available for outcalls and incalls.',
      'Offering a luxurious and unforgettable experience. Book in advance.',
      "New in town! Limited time only. Don't miss your chance.",
      'VIP service with a personal touch. 100% satisfaction guaranteed.',
      'Experienced and passionate. Let me take care of all your needs.',
      'Elite companion available for dinner dates and private meetings.',
      'Touring this week only! Book your appointment now.',
      'Exclusive service for discerning gentlemen. References required.',
      'Independent provider with a warm personality and stunning looks.',
      'High-class service with attention to detail. No rush experience.',
    ];

    // Use profile images from assets/img folder
    const profileImages = [
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
    ];

    // Generate a set of unique ads
    for (let i = 1; i <= 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const name = names[Math.floor(Math.random() * names.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const isFeatured = Math.random() > 0.7;
      const isTrending = Math.random() > 0.7;
      const isTouring = Math.random() > 0.7;
      const age = Math.floor(Math.random() * 15) + 20;

      // Select a profile image based on index (to ensure variety)
      const profileImageIndex = (i - 1) % profileImages.length;
      const profileImage = profileImages[profileImageIndex];

      // Select a second image that's different from the first
      const secondImageIndex = (profileImageIndex + 1) % profileImages.length;
      const secondImage = profileImages[secondImageIndex];

      // Generate additional tags based on service type
      const serviceTags = [];
      if (category === 'Escort') {
        serviceTags.push(
          ...['GFE', 'Dinner Date', 'Overnight', 'Travel Companion'].slice(
            0,
            Math.floor(Math.random() * 3) + 1
          )
        );
      } else if (category === 'Massage') {
        serviceTags.push(
          ...['Swedish', 'Deep Tissue', 'Aromatherapy', 'Hot Stone'].slice(
            0,
            Math.floor(Math.random() * 3) + 1
          )
        );
      } else if (category === 'Striptease') {
        serviceTags.push(
          ...['Private Show', 'Bachelor Party', 'Birthday', 'Corporate Event'].slice(
            0,
            Math.floor(Math.random() * 3) + 1
          )
        );
      }

      // Create a more realistic title
      const title = `${name} - ${age} - ${category}`;

      mockAds.push({
        _id: `mock-ad-${i}`,
        title: title,
        description: `${description} Located in ${location}. Available for bookings 7 days a week. Contact for more information.`,
        category,
        price: Math.floor(Math.random() * 1000) + 500,
        location: { city: location, county: 'County' },
        images: [profileImage, secondImage],
        media: [
          { type: 'image', url: profileImage },
          { type: 'image', url: secondImage },
        ],
        advertiser: `advertiser-${i}`,
        userId: `user-${Math.floor(Math.random() * 5) + 1}`, // Add userId property
        isActive: true,
        isFeatured,
        isTrending,
        isTouring,
        viewCount: Math.floor(Math.random() * 1000),
        clickCount: Math.floor(Math.random() * 500),
        inquiryCount: Math.floor(Math.random() * 100),
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [...serviceTags, category, location, isTouring ? 'Touring' : ''],
        age,
      });
    }

    return mockAds;
  }

  getAdById(id: string | { city: string; county: string }): Observable<Ad> {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id);
    return this.http.get<Ad>(`${this.apiUrl}/${idStr}`);
  }

  getUserAds(userId: string): Observable<Ad[]> {
    return this.http.get<Ad[]>(`${this.apiUrl}/user/${userId}`);
  }

  createAd(adData: AdCreateDTO): Observable<Ad> {
    return this.http.post<Ad>(this.apiUrl, adData);
  }

  createAdWithImages(formData: FormData): Observable<Ad> {
    return this.http.post<Ad>(`${this.apiUrl}/with-images`, formData);
  }

  updateAd(id: string | { city: string; county: string }, adData: AdUpdateDTO): Observable<Ad> {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id);
    return this.http.put<Ad>(`${this.apiUrl}/${idStr}`, adData);
  }

  updateAdImages(
    id: string | { city: string; county: string },
    formData: FormData
  ): Observable<Ad> {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id);
    return this.http.put<Ad>(`${this.apiUrl}/${idStr}/images`, formData);
  }

  deleteAd(id: string | { city: string; county: string }): Observable<void> {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id);
    return this.http.delete<void>(`${this.apiUrl}/${idStr}`);
  }

  deleteAdImage(
    adId: string | { city: string; county: string },
    imageId: string
  ): Observable<void> {
    const adIdStr = typeof adId === 'string' ? adId : JSON.stringify(adId);
    return this.http.delete<void>(`${this.apiUrl}/${adIdStr}/images/${imageId}`);
  }

  getSwipeAds(filters?: any): Observable<Ad[]> {
    let url = `${this.apiUrl}/swipe`;

    if (filters) {
      const queryParams = new URLSearchParams();

      if (filters.category) {
        queryParams.append('category', filters.category);
      }

      if (filters.location) {
        queryParams.append('location', filters.location);
      }

      if (filters.touringOnly !== undefined) {
        queryParams.append('touringOnly', filters.touringOnly.toString());
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }

    return this.http.get<Ad[]>(url);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getAdsByCategory(categoryId: string): Observable<Ad[]> {
    return this.http.get<Ad[]>(`${this.apiUrl}/category/${categoryId}`);
  }

  recordSwipe(
    adId: string | { city: string; county: string },
    direction: 'left' | 'right'
  ): Observable<void> {
    const adIdStr = typeof adId === 'string' ? adId : JSON.stringify(adId);
    return this.http.post<void>(`${this.apiUrl}/${adIdStr}/swipe`, { direction });
  }

  searchNearby(longitude: number, latitude: number, radius: number): Observable<Ad[]> {
    return this.http.get<Ad[]>(`${this.apiUrl}/nearby`, {
      params: {
        longitude: longitude.toString(),
        latitude: latitude.toString(),
        radius: radius.toString(),
      },
    });
  }

  getTrendingAds(): Observable<Ad[]> {
    return this.http.get<Ad[]>(`${this.apiUrl}/trending`);
  }

  getFeaturedAds(): Observable<Ad[]> {
    return this.http.get<Ad[]>(`${this.apiUrl}/featured`);
  }

  searchAds(query: string): Observable<Ad[]> {
    return this.http.get<Ad[]>(`${this.apiUrl}/search`, {
      params: { q: query },
    });
  }

  reportAd(id: string | { city: string; county: string }, reason: string): Observable<void> {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id);
    return this.http.post<void>(`${this.apiUrl}/${idStr}/report`, { reason });
  }

  toggleActiveStatus(
    id: string | { city: string; county: string },
    isActive: boolean
  ): Observable<void> {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id);
    return this.http.patch<void>(`${this.apiUrl}/${idStr}/status`, { isActive });
  }

  /**
   * Search for ads by location with distance calculation
   * @param longitude Longitude coordinate
   * @param latitude Latitude coordinate
   * @param radius Search radius in kilometers
   * @param categories Optional array of categories to filter by
   * @returns Observable with location match results including distance
   */
  searchByLocation(
    longitude: number,
    latitude: number,
    radius: number,
    categories?: string[]
  ): Observable<any[]> {
    const params: any = {
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      radius: radius.toString(),
    };

    if (categories && categories.length > 0) {
      params.categories = categories.join(',');
    }

    return this.http.get<any[]>(`${this.apiUrl}/location-search`, { params }).pipe(
      catchError(error => {
        console.error('Error searching by location:', error);
        // Return mock data for development
        return of(this.getMockLocationResults(longitude, latitude, radius));
      })
    );
  }

  /**
   * Generate mock location search results for development
   * @param longitude Center longitude
   * @param latitude Center latitude
   * @param radius Search radius
   * @returns Array of mock location results
   */
  private getMockLocationResults(longitude: number, latitude: number, radius: number): any[] {
    const mockResults = [];
    const mockAds = this.getMockAds();

    // Generate random coordinates within the radius
    for (let i = 0; i < 10; i++) {
      // Convert radius from km to degrees (approximate)
      const kmToDegrees = 0.009;
      const radiusDegrees = radius * kmToDegrees;

      // Generate random offsets within the radius
      const randomAngle = Math.random() * 2 * Math.PI;
      const randomDistance = Math.random() * radiusDegrees;

      const offsetLng = randomDistance * Math.cos(randomAngle);
      const offsetLat = randomDistance * Math.sin(randomAngle);

      const resultLng = longitude + offsetLng;
      const resultLat = latitude + offsetLat;

      // Calculate mock distance in km (approximate)
      const distance = this.calculateDistance(latitude, longitude, resultLat, resultLng);

      // Use a random ad from the mock data
      const randomAd = mockAds[Math.floor(Math.random() * mockAds.length)];

      mockResults.push({
        _id: randomAd._id,
        title: randomAd.title,
        description: randomAd.description,
        distance: distance,
        location: {
          type: 'Point',
          coordinates: [resultLng, resultLat],
        },
        city: randomAd.location,
        county: 'Oslo County', // Mock county
        imageUrl: randomAd.images[0],
        rating: Math.floor(Math.random() * 5) + 1,
      });
    }

    // Sort by distance
    return mockResults.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 First latitude
   * @param lon1 First longitude
   * @param lat2 Second latitude
   * @param lon2 Second longitude
   * @returns Distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
