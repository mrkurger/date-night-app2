import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CsrfService {
  private apiUrl = `${environment.apiUrl}/csrf-token`;
  private csrfInitialized = false;

  constructor(private http: HttpClient) {}

  /**
   * Initialize CSRF protection by requesting a token from the server
   */
  initializeCsrf(): Observable<any> {
    if (this.csrfInitialized) {
      return of(true);
    }

    return this.http.get(this.apiUrl, { withCredentials: true }).pipe(
      tap(() => {
        this.csrfInitialized = true;
      }),
      catchError(error => {
        console.error('Failed to initialize CSRF token:', error);
        return of(false);
      })
    );
  }

  /**
   * Check if CSRF token is initialized
   */
  isCsrfInitialized(): boolean {
    return this.csrfInitialized;
  }
}
