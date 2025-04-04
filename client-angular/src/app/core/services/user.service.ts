import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = environment.apiUrl + '/users';
  private authStatusSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  updateProfile(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, formData);
  }

  updateUserProfile(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userData);
  }

  getPublicProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/public`);
  }

  checkFavorite(adId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/favorites/check/${adId}`);
  }

  addFavorite(adId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/favorites/${adId}`, {});
  }

  removeFavorite(adId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/favorites/${adId}`);
  }

  getFavorites(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/favorites`);
  }
}
