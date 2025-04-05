import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Ad, AdCreateDTO, AdUpdateDTO } from '../models/ad.interface';

@Injectable({
  providedIn: 'root'
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

  // Generate mock ads for development and testing
  private getMockAds(): Ad[] {
    const mockAds: Ad[] = [];
    const categories = ['Escort', 'Massage', 'Striptease'];
    const locations = ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'];

    for (let i = 1; i <= 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const isFeatured = Math.random() > 0.7;
      const isTrending = Math.random() > 0.7;
      const isTouring = Math.random() > 0.7;

      mockAds.push({
        _id: `mock-ad-${i}`,
        title: `${category} Service ${i}`,
        description: `This is a mock ${category.toLowerCase()} service located in ${location}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        category,
        price: Math.floor(Math.random() * 1000) + 500,
        location,
        images: [`https://picsum.photos/id/${i + 10}/500/700`],
        media: [
          { type: 'image', url: `https://picsum.photos/id/${i + 10}/500/700` },
          { type: 'image', url: `https://picsum.photos/id/${i + 30}/500/700` }
        ],
        advertiser: `advertiser-${i}`,
        isActive: true,
        isFeatured,
        isTrending,
        isTouring,
        viewCount: Math.floor(Math.random() * 1000),
        clickCount: Math.floor(Math.random() * 500),
        inquiryCount: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [category, location, isTouring ? 'Touring' : ''],
        age: Math.floor(Math.random() * 15) + 20
      });
    }

    return mockAds;
  }

  getAdById(id: string): Observable<Ad> {
    return this.http.get<Ad>(`${this.apiUrl}/${id}`);
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

  updateAd(id: string, adData: AdUpdateDTO): Observable<Ad> {
    return this.http.put<Ad>(`${this.apiUrl}/${id}`, adData);
  }

  updateAdImages(id: string, formData: FormData): Observable<Ad> {
    return this.http.put<Ad>(`${this.apiUrl}/${id}/images`, formData);
  }

  deleteAd(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteAdImage(adId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${adId}/images/${imageId}`);
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

  recordSwipe(adId: string, direction: 'left' | 'right'): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${adId}/swipe`, { direction });
  }

  searchNearby(longitude: number, latitude: number, radius: number): Observable<Ad[]> {
    return this.http.get<Ad[]>(`${this.apiUrl}/nearby`, {
      params: {
        longitude: longitude.toString(),
        latitude: latitude.toString(),
        radius: radius.toString()
      }
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
      params: { q: query }
    });
  }

  reportAd(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/report`, { reason });
  }

  toggleActiveStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { isActive });
  }
}
