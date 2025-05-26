import { Injectable,  } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { catchError } from 'rxjs/operators'; // Removed tap
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

/**
 * CSRF Service
 *
 * This service uses direct XMLHttpRequest instead of HttpClient to avoid circular dependencies
 * with HTTP interceptors.
 */
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

    // Use XMLHttpRequest directly to avoid circular dependency with HttpClient
    return from(
      new Promise<boolean>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', this.apiUrl);
        xhr.withCredentials = true;

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            this.csrfInitialized = true;
            resolve(true);
          } else {
            reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error'));
        };

        xhr.send();
      }),
    ).pipe(
      catchError((error) => {
        console.error('Failed to initialize CSRF token:', error);
        return of(false);
      }),
    );
  }

  /**
   * Check if CSRF token is initialized
   */
  isCsrfInitialized(): boolean {
    return this.csrfInitialized;
  }

  /**
   * Get CSRF token from cookie
   */
  getCsrfToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }
}
