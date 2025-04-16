import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { MapMonitoringService } from '../../../core/services/map-monitoring.service';
import { catchError, of } from 'rxjs';

/**
 * Interface for map markers
 * @property id - Unique identifier for the marker
 * @property latitude - Latitude coordinate
 * @property longitude - Longitude coordinate
 * @property title - Title to display in popup
 * @property description - Description to display in popup
 * @property icon - Optional custom icon name (from assets/icons)
 * @property color - Optional color for the marker (default: blue)
 */
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}

/**
 * Reusable map component using Leaflet
 *
 * This component provides a flexible map interface with the following features:
 * - Display interactive maps with markers
 * - Allow location selection
 * - Show current user location
 * - Custom styling and configuration
 * - Accessibility support
 *
 * @example
 * <app-map
 *   [height]="'400px'"
 *   [initialLatitude]="59.9139"
 *   [initialLongitude]="10.7522"
 *   [initialZoom]="10"
 *   [selectable]="true"
 *   [markers]="mapMarkers"
 *   [showCurrentLocation]="true"
 *   (locationSelected)="onLocationSelected($event)"
 *   (markerClick)="onMarkerClick($event)"
 * ></app-map>
 */
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('map') mapElement?: ElementRef;

  /**
   * Height of the map container (CSS value)
   * @default '400px'
   */
  @Input() height = '400px';

  /**
   * Initial latitude for map center
   * @default 59.9139 (Oslo, Norway)
   */
  @Input() initialLatitude = 59.9139; // Oslo, Norway

  /**
   * Initial longitude for map center
   * @default 10.7522 (Oslo, Norway)
   */
  @Input() initialLongitude = 10.7522; // Oslo, Norway

  /**
   * Initial zoom level
   * @default 6
   */
  @Input() initialZoom = 6;

  /**
   * Array of markers to display on the map
   * @default []
   */
  @Input() markers: MapMarker[] = [];

  /**
   * Whether the map allows location selection via clicking
   * @default false
   */
  @Input() selectable = false;

  /**
   * Whether to show the user's current location on the map
   * @default false
   */
  @Input() showCurrentLocation = false;

  /**
   * Event emitted when a marker is clicked
   * Emits the marker object that was clicked
   */
  @Output() markerClick = new EventEmitter<MapMarker>();

  /**
   * Event emitted when the map is clicked
   * Emits the coordinates of the click
   */
  @Output() mapClick = new EventEmitter<{ latitude: number; longitude: number }>();

  /**
   * Event emitted when a location is selected on the map
   * Emits an object with latitude, longitude, and optional address
   */
  @Output() locationSelected = new EventEmitter<{
    latitude: number;
    longitude: number;
    address?: string;
  }>();

  // Leaflet map instance
  private map: L.Map | null = null;
  private markerLayer: L.LayerGroup | null = null;
  private currentLocationMarker: L.Marker | null = null;
  private selectedLocationMarker: L.Marker | null = null;

  // Tracking state
  private isInitialized = false;
  private keyboardControlActive = false;
  private keyboardControlStep = 0.0001; // Step size for keyboard navigation
  private initStartTime = 0;

  constructor(
    private geocodingService: GeocodingService,
    private mapMonitoringService: MapMonitoringService,
    private ngZone: NgZone
  ) {}

  /**
   * Initialize component
   */
  ngOnInit(): void {
    // Initialize keyboard event listeners for accessibility
    this.setupKeyboardAccessibility();

    // Start tracking initialization time
    this.initStartTime = performance.now();
  }

  /**
   * Initialize the map after the view is initialized
   */
  ngAfterViewInit(): void {
    // Run map initialization outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      this.initMap();
      this.addMarkers();

      if (this.showCurrentLocation) {
        this.showUserLocation();
      }

      // Track initialization time
      const initTime = performance.now() - this.initStartTime;
      this.ngZone.run(() => {
        this.mapMonitoringService.trackInitialization(initTime);
        this.isInitialized = true;
      });
    });
  }

  /**
   * Clean up resources when component is destroyed
   */
  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Remove keyboard event listeners
    this.removeKeyboardAccessibility();
  }

  /**
   * Handle changes to input properties
   * @param changes - SimpleChanges object containing changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    // If markers change, update the map markers
    if (changes['markers'] && !changes['markers'].firstChange && this.isInitialized) {
      this.updateMarkers(this.markers);
    }

    // If showCurrentLocation changes, update current location display
    if (
      changes['showCurrentLocation'] &&
      !changes['showCurrentLocation'].firstChange &&
      this.isInitialized
    ) {
      if (this.showCurrentLocation) {
        this.showUserLocation();
      } else if (this.currentLocationMarker) {
        this.currentLocationMarker.remove();
        this.currentLocationMarker = null;
      }
    }

    // If height changes, refresh the map
    if (changes['height'] && !changes['height'].firstChange && this.isInitialized) {
      setTimeout(() => this.refreshMap(), 100);
    }
  }

  /**
   * Initialize the Leaflet map
   */
  private initMap(): void {
    try {
      // Create map instance with accessibility options
      this.map = L.map('map', {
        center: [this.initialLatitude, this.initialLongitude],
        zoom: this.initialZoom,
        keyboard: true,
        keyboardPanDelta: 80,
        zoomControl: true,
        attributionControl: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      // Create a layer for markers
      this.markerLayer = L.layerGroup().addTo(this.map);

      // Add click handler if selectable
      if (this.selectable) {
        this.map.on('click', (e: L.LeafletMouseEvent) => {
          this.handleMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      // Add keyboard focus handler for accessibility
      const mapContainer = this.map.getContainer();
      mapContainer.setAttribute('tabindex', '0');
      mapContainer.setAttribute('role', 'application');
      mapContainer.setAttribute('aria-label', 'Interactive map');

      // Add screen reader instructions
      const srInstructions = document.createElement('div');
      srInstructions.className = 'sr-only';
      srInstructions.setAttribute('aria-live', 'polite');
      srInstructions.textContent = this.selectable
        ? 'Press Enter to activate keyboard controls. Use arrow keys to navigate the map. Press Space to select a location.'
        : 'Press Enter to activate keyboard controls. Use arrow keys to navigate the map.';
      mapContainer.appendChild(srInstructions);

      // Add focus/blur handlers
      mapContainer.addEventListener('focus', () => {
        mapContainer.classList.add('map-focused');
      });

      mapContainer.addEventListener('blur', () => {
        mapContainer.classList.remove('map-focused');
        this.keyboardControlActive = false;
      });

      // Add keyboard handler for Enter key to activate keyboard navigation
      mapContainer.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          this.keyboardControlActive = !this.keyboardControlActive;
          srInstructions.textContent = this.keyboardControlActive
            ? 'Keyboard controls activated. Use arrow keys to navigate. Press Space to select location.'
            : 'Keyboard controls deactivated. Press Enter to activate.';
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  /**
   * Handle map click events
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   */
  private handleMapClick(latitude: number, longitude: number): void {
    if (!this.selectable || !this.map) return;

    // Track interaction
    this.mapMonitoringService.trackInteraction('map_click', { latitude, longitude });

    // Emit map click event
    this.ngZone.run(() => {
      this.mapClick.emit({ latitude, longitude });
    });

    // Add a marker at the clicked location
    this.setSelectedLocation(latitude, longitude);

    // Get address information for the clicked location
    this.geocodingService
      .reverseGeocode(longitude, latitude)
      .pipe(
        catchError(error => {
          console.error('Error getting address information:', error);
          this.mapMonitoringService.trackError('geocoding_error', error);
          return of(null);
        })
      )
      .subscribe(result => {
        this.ngZone.run(() => {
          if (result) {
            this.locationSelected.emit({
              latitude,
              longitude,
              address: result.address,
            });

            // Track location selection with address
            this.mapMonitoringService.trackLocationSelection({
              latitude,
              longitude,
              address: result.address,
            });
          } else {
            this.locationSelected.emit({
              latitude,
              longitude,
            });

            // Track location selection without address
            this.mapMonitoringService.trackLocationSelection({
              latitude,
              longitude,
            });
          }
        });
      });
  }

  /**
   * Add markers to the map
   */
  private addMarkers(): void {
    if (!this.map || !this.markerLayer) return;

    const startTime = performance.now();

    // Clear existing markers
    this.markerLayer.clearLayers();

    // Add markers
    this.markers.forEach(marker => {
      const icon = this.createMarkerIcon(marker.color || 'blue', marker.icon);

      const leafletMarker = L.marker([marker.latitude, marker.longitude], {
        icon,
        keyboard: true, // Enable keyboard navigation
        title: marker.title, // For accessibility
      }).addTo(this.markerLayer!);

      // Add popup if title is provided
      if (marker.title) {
        const popupContent = `
          <div>
            <h4>${marker.title}</h4>
            ${marker.description ? `<p>${marker.description}</p>` : ''}
          </div>
        `;
        leafletMarker.bindPopup(popupContent);
      }

      // Add click handler
      leafletMarker.on('click', () => {
        // Track marker click
        this.mapMonitoringService.trackInteraction('marker_click', {
          id: marker.id,
          title: marker.title,
        });

        // Emit event in Angular zone
        this.ngZone.run(() => {
          this.markerClick.emit(marker);
        });
      });

      // Add keyboard handler for accessibility
      leafletMarker.on('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          // Track marker keyboard activation
          this.mapMonitoringService.trackInteraction('marker_keyboard_activation', {
            id: marker.id,
            title: marker.title,
            key: e.key,
          });

          // Emit event in Angular zone
          this.ngZone.run(() => {
            this.markerClick.emit(marker);
          });
        }
      });
    });

    // Fit bounds if there are markers
    if (this.markers.length > 0) {
      const bounds = L.latLngBounds(
        this.markers.map(marker => [marker.latitude, marker.longitude])
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Track marker rendering performance
    const renderTime = performance.now() - startTime;
    this.mapMonitoringService.trackRender(renderTime);
    this.mapMonitoringService.trackMarkers(this.markers.length, 'update');
  }

  /**
   * Create a marker icon
   * @param color - Color name for the marker
   * @param iconName - Optional custom icon name
   * @returns Leaflet Icon instance
   */
  private createMarkerIcon(color: string, iconName?: string): L.Icon {
    // Default icon
    const iconUrl = iconName
      ? `assets/icons/${iconName}.png`
      : `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`;

    return L.icon({
      iconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  /**
   * Show the user's current position on the map
   */
  private showUserLocation(): void {
    if (!this.map) return;

    if (navigator.geolocation) {
      const startTime = performance.now();

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;

          // Create a marker for the current location
          if (this.currentLocationMarker) {
            this.currentLocationMarker.remove();
          }

          const icon = L.divIcon({
            className: 'current-location-marker',
            html: '<div class="pulse" role="presentation" aria-label="Your current location"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          this.currentLocationMarker = L.marker([latitude, longitude], {
            icon,
            keyboard: true,
            title: 'Your current location', // For accessibility
          })
            .addTo(this.map!)
            .bindPopup('<strong>Your current location</strong>');

          // Center the map on the current location
          this.map.setView([latitude, longitude], 13);

          // Announce to screen readers
          this.announceToScreenReader('Current location detected and displayed on the map');

          // Track successful geolocation
          const geolocateTime = performance.now() - startTime;
          this.mapMonitoringService.trackCurrentLocation(true);
          this.mapMonitoringService.trackPerformance('geolocation', geolocateTime);

          // Track viewport change
          this.mapMonitoringService.trackViewportChange({ lat: latitude, lng: longitude }, 13);
        },
        error => {
          console.error('Error getting current location:', error);

          // Handle specific error cases
          let errorMessage = 'Unable to determine your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          // Show error as popup on map
          if (this.map) {
            const popup = L.popup()
              .setLatLng([this.map.getCenter().lat, this.map.getCenter().lng])
              .setContent(`<p class="error-message">${errorMessage}</p>`)
              .openOn(this.map);

            // Auto-close popup after 5 seconds
            setTimeout(() => {
              this.map?.closePopup(popup);
            }, 5000);
          }

          // Announce to screen readers
          this.announceToScreenReader(errorMessage);

          // Track geolocation error
          this.mapMonitoringService.trackCurrentLocation(false, errorMessage);
          this.mapMonitoringService.trackError('geolocation_error', {
            code: error.code,
            message: errorMessage,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      const errorMessage = 'Geolocation is not supported by your browser';
      console.error(errorMessage);
      this.announceToScreenReader(errorMessage);

      // Track geolocation not supported error
      this.mapMonitoringService.trackCurrentLocation(false, errorMessage);
      this.mapMonitoringService.trackError('geolocation_not_supported', {
        message: errorMessage,
      });
    }
  }

  /**
   * Set up keyboard accessibility features
   */
  private setupKeyboardAccessibility(): void {
    document.addEventListener('keydown', this.handleKeyboardNavigation);
  }

  /**
   * Remove keyboard accessibility event listeners
   */
  private removeKeyboardAccessibility(): void {
    document.removeEventListener('keydown', this.handleKeyboardNavigation);
  }

  /**
   * Handle keyboard navigation events
   */
  private handleKeyboardNavigation = (e: KeyboardEvent): void => {
    if (!this.map || !this.keyboardControlActive) return;

    // Only handle events when map is focused
    const mapContainer = this.map.getContainer();
    if (document.activeElement !== mapContainer) return;

    const center = this.map.getCenter();
    let lat = center.lat;
    let lng = center.lng;
    let handled = false;

    // Adjust step size based on zoom level
    const zoomFactor = Math.pow(2, 16 - this.map.getZoom());
    const step = this.keyboardControlStep * zoomFactor;

    switch (e.key) {
      case 'ArrowUp':
        lat += step;
        handled = true;
        break;
      case 'ArrowDown':
        lat -= step;
        handled = true;
        break;
      case 'ArrowLeft':
        lng -= step;
        handled = true;
        break;
      case 'ArrowRight':
        lng += step;
        handled = true;
        break;
      case ' ': // Space key
        if (this.selectable) {
          this.handleMapClick(lat, lng);
          this.announceToScreenReader(
            `Location selected at latitude ${lat.toFixed(6)}, longitude ${lng.toFixed(6)}`
          );
          handled = true;
        }
        break;
      case '+':
        this.map.zoomIn();
        this.announceToScreenReader(`Zoomed in to level ${this.map.getZoom()}`);
        handled = true;
        break;
      case '-':
        this.map.zoomOut();
        this.announceToScreenReader(`Zoomed out to level ${this.map.getZoom()}`);
        handled = true;
        break;
    }

    if (handled) {
      e.preventDefault();

      if (e.key !== ' ' && e.key !== '+' && e.key !== '-') {
        this.map.panTo([lat, lng]);
      }
    }
  };

  /**
   * Announce a message to screen readers
   * @param message - Message to announce
   */
  private announceToScreenReader(message: string): void {
    if (!this.map) return;

    const mapContainer = this.map.getContainer();
    const srAnnouncer = mapContainer.querySelector('.sr-only');

    if (srAnnouncer) {
      srAnnouncer.textContent = message;
    } else {
      const newAnnouncer = document.createElement('div');
      newAnnouncer.className = 'sr-only';
      newAnnouncer.setAttribute('aria-live', 'polite');
      newAnnouncer.textContent = message;
      mapContainer.appendChild(newAnnouncer);
    }
  }

  // Public methods

  /**
   * Update the markers on the map
   * @param markers - Array of MapMarker objects to display
   */
  updateMarkers(markers: MapMarker[]): void {
    const startTime = performance.now();

    this.markers = markers;
    this.addMarkers();

    // Track marker update performance
    const updateTime = performance.now() - startTime;
    this.mapMonitoringService.trackPerformance('update_markers', updateTime, {
      markerCount: markers.length,
    });
  }

  /**
   * Set the selected location on the map
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   */
  setSelectedLocation(latitude: number, longitude: number): void {
    if (!this.map) return;

    // Remove existing marker if any
    if (this.selectedLocationMarker) {
      this.selectedLocationMarker.remove();
    }

    // Create a new marker
    const icon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.selectedLocationMarker = L.marker([latitude, longitude], {
      icon,
      keyboard: true,
      title: 'Selected location', // For accessibility
    }).addTo(this.map).bindPopup(`
        <strong>Selected Location</strong><br>
        Latitude: ${latitude.toFixed(6)}<br>
        Longitude: ${longitude.toFixed(6)}
      `);

    // Announce to screen readers
    this.announceToScreenReader(
      `Location selected at latitude ${latitude.toFixed(6)}, longitude ${longitude.toFixed(6)}`
    );

    // Track location selection
    this.mapMonitoringService.trackInteraction('location_selected', {
      latitude,
      longitude,
      method: 'direct',
    });
  }

  /**
   * Center the map on a specific location
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param zoom - Optional zoom level
   */
  centerMap(latitude: number, longitude: number, zoom?: number): void {
    if (!this.map) return;

    const zoomLevel = zoom !== undefined ? zoom : this.map.getZoom();

    // Track viewport change before animation
    this.mapMonitoringService.trackViewportChange({ lat: latitude, lng: longitude }, zoomLevel);

    // Animate to new location
    this.map.flyTo([latitude, longitude], zoomLevel, {
      duration: 1, // Animation duration in seconds
    });

    // Track interaction
    this.mapMonitoringService.trackInteraction('center_map', {
      latitude,
      longitude,
      zoom: zoomLevel,
    });
  }

  /**
   * Refresh the map (useful when container size changes)
   */
  refreshMap(): void {
    if (!this.map) return;

    const startTime = performance.now();

    // Force map to recalculate its size
    setTimeout(() => {
      this.map?.invalidateSize();

      // Track refresh performance
      const refreshTime = performance.now() - startTime;
      this.mapMonitoringService.trackPerformance('refresh_map', refreshTime);
    }, 100);
  }
}
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { GeocodingService } from '../../../core/services/geocoding.service';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() height = '400px';
  @Input() initialLatitude = 59.9139; // Oslo
  @Input() initialLongitude = 10.7522; // Oslo
  @Input() initialZoom = 6;
  @Input() markers: MapMarker[] = [];
  @Input() selectable = false;
  @Input() showCurrentLocation = false;

  @Output() markerClick = new EventEmitter<MapMarker>();
  @Output() mapClick = new EventEmitter<{ latitude: number; longitude: number }>();
  @Output() locationSelected = new EventEmitter<{
    latitude: number;
    longitude: number;
    address?: string;
  }>();

  private map: L.Map | null = null;
  private markerLayer: L.LayerGroup | null = null;
  private currentLocationMarker: L.Marker | null = null;
  private selectedLocationMarker: L.Marker | null = null;

  constructor(private geocodingService: GeocodingService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
    this.addMarkers();

    if (this.showCurrentLocation) {
      this.showUserLocation();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Create the map
    this.map = L.map('map', {
      center: [this.initialLatitude, this.initialLongitude],
      zoom: this.initialZoom,
    });

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Create a layer for markers
    this.markerLayer = L.layerGroup().addTo(this.map);

    // Add click handler if selectable
    if (this.selectable) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const latlng = e.latlng;
        this.mapClick.emit({ latitude: latlng.lat, longitude: latlng.lng });

        // Add a marker at the clicked location
        this.setSelectedLocation(latlng.lat, latlng.lng);

        // Get address information for the clicked location
        this.geocodingService.reverseGeocode(latlng.lng, latlng.lat).subscribe(result => {
          if (result) {
            this.locationSelected.emit({
              latitude: latlng.lat,
              longitude: latlng.lng,
              address: result.address,
            });
          } else {
            this.locationSelected.emit({
              latitude: latlng.lat,
              longitude: latlng.lng,
            });
          }
        });
      });
    }
  }

  private addMarkers(): void {
    if (!this.map || !this.markerLayer) return;

    // Clear existing markers
    this.markerLayer.clearLayers();

    // Add markers
    this.markers.forEach(marker => {
      const icon = this.createMarkerIcon(marker.color || 'blue', marker.icon);

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon }).addTo(
        this.markerLayer!
      );

      // Add popup if title is provided
      if (marker.title) {
        const popupContent = `
          <div>
            <h4>${marker.title}</h4>
            ${marker.description ? `<p>${marker.description}</p>` : ''}
          </div>
        `;
        leafletMarker.bindPopup(popupContent);
      }

      // Add click handler
      leafletMarker.on('click', () => {
        this.markerClick.emit(marker);
      });
    });

    // Fit bounds if there are markers
    if (this.markers.length > 0) {
      const bounds = L.latLngBounds(
        this.markers.map(marker => [marker.latitude, marker.longitude])
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  private createMarkerIcon(color: string, iconName?: string): L.Icon {
    // Default icon
    const iconUrl = iconName
      ? `assets/icons/${iconName}.png`
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png';

    return L.icon({
      iconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  private showUserLocation(): void {
    if (!this.map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;

          // Create a marker for the current location
          if (this.currentLocationMarker) {
            this.currentLocationMarker.remove();
          }

          const icon = L.divIcon({
            className: 'current-location-marker',
            html: '<div class="pulse"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          this.currentLocationMarker = L.marker([latitude, longitude], { icon })
            .addTo(this.map!)
            .bindPopup('Your current location');

          // Center the map on the current location
          this.map.setView([latitude, longitude], 13);
        },
        error => {
          console.error('Error getting current location:', error);
        }
      );
    }
  }

  // Public methods

  /**
   * Update the markers on the map
   * @param markers New markers to display
   */
  updateMarkers(markers: MapMarker[]): void {
    this.markers = markers;
    this.addMarkers();
  }

  /**
   * Set the selected location on the map
   * @param latitude Latitude
   * @param longitude Longitude
   */
  setSelectedLocation(latitude: number, longitude: number): void {
    if (!this.map) return;

    // Remove existing marker if any
    if (this.selectedLocationMarker) {
      this.selectedLocationMarker.remove();
    }

    // Create a new marker
    const icon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.selectedLocationMarker = L.marker([latitude, longitude], { icon })
      .addTo(this.map)
      .bindPopup('Selected location');
  }

  /**
   * Center the map on a specific location
   * @param latitude Latitude
   * @param longitude Longitude
   * @param zoom Zoom level
   */
  centerMap(latitude: number, longitude: number, zoom?: number): void {
    if (!this.map) return;

    this.map.setView([latitude, longitude], zoom || this.map.getZoom());
  }

  /**
   * Refresh the map (useful when container size changes)
   */
  refreshMap(): void {
    if (!this.map) return;

    this.map.invalidateSize();
  }
}
