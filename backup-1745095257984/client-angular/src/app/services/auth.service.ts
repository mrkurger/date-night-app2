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
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/login`, credentials).subscribe({
        next: (response: any) => {
          // Store token and user in localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          observer.next(response);
          observer.complete();
        },
        error: error => {
          observer.error(error);
        },
      });
    });
  }

  logout(): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: response => {
          // Clear token and user from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          observer.next(response);
          observer.complete();
        },
        error: error => {
          observer.error(error);
        },
      });
    });
  }

  getCurrentUser(): any {
    // ...existing logic to get the current user...
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    // ...existing code for authentication state...
    return !!localStorage.getItem('token');
  }
}
