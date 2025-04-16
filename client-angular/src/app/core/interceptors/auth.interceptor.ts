import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

/**
 * Auth Interceptor
 *
 * This interceptor adds authentication-related headers and ensures
 * credentials are sent with cross-origin requests to our API.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to request if available
    const token = localStorage.getItem('token');

    if (token) {
      request = this.addToken(request, token);
    }

    // Add withCredentials for all requests to the API
    // This ensures cookies are sent with cross-origin requests
    if (request.url.includes(environment.apiUrl)) {
      request = request.clone({
        withCredentials: true,
      });
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Token expired or invalid
          this.userService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
