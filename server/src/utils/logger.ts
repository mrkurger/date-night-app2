/**
 * Logger utility for the date-night-app
 * Provides consistent logging throughout the application
 */

/**
 * Log levels
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

/**
 * Logger interface
 */
interface Logger {
  error(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  http(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}

/**
 * Simple console-based logger
 * In a real application, this would be replaced with a more robust logger
 * such as Winston or Pino
 */
class ConsoleLogger implements Logger {
  private readonly level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };

    return levels[messageLevel] <= levels[this.level];
  }

  private formatMessage(message: string, meta?: Record<string, any>): string {
    if (!meta) return message;
    try {
      return `${message} ${JSON.stringify(meta)}`;
    } catch (e) {
      return `${message} [Error serializing metadata]`;
    }
  }

  error(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      console.error(`❌ ERROR: ${this.formatMessage(message, meta)}`);
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ WARNING: ${this.formatMessage(message, meta)}`);
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.info(`ℹ️ INFO: ${this.formatMessage(message, meta)}`);
    }
  }

  http(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('http')) {
      console.log(`🌐 HTTP: ${this.formatMessage(message, meta)}`);
    }
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.debug(`🔍 DEBUG: ${this.formatMessage(message, meta)}`);
    }
  }
}

// Determine log level from environment variables
const getLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && ['error', 'warn', 'info', 'http', 'debug'].includes(envLevel)) {
    return envLevel as LogLevel;
  }

  // Default log level based on environment
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

// Create and export the logger instance
export const logger = new ConsoleLogger(getLogLevel());
