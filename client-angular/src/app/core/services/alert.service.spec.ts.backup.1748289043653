// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (alert.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AlertService } from './alert.service';
import { TelemetrySocketService } from './telemetry-socket.service';
import { environment } from '../../../environments/environment';
import {
  Alert,
  AlertConditionType,
  AlertTimeWindow,
  AlertSeverity,
  AlertChannel,
  AlertEvent,
} from '../models/alert.model';
import { Subject } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// import { of } from 'rxjs'; // Unused import

describe('AlertService', () => {
  let service: AlertService;
  let httpMock: HttpTestingController;
  let mockTelemetrySocketService: jasmine.SpyObj<TelemetrySocketService>;
  const apiUrl = environment.apiUrl + '/alerts';

  // Mock alert event subject
  const mockAlertEvents = new Subject<AlertEvent>();

  // Mock connection status subject
  const mockConnectionStatus = new Subject<boolean>();

  beforeEach(() => {
    // Create mock for TelemetrySocketService
    mockTelemetrySocketService = jasmine.createSpyObj(
      'TelemetrySocketService',
      ['connect', 'disconnect', 'subscribe', 'unsubscribe'],
      {
        alertEvents$: mockAlertEvents.asObservable(),
        connectionStatus$: mockConnectionStatus.asObservable(),
        isConnected: false,
      },
    );

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        AlertService,
        { provide: TelemetrySocketService, useValue: mockTelemetrySocketService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    service = TestBed.inject(AlertService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all alerts', () => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        name: 'Test Alert 1',
        enabled: true,
        severity: AlertSeverity.WARNING,
        condition: {
          type: AlertConditionType.ERROR_COUNT,
          threshold: 10,
          timeWindow: AlertTimeWindow.MINUTES_15,
        },
        notifications: [{ channel: AlertChannel.UI }],
      },
      {
        id: '2',
        name: 'Test Alert 2',
        enabled: false,
        severity: AlertSeverity.ERROR,
        condition: {
          type: AlertConditionType.ERROR_RATE,
          threshold: 5,
          timeWindow: AlertTimeWindow.HOURS_1,
        },
        notifications: [{ channel: AlertChannel.EMAIL, email: 'test@example.com' }],
      },
    ];

    service.getAlerts().subscribe((alerts) => {
      expect(alerts).toEqual(mockAlerts);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockAlerts);
  });

  it('should get a specific alert by ID', () => {
    const mockAlert: Alert = {
      id: '1',
      name: 'Test Alert',
      enabled: true,
      severity: AlertSeverity.WARNING,
      condition: {
        type: AlertConditionType.ERROR_COUNT,
        threshold: 10,
        timeWindow: AlertTimeWindow.MINUTES_15,
      },
      notifications: [{ channel: AlertChannel.UI }],
    };

    service.getAlert('1').subscribe((alert) => {
      expect(alert).toEqual(mockAlert);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAlert);
  });

  it('should create a new alert', () => {
    const newAlert: Alert = {
      name: 'New Alert',
      enabled: true,
      severity: AlertSeverity.INFO,
      condition: {
        type: AlertConditionType.PERFORMANCE_THRESHOLD,
        threshold: 500,
        timeWindow: AlertTimeWindow.MINUTES_5,
      },
      notifications: [{ channel: AlertChannel.UI }],
    };

    const createdAlert: Alert = {
      ...newAlert,
      id: '3',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    service.createAlert(newAlert).subscribe((alert) => {
      expect(alert).toEqual(createdAlert);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newAlert);
    req.flush(createdAlert);
  });

  it('should update an existing alert', () => {
    const updatedAlert: Alert = {
      id: '1',
      name: 'Updated Alert',
      enabled: true,
      severity: AlertSeverity.CRITICAL,
      condition: {
        type: AlertConditionType.ERROR_COUNT,
        threshold: 20,
        timeWindow: AlertTimeWindow.HOURS_1,
      },
      notifications: [
        { channel: AlertChannel.UI },
        { channel: AlertChannel.EMAIL, email: 'test@example.com' },
      ],
    };

    service.updateAlert('1', updatedAlert).subscribe((alert) => {
      expect(alert).toEqual(updatedAlert);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedAlert);
    req.flush(updatedAlert);
  });

  it('should delete an alert', () => {
    service.deleteAlert('1').subscribe((response) => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should toggle an alert', () => {
    const mockAlert: Alert = {
      id: '1',
      name: 'Test Alert',
      enabled: true,
      severity: AlertSeverity.WARNING,
      condition: {
        type: AlertConditionType.ERROR_COUNT,
        threshold: 10,
        timeWindow: AlertTimeWindow.MINUTES_15,
      },
      notifications: [{ channel: AlertChannel.UI }],
    };

    service.toggleAlert('1', false).subscribe((alert) => {
      expect(alert.enabled).toBe(false);
    });

    const req = httpMock.expectOne(`${apiUrl}/1/toggle`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush({ ...mockAlert, enabled: false });
  });

  it('should get active alert events', () => {
    const mockAlertEvents: AlertEvent[] = [
      {
        id: '1',
        alertId: '1',
        alertName: 'Test Alert 1',
        severity: AlertSeverity.WARNING,
        message: 'Error count exceeded threshold',
        timestamp: new Date(),
        acknowledged: false,
      },
      {
        id: '2',
        alertId: '2',
        alertName: 'Test Alert 2',
        severity: AlertSeverity.ERROR,
        message: 'Error rate exceeded threshold',
        timestamp: new Date(),
        acknowledged: false,
      },
    ];

    service.getActiveAlertEvents().subscribe((events) => {
      expect(events).toEqual(mockAlertEvents);
    });

    const req = httpMock.expectOne(`${apiUrl}/events/active`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAlertEvents);
  });

  it('should acknowledge an alert event', () => {
    const mockAlertEvent: AlertEvent = {
      id: '1',
      alertId: '1',
      alertName: 'Test Alert',
      severity: AlertSeverity.WARNING,
      message: 'Error count exceeded threshold',
      timestamp: new Date(),
      acknowledged: true,
      acknowledgedBy: 'test-user',
      acknowledgedAt: new Date(),
    };

    service.acknowledgeAlertEvent('1').subscribe((event) => {
      expect(event).toEqual(mockAlertEvent);
    });

    const req = httpMock.expectOne(`${apiUrl}/events/1/acknowledge`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAlertEvent);
  });

  it('should test an alert', () => {
    const testAlert: Alert = {
      name: 'Test Alert',
      enabled: true,
      severity: AlertSeverity.WARNING,
      condition: {
        type: AlertConditionType.ERROR_COUNT,
        threshold: 10,
        timeWindow: AlertTimeWindow.MINUTES_15,
      },
      notifications: [{ channel: AlertChannel.UI }],
    };

    const testResult = {
      wouldTrigger: true,
      message: 'Alert would trigger based on current data',
    };

    service.testAlert(testAlert).subscribe((result) => {
      expect(result).toEqual(testResult);
    });

    const req = httpMock.expectOne(`${apiUrl}/test`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testAlert);
    req.flush(testResult);
  });

  it('should update active alerts when receiving WebSocket events', () => {
    // Simulate WebSocket connection
    mockConnectionStatus.next(true);

    // Verify that the service subscribed to the alerts channel
    expect(mockTelemetrySocketService.subscribe).toHaveBeenCalledWith('alerts');

    // Simulate receiving an alert event
    const mockAlertEvent: AlertEvent = {
      id: '1',
      alertId: '1',
      alertName: 'Test Alert',
      severity: AlertSeverity.WARNING,
      message: 'Error count exceeded threshold',
      timestamp: new Date(),
      acknowledged: false,
    };

    // Get the active alerts
    let activeAlerts: AlertEvent[] = [];
    service.activeAlerts$.subscribe((alerts) => {
      activeAlerts = alerts;
    });

    // Simulate the server sending an alert event
    mockAlertEvents.next(mockAlertEvent);

    // Verify that the alert was added to the active alerts
    expect(activeAlerts.length).toBe(1);
    expect(activeAlerts[0]).toEqual(mockAlertEvent);

    // Verify that the unacknowledged count was updated
    let unacknowledgedCount = 0;
    service.unacknowledgedCount$.subscribe((count) => {
      unacknowledgedCount = count;
    });
    expect(unacknowledgedCount).toBe(1);
  });

  it('should update unacknowledged count when acknowledging an alert', () => {
    // Setup initial state with one active alert
    const mockAlertEvent: AlertEvent = {
      id: '1',
      alertId: '1',
      alertName: 'Test Alert',
      severity: AlertSeverity.WARNING,
      message: 'Error count exceeded threshold',
      timestamp: new Date(),
      acknowledged: false,
    };

    // Mock the HTTP request for getting active alerts
    service.getActiveAlertEvents().subscribe();
    const req = httpMock.expectOne(`${apiUrl}/events/active`);
    req.flush([mockAlertEvent]);

    // Verify initial unacknowledged count
    let unacknowledgedCount = 0;
    service.unacknowledgedCount$.subscribe((count) => {
      unacknowledgedCount = count;
    });
    expect(unacknowledgedCount).toBe(1);

    // Acknowledge the alert
    service.acknowledgeAlertEvent('1').subscribe();
    const ackReq = httpMock.expectOne(`${apiUrl}/events/1/acknowledge`);
    ackReq.flush({
      ...mockAlertEvent,
      acknowledged: true,
      acknowledgedBy: 'test-user',
      acknowledgedAt: new Date(),
    });

    // Verify that the unacknowledged count was updated
    expect(unacknowledgedCount).toBe(0);
  });
});
