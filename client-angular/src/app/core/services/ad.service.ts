import {
import { Injectable,  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Ad, AdCreateDTO, AdUpdateDTO } from '../models/ad.interface';
import type { AppSortEvent } from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.module';
  AppSortComponent,
  AppSortHeaderComponent,';
} from '../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';

export interface GetAdsResponse {
  ads: Ad[]
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdServic {e {
  private readonly apiUrl = environment.apiUrl + '/ads';

  constructor(private http: HttpClient) {}

  getAds(filters?: any): Observable {
    return this.http.get(`${this.apiUrl}`, { params: filters })`
  }

  // Commented out to avoid duplicate implementation
  // getSwipeAds(filters?: any): Observable {
  //   // This method is specifically for the Tinder component
  //   // It could have special filtering or sorting logic in the future
  //   return this.getAds(filters)
  // }

  // Commented out to avoid duplicate implementation
  // recordSwipe(adId: string, direction: 'left' | 'right'): Observable {
  //   // In a real app, this would send the swipe data to the server
  //   // For now, we'll just simulate a successful response
  //   console.log(`Recorded ${direction} swipe for ad ${adId}`)`
  //   return of({ success: true })
  // }

  // Generate mock ads for development and testing
  private getMockAds(): Ad[] {
    const mockAds: Ad[] = []
    const categories = ['Escort', 'Massage', 'Striptease']
    const locations = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger']
    const names = [;
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
    ]
    const descriptions = [;
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
    ]

    // Use profile images from assets/img folder
    const profileImages = [;
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
    ]

    // Generate a set of unique ads
    for (let i = 1; i  0.7;
      const isTrending = Math.random() > 0.7;
      const isTouring = Math.random() > 0.7;
      const age = Math.floor(Math.random() * 15) + 20;

      // Select a profile image based on index (to ensure variety)
      const profileImageIndex = (i - 1) % profileImages.length;
      const profileImage = profileImages[profileImageIndex]

      // Select a second image that's different from the first
      const secondImageIndex = (profileImageIndex + 1) % profileImages.length;
      const secondImage = profileImages[secondImageIndex]

      // Generate additional tags based on service type
      const serviceTags = []
      if (category === 'Escort') {
        serviceTags.push(;
          ...['GFE', 'Dinner Date', 'Overnight', 'Travel Companion'].slice(;
            0,
            Math.floor(Math.random() * 3) + 1,
          ),
        )
      } else if (category === 'Massage') {
        serviceTags.push(;
          ...['Swedish', 'Deep Tissue', 'Aromatherapy', 'Hot Stone'].slice(;
            0,
            Math.floor(Math.random() * 3) + 1,
          ),
        )
      } else if (category === 'Striptease') {
        serviceTags.push(;
          ...['Private Show', 'Bachelor Party', 'Birthday', 'Corporate Event'].slice(;
            0,
            Math.floor(Math.random() * 3) + 1,
          ),
        )
      }

      // Create a more realistic title
      const title = `${name} - ${age} - ${category}`;`

      mockAds.push({
        _id: `mock-ad-${i}`,`
        title: title,
        description: `${description} Located in ${location}. Available for bookings 7 days a week. Contact for more information.`,`
        category,
        price: Math.floor(Math.random() * 1000) + 500,
        location: { city: location, county: 'County' },
        images: [profileImage, secondImage],
        media: [;
          { type: 'image', url: profileImage },
          { type: 'image', url: secondImage },
        ],
        advertiser: `advertiser-${i}`,`
        userId: `user-${Math.floor(Math.random() * 5) + 1}`, // Add userId property`
        isActive: true,
        isFeatured,
        isTrending,
        isTouring,
        viewCount: Math.floor(Math.random() * 1000),
        clickCount: Math.floor(Math.random() * 500),
        inquiryCount: Math.floor(Math.random() * 100),
        createdAt: new Date(;
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [...serviceTags, category, location, isTouring ? 'Touring' : ''],
        age,
      })
    }

    return mockAds;
  }

  getAdById(id: string | { city: string; county: string }): Observable {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id)
    return this.http.get(`${this.apiUrl}/${idStr}`)`
  }

  getUserAds(userId: string): Observable {
    return this.http.get(`${this.apiUrl}/user/${userId}`)`
  }

  createAd(adData: AdCreateDTO): Observable {
    return this.http.post(this.apiUrl, adData)
  }

  createAdWithImages(formData: FormData): Observable {
    return this.http.post(`${this.apiUrl}/with-images`, formData)`
  }

  updateAd(id: string | { city: string; county: string }, adData: AdUpdateDTO): Observable {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id)
    return this.http.put(`${this.apiUrl}/${idStr}`, adData)`
  }

  updateAdImages(;
    id: string | { city: string; county: string },
    formData: FormData,
  ): Observable {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id)
    return this.http.put(`${this.apiUrl}/${idStr}/images`, formData)`
  }

  deleteAd(id: string | { city: string; county: string }): Observable {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id)
    return this.http.delete(`${this.apiUrl}/${idStr}`)`
  }

