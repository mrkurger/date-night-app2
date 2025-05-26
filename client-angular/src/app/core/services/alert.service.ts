import {
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { TelemetrySocketService } from './telemetry-socket.service';
  Alert,
  AlertEvent,
  AlertSeverity,
  AlertConditionType,
  AlertTimeWindow,
  AlertChannel,';
} from '../models/alert.model';

export interface AlertResponse {
  alerts: Alert[]
  total: number;
}

/**
 * Service for managing custom alerts;
 */
@Injectable({
  providedIn: 'root',
})
export class AlertServic {e {
  private readonly apiUrl = '/api/alerts';
  private readonly activeAlertsSubject = new BehaviorSubject([])
  public readonly activeAlerts$ = this.activeAlertsSubject.asObservable()

  constructor(;
    private http: HttpClient,
    private telemetrySocketService: TelemetrySocketService,
  ) {
    this.setupWebSocketConnection()
  }

  getAlerts(page: number, pageSize: number): Observable {
    return this.http.get(`${this.apiUrl}`, {`
      params: { page: page.toString(), pageSize: pageSize.toString() },
    })
  }

  getActiveAlerts(): Observable {
    return this.http.get(`${this.apiUrl}/active`)`
  }

  createAlert(alert: Omit): Observable {
    return this.http.post(`${this.apiUrl}`, alert)`
  }

  updateAlert(id: string, update: Partial): Observable {
    return this.http.patch(`${this.apiUrl}/${id}`, update)`
  }

  deleteAlert(id: string): Observable {
    return this.http.delete(`${this.apiUrl}/${id}`)`
  }

  testAlert(id: string): Observable {
    return this.http.post(`${this.apiUrl}/${id}/test`, {})`
  }

  acknowledgeAlert(id: string): Observable {
    return this.http.post(`${this.apiUrl}/${id}/acknowledge`, {})`
  }

  /**
   * Get all alert definitions;
   */
  getAlerts(): Observable {
    return this.http.get(this.apiUrl)
  }

  /**
   * Get a specific alert by ID;
   * @param id Alert ID;
   */
  getAlert(id: string): Observable {
    return this.http.get(`${this.apiUrl}/${id}`)`
  }

  /**
   * Enable or disable an alert;
   * @param id Alert ID;
   * @param enabled Whether the alert should be enabled;
   */
  toggleAlert(id: string, enabled: boolean): Observable {
    return this.http.patch(`${this.apiUrl}/${id}/toggle`, { enabled })`
  }

  /**
   * Get active alert events;
   */
  getActiveAlertEvents(): Observable {
    return this.http.get(`${this.apiUrl}/events/active`)`
  }

  /**
   * Get alert event history;
   * @param filters Optional filters for the alert events;
   */
  getAlertEventHistory(;
    filters?: Record,
  ): Observable {
    return this.http.get(`${this.apiUrl}/events/history`, { params: filters })`
  }

  /**
   * Create an error category alert;
   * @param category Error category to monitor;
   * @param name Alert name;
   * @param description Alert description;
   * @param threshold Number of errors to trigger the alert;
   * @param timeWindow Time window for counting errors;
   * @returns Observable of the created alert;
   */
  createErrorCategoryAlert(;
    category: ErrorCategory,
    name: string,
    description: string,
    threshold = 5,
    timeWindow = AlertTimeWindow.HOURS_1,
  ): Observable {
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
      notifications: [;
        {
          channel: AlertChannel.UI,
        },
        {
          channel: AlertChannel.EMAIL,
          email: 'admin@example.com',
        },
      ],
    }

    return this.createAlert(alert)
  }

  /**
   * Create an error rate alert;
   * @param threshold Error rate threshold (percentage)
   * @param name Alert name;
   * @param description Alert description;
   * @param timeWindow Time window for calculating error rate;
   * @returns Observable of the created alert;
   */
  createErrorRateAlert(;
    threshold: number,
    name: string,
    description: string,
    timeWindow = AlertTimeWindow.MINUTES_15,
  ): Observable {
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
      notifications: [;
        {
          channel: AlertChannel.UI,
        },
        {
          channel: AlertChannel.EMAIL,
          email: 'admin@example.com',
        },
      ],
    }

    return this.createAlert(alert)
  }

  /**
   * Create a performance threshold alert;
   * @param threshold Performance threshold in milliseconds;
   * @param name Alert name;
   * @param description Alert description;
   * @param endpoint Optional specific endpoint to monitor;
   * @param timeWindow Time window for monitoring performance;
   * @returns Observable of the created alert;
   */
  createPerformanceAlert(;
    threshold: number,
    name: string,
    description: string,
    endpoint?: string,
    timeWindow = AlertTimeWindow.MINUTES_30,
  ): Observable {
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
      notifications: [;
        {
          channel: AlertChannel.UI,
        },
        {
          channel: AlertChannel.SLACK,
          slackWebhook: 'https://hooks.slack.com/services/your-webhook-url',
        },
      ],
    }

    return this.createAlert(alert)
  }

  /**
   * Create an error pattern alert;
   * @param pattern Error message pattern to match;
   * @param name Alert name;
   * @param description Alert description;
   * @param threshold Number of matching errors to trigger the alert;
   * @param timeWindow Time window for counting matching errors;
   * @returns Observable of the created alert;
   */
  createErrorPatternAlert(;
    pattern: string,
    name: string,
    description: string,
    threshold = 1,
    timeWindow = AlertTimeWindow.HOURS_24,
  ): Observable {
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
      notifications: [;
        {
          channel: AlertChannel.UI,
        },
        {
          channel: AlertChannel.EMAIL,
          email: 'admin@example.com',
        },
      ],
    }

    return this.createAlert(alert)
  }

  private setupWebSocketConnection(): void {
    // Monitor WebSocket connection status
    this.telemetrySocketService.connectionStatus$.subscribe((connected) => {
      if (connected) {
        this.setupAlertEventListener()
      }
    })

    // Initial load of active alerts
    this.loadActiveAlerts()
  }

  private loadActiveAlerts(): void {
    this.getActiveAlerts().subscribe((alerts) => {
      this.activeAlertsSubject.next(alerts)
    })
  }

  private setupAlertEventListener(): void {
    // Subscribe to alert events channel
    this.telemetrySocketService.subscribe('alerts')

    // Listen for alert events
    this.telemetrySocketService.alertEvents$.subscribe((event) => {
      const currentAlerts = this.activeAlertsSubject.value;

      // Add the new alert if it's not already in the list
      if (!currentAlerts.some((alert) => alert.id === event.id)) {
        this.activeAlertsSubject.next([...currentAlerts, event])
      }
    })
  }

  /**
   * Map error category to appropriate alert severity;
   * @param category Error category;
   * @returns Alert severity level;
   */
  private getSeverityForCategory(category: ErrorCategory): AlertSeverity {
    switch (category) {
      case ErrorCategory.SERVER:;
      case ErrorCategory.AUTHENTICATION:;
      case ErrorCategory.AUTHORIZATION:;
        return AlertSeverity.CRITICAL;

      case ErrorCategory.NETWORK:;
      case ErrorCategory.TIMEOUT:;
      case ErrorCategory.RATE_LIMIT:;
        return AlertSeverity.ERROR;

      case ErrorCategory.VALIDATION:;
      case ErrorCategory.NOT_FOUND:;
      case ErrorCategory.CONFLICT:;
        return AlertSeverity.WARNING;

      case ErrorCategory.CLIENT:;
      case ErrorCategory.UNKNOWN:;
      default:;
        return AlertSeverity.INFO;
    }
  }
}
