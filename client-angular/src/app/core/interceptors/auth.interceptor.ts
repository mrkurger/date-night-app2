import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

/**
 * Auth Interceptor
 *
 * This interceptor adds authentication-related headers and ensures
 * credentials are sent with cross-origin requests to our API.
 *
 * Token is now stored in HttpOnly cookies; no need to add Authorization header from localStorage.
 */
export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const userService = inject(UserService);
  const router = inject(Router);

  // No longer add auth token from localStorage; rely on HttpOnly cookies

  // Add withCredentials for all requests to the API
  // This ensures cookies are sent with cross-origin requests
  if (request.url.includes(environment.apiUrl)) {
    request = request.clone({
      withCredentials: true,
    });
  }

  return next(request).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Token expired or invalid
        userService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
