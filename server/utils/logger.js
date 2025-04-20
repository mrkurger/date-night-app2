/**
 * Centralized logging utility
 * Provides structured logging with different log levels
 */

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for logger settings
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// ===================================================
import winston from 'winston';
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Get current directory (works in both CommonJS and ES modules)
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${level}]: ${message} ${metaString}`;
});

// Define log format for file output
const fileFormat = combine(timestamp(), json());

// Create file transport for error logs
const errorFileTransport = new transports.DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// Create file transport for combined logs
const combinedFileTransport = new transports.DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// Create console transport
const consoleTransport = new transports.Console({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
});

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'date-night-api' },
  transports: [consoleTransport, errorFileTransport, combinedFileTransport],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new transports.File({ filename: path.join(logsDir, 'exceptions.log') }),
    consoleTransport,
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logsDir, 'rejections.log') }),
    consoleTransport,
  ],
  exitOnError: false,
});

// Add request logger middleware
const requestLogger = (req, res, next) => {
  // Skip logging for static files and health checks
  if (req.path.startsWith('/uploads') || req.path === '/api/v1/health') {
    return next();
  }

  const start = Date.now();

  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, `${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      correlationId: req.correlationId,
    });
  });

  next();
};

export { logger, requestLogger };
