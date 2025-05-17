// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (logging.service)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Injectable, Component } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Logging levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  PERFORMANCE = 4,
  INTERACTION = 5,
}

/**
 * Service for centralized application logging
 *
 * This service provides methods for logging different types of messages:
 * - Debug: Detailed information for debugging
 * - Info: General information about application flow
 * - Warn: Warnings that don't prevent the application from working
 * - Error: Errors that may prevent the application from working correctly
 * - Performance: Performance metrics
 * - Interaction: User interactions
 *
 * In production, only warnings, errors, performance metrics, and interactions are logged.
 * In development, all log levels are enabled.
 */
@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  private currentLogLevel: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;

  // Enable remote logging in production
  private enableRemoteLogging: boolean = environment.production;

  // Queue for batching logs
  private logQueue: any[] = [];
  private queueTimer: any = null;
  private readonly QUEUE_FLUSH_INTERVAL = 10000; // 10 seconds

  constructor() {
    // Set up queue flushing
    if (this.enableRemoteLogging) {
      this.queueTimer = setInterval(() => this.flushLogQueue(), this.QUEUE_FLUSH_INTERVAL);
    }
  }

  /**
   * Log a debug message
   * @param message - Message to log
   * @param data - Optional data to include
   */
  logDebug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   * @param message - Message to log
   * @param data - Optional data to include
   */
  logInfo(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   * @param message - Message to log
   * @param data - Optional data to include
   */
  logWarning(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   * @param source - Source of the error
   * @param errorType - Type of error
   * @param details - Error details
   */
  logError(source: string, errorType: string, details?: any): void {
    this.log(LogLevel.ERROR, `${source} - ${errorType}`, details);
  }

  /**
   * Log a performance metric
   * @param operation - Operation being measured
   * @param timeMs - Time in milliseconds
   * @param details - Optional additional details
   */
  logPerformance(operation: string, timeMs: number, details?: any): void {
    this.log(LogLevel.PERFORMANCE, `Performance: ${operation}`, { timeMs, ...details });
  }

  /**
   * Log a user interaction
   * @param component - Component where the interaction occurred
   * @param action - Action performed
   * @param details - Optional additional details
   */
  logInteraction(component: string, action: string, details?: any): void {
    this.log(LogLevel.INTERACTION, `Interaction: ${component} - ${action}`, details);
  }

  /**
   * Set the current log level
   * @param level - New log level
   */
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  /**
   * Enable or disable remote logging
   * @param enable - Whether to enable remote logging
   */
  setRemoteLogging(enable: boolean): void {
    this.enableRemoteLogging = enable;

    if (enable && !this.queueTimer) {
      this.queueTimer = setInterval(() => this.flushLogQueue(), this.QUEUE_FLUSH_INTERVAL);
    } else if (!enable && this.queueTimer) {
      clearInterval(this.queueTimer);
      this.queueTimer = null;
    }
  }

  /**
   * Internal logging method
   * @param level - Log level
   * @param message - Message to log
   * @param data - Optional data to include
   */
  private log(level: LogLevel, message: string, data?: any): void {
    // Skip if log level is below current level
    if (level < this.currentLogLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: LogLevel[level],
      message,
      data,
    };

    // Always log to console in development
    if (!environment.production) {
      this.logToConsole(level, message, data);
    }

    // Queue for remote logging if enabled
    if (this.enableRemoteLogging) {
      this.logQueue.push(logEntry);

      // Flush immediately for errors
      if (level === LogLevel.ERROR) {
        this.flushLogQueue();
      }
    }
  }

  /**
   * Log to console with appropriate formatting
   * @param level - Log level
   * @param message - Message to log
   * @param data - Optional data to include
   */
  private logToConsole(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${LogLevel[level]}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data || '');
        break;
      case LogLevel.PERFORMANCE:
        console.info(`${prefix} 📊`, message, data || '');
        break;
      case LogLevel.INTERACTION:
        console.info(`${prefix} 👆`, message, data || '');
        break;
    }
  }

  /**
   * Flush the log queue to remote logging service
   */
  private flushLogQueue(): void {
    if (this.logQueue.length === 0) {
      return;
    }

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    // In a real application, this would send logs to a remote service
    // For now, we'll just log to console in production
    if (environment.production) {
      console.log(`Sending ${logsToSend.length} logs to remote service`);
      // this.httpClient.post('/api/logs', logsToSend).subscribe();
    }
  }
}
