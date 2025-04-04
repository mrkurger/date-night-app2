import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers: { [key: string]: string } = {};
    let updatedRequest = request;

    // Add withCredentials for all requests to the API
    // This ensures cookies are sent with cross-origin requests
    if (request.url.includes(environment.apiUrl)) {
      updatedRequest = request.clone({
        withCredentials: true
      });
    }

    // Add CSRF token from cookie if available
    const csrfToken = this.getCsrfToken();
    if (csrfToken && this.isModifyingRequest(updatedRequest)) {
      headers['X-XSRF-TOKEN'] = csrfToken;

      // Clone the request with the CSRF header
      if (Object.keys(headers).length > 0) {
        updatedRequest = updatedRequest.clone({
          setHeaders: headers
        });
      }
    }

    return next.handle(updatedRequest);
  }

  /**
   * Get CSRF token from cookie
   */
  private getCsrfToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Check if the request is modifying data (POST, PUT, DELETE, PATCH)
   */
  private isModifyingRequest(request: HttpRequest<any>): boolean {
    const method = request.method.toUpperCase();
    return method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';
  }
}
