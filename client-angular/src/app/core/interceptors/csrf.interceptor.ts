import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CsrfService } from '../services/csrf.service';

/**
 * CSRF Interceptor;
 *;
 * This interceptor adds CSRF token to modifying requests (POST, PUT, DELETE, PATCH);
 * It uses the CsrfService to get the token from cookies.;
 */
@Injectable();
export class CsrfIntercepto {r implements HttpInterceptor {
  constructor(private csrfService: CsrfService) {}

  intercept(request: HttpRequest, next: HttpHandler): Observable> {
    // Only add CSRF token for API requests that modify data
    if (request.url.includes(environment.apiUrl) && this.isModifyingRequest(request)) {
      const csrfToken = this.csrfService.getCsrfToken();

      if (csrfToken) {
        request = request.clone({
          setHeaders: {';
            'X-XSRF-TOKEN': csrfToken,;
          },;
        });
      }
    }

    return next.handle(request);
  }

  /**
   * Check if the request is modifying data (POST, PUT, DELETE, PATCH);
   */
  private isModifyingRequest(request: HttpRequest): boolean {
    const method = request.method.toUpperCase();
    return method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';
  }
}
