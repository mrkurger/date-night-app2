import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TelemetryService, ErrorTelemetry, PerformanceTelemetry } from './telemetry.service';
import { environment } from '../../../environments/environment';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/telemetry';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TelemetryService],
    });
    service = TestBed.inject(TelemetryService);
    httpMock = TestBed.inject(HttpTestingController);

    // Mock localStorage
    const store: Record<string, string> = {};
    spyOn(localStorage, 'getItem').and.callFake(key => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      store[key] = value.toString();
    });

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should track errors', () => {
    const errorData: Partial<ErrorTelemetry> = {
      errorCode: 'test_error',
      statusCode: 500,
      userMessage: 'Test error message',
      technicalMessage: 'Technical details',
      url: 'https://example.com/api/test',
      method: 'GET',
    };

    service.trackError(errorData).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/errors`);
    expect(req.request.method).toBe('POST');

    const requestBody = req.request.body;
    expect(requestBody.errorCode).toBe('test_error');
    expect(requestBody.statusCode).toBe(500);
    expect(requestBody.userMessage).toBe('Test error message');
    expect(requestBody.technicalMessage).toBe('Technical details');
    expect(requestBody.url).toBe('https://example.com/api/test');
    expect(requestBody.method).toBe('GET');
    expect(requestBody.sessionId).toBeTruthy();
    expect(requestBody.timestamp).toBeTruthy();

    req.flush({ success: true });
  });

  it('should track performance metrics', () => {
    const performanceData: Partial<PerformanceTelemetry> = {
      url: 'https://example.com/api/test',
      method: 'GET',
      duration: 250,
      ttfb: 100,
      requestSize: 1024,
      responseSize: 5120,
    };

    service.trackPerformance(performanceData).subscribe(response => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/performance`);
    expect(req.request.method).toBe('POST');

    const requestBody = req.request.body;
    expect(requestBody.url).toBe('https://example.com/api/test');
    expect(requestBody.method).toBe('GET');
    expect(requestBody.duration).toBe(250);
    expect(requestBody.ttfb).toBe(100);
    expect(requestBody.requestSize).toBe(1024);
    expect(requestBody.responseSize).toBe(5120);
    expect(requestBody.sessionId).toBeTruthy();
    expect(requestBody.timestamp).toBeTruthy();

    req.flush({ success: true });
  });

  it('should store telemetry data locally when offline', () => {
    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', { value: false });

    const errorData: Partial<ErrorTelemetry> = {
      errorCode: 'offline_error',
      statusCode: 500,
      userMessage: 'Offline error message',
      url: 'https://example.com/api/test',
      method: 'GET',
    };

    service.trackError(errorData).subscribe(response => {
      expect(response.offline).toBe(true);
    });

    // No HTTP request should be made
    httpMock.expectNone(`${apiUrl}/errors`);

    // Check if data was stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should get error statistics', () => {
    const mockStatistics = {
      totalErrors: 150,
      byErrorCode: {
        network_error: 45,
        server_error: 65,
        validation_error: 40,
      },
      byTimeRange: [
        { date: '2023-06-01', count: 25 },
        { date: '2023-06-02', count: 35 },
        { date: '2023-06-03', count: 90 },
      ],
    };

    service.getErrorStatistics().subscribe(stats => {
      expect(stats).toEqual(mockStatistics);
    });

    const req = httpMock.expectOne(`${apiUrl}/errors/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStatistics);
  });

  it('should get performance statistics', () => {
    const mockStatistics = {
      averageDuration: 320,
      p95Duration: 750,
      byEndpoint: [
        { url: '/api/users', avgDuration: 150 },
        { url: '/api/products', avgDuration: 450 },
      ],
      byTimeRange: [
        { date: '2023-06-01', avgDuration: 280 },
        { date: '2023-06-02', avgDuration: 320 },
        { date: '2023-06-03', avgDuration: 360 },
      ],
    };

    service.getPerformanceStatistics().subscribe(stats => {
      expect(stats).toEqual(mockStatistics);
    });

    const req = httpMock.expectOne(`${apiUrl}/performance/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStatistics);
  });

  it('should set user ID', () => {
    const userId = 'test-user-123';
    service.setUserId(userId);

    // Track an error to verify the user ID is included
    service.trackError({ errorCode: 'test_error' }).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/errors`);
    expect(req.request.body.userId).toBe(userId);
    req.flush({ success: true });
  });
});
