import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ad, AdCreateDTO, AdUpdateDTO } from '../models/ad.interface';

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private readonly apiUrl = environment.apiUrl + '/ads';

  constructor(private http: HttpClient) {}

  getAds(filters?: any): Observable<Ad[]> {
    return this.http.get<Ad[]>(this.apiUrl, { params: filters });
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
