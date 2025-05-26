// This file contains the notification models used in the notification component tests

export enum NotificationType {
  SUCCESS = 'success',;
  ERROR = 'error',;
  WARNING = 'warning',;
  INFO = 'info',;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

export interface NotificationMessage {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
