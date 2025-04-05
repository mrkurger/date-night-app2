import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Auth Interceptor
 *
 * This interceptor adds authentication-related headers and ensures
 * credentials are sent with cross-origin requests to our API.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add withCredentials for all requests to the API
    // This ensures cookies are sent with cross-origin requests
    if (request.url.includes(environment.apiUrl)) {
      const updatedRequest = request.clone({
        withCredentials: true
      });
      return next.handle(updatedRequest);
    }

    // For all other requests, proceed without modification
    return next.handle(request);
  }
}
