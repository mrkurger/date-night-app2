import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
// map and switchMap are not used in this file
import { environment } from '../../../environments/environment';
import {
  Alert,
  AlertEvent,
  AlertConditionType,
  AlertSeverity,
  AlertTimeWindow,
  AlertChannel,
} from '../models/alert.model';
import { TelemetrySocketService } from './telemetry-socket.service';
import { ErrorCategory } from '../interceptors/error-category.enum';

/**
 * Service for managing custom alerts
 */
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private apiUrl = `${environment.apiUrl}/alerts`;

  // Active alerts that have been triggered
  private activeAlerts = new BehaviorSubject<AlertEvent[]>([]);
  public activeAlerts$ = this.activeAlerts.asObservable();

  // Count of unacknowledged alerts
  private unacknowledgedCount = new BehaviorSubject<number>(0);
  public unacknowledgedCount$ = this.unacknowledgedCount.asObservable();

  constructor(
    private http: HttpClient,
    private telemetrySocketService: TelemetrySocketService
  ) {
    // Initialize by loading active alerts
    this.loadActiveAlerts();

    // Subscribe to real-time alert events if WebSocket is available
    this.telemetrySocketService.connectionStatus$.subscribe(connected => {
      if (connected) {
        this.subscribeToAlertEvents();
      }
    });

    // Fallback: Poll for active alerts every minute if WebSocket is not available
    interval(60000).subscribe(() => {
      if (!this.telemetrySocketService.isConnected) {
        this.loadActiveAlerts();
      }
    });
  }

  /**
   * Get all alert definitions
   */
  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching alerts:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a specific alert by ID
   * @param id Alert ID
   */
  getAlert(id: string): Observable<Alert> {
    return this.http.get<Alert>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new alert
   * @param alert Alert definition
   */
  createAlert(alert: Alert): Observable<Alert> {
    return this.http.post<Alert>(this.apiUrl, alert);
  }

  /**
   * Update an existing alert
   * @param id Alert ID
   * @param alert Updated alert definition
   */
  updateAlert(id: string, alert: Alert): Observable<Alert> {
    return this.http.put<Alert>(`${this.apiUrl}/${id}`, alert);
  }

  /**
   * Delete an alert
   * @param id Alert ID
   */
  deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Enable or disable an alert
   * @param id Alert ID
   * @param enabled Whether the alert should be enabled
   */
  toggleAlert(id: string, enabled: boolean): Observable<Alert> {
    return this.http.patch<Alert>(`${this.apiUrl}/${id}/toggle`, { enabled });
  }

  /**
   * Get active alert events
   */
  getActiveAlertEvents(): Observable<AlertEvent[]> {
    return this.http.get<AlertEvent[]>(`${this.apiUrl}/events/active`).pipe(
      catchError(error => {
        console.error('Error fetching active alert events:', error);
        return of([]);
      })
    );
  }

  /**
   * Get alert event history
   * @param filters Optional filters for the alert events
   */
  getAlertEventHistory(
    filters?: Record<string, string | number | boolean>
  ): Observable<AlertEvent[]> {
    return this.http.get<AlertEvent[]>(`${this.apiUrl}/events/history`, { params: filters }).pipe(
      catchError(error => {
        console.error('Error fetching alert event history:', error);
        return of([]);
      })
    );
  }

  /**
   * Acknowledge an alert event
   * @param eventId Alert event ID
   */
  acknowledgeAlertEvent(eventId: string): Observable<AlertEvent> {
    return this.http.post<AlertEvent>(`${this.apiUrl}/events/${eventId}/acknowledge`, {}).pipe(
      tap(() => {
        // Update the active alerts list
        const currentAlerts = this.activeAlerts.value;
        const updatedAlerts = currentAlerts.map(alert =>
          alert.id === eventId ? { ...alert, acknowledged: true } : alert
        );
        this.activeAlerts.next(updatedAlerts);

        // Update unacknowledged count
        this.updateUnacknowledgedCount();
      })
    );
  }

  /**
   * Test an alert definition to see if it would trigger
   * @param alert Alert definition to test
   */
  testAlert(alert: Alert): Observable<{ wouldTrigger: boolean; message: string }> {
    return this.http.post<{ wouldTrigger: boolean; message: string }>(`${this.apiUrl}/test`, alert);
  }

  /**
   * Create an error category alert
   * @param category Error category to monitor
   * @param name Alert name
   * @param description Alert description
   * @param threshold Number of errors to trigger the alert
   * @param timeWindow Time window for counting errors
   * @returns Observable of the created alert
   */
  createErrorCategoryAlert(
    category: ErrorCategory,
    name: string,
    description: string,
    threshold = 5,
    timeWindow = AlertTimeWindow.HOURS_1
  ): Observable<Alert> {
    const alert: Alert = {
      name,
      description,
      enabled: true,
      severity: this.getSeverityForCategory(category),
      condition: {
        type: AlertConditionType.ERROR_CATEGORY,
        threshold,
        timeWindow,
        errorCategory: category,
      },
      notifications: [
        {
          channel: AlertChannel.UI,
        },
        {
          channel: AlertChannel.EMAIL,
          email: 'admin@example.com',
        },
      ],
    };

    return this.createAlert(alert);
  }

  /**
   * Create an error rate alert
   * @param threshold Error rate threshold (percentage)
   * @param name Alert name
   * @param description Alert description
   * @param timeWindow Time window for calculating error rate
   * @returns Observable of the created alert
   */
  createErrorRateAlert(
    threshold: number,
    name: string,
    description: string,
    timeWindow = AlertTimeWindow.MINUTES_15
  ): Observable<Alert> {
    const alert: Alert = {
      name,
      description,
      enabled: true,
      severity: AlertSeverity.WARNING,
      condition: {
        type: AlertConditionType.ERROR_RATE,
        threshold,
        timeWindow,
      },
      notifications: [
        {
          channel: AlertChannel.UI,
        },
        {
          channel: AlertChannel.EMAIL,
          email: 'admin@example.com',
        },
      ],
    };

    return this.createAlert(alert);
  }

  /**
   * Create a performance threshold alert
   * @param threshold Performance threshold in milliseconds
   * @param name Alert name
   * @param description Alert description
   * @param endpoint Optional specific endpoint to monitor
   * @param timeWindow Time window for monitoring performance
   * @returns Observable of the created alert
   */
  createPerformanceAlert(
    threshold: number,
    name: string,
    description: string,
    endpoint?: string,
    timeWindow = AlertTimeWindow.MINUTES_30
  ): Observable<Alert> {
    const alert: Alert = {
      name,
      description,
      enabled: true,
      severity: AlertSeverity.WARNING,
      condition: {
        type: AlertConditionType.PERFORMANCE_THRESHOLD,
        threshold,
        timeWindow,
        endpoint,
      },
      notifications: [
        {
          channel: AlertChannel.UI,
        },
        {
          channel: AlertChannel.SLACK,
          slackWebhook: 'https://hooks.slack.com/services/your-webhook-url',
        },
      ],
    };

    return this.createAlert(alert);
  }

  /**
   * Create an error pattern alert
   * @param pattern Error message pattern to match
   * @param name Alert name
   * @param description Alert description
   * @param threshold Number of matching errors to trigger the alert
   * @param timeWindow Time window for counting matching errors
   * @returns Observable of the created alert
   */
  createErrorPatternAlert(
    pattern: string,
    name: string,
    description: string,
    threshold = 1,
    timeWindow = AlertTimeWindow.HOURS_24
  ): Observable<Alert> {
    const alert: Alert = {
      name,
      description,
      enabled: true,
      severity: AlertSeverity.ERROR,
      condition: {
        type: AlertConditionType.ERROR_PATTERN,
        threshold,
        timeWindow,
        pattern,
      },
      notifications: [
        {
          channel: AlertChannel.UI,
        },
        {
          channel: AlertChannel.EMAIL,
          email: 'admin@example.com',
        },
      ],
    };

    return this.createAlert(alert);
  }

  /**
   * Load active alerts from the server
   */
  private loadActiveAlerts(): void {
    this.getActiveAlertEvents().subscribe(alerts => {
      this.activeAlerts.next(alerts);
      this.updateUnacknowledgedCount();
    });
  }

  /**
   * Subscribe to real-time alert events via WebSocket
   */
  private subscribeToAlertEvents(): void {
    this.telemetrySocketService.subscribe('alerts');

    // Listen for alert events
    this.telemetrySocketService.alertEvents$.subscribe(event => {
      const currentAlerts = this.activeAlerts.value;

      // Add the new alert if it's not already in the list
      if (!currentAlerts.some(alert => alert.id === event.id)) {
        this.activeAlerts.next([...currentAlerts, event]);
        this.updateUnacknowledgedCount();
      }
    });
  }

  /**
   * Update the count of unacknowledged alerts
   */
  private updateUnacknowledgedCount(): void {
    const count = this.activeAlerts.value.filter(alert => !alert.acknowledged).length;
    this.unacknowledgedCount.next(count);
  }

  /**
   * Map error category to appropriate alert severity
   * @param category Error category
   * @returns Alert severity level
   */
  private getSeverityForCategory(category: ErrorCategory): AlertSeverity {
    switch (category) {
      case ErrorCategory.SERVER:
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return AlertSeverity.CRITICAL;

      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
      case ErrorCategory.RATE_LIMIT:
        return AlertSeverity.ERROR;

      case ErrorCategory.VALIDATION:
      case ErrorCategory.NOT_FOUND:
      case ErrorCategory.CONFLICT:
        return AlertSeverity.WARNING;

      case ErrorCategory.CLIENT:
      case ErrorCategory.UNKNOWN:
      default:
        return AlertSeverity.INFO;
    }
  }
}
