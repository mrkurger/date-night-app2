import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ad, AdCreateDTO, AdUpdateDTO } from '../models/ad.interface';

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private apiUrl = `${environment.apiUrl}/ads`;

  constructor(private http: HttpClient) {}

  getAds(): Observable<Ad[]> {
    return this.http.get<Ad[]>(this.apiUrl);
  }

  getAdById(id: string): Observable<Ad> {
    return this.http.get<Ad>(`${this.apiUrl}/${id}`);
  }

  getUserAds(userId: string): Observable<Ad[]> {
    return this.http.get<Ad[]>(`${this.apiUrl}/user/${userId}`);
  }

  createAd(adData: AdCreateDTO): Observable<Ad> {
    const formData = new FormData();
    Object.keys(adData).forEach(key => {
      if (key === 'images') {
        adData.images.forEach((image: File) => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, JSON.stringify(adData[key as keyof AdCreateDTO]));
      }
    });
    return this.http.post<Ad>(this.apiUrl, formData);
  }

  updateAd(id: string, adData: AdUpdateDTO): Observable<Ad> {
    return this.http.put<Ad>(`${this.apiUrl}/${id}`, adData);
  }

  deleteAd(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
}
