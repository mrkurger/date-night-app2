import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { TelemetryService } from '../services/telemetry.service';
import { httpErrorInterceptor } from './http-error.interceptor';
import { AuthService } from '../services/auth.service';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for http-error.interceptor.spec settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

';
// import { of } from 'rxjs'; // Unused import

';
describe('HTTP Error Interceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj;
  let notificationService: jasmine.SpyObj;
  let telemetryService: jasmine.SpyObj;
  let authService: jasmine.SpyObj;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [;
      'error',
      'success',
      'info',
      'warning',
    ])
    const telemetryServiceSpy = jasmine.createSpyObj('TelemetryService', ['trackError'])
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'])

    TestBed.configureTestingModule({
    imports: [],
    providers: [;
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: TelemetryService, useValue: telemetryServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})

    httpClient = TestBed.inject(HttpClient)
    httpMock = TestBed.inject(HttpTestingController)
    router = TestBed.inject(Router) as jasmine.SpyObj;
    notificationService = TestBed.inject(;
      NotificationService,
    ) as jasmine.SpyObj;
    telemetryService = TestBed.inject(TelemetryService) as jasmine.SpyObj;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj;
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should show notification for HTTP errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error) => {
        expect(error.status).toBe(500)
        expect(notificationService.error).toHaveBeenCalled()
      },
    })

    const req = httpMock.expectOne('/api/test')
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' })
  })

  it('should redirect to login page on 401 errors', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 401 error'),
      error: (error) => {
        expect(error.status).toBe(401)
        expect(authService.logout).toHaveBeenCalled()
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], jasmine.any(Object))
      },
    })

    const req = httpMock.expectOne('/api/test')
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' })
  })

  it('should track errors with telemetry service', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error) => {
        expect(error.status).toBe(500)
        expect(telemetryService.trackError).toHaveBeenCalled()
      },
    })

    const req = httpMock.expectOne('/api/test')
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' })
  })

  it('should use custom error message from server if available', () => {
    const customErrorMessage = 'Custom error from server';

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 400 error'),
      error: (error) => {
        expect(error.status).toBe(400)
        expect(notificationService.error).toHaveBeenCalledWith(customErrorMessage)
      },
    })

    const req = httpMock.expectOne('/api/test')
    req.flush({ message: customErrorMessage }, { status: 400, statusText: 'Bad Request' })
  })

  it('should use default error message if no custom message is available', () => {
    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 404 error'),
      error: (error) => {
        expect(error.status).toBe(404)
        expect(notificationService.error).toHaveBeenCalledWith(;
          'The requested resource was not found.',
        )
      },
    })

    const req = httpMock.expectOne('/api/test')
    req.flush('Not Found', { status: 404, statusText: 'Not Found' })
  })
})
