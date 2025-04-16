import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * CSRF Interceptor
 *
 * This interceptor adds CSRF token to modifying requests (POST, PUT, DELETE, PATCH)
 * It extracts the token from cookies rather than injecting the CsrfService
 * to avoid circular dependencies.
 */
@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add CSRF token for API requests that modify data
    if (request.url.includes(environment.apiUrl) && this.isModifyingRequest(request)) {
      const csrfToken = this.getCsrfToken();

      if (csrfToken) {
        request = request.clone({
          setHeaders: {
            'X-XSRF-TOKEN': csrfToken,
          },
        });
      }
    }

    return next.handle(request);
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
