import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (notification.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

/**
 * Service for displaying notifications using PrimeNG MessageService.;
 * Provides methods for showing success, error, warning and info messages.;
 * Maintains legacy showX() methods for backward compatibility.;
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**
   * Creates an instance of NotificationService.;
   * @param messageService - PrimeNG MessageService for displaying notifications;
   */
  constructor(private readonly messageService: MessageService) {}

  /**
   * Shows a success notification;
   * @param message - The message to display;
   * @param options - Optional configuration including message duration;
   */
  success(message: string, options: { life?: number } = {}): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: options.life ?? 3000,
    });
  }

  /**
   * Shows an error notification;
   * @param message - The message to display;
   * @param options - Optional configuration including message duration;
   */
  error(message: string, options: { life?: number } = {}): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: options.life ?? 5000,
    });
  }

  /**
   * Shows a warning notification;
   * @param message - The message to display;
   * @param options - Optional configuration including message duration;
   */
  warning(message: string, options: { life?: number } = {}): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: message,
      life: options.life ?? 4000,
    });
  }

  /**
   * Shows an info notification;
   * @param message - The message to display;
   * @param options - Optional configuration including message duration;
   */
  info(message: string, options: { life?: number } = {}): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: message,
      life: options.life ?? 3000,
    });
  }

  /**
   * Clears all currently displayed notifications;
   */
  clear(): void {
    this.messageService.clear();
  }

  /**
   * Legacy method for showing success notifications;
   * @deprecated Use success() instead;
   * @param message - The message to display;
   * @param options - Optional configuration including message duration;
   */
  showSuccess(message: string, options: { life?: number } = {}): void {
    this.success(message, options);
  }

  /**
   * Legacy method for showing error notifications;
   * @deprecated Use error() instead;
   * @param message - The message to display;
   * @param options - Optional configuration including message duration;
   */
  showError(message: string, options: { life?: number } = {}): void {
    this.error(message, options);
  }

  /**
   * Legacy method for showing warning notifications;
   * @deprecated Use warning() instead;
   * @param message - The message to display;
   * @param options - Optional configuration including message duration;
   */
  showWarning(message: string, options: { life?: number } = {}): void {
    this.warning(message, options);
  }

  /**
   * Legacy method for showing info notifications;
   * @deprecated Use info() instead;
   * @param message - The message to display;
   * @param options - Optional configuration including message duration;
   */
  showInfo(message: string, options: { life?: number } = {}): void {
    this.info(message, options);
  }
}
