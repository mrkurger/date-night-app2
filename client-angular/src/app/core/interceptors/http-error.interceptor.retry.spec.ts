import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { TelemetryService } from '../services/telemetry.service';
import { HttpErrorInterceptor, HttpErrorInterceptorConfig } from './http-error.interceptor';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * This test suite focuses specifically on the retry functionality of the HTTP error interceptor.
 * It tests the exponential backoff, jitter, and retry limits.
 */
describe('HttpErrorInterceptor - Retry Functionality', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let interceptor: HttpErrorInterceptor;
  let telemetryService: TelemetryService;

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
    telemetryService = TestBed.inject(TelemetryService);

    // Configure the interceptor with retry enabled
    const testConfig: Partial<HttpErrorInterceptorConfig> = {
      showNotifications: true,
      retryFailedRequests: true,
      maxRetryAttempts: 3,
      retryDelay: 100, // Short delay for testing
      retryJitter: 50, // Small jitter for testing
      redirectToLogin: true,
      logErrors: false, // Disable console logging during tests
      trackErrors: true,
      trackPerformance: true,
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

  it('should retry server errors up to the configured maximum attempts', fakeAsync(() => {
    let errorCount = 0;

    httpClient.get('/api/test').subscribe({
      next: response => {
        expect(response).toEqual({ success: true });
      },
      error: () => {
        fail('should have succeeded after retries');
      },
    });

    // First attempt fails
    const req1 = httpMock.expectOne('/api/test');
    req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    errorCount++;
    tick(200); // Base delay (100) + maximum jitter (50) + buffer

    // Second attempt fails
    const req2 = httpMock.expectOne('/api/test');
    req2.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    errorCount++;
    tick(400); // Base delay (200) + maximum jitter (50) + buffer

    // Third attempt fails
    const req3 = httpMock.expectOne('/api/test');
    req3.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    errorCount++;
    tick(800); // Base delay (400) + maximum jitter (50) + buffer

    // Fourth attempt succeeds
    const req4 = httpMock.expectOne('/api/test');
    req4.flush({ success: true });

    // Verify telemetry was called for each error
    expect(mockTelemetryService.trackError).toHaveBeenCalledTimes(3);

    // Verify the first error was tracked
    const firstErrorCall = mockTelemetryService.trackError.calls.argsFor(0)[0];
    expect(firstErrorCall.errorCode).toBe('server_error');
    expect(firstErrorCall.statusCode).toBe(500);

    // Verify retry attempts were tracked
    expect(mockTelemetryService.trackError.calls.argsFor(0)[0].context).toBeDefined();
    expect(mockTelemetryService.trackError.calls.argsFor(1)[0].context).toBeDefined();
    expect(mockTelemetryService.trackError.calls.argsFor(2)[0].context).toBeDefined();
  }));

  it('should stop retrying after reaching the maximum attempts', fakeAsync(() => {
    httpClient.get('/api/test').subscribe({
      next: () => {
        fail('should have failed after max retries');
      },
      error: error => {
        expect(error.details.errorCode).toBe('server_error');
        expect(error.message).toBe('Something went wrong on our end');
      },
    });

    // First attempt fails
    const req1 = httpMock.expectOne('/api/test');
    req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    tick(200); // Base delay (100) + maximum jitter (50) + buffer

    // Second attempt fails
    const req2 = httpMock.expectOne('/api/test');
    req2.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    tick(400); // Base delay (200) + maximum jitter (50) + buffer

    // Third attempt fails
    const req3 = httpMock.expectOne('/api/test');
    req3.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    tick(800); // Base delay (400) + maximum jitter (50) + buffer

    // Fourth attempt fails - this should be the final attempt
    const req4 = httpMock.expectOne('/api/test');
    req4.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    // No more requests should be made
    tick(1600);
    httpMock.expectNone('/api/test');

    // Verify error notification was shown
    expect(mockNotificationService.error).toHaveBeenCalledWith('Something went wrong on our end');

    // Verify telemetry was called for each error (4 times total)
    expect(mockTelemetryService.trackError).toHaveBeenCalledTimes(4);
  }));

  it('should not retry 4xx client errors', fakeAsync(() => {
    httpClient.get('/api/test').subscribe({
      next: () => {
        fail('should have failed with 400 error');
      },
      error: error => {
        expect(error.details.errorCode).toBe('bad_request');
        expect(error.message).toBe('The request was invalid');
      },
    });

    // Request fails with 400
    const req = httpMock.expectOne('/api/test');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

    // Wait for potential retries
    tick(1000);

    // No more requests should be made
    httpMock.expectNone('/api/test');

    // Verify error notification was shown
    expect(mockNotificationService.error).toHaveBeenCalledWith('The request was invalid');

    // Verify telemetry was called once
    expect(mockTelemetryService.trackError).toHaveBeenCalledTimes(1);
  }));

  it('should not retry when retryFailedRequests is disabled', fakeAsync(() => {
    // Reconfigure the interceptor with retries disabled
    interceptor.configure({
      retryFailedRequests: false,
    });

    httpClient.get('/api/test').subscribe({
      next: () => {
        fail('should have failed with 500 error');
      },
      error: error => {
        expect(error.details.errorCode).toBe('server_error');
        expect(error.message).toBe('Something went wrong on our end');
      },
    });

    // Request fails with 500
    const req = httpMock.expectOne('/api/test');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    // Wait for potential retries
    tick(1000);

    // No more requests should be made
    httpMock.expectNone('/api/test');

    // Verify error notification was shown
    expect(mockNotificationService.error).toHaveBeenCalledWith('Something went wrong on our end');

    // Verify telemetry was called once
    expect(mockTelemetryService.trackError).toHaveBeenCalledTimes(1);
  }));

  it('should retry network errors (status 0)', fakeAsync(() => {
    httpClient.get('/api/test').subscribe({
      next: response => {
        expect(response).toEqual({ success: true });
      },
      error: () => {
        fail('should have succeeded after retries');
      },
    });

    // First attempt fails with network error
    const req1 = httpMock.expectOne('/api/test');
    const mockError = new ProgressEvent('error');
    req1.error(mockError, { status: 0, statusText: 'Unknown Error' });
    tick(200); // Base delay (100) + maximum jitter (50) + buffer

    // Second attempt succeeds
    const req2 = httpMock.expectOne('/api/test');
    req2.flush({ success: true });

    // Verify telemetry was called for the error
    expect(mockTelemetryService.trackError).toHaveBeenCalledTimes(1);

    // Verify the error was tracked as a network error
    const errorCall = mockTelemetryService.trackError.calls.first().args[0];
    expect(errorCall.errorCode).toBe('network_error');
    expect(errorCall.statusCode).toBe(0);
  }));

  it('should retry rate limit errors (429) with exponential backoff', fakeAsync(() => {
    httpClient.get('/api/test').subscribe({
      next: response => {
        expect(response).toEqual({ success: true });
      },
      error: () => {
        fail('should have succeeded after retries');
      },
    });

    // First attempt fails with rate limit error
    const req1 = httpMock.expectOne('/api/test');
    req1.flush('Too Many Requests', {
      status: 429,
      statusText: 'Too Many Requests',
      headers: { 'Retry-After': '1' }, // Server suggests 1 second retry
    });
    tick(200); // Base delay (100) + maximum jitter (50) + buffer

    // Second attempt succeeds
    const req2 = httpMock.expectOne('/api/test');
    req2.flush({ success: true });

    // Verify telemetry was called for the error
    expect(mockTelemetryService.trackError).toHaveBeenCalledTimes(1);

    // Verify the error was tracked as a rate limit error
    const errorCall = mockTelemetryService.trackError.calls.first().args[0];
    expect(errorCall.errorCode).toBe('too_many_requests');
    expect(errorCall.statusCode).toBe(429);
  }));

  it('should use exponential backoff for retry delays', fakeAsync(() => {
    // Spy on the getRetryDelay method
    // @ts-ignore - accessing private method for testing
    const getRetryDelaySpy = spyOn<any>(interceptor, 'getRetryDelay').and.callThrough();

    httpClient.get('/api/test').subscribe({
      next: () => {
        fail('should have failed after max retries');
      },
      error: () => {
        // Expected to fail after max retries
      },
    });

    // First attempt fails
    const req1 = httpMock.expectOne('/api/test');
    req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    tick(200); // Base delay (100) + maximum jitter (50) + buffer

    // Second attempt fails
    const req2 = httpMock.expectOne('/api/test');
    req2.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    tick(400); // Base delay (200) + maximum jitter (50) + buffer

    // Third attempt fails
    const req3 = httpMock.expectOne('/api/test');
    req3.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    tick(800); // Base delay (400) + maximum jitter (50) + buffer

    // Fourth attempt fails - this should be the final attempt
    const req4 = httpMock.expectOne('/api/test');
    req4.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });

    // Verify getRetryDelay was called with increasing attempt numbers
    expect(getRetryDelaySpy).toHaveBeenCalledTimes(3); // Called for attempts 1, 2, and 3
    expect(getRetryDelaySpy).toHaveBeenCalledWith(1);
    expect(getRetryDelaySpy).toHaveBeenCalledWith(2);
    expect(getRetryDelaySpy).toHaveBeenCalledWith(3);

    // Verify the delay increases exponentially
    const delay1 = getRetryDelaySpy.calls.argsFor(0)[0];
    const delay2 = getRetryDelaySpy.calls.argsFor(1)[0];
    const delay3 = getRetryDelaySpy.calls.argsFor(2)[0];

    // The formula is baseDelay * 2^(attempt-1)
    // For attempt 1: 100 * 2^0 = 100
    // For attempt 2: 100 * 2^1 = 200
    // For attempt 3: 100 * 2^2 = 400
    expect(delay1).toBe(1);
    expect(delay2).toBe(2);
    expect(delay3).toBe(3);
  }));
});
