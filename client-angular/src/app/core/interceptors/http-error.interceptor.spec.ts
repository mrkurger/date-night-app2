import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { HttpErrorInterceptor, HttpErrorInterceptorConfig } from './http-error.interceptor';

describe('HttpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let interceptor: HttpErrorInterceptor;
  let router: Router;
  let notificationService: NotificationService;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  const mockNotificationService = {
    error: jasmine.createSpy('error'),
    success: jasmine.createSpy('success'),
    info: jasmine.createSpy('info'),
    warning: jasmine.createSpy('warning'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpErrorInterceptor,
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    interceptor = TestBed.inject(HttpErrorInterceptor);
    router = TestBed.inject(Router);
    notificationService = TestBed.inject(NotificationService);

    // Configure the interceptor with test settings
    const testConfig: Partial<HttpErrorInterceptorConfig> = {
      showNotifications: true,
      retryFailedRequests: false, // Disable retries for easier testing
      redirectToLogin: true,
      logErrors: false, // Disable console logging during tests
    };

    interceptor.configure(testConfig);

    // Reset spies
    mockRouter.navigate.calls.reset();
    mockNotificationService.error.calls.reset();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should handle 401 Unauthorized errors and redirect to login', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 401 error'),
      error: error => {
        expect(error.details.errorCode).toBe('unauthorized');
        expect(error.message).toBe('Please log in to continue');
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(mockNotificationService.error).toHaveBeenCalledWith('Please log in to continue');
  });

  it('should handle 404 Not Found errors', () => {
    httpClient.get('/api/nonexistent').subscribe({
      next: () => fail('should have failed with 404 error'),
      error: error => {
        expect(error.details.errorCode).toBe('not_found');
        expect(error.message).toBe('The requested resource was not found');
      },
    });

    const req = httpMock.expectOne('/api/nonexistent');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith(
      'The requested resource was not found'
    );
  });

  it('should handle 500 Server errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 500 error'),
      error: error => {
        expect(error.details.errorCode).toBe('server_error');
        expect(error.message).toBe('Something went wrong on our end');
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith('Something went wrong on our end');
  });

  it('should handle network errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with network error'),
      error: error => {
        expect(error.details.errorCode).toBe('network_error');
        expect(error.message).toBe('Unable to connect to the server');
      },
    });

    const req = httpMock.expectOne('/api/test');
    const mockError = new ProgressEvent('error');
    req.error(mockError, { status: 0, statusText: 'Unknown Error' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith('Unable to connect to the server');
  });

  it('should handle validation errors (422)', () => {
    const validationError = {
      message: 'Validation failed',
      errors: [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ],
    };

    httpClient.post('/api/users', { email: 'invalid', password: '123' }).subscribe({
      next: () => fail('should have failed with validation error'),
      error: error => {
        expect(error.details.errorCode).toBe('validation_error');
        expect(error.message).toBe('The submitted data is invalid');
        expect(error.details.response).toEqual(validationError);
      },
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(validationError, { status: 422, statusText: 'Unprocessable Entity' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith('The submitted data is invalid');
  });

  it('should sanitize sensitive information in request body', () => {
    const testRequest = {
      email: 'test@example.com',
      password: 'secret123',
      creditCard: '4111111111111111',
      name: 'Test User',
    };

    httpClient.post('/api/login', testRequest).subscribe({
      next: () => fail('should have failed with error'),
      error: error => {
        // Check that sensitive fields are masked
        expect(error.details.request.body.password).toBe('********');
        expect(error.details.request.body.creditCard).toBe('********');

        // Check that non-sensitive fields are preserved
        expect(error.details.request.body.email).toBe('test@example.com');
        expect(error.details.request.body.name).toBe('Test User');
      },
    });

    const req = httpMock.expectOne('/api/login');
    req.flush('Error', { status: 400, statusText: 'Bad Request' });
  });

  it('should skip error handling for health check endpoints', () => {
    // This request should bypass the error interceptor
    httpClient.get('/api/health').subscribe({
      next: response => {
        expect(response).toBe('OK');
      },
      error: () => fail('should not have intercepted health check'),
    });

    const req = httpMock.expectOne('/api/health');
    req.flush('OK');

    // Verify that notification service was not called
    expect(mockNotificationService.error).not.toHaveBeenCalled();
  });
});
