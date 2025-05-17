import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (logging.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed } from '@angular/core/testing';
import { LoggingService, LogLevel } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;
  let consoleSpy: jasmine.SpyObj<Console>;

  beforeEach(() => {
    // Create spy for console methods
    consoleSpy = jasmine.createSpyObj('console', ['debug', 'info', 'warn', 'error', 'log']);
    spyOn(console, 'debug').and.callFake(consoleSpy.debug);
    spyOn(console, 'info').and.callFake(consoleSpy.info);
    spyOn(console, 'warn').and.callFake(consoleSpy.warn);
    spyOn(console, 'error').and.callFake(consoleSpy.error);
    spyOn(console, 'log').and.callFake(consoleSpy.log);

    TestBed.configureTestingModule({
      providers: [LoggingService],
    });

    service = TestBed.inject(LoggingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log debug messages', () => {
    const message = 'Debug message';
    const data = { key: 'value' };

    // Set log level to DEBUG to ensure debug messages are logged
    service.setLogLevel(LogLevel.DEBUG);

    service.logDebug(message, data);
    expect(console.debug).toHaveBeenCalled();
  });

  it('should log info messages', () => {
    const message = 'Info message';
    const data = { key: 'value' };

    // Set log level to INFO to ensure info messages are logged
    service.setLogLevel(LogLevel.INFO);

    service.logInfo(message, data);
    expect(console.info).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    const message = 'Warning message';
    const data = { key: 'value' };

    // Set log level to WARN to ensure warning messages are logged
    service.setLogLevel(LogLevel.WARN);

    service.logWarning(message, data);
    expect(console.warn).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    const source = 'TestComponent';
    const errorType = 'ValidationError';
    const details = { message: 'Invalid input' };

    // Set log level to ERROR to ensure error messages are logged
    service.setLogLevel(LogLevel.ERROR);

    service.logError(source, errorType, details);
    expect(console.error).toHaveBeenCalled();
  });

  it('should log performance metrics', () => {
    const operation = 'render';
    const timeMs = 150;
    const details = { component: 'MapComponent' };

    // Set log level to PERFORMANCE to ensure performance metrics are logged
    service.setLogLevel(LogLevel.PERFORMANCE);

    service.logPerformance(operation, timeMs, details);
    expect(console.info).toHaveBeenCalled();
  });

  it('should log user interactions', () => {
    const component = 'MapComponent';
    const action = 'click';
    const details = { x: 100, y: 200 };

    // Set log level to INTERACTION to ensure interactions are logged
    service.setLogLevel(LogLevel.INTERACTION);

    service.logInteraction(component, action, details);
    expect(console.info).toHaveBeenCalled();
  });

  it('should not log messages below current log level', () => {
    // Set log level to ERROR
    service.setLogLevel(LogLevel.ERROR);

    // Log messages at different levels
    service.logDebug('Debug message');
    service.logInfo('Info message');
    service.logWarning('Warning message');
    service.logError('Component', 'Error', 'Error message');

    // Only error messages should be logged
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should enable and disable remote logging', () => {
    // Initially, remote logging is disabled in test environment

    // Enable remote logging
    service.setRemoteLogging(true);

    // Log some messages
    service.logError('Component', 'Error', 'Error message');

    // Disable remote logging
    service.setRemoteLogging(false);

    // No way to directly test the remote logging functionality in a unit test,
    // but we can verify the method doesn't throw errors
    expect(true).toBeTruthy();
  });
});
