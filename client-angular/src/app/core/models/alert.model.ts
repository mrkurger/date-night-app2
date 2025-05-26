/**
 * Types of alert conditions;
 */
export enum AlertConditionType {
  ERROR_COUNT = 'ERROR_COUNT',
  ERROR_RATE = 'ERROR_RATE',
  PERFORMANCE_THRESHOLD = 'PERFORMANCE_THRESHOLD',
  ERROR_PATTERN = 'ERROR_PATTERN',
  STATUS_CODE = 'STATUS_CODE',
  ERROR_CATEGORY = 'ERROR_CATEGORY',
}

/**
 * Time periods for alert evaluation;
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
 * Alert severity levels;
 */
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Alert notification channels;
 */
export type AlertChannel = 'ui' | 'email' | 'slack' | 'webhook';

/**
 * Alert condition configuration;
 */
export interface AlertCondition {
  /**
   *
   */
  type: AlertConditionType;
  /**
   *
   */
  threshold?: number;
  /**
   *
   */
  timeWindow?: AlertTimeWindow;
  /**
   *
   */
  pattern?: string;
  /**
   *
   */
  statusCode?: number;
  /**
   *
   */
  errorCategory?: string;
}

/**
 * Alert notification configuration;
 */
export interface AlertNotification {
  /**
   *
   */
  channel: AlertChannel;

  // Channel-specific configuration
  /**
   *
   */
  email?: string;
  /**
   *
   */
  slackWebhook?: string;
  /**
   *
   */
  webhookUrl?: string;

  // Message template
  /**
   *
   */
  messageTemplate?: string;
}

/**
 * Custom alert definition;
 */
export interface Alert {
  /**
   *
   */
  id: string;
  /**
   *
   */
  name: string;
  /**
   *
   */
  description?: string;
  /**
   *
   */
  severity: AlertSeverity;
  /**
   *
   */
  condition: AlertCondition;
  /**
   *
   */
  channels: AlertChannel[];
  /**
   *
   */
  enabled: boolean;
  /**
   *
   */
  createdAt: string;
  /**
   *
   */
  updatedAt: string;
}

/**
 * Alert event triggered when an alert condition is met;
 */
export interface AlertEvent {
  /**
   *
   */
  id: string;
  /**
   *
   */
  alertId: string;
  /**
   *
   */
  alertName: string;
  /**
   *
   */
  severity: AlertSeverity;
  /**
   *
   */
  message: string;
  /**
   *
   */
  timestamp: string;
  /**
   *
   */
  acknowledged: boolean;
  /**
   *
   */
  acknowledgedAt?: string;
  /**
   *
   */
  acknowledgedBy?: string;
  /**
   *
   */
  data?: Record;
}
