import { Injectable } from '@angular/core';
import { LoggingService } from './logging.service';

/**
 * Service for monitoring map component performance and usage
 *
 * This service tracks various metrics related to map usage:
 * - Initialization time
 * - Render performance
 * - User interactions
 * - Error rates
 *
 * The data is used to optimize the map component and improve user experience.
 */
@Injectable({
  providedIn: 'root',
})
export class MapMonitoringService {
  private metrics: {
    initTime: number;
    renderTime: number;
    interactionCount: number;
    errorCount: number;
    markerCount: number;
    viewportChanges: number;
    locationSelections: number;
    currentLocationUsage: number;
  } = {
    initTime: 0,
    renderTime: 0,
    interactionCount: 0,
    errorCount: 0,
    markerCount: 0,
    viewportChanges: 0,
    locationSelections: 0,
    currentLocationUsage: 0,
  };

  constructor(private loggingService: LoggingService) {}

  /**
   * Track map initialization time
   * @param timeMs - Time in milliseconds to initialize the map
   */
  trackInitialization(timeMs: number): void {
    this.metrics.initTime = timeMs;
    this.loggingService.logPerformance('Map initialization', timeMs);
  }

  /**
   * Track map render time
   * @param timeMs - Time in milliseconds to render the map
   */
  trackRender(timeMs: number): void {
    this.metrics.renderTime = timeMs;
    this.loggingService.logPerformance('Map render', timeMs);
  }

  /**
   * Track user interaction with the map
   * @param interactionType - Type of interaction (click, drag, zoom, etc.)
   * @param details - Additional details about the interaction
   */
  trackInteraction(interactionType: string, details?: any): void {
    this.metrics.interactionCount++;
    this.loggingService.logInteraction('Map', interactionType, details);
  }

  /**
   * Track map errors
   * @param errorType - Type of error
   * @param details - Error details
   */
  trackError(errorType: string, details: any): void {
    this.metrics.errorCount++;
    this.loggingService.logError('Map', errorType, details);
  }

  /**
   * Track marker operations
   * @param count - Number of markers
   * @param operation - Operation type (add, remove, update)
   */
  trackMarkers(count: number, operation: 'add' | 'remove' | 'update'): void {
    this.metrics.markerCount = count;
    this.loggingService.logDebug('Map markers', { count, operation });
  }

  /**
   * Track viewport changes
   * @param center - New center coordinates
   * @param zoom - New zoom level
   */
  trackViewportChange(center: { lat: number; lng: number }, zoom: number): void {
    this.metrics.viewportChanges++;
    this.loggingService.logDebug('Map viewport change', { center, zoom });
  }

  /**
   * Track location selection
   * @param location - Selected location
   */
  trackLocationSelection(location: { latitude: number; longitude: number }): void {
    this.metrics.locationSelections++;
    this.loggingService.logInteraction('Map', 'location_selection', location);
  }

  /**
   * Track current location usage
   * @param success - Whether getting the current location was successful
   * @param error - Error message if unsuccessful
   */
  trackCurrentLocation(success: boolean, error?: string): void {
    this.metrics.currentLocationUsage++;

    if (success) {
      this.loggingService.logInteraction('Map', 'current_location_success');
    } else {
      this.loggingService.logError('Map', 'current_location_error', error);
    }
  }

  /**
   * Get current metrics
   * @returns Current map metrics
   */
  getMetrics(): any {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    Object.keys(this.metrics).forEach((key) => {
      (this.metrics as any)[key] = 0;
    });
  }

  /**
   * Track performance metrics for map operations
   * @param operation - The operation being measured
   * @param timeMs - Time in milliseconds
   * @param details - Additional details
   */
  trackPerformance(operation: string, timeMs: number, details?: any): void {
    this.loggingService.logPerformance(`Map ${operation}`, timeMs, details);
  }
}
