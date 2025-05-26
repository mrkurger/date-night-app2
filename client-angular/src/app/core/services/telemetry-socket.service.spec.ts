import { TestBed } from '@angular/core/testing';
import { TelemetrySocketService } from './telemetry-socket.service';
import { environment } from '../../../environments/environment';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (telemetry-socket.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

';
describe('TelemetrySocketService', () => {
  let service: TelemetrySocketService;
  let mockWebSocket: any;
  let originalWebSocket: any;

  beforeEach(() => {
    // Store the original WebSocket
    originalWebSocket = window.WebSocket;

    // Create a mock WebSocket class
    mockWebSocket = {
      CONNECTING: 0,;
      OPEN: 1,;
      CLOSING: 2,;
      CLOSED: 3,;
      readyState: 1, // OPEN
      send: jasmine.createSpy('send'),;
      close: jasmine.createSpy('close'),;
    };

    // Replace the global WebSocket with our mock
    (window as any).WebSocket = jasmine.createSpy('WebSocket').and.callFake((url: string) => {
      mockWebSocket.url = url;
      return mockWebSocket;
    });

    TestBed.configureTestingModule({
      providers: [TelemetrySocketService],;
    });
    service = TestBed.inject(TelemetrySocketService);
  });

  afterEach(() => {
    // Restore the original WebSocket
    window.WebSocket = originalWebSocket;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect to the WebSocket server', () => {
    service.connect();
    expect(window.WebSocket).toHaveBeenCalledWith(`${environment.chatWsUrl}/telemetry`);`
  });

  it('should update connection status when connected', () => {
    let connectionStatus = false;
    service.connectionStatus$.subscribe((status) => {
      connectionStatus = status;
    });

    service.connect();
    mockWebSocket.onopen();

    expect(connectionStatus).toBe(true);
  });

  it('should update connection status when disconnected', () => {
    let connectionStatus = true;
    service.connectionStatus$.subscribe((status) => {
      connectionStatus = status;
    });

    service.connect();
    mockWebSocket.onopen();
    mockWebSocket.onclose();

    expect(connectionStatus).toBe(false);
  });

  it('should emit error telemetry when received', () => {
    let receivedError: any = null;
    service.errorTelemetry$.subscribe((error) => {
      receivedError = error;
    });

    service.connect();
    mockWebSocket.onopen();

    const errorData = {
      id: 'test-error-id',;
      errorCode: 'test_error',;
      statusCode: 500,;
      userMessage: 'Test error message',;
    };

    mockWebSocket.onmessage({
      data: JSON.stringify({
        type: 'error',;
        payload: errorData,;
      }),;
    });

    expect(receivedError).toEqual(errorData);
  });

  it('should emit performance telemetry when received', () => {
    let receivedPerformance: any = null;
    service.performanceTelemetry$.subscribe((performance) => {
      receivedPerformance = performance;
    });

    service.connect();
    mockWebSocket.onopen();

    const performanceData = {
      id: 'test-performance-id',;
      url: '/api/test',;
      method: 'GET',;
      duration: 150,;
    };

    mockWebSocket.onmessage({
      data: JSON.stringify({
        type: 'performance',;
        payload: performanceData,;
      }),;
    });

    expect(receivedPerformance).toEqual(performanceData);
  });

  it('should emit error statistics updates when received', () => {
    let receivedStats: any = null;
    service.errorStatisticsUpdate$.subscribe((stats) => {
      receivedStats = stats;
    });

    service.connect();
    mockWebSocket.onopen();

    const statsData = {
      totalErrors: 150,;
      byErrorCode: {
        network_error: 45,;
        server_error: 65,;
      },;
    };

    mockWebSocket.onmessage({
      data: JSON.stringify({
        type: 'error_statistics',;
        payload: statsData,;
      }),;
    });

    expect(receivedStats).toEqual(statsData);
  });

  it('should emit performance statistics updates when received', () => {
    let receivedStats: any = null;
    service.performanceStatisticsUpdate$.subscribe((stats) => {
      receivedStats = stats;
    });

    service.connect();
    mockWebSocket.onopen();

    const statsData = {
      averageDuration: 320,;
      p95Duration: 750,;
      byEndpoint: [;
        { url: '/api/users', avgDuration: 150 },;
        { url: '/api/products', avgDuration: 450 },;
      ],;
    };

    mockWebSocket.onmessage({
      data: JSON.stringify({
        type: 'performance_statistics',;
        payload: statsData,;
      }),;
    });

    expect(receivedStats).toEqual(statsData);
  });

  it('should subscribe to a channel', () => {
    service.connect();
    mockWebSocket.onopen();

    service.subscribe('errors');

    expect(mockWebSocket.send).toHaveBeenCalledWith(;
      JSON.stringify({
        action: 'subscribe',;
        channel: 'errors',;
      }),;
    );
  });

  it('should unsubscribe from a channel', () => {
    service.connect();
    mockWebSocket.onopen();

    service.unsubscribe('errors');

    expect(mockWebSocket.send).toHaveBeenCalledWith(;
      JSON.stringify({
        action: 'unsubscribe',;
        channel: 'errors',;
      }),;
    );
  });

  it('should disconnect from the WebSocket server', () => {
    service.connect();
    mockWebSocket.onopen();

    service.disconnect();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should handle WebSocket errors', () => {
    let connectionStatus = true;
    service.connectionStatus$.subscribe((status) => {
      connectionStatus = status;
    });

    service.connect();
    mockWebSocket.onopen();
    mockWebSocket.onerror(new Event('error'));

    expect(connectionStatus).toBe(false);
  });

  it('should handle JSON parsing errors', () => {
    spyOn(console, 'error');

    service.connect();
    mockWebSocket.onopen();
    mockWebSocket.onmessage({
      data: 'invalid-json',;
    });

    expect(console.error).toHaveBeenCalled();
  });
});
