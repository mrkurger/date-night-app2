import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { TelemetryService } from '../services/telemetry.service';
import {
  HttpErrorInterceptor,
  HttpErrorInterceptorConfig,
  ErrorCategory,
} from './http-error.interceptor';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';

describe('HttpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let interceptor: HttpErrorInterceptor;
  let router: Router;
  let notificationService: NotificationService;
  let telemetryService: TelemetryService;
  let authService: AuthService;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  const mockNotificationService = {
    error: jasmine.createSpy('error'),
    success: jasmine.createSpy('success'),
    info: jasmine.createSpy('info'),
    warning: jasmine.createSpy('warning'),
  };

  const mockTelemetryService = {
    trackError: jasmine.createSpy('trackError').and.returnValue(of({})),
    trackPerformance: jasmine.createSpy('trackPerformance').and.returnValue(of({})),
  };

  const mockAuthService = {
    logout: jasmine.createSpy('logout'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpErrorInterceptor,
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TelemetryService, useValue: mockTelemetryService },
        { provide: AuthService, useValue: mockAuthService },
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
    telemetryService = TestBed.inject(TelemetryService);
    authService = TestBed.inject(AuthService);

    // Configure the interceptor with test settings
    const testConfig: Partial<HttpErrorInterceptorConfig> = {
      showNotifications: true,
      retryFailedRequests: false, // Disable retries for easier testing
      redirectToLogin: true,
      logErrors: false, // Disable console logging during tests
      trackErrors: true,
      trackPerformance: true,
      sanitizeSensitiveData: true,
      groupSimilarErrors: true,
      skipUrls: ['/api/health', '/api/metrics', '/api/telemetry'],
    };

    interceptor.configure(testConfig);

    // Reset spies
    mockRouter.navigate.calls.reset();
    mockNotificationService.error.calls.reset();
    mockTelemetryService.trackError.calls.reset();
    mockTelemetryService.trackPerformance.calls.reset();
    mockAuthService.logout.calls.reset();
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
        expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    expect(mockNotificationService.error).toHaveBeenCalledWith('Please log in to continue');
    expect(mockTelemetryService.trackError).toHaveBeenCalled();

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].errorCode).toBe('unauthorized');
    expect(telemetryCall.args[0].statusCode).toBe(401);
    expect(telemetryCall.args[0].userMessage).toBe('Please log in to continue');
    expect(telemetryCall.args[0].context.category).toBe(ErrorCategory.AUTHENTICATION);
  });

  it('should handle 404 Not Found errors', () => {
    httpClient.get('/api/nonexistent').subscribe({
      next: () => fail('should have failed with 404 error'),
      error: error => {
        expect(error.details.errorCode).toBe('not_found');
        expect(error.message).toBe('The requested resource was not found');
        expect(error.category).toBe(ErrorCategory.NOT_FOUND);
      },
    });

    const req = httpMock.expectOne('/api/nonexistent');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith(
      'The requested resource was not found'
    );
    expect(mockTelemetryService.trackError).toHaveBeenCalled();

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].errorCode).toBe('not_found');
    expect(telemetryCall.args[0].statusCode).toBe(404);
    expect(telemetryCall.args[0].context.category).toBe(ErrorCategory.NOT_FOUND);
  });

  it('should handle 500 Server errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 500 error'),
      error: error => {
        expect(error.details.errorCode).toBe('server_error');
        expect(error.message).toBe('Something went wrong on our end');
        expect(error.category).toBe(ErrorCategory.SERVER);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith('Something went wrong on our end');
    expect(mockTelemetryService.trackError).toHaveBeenCalled();

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].errorCode).toBe('server_error');
    expect(telemetryCall.args[0].statusCode).toBe(500);
    expect(telemetryCall.args[0].context.category).toBe(ErrorCategory.SERVER);
  });

  it('should handle network errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with network error'),
      error: error => {
        expect(error.details.errorCode).toBe('network_error');
        expect(error.message).toBe('Unable to connect to the server');
        expect(error.category).toBe(ErrorCategory.NETWORK);
      },
    });

    const req = httpMock.expectOne('/api/test');
    const mockError = new ProgressEvent('error');
    req.error(mockError, { status: 0, statusText: 'Unknown Error' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith('Unable to connect to the server');
    expect(mockTelemetryService.trackError).toHaveBeenCalled();

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].errorCode).toBe('network_error');
    expect(telemetryCall.args[0].statusCode).toBe(0);
    expect(telemetryCall.args[0].context.category).toBe(ErrorCategory.NETWORK);
  });

  it('should handle validation errors (422) with field errors', () => {
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
        expect(error.message).toBe('Please check the following fields: email, password');
        expect(error.category).toBe(ErrorCategory.VALIDATION);
        expect(error.details.response).toEqual(validationError);
      },
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(validationError, { status: 422, statusText: 'Unprocessable Entity' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith(
      'Please check the following fields: email, password'
    );
    expect(mockTelemetryService.trackError).toHaveBeenCalled();

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].errorCode).toBe('validation_error');
    expect(telemetryCall.args[0].statusCode).toBe(422);
    expect(telemetryCall.args[0].context.category).toBe(ErrorCategory.VALIDATION);
  });

  it('should handle validation errors (422) with single error message', () => {
    const validationError = {
      message: 'Email is already in use',
    };

    httpClient.post('/api/users', { email: 'existing@example.com' }).subscribe({
      next: () => fail('should have failed with validation error'),
      error: error => {
        expect(error.details.errorCode).toBe('validation_error');
        expect(error.message).toBe('Email is already in use');
        expect(error.category).toBe(ErrorCategory.VALIDATION);
      },
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(validationError, { status: 422, statusText: 'Unprocessable Entity' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith('Email is already in use');
    expect(mockTelemetryService.trackError).toHaveBeenCalled();
  });

  it('should sanitize sensitive information in request body', () => {
    const testRequest = {
      email: 'test@example.com',
      password: 'secret123',
      creditCard: '4111111111111111',
      name: 'Test User',
      payment: {
        cardNumber: '5555555555554444',
        cvv: '123',
      },
    };

    httpClient.post('/api/login', testRequest).subscribe({
      next: () => fail('should have failed with error'),
      error: error => {
        // Check that sensitive fields are masked
        expect(error.details.request.body.password).toBe('********');
        expect(error.details.request.body.creditCard).toBe('********');
        expect(error.details.request.body.payment.cardNumber).toBe('********');
        expect(error.details.request.body.payment.cvv).toBe('********');

        // Check that non-sensitive fields are preserved
        expect(error.details.request.body.email).toBe('test@example.com');
        expect(error.details.request.body.name).toBe('Test User');
      },
    });

    const req = httpMock.expectOne('/api/login');
    req.flush('Error', { status: 400, statusText: 'Bad Request' });

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].context.requestDetails.body.password).toBe('********');
    expect(telemetryCall.args[0].context.requestDetails.body.creditCard).toBe('********');
    expect(telemetryCall.args[0].context.requestDetails.body.payment.cardNumber).toBe('********');
    expect(telemetryCall.args[0].context.requestDetails.body.payment.cvv).toBe('********');
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
    expect(mockTelemetryService.trackError).not.toHaveBeenCalled();
  });

  it('should skip error handling for telemetry endpoints', () => {
    // This request should bypass the error interceptor
    httpClient.get('/api/telemetry/errors').subscribe({
      next: response => {
        expect(response).toBe('OK');
      },
      error: () => fail('should not have intercepted telemetry endpoint'),
    });

    const req = httpMock.expectOne('/api/telemetry/errors');
    req.flush('OK');

    // Verify that notification service was not called
    expect(mockNotificationService.error).not.toHaveBeenCalled();
    expect(mockTelemetryService.trackError).not.toHaveBeenCalled();
  });

  it('should track performance metrics for successful requests', () => {
    // Mock performance.now
    spyOn(performance, 'now').and.returnValues(100, 250); // Start time, end time

    httpClient.get('/api/users').subscribe(response => {
      expect(response).toEqual(['user1', 'user2']);
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(['user1', 'user2']);

    expect(mockTelemetryService.trackPerformance).toHaveBeenCalled();

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackPerformance.calls.mostRecent();
    expect(telemetryCall.args[0].url).toBe('/api/users');
    expect(telemetryCall.args[0].method).toBe('GET');
    expect(telemetryCall.args[0].duration).toBe(150); // 250 - 100
  });

  it('should not track performance when disabled in config', () => {
    // Reconfigure the interceptor with performance tracking disabled
    interceptor.configure({
      trackPerformance: false,
    });

    httpClient.get('/api/users').subscribe(response => {
      expect(response).toEqual(['user1', 'user2']);
    });

    const req = httpMock.expectOne('/api/users');
    req.flush(['user1', 'user2']);

    expect(mockTelemetryService.trackPerformance).not.toHaveBeenCalled();
  });

  it('should not track errors when disabled in config', () => {
    // Reconfigure the interceptor with error tracking disabled
    interceptor.configure({
      trackErrors: false,
    });

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 500 error'),
      error: error => {
        expect(error.details.errorCode).toBe('server_error');
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(mockTelemetryService.trackError).not.toHaveBeenCalled();
  });

  it('should handle rate limit errors (429)', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with rate limit error'),
      error: error => {
        expect(error.details.errorCode).toBe('too_many_requests');
        expect(error.message).toBe('Too many requests, please try again later');
        expect(error.category).toBe(ErrorCategory.RATE_LIMIT);
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Too Many Requests', { status: 429, statusText: 'Too Many Requests' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith(
      'Too many requests, please try again later'
    );
    expect(mockTelemetryService.trackError).toHaveBeenCalled();

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].errorCode).toBe('too_many_requests');
    expect(telemetryCall.args[0].statusCode).toBe(429);
    expect(telemetryCall.args[0].context.category).toBe(ErrorCategory.RATE_LIMIT);
  });

  it('should handle forbidden errors (403)', () => {
    httpClient.get('/api/admin/users').subscribe({
      next: () => fail('should have failed with forbidden error'),
      error: error => {
        expect(error.details.errorCode).toBe('forbidden');
        expect(error.message).toBe('You do not have permission to access this resource');
        expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
      },
    });

    const req = httpMock.expectOne('/api/admin/users');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.error).toHaveBeenCalledWith(
      'You do not have permission to access this resource'
    );
    expect(mockTelemetryService.trackError).toHaveBeenCalled();

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].errorCode).toBe('forbidden');
    expect(telemetryCall.args[0].statusCode).toBe(403);
    expect(telemetryCall.args[0].context.category).toBe(ErrorCategory.AUTHORIZATION);
  });

  it('should include query parameters in error details', () => {
    httpClient.get('/api/users', { params: { search: 'test', limit: '10' } }).subscribe({
      next: () => fail('should have failed with error'),
      error: error => {
        expect(error.details.request.queryParams).toBeDefined();
        expect(error.details.request.queryParams.search).toBe('test');
        expect(error.details.request.queryParams.limit).toBe('10');
      },
    });

    const req = httpMock.expectOne(
      r => r.url === '/api/users' && r.params.get('search') === 'test'
    );
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

    // Verify telemetry data
    const telemetryCall = mockTelemetryService.trackError.calls.mostRecent();
    expect(telemetryCall.args[0].context.requestDetails.queryParams.search).toBe('test');
    expect(telemetryCall.args[0].context.requestDetails.queryParams.limit).toBe('10');
  });

  it('should not show duplicate error notifications in quick succession', () => {
    // First error
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with error'),
      error: () => {},
    });

    let req = httpMock.expectOne('/api/test');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    expect(mockNotificationService.error).toHaveBeenCalledTimes(1);
    mockNotificationService.error.calls.reset();

    // Second identical error immediately after
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with error'),
      error: () => {},
    });

    req = httpMock.expectOne('/api/test');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });

    // Should not show another notification for the same error
    expect(mockNotificationService.error).not.toHaveBeenCalled();
  });
});
