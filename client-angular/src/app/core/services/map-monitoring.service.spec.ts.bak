// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (map-monitoring.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed } from '@angular/core/testing';
import { MapMonitoringService } from './map-monitoring.service';
import { LoggingService } from './logging.service';

describe('MapMonitoringService', () => {
  let service: MapMonitoringService;
  let loggingServiceSpy: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('LoggingService', [
      'logPerformance',
      'logInteraction',
      'logError',
      'logDebug',
    ]);

    TestBed.configureTestingModule({
      providers: [MapMonitoringService, { provide: LoggingService, useValue: spy }],
    });

    service = TestBed.inject(MapMonitoringService);
    loggingServiceSpy = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should track initialization time', () => {
    const time = 150;
    service.trackInitialization(time);
    expect(loggingServiceSpy.logPerformance).toHaveBeenCalledWith('Map initialization', time);
  });

  it('should track render time', () => {
    const time = 50;
    service.trackRender(time);
    expect(loggingServiceSpy.logPerformance).toHaveBeenCalledWith('Map render', time);
  });

  it('should track user interactions', () => {
    const interactionType = 'click';
    const details = { x: 100, y: 200 };
    service.trackInteraction(interactionType, details);
    expect(loggingServiceSpy.logInteraction).toHaveBeenCalledWith('Map', interactionType, details);
  });

  it('should track errors', () => {
    const errorType = 'load_error';
    const details = { message: 'Failed to load map' };
    service.trackError(errorType, details);
    expect(loggingServiceSpy.logError).toHaveBeenCalledWith('Map', errorType, details);
  });

  it('should track marker operations', () => {
    const count = 5;
    const operation = 'add';
    service.trackMarkers(count, operation as any);
    expect(loggingServiceSpy.logDebug).toHaveBeenCalledWith('Map markers', { count, operation });
  });

  it('should track viewport changes', () => {
    const center = { lat: 59.9139, lng: 10.7522 };
    const zoom = 10;
    service.trackViewportChange(center, zoom);
    expect(loggingServiceSpy.logDebug).toHaveBeenCalledWith('Map viewport change', {
      center,
      zoom,
    });
  });

  it('should track location selection', () => {
    const location = { latitude: 59.9139, longitude: 10.7522 };
    service.trackLocationSelection(location);
    expect(loggingServiceSpy.logInteraction).toHaveBeenCalledWith(
      'Map',
      'location_selection',
      location,
    );
  });

  it('should track successful current location usage', () => {
    service.trackCurrentLocation(true);
    expect(loggingServiceSpy.logInteraction).toHaveBeenCalledWith(
      'Map',
      'current_location_success',
    );
  });

  it('should track failed current location usage', () => {
    const error = 'Permission denied';
    service.trackCurrentLocation(false, error);
    expect(loggingServiceSpy.logError).toHaveBeenCalledWith('Map', 'current_location_error', error);
  });

  it('should get metrics', () => {
    // Set some metrics
    service.trackInitialization(100);
    service.trackRender(50);
    service.trackInteraction('click');
    service.trackError('load_error', {});

    // Get metrics
    const metrics = service.getMetrics();

    // Verify metrics
    expect(metrics).toBeDefined();
    expect(metrics.initTime).toBe(100);
    expect(metrics.renderTime).toBe(50);
    expect(metrics.interactionCount).toBe(1);
    expect(metrics.errorCount).toBe(1);
  });

  it('should reset metrics', () => {
    // Set some metrics
    service.trackInitialization(100);
    service.trackRender(50);
    service.trackInteraction('click');

    // Reset metrics
    service.resetMetrics();

    // Get metrics
    const metrics = service.getMetrics();

    // Verify metrics are reset
    expect(metrics.initTime).toBe(0);
    expect(metrics.renderTime).toBe(0);
    expect(metrics.interactionCount).toBe(0);
    expect(metrics.errorCount).toBe(0);
  });
});
