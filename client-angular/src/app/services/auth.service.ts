import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return new Observable((observer) => {
      this.http.post(`${this.apiUrl}/login`, credentials).subscribe({
        next: (response: any) => {
          // Token is now stored in HttpOnly cookie by the server
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  logout(): Observable<any> {
    return new Observable((observer) => {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: (response) => {
          // No need to clear token and user from localStorage; token is in HttpOnly cookie
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }

  getCurrentUser(): any {
    // Should fetch user from API or use a BehaviorSubject, not localStorage
    return null;
  }

  isAuthenticated(): boolean {
    // Should check authentication state via API or BehaviorSubject
    return false;
  }
}
