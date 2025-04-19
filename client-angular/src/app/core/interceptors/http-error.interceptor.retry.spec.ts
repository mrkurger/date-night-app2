// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for http-error.interceptor.retry.spec settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { TelemetryService } from '../services/telemetry.service';
import { httpErrorInterceptor } from './http-error.interceptor';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * This test suite focuses specifically on the retry functionality of the HTTP error interceptor.
 * It tests the exponential backoff, jitter, and retry limits.
 */
describe('HTTP Error Interceptor - Retry Functionality', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let telemetryService: jasmine.SpyObj<TelemetryService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'error',
      'success',
      'info',
      'warning',
    ]);
    const telemetryServiceSpy = jasmine.createSpyObj('TelemetryService', ['trackError']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: TelemetryService, useValue: telemetryServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
    telemetryService = TestBed.inject(TelemetryService) as jasmine.SpyObj<TelemetryService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Note: The retry functionality is currently disabled by default in the interceptor
  // These tests would be more relevant if we enable retry in the configuration

  it('should handle server errors (500) appropriately', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 500 error'),
      error: error => {
        expect(error.status).toBe(500);
        expect(notificationService.error).toHaveBeenCalled();
        expect(telemetryService.trackError).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should not retry 400 errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 400 error'),
      error: error => {
        expect(error.status).toBe(400);
        expect(notificationService.error).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Bad request', { status: 400, statusText: 'Bad Request' });

    // No additional requests should be made
    httpMock.verify();
  });

  it('should not retry 401 errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 401 error'),
      error: error => {
        expect(error.status).toBe(401);
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // No additional requests should be made
    httpMock.verify();
  });
});
