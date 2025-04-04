import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private zone: NgZone,
    private router: Router
  ) {}

  handleError(error: Error | HttpErrorResponse): void {
    // Log the error to console in development mode
    if (!environment.production) {
      console.error('Error caught by Global Error Handler:', error);
    }

    // Handle different types of errors
    if (error instanceof HttpErrorResponse) {
      // Server or connection error
      this.handleHttpError(error);
    } else {
      // Client-side error
      this.handleClientError(error);
    }

    // In a real application, you would log the error to a service
    this.logErrorToService(error);
  }

  private handleHttpError(error: HttpErrorResponse): void {
    // Handle HTTP errors based on status code
    switch (error.status) {
      case 0:
        // Connection error
        this.showErrorMessage('Could not connect to the server. Please check your internet connection.');
        break;
      case 401:
        // Unauthorized
        this.showErrorMessage('You are not authorized to access this resource.');
        this.zone.run(() => this.router.navigate(['/auth/login']));
        break;
      case 403:
        // Forbidden
        this.showErrorMessage('You do not have permission to access this resource.');
        break;
      case 404:
        // Not found
        this.showErrorMessage('The requested resource was not found.');
        break;
      case 500:
        // Server error
        this.showErrorMessage('An error occurred on the server. Please try again later.');
        break;
      default:
        // Other errors
        this.showErrorMessage(`An error occurred: ${error.message}`);
        break;
    }
  }

  private handleClientError(error: Error): void {
    // Handle client-side errors
    this.showErrorMessage(`An application error occurred: ${error.message}`);
  }

  private showErrorMessage(message: string): void {
    // In a real application, you would use a notification service
    // For now, we'll just log to console
    console.error(message);

    // You could also use a toast notification library like ngx-toastr
    // this.toastr.error(message, 'Error');
  }

  private logErrorToService(error: Error | HttpErrorResponse): void {
    // In a real application, you would send the error to a logging service
    // For example, using a service like Sentry or a custom API endpoint
    
    // Example implementation:
    // this.loggingService.logError({
    //   message: error.message,
    //   stack: error instanceof Error ? error.stack : null,
    //   timestamp: new Date().toISOString()
    // });
  }
}