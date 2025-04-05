import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 401:
              errorMessage = 'Unauthorized: Please log in to continue';
              this.router.navigate(['/auth/login']);
              break;
            case 403:
              errorMessage = 'Forbidden: You do not have permission to access this resource';
              break;
            case 404:
              errorMessage = 'Not Found: The requested resource does not exist';
              break;
            case 500:
              errorMessage = 'Server Error: Something went wrong on our end';
              break;
            default:
              errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
          }
        }
        
        // Log the error
        console.error('HTTP Error:', error);
        console.error('Error Message:', errorMessage);
        
        // Return the error for further handling
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}