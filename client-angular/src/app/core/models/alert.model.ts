/**
 * Types of alert conditions
 */
export enum AlertConditionType {
  ERROR_COUNT = 'error_count',
  ERROR_RATE = 'error_rate',
  PERFORMANCE_THRESHOLD = 'performance_threshold',
  ERROR_PATTERN = 'error_pattern',
  STATUS_CODE = 'status_code',
  ERROR_CATEGORY = 'error_category',
}

/**
 * Time periods for alert evaluation
 */
export enum AlertTimeWindow {
  MINUTES_5 = '5m',
  MINUTES_15 = '15m',
  MINUTES_30 = '30m',
  HOURS_1 = '1h',
  HOURS_6 = '6h',
  HOURS_12 = '12h',
  HOURS_24 = '24h',
}

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Alert notification channels
 */
export enum AlertChannel {
  UI = 'ui',
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
}

/**
 * Alert condition configuration
 */
export interface AlertCondition {
  type: AlertConditionType;
  threshold: number;
  timeWindow: AlertTimeWindow;

  // Optional parameters based on condition type
  errorCode?: string;
  statusCode?: number;
  errorCategory?: string;
  endpoint?: string;
  pattern?: string;
}

/**
 * Alert notification configuration
 */
export interface AlertNotification {
  channel: AlertChannel;

  // Channel-specific configuration
  email?: string;
  slackWebhook?: string;
  webhookUrl?: string;

  // Message template
  messageTemplate?: string;
}

/**
 * Custom alert definition
 */
export interface Alert {
  id?: string;
  name: string;
  description?: string;
  enabled: boolean;
  severity: AlertSeverity;
  condition: AlertCondition;
  notifications: AlertNotification[];
  createdAt?: Date;
  updatedAt?: Date;
  lastTriggeredAt?: Date;
  createdBy?: string;
}

/**
 * Alert event triggered when an alert condition is met
 */
export interface AlertEvent {
  id: string;
  alertId: string;
  alertName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  relatedData?: any;
}