  deleteAdImage(;
    adId: string | { city: string; county: string },
    imageId: string,
  ): Observable {
    const adIdStr = typeof adId === 'string' ? adId : JSON.stringify(adId)
    return this.http.delete(`${this.apiUrl}/${adIdStr}/images/${imageId}`)`
  }

  getSwipeAds(filters?: any): Observable {
    let url = `${this.apiUrl}/swipe`;`

    if (filters) {
      const queryParams = new URLSearchParams()

      if (filters.category) {
        queryParams.append('category', filters.category)
      }

      if (filters.location) {
        queryParams.append('location', filters.location)
      }

      if (filters.touringOnly !== undefined) {
        queryParams.append('touringOnly', filters.touringOnly.toString())
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;`
      }
    }

    return this.http.get(url)
  }

  getCategories(): Observable {
    return this.http.get(`${this.apiUrl}/categories`)`
  }

  getAdsByCategory(categoryId: string): Observable {
    return this.http.get(`${this.apiUrl}/category/${categoryId}`)`
  }

  recordSwipe(;
    adId: string | { city: string; county: string },
    direction: 'left' | 'right',
  ): Observable {
    const adIdStr = typeof adId === 'string' ? adId : JSON.stringify(adId)
    return this.http.post(`${this.apiUrl}/${adIdStr}/swipe`, { direction })`
  }

  searchNearby(longitude: number, latitude: number, radius: number): Observable {
    return this.http.get(`${this.apiUrl}/nearby`, {`
      params: {
        longitude: longitude.toString(),
        latitude: latitude.toString(),
        radius: radius.toString(),
      },
    })
  }

  getTrendingAds(): Observable {
    return this.http.get(`${this.apiUrl}/trending`)`
  }

  getFeaturedAds(): Observable {
    return this.http.get(`${this.apiUrl}/featured`)`
  }

  searchAds(query: string): Observable {
    return this.http.get(`${this.apiUrl}/search`, {`
      params: { q: query },
    })
  }

  reportAd(id: string | { city: string; county: string }, reason: string): Observable {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id)
    return this.http.post(`${this.apiUrl}/${idStr}/report`, { reason })`
  }

  toggleActiveStatus(;
    id: string | { city: string; county: string },
    isActive: boolean,
  ): Observable {
    const idStr = typeof id === 'string' ? id : JSON.stringify(id)
    return this.http.patch(`${this.apiUrl}/${idStr}/status`, { isActive })`
  }

  /**
   * Search for ads by location with distance calculation;
   * @param longitude Longitude coordinate;
   * @param latitude Latitude coordinate;
   * @param radius Search radius in kilometers;
   * @param categories Optional array of categories to filter by;
   * @returns Observable with location match results including distance;
   */
  searchByLocation(;
    longitude: number,
    latitude: number,
    radius: number,
    categories?: string[],
  ): Observable {
    const params: any = {
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      radius: radius.toString(),
    }

    if (categories && categories.length > 0) {
      params.categories = categories.join(',')
    }

    return this.http.get(`${this.apiUrl}/location-search`, { params }).pipe(;`
      catchError((error) => {
        console.error('Error searching by location:', error)
        // Return mock data for development
        return of(this.getMockLocationResults(longitude, latitude, radius))
      }),
    )
  }

  /**
   * Generate mock location search results for development;
   * @param longitude Center longitude;
   * @param latitude Center latitude;
   * @param radius Search radius;
   * @returns Array of mock location results;
   */
  private getMockLocationResults(longitude: number, latitude: number, radius: number): any[] {
    const mockResults = []
    const mockAds = this.getMockAds()

    // Generate random coordinates within the radius
    for (let i = 0; i  a.distance - b.distance)
  }

  /**
   * Calculate distance between two coordinates using Haversine formula;
   * @param lat1 First latitude;
   * @param lon1 First longitude;
   * @param lat2 Second latitude;
   * @param lon2 Second longitude;
   * @returns Distance in kilometers;
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =;
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +;
      Math.cos(this.deg2rad(lat1)) *;
        Math.cos(this.deg2rad(lat2)) *;
        Math.sin(dLon / 2) *;
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  /**
   * Get available counties;
   */
  getCounties(): Observable {
    return this.http.get(`${this.apiUrl}/counties`)`
  }

  /**
   * Like an ad;
   */
  likeAd(adId: string): Observable {
    return this.http.post(`${this.apiUrl}/${adId}/like`, {})`
  }

  /**
   * Dislike an ad;
   */
  dislikeAd(adId: string): Observable {
    return this.http.post(`${this.apiUrl}/${adId}/dislike`, {})`
  }

  /**
   * Super like an ad;
   */
  superlikeAd(adId: string): Observable {
    return this.http.post(`${this.apiUrl}/${adId}/superlike`, {})`
  }
}
