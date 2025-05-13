import { Input } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (location-matching.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NbButtonModule,
  NbCardModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbIconModule,
  NbSpinnerModule,
  NbDatepickerModule,
  NbTooltipModule,
} from '@nebular/theme';
import { MapComponent } from '../../shared/components/map/map.component';
import { GeocodingService } from '../../core/services/geocoding.service';
import { LocationService } from '../../core/services/location.service';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  Observable,
  Subscription,
  catchError,
  finalize,
  of,
  distinctUntilChanged,
  take,
  map,
} from 'rxjs';
import { NorwayCity, NorwayCounty } from '../../core/constants/norway-locations';
import { ClusterModule } from '../../shared/modules/cluster/cluster.module';

interface LocationMatchResult {
  _id: string;
  title: string;
  description: string;
  distance: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  city: string;
  county: string;
  imageUrl?: string;
  rating?: number;
  availableDates?: Date[];
}

@Component({
  selector: 'app-location-matching',
  templateUrl: './location-matching.component.html',
  styleUrls: ['./location-matching.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NbButtonModule,
    NbCardModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    NbDatepickerModule,
    NbTooltipModule,
    MapComponent,
  ],
})
export class LocationMatchingComponent implements OnInit, OnDestroy {
  searchForm: FormGroup;
  loading = false;
  results: LocationMatchResult[] = [];
  counties: string[] = [];
  cities: NorwayCity[] = [];
  filteredCities: NorwayCity[] = [];
  selectedLocation: { latitude: number; longitude: number; address?: string } | null = null;
  mapMarkers: any[] = [];
  markerCluster: any = null;
  selectedDateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
  locationSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private adService: AdService,
    private geocodingService: GeocodingService,
    private locationService: LocationService,
    private notificationService: NotificationService,
  ) {
    this.searchForm = this.fb.group({
      location: this.fb.group({
        city: ['', Validators.required],
        county: ['', Validators.required],
        country: ['Norway'],
        coordinates: [null],
      }),
      radius: [25, [Validators.required, Validators.min(1), Validators.max(500)]],
      categories: [[]],
      useCurrentLocation: [false],
      dateRange: this.fb.group({
        start: [null],
        end: [null],
      }),
    });
  }

  // Map configuration
  mapConfig = {
    showHeatmap: false,
    enableClustering: true,
  };

  // Reference to the map component
  mapComponent: any;

  ngOnInit(): void {
    this.loadLocations();

    // Listen for county changes to update cities
    this.searchForm.get('location.county')?.valueChanges.subscribe((county) => {
      if (county) {
        this.loadCitiesByCounty(county);
      }
    });

    // Listen for city changes to update coordinates
    this.searchForm.get('location.city')?.valueChanges.subscribe((city) => {
      if (city && typeof city === 'string') {
        this.updateCityCoordinates(city);
      }
    });

    // Listen for useCurrentLocation changes
    this.searchForm.get('useCurrentLocation')?.valueChanges.subscribe((useCurrentLocation) => {
      if (useCurrentLocation) {
        this.startLocationMonitoring();
      } else {
        this.stopLocationMonitoring();
      }
    });

    // Monitor date range changes
    this.searchForm.get('dateRange')?.valueChanges.subscribe((range) => {
      if (range.start && range.end) {
        this.selectedDateRange = range;
        this.updateMatches();
      }
    });
  }

  loadLocations(): void {
    // Load counties
    this.locationService.getCounties().subscribe((counties) => {
      this.counties = counties;
    });
  }

  loadCitiesByCounty(county: string): void {
    this.locationService.getCitiesByCounty(county).subscribe((cities) => {
      this.cities = cities;
      this.filteredCities = cities;
    });
  }

  updateCityCoordinates(city: string): void {
    const county = this.searchForm.get('location.county')?.value;
    if (!county) return;

    this.locationService.getCityCoordinates(city).subscribe((coordinates) => {
      if (coordinates) {
        this.searchForm.get('location.coordinates')?.setValue(coordinates);
        this.selectedLocation = {
          latitude: coordinates[1],
          longitude: coordinates[0],
        };
        this.updateMapMarkers();
      } else {
        // If coordinates not found in local database, try geocoding
        this.geocodingService.geocodeLocation(city, county).subscribe((result) => {
          if (result && result.coordinates) {
            this.searchForm.get('location.coordinates')?.setValue(result.coordinates);
            this.selectedLocation = {
              latitude: result.coordinates[1],
              longitude: result.coordinates[0],
            };
            this.updateMapMarkers();
          }
        });
      }
    });
  }

  startLocationMonitoring(): void {
    if (!navigator.geolocation) {
      this.notificationService.error('Geolocation is not supported by your browser');
      this.searchForm.get('useCurrentLocation')?.setValue(false);
      return;
    }

    this.locationSubscription = new Observable<GeolocationPosition>((observer) => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => observer.next(position),
        (error) => observer.error(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    })
      .pipe(
        // Only emit when location has changed significantly (> 100m)
        distinctUntilChanged((prev, curr) => {
          const distance = this.calculateDistance(
            prev.coords.latitude,
            prev.coords.longitude,
            curr.coords.latitude,
            curr.coords.longitude,
          );
          return distance < 0.1; // 100 meters
        }),
      )
      .subscribe({
        next: (position) => {
          const { latitude, longitude } = position.coords;
          this.updateLocation(latitude, longitude);
          this.checkForNearbyMatches(latitude, longitude);
        },
        error: (error) => this.handleLocationError(error),
      });
  }

  stopLocationMonitoring(): void {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
      this.locationSubscription = null;
    }
  }

  checkForNearbyMatches(latitude: number, longitude: number): void {
    const radius = this.searchForm.get('radius')?.value || 25;
    this.searchLocationMatches(longitude, latitude, radius)
      .pipe(take(1))
      .subscribe((matches) => {
        const newMatches = matches.filter(
          (match) => !this.results.find((r) => r._id === match._id),
        );
        if (newMatches.length > 0) {
          this.notificationService.info(`Found ${newMatches.length} new matches nearby!`);
          this.results = [...this.results, ...newMatches];
          this.updateMapMarkers();
        }
      });
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  updateLocation(latitude: number, longitude: number): void {
    this.searchForm.get('location.coordinates')?.setValue([longitude, latitude]);
    this.selectedLocation = { latitude, longitude };
    this.geocodingService.reverseGeocode(longitude, latitude).subscribe((result) => {
      if (result) {
        this.searchForm.get('location.city')?.setValue(result.city);
        this.searchForm.get('location.county')?.setValue(result.county);
        this.selectedLocation = {
          latitude,
          longitude,
          address: result.address,
        };
      }
    });
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.notificationService.error('Geolocation is not supported by your browser');
      this.searchForm.get('useCurrentLocation')?.setValue(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Update form with coordinates
        this.searchForm.get('location.coordinates')?.setValue([longitude, latitude]);
        this.selectedLocation = { latitude, longitude };

        // Get city and county from coordinates
        this.geocodingService.reverseGeocode(longitude, latitude).subscribe((result) => {
          if (result) {
            this.searchForm.get('location.city')?.setValue(result.city);
            this.searchForm.get('location.county')?.setValue(result.county);
            this.searchForm.get('location.country')?.setValue(result.country || 'Norway');
            this.selectedLocation = {
              latitude,
              longitude,
              address: result.address,
            };
            this.updateMapMarkers();
          }
        });
      },
      (error) => {
        this.searchForm.get('useCurrentLocation')?.setValue(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.notificationService.error('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            this.notificationService.error('Location information is unavailable');
            break;
          case error.TIMEOUT:
            this.notificationService.error('Location request timed out');
            break;
          default:
            this.notificationService.error('An unknown error occurred');
            break;
        }
      },
    );
  }

  onMapLocationSelected(location: { latitude: number; longitude: number; address?: string }): void {
    this.selectedLocation = location;

    // Update form with selected location
    const coordinates: [number, number] = [location.longitude, location.latitude];
    this.searchForm.get('location.coordinates')?.setValue(coordinates);

    // Try to get city and county information
    this.geocodingService
      .reverseGeocode(location.longitude, location.latitude)
      .subscribe((result) => {
        if (result) {
          this.searchForm.get('location.city')?.setValue(result.city);
          this.searchForm.get('location.county')?.setValue(result.county);
          this.searchForm.get('location.country')?.setValue(result.country || 'Norway');
        }
      });

    this.updateMapMarkers();
  }

  updateMapMarkers(): void {
    this.mapMarkers = [];

    if (this.selectedLocation) {
      this.mapMarkers.push({
        id: 'selected-location',
        latitude: this.selectedLocation.latitude,
        longitude: this.selectedLocation.longitude,
        title: 'Selected Location',
        description: this.selectedLocation.address || 'Your search location',
        color: 'blue',
        icon: 'location_on',
        tooltip: 'Your selected search location',
      });
    }

    // Add result markers with clustering
    this.results.forEach((result) => {
      if (result.location && result.location.coordinates) {
        this.mapMarkers.push({
          id: result._id,
          latitude: result.location.coordinates[1],
          longitude: result.location.coordinates[0],
          title: result.title,
          description: `${result.city}, ${result.county} (${this.formatDistance(result.distance)})`,
          color: 'red',
          icon: 'place',
          tooltip: `${result.title}\n${this.formatDistance(result.distance)} away`,
          cluster: true,
          rating: result.rating,
        });
      }
    });
  }

  onMapControlClick(action: string): void {
    switch (action) {
      case 'locate':
        this.getCurrentLocation();
        break;
      case 'heatmap':
        this.mapConfig.showHeatmap = !this.mapConfig.showHeatmap;
        this.updateMapMarkers();
        break;
      case 'clusters':
        this.mapConfig.enableClustering = !this.mapConfig.enableClustering;
        this.updateMapMarkers();
        break;
    }
  }

  onClusterClick(cluster: any): void {
    const bounds = this.calculateClusterBounds(cluster.markers);
    this.mapComponent.fitBounds(bounds);
  }

  private calculateClusterBounds(markers: any[]): any {
    // Calculate the bounding box for a group of markers
    const lats = markers.map((m) => m.latitude);
    const lngs = markers.map((m) => m.longitude);
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.searchForm.controls).forEach((key) => {
        const control = this.searchForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValue = this.searchForm.value;
    const coordinates = formValue.location.coordinates;

    if (!coordinates) {
      this.notificationService.error('Location coordinates are required');
      return;
    }

    this.loading = true;

    this.searchLocationMatches(
      coordinates[0],
      coordinates[1],
      formValue.radius,
      formValue.categories,
    )
      .pipe(
        catchError((error) => {
          this.notificationService.error('Failed to find location matches');
          console.error('Error searching for location matches:', error);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((results) => {
        this.results = results;
        this.updateMapMarkers();

        if (results.length === 0) {
          this.notificationService.info('No matches found for your search criteria');
        }
      });
  }

  /**
   * Search for location matches based on coordinates and radius
   * @param longitude Longitude coordinate
   * @param latitude Latitude coordinate
   * @param radius Search radius in kilometers
   * @param categories Optional categories to filter by
   * @returns Observable of location match results
   */
  searchLocationMatches(
    longitude: number,
    latitude: number,
    radius: number,
    categories?: string[],
  ): Observable<LocationMatchResult[]> {
    this.loading = true;
    return categories
      ? this.adService.searchByLocation(longitude, latitude, radius, categories)
      : this.locationService.findNearestCity(longitude, latitude).pipe(
          map((result) =>
            result
              ? [
                  {
                    ...result,
                    _id: '',
                    title: '',
                    description: '',
                    location: { type: '', coordinates: [longitude, latitude] },
                    imageUrl: '',
                    rating: 0,
                    availableDates: [],
                    city: result.city,
                    county: result.county,
                    distance: result.distance,
                  },
                ]
              : [],
          ),
          catchError((error) => {
            this.notificationService.error('Error searching for locations');
            console.error('Location search error:', error);
            return of([]);
          }),
          finalize(() => {
            this.loading = false;
          }),
        );
  }

  clearSearch(): void {
    this.searchForm.reset({
      location: {
        country: 'Norway',
      },
      radius: 25,
      categories: [],
      useCurrentLocation: false,
    });
    this.results = [];
    this.selectedLocation = null;
    this.updateMapMarkers();
  }

  /**
   * Format distance for display
   * @param distance Distance in kilometers
   * @returns Formatted distance string
   */
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  }

  /**
   * Handle marker click events on the map
   * @param marker The marker that was clicked
   */
  onMarkerClick(marker: any): void {
    if (marker.id === 'selected-location') {
      return;
    }

    const result = this.results.find((r) => r._id === marker.id);
    if (result) {
      // Highlight result in list
      const resultElement = document.getElementById(`result-${result._id}`);
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        resultElement.classList.add('highlight');
        setTimeout(() => resultElement.classList.remove('highlight'), 2000);
      }

      // Show detailed info in tooltip
      this.notificationService.info(
        `${result.title}\n${result.description}\nRating: ${result.rating || 'N/A'}\n${this.formatDistance(result.distance)} away`,
        'View Details',
      );
    }
  }

  onMapIdle(event: any): void {
    const bounds = event.bounds;
    if (bounds && this.selectedLocation) {
      // Update search if viewport changed significantly
      const center = {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2,
      };
      const distance = this.calculateDistance(
        center.lat,
        center.lng,
        this.selectedLocation.latitude,
        this.selectedLocation.longitude,
      );
      if (distance > this.searchForm.get('radius')?.value) {
        this.searchForm.patchValue({
          location: {
            coordinates: [center.lng, center.lat],
          },
        });
        this.onSearch();
      }
    }
  }

  /**
   * Update matches based on current search criteria
   */
  updateMatches(): void {
    if (!this.selectedLocation) {
      return;
    }

    const { latitude, longitude } = this.selectedLocation;
    const radius = this.searchForm.get('radius')?.value || 25;

    this.searchLocationMatches(longitude, latitude, radius).subscribe((matches) => {
      this.results = matches;
      this.updateMapMarkers();
    });
  }

  /**
   * Handle location errors
   */
  handleLocationError(error: GeolocationPositionError): void {
    this.searchForm.get('useCurrentLocation')?.setValue(false);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.notificationService.error('Location permission denied');
        break;
      case error.POSITION_UNAVAILABLE:
        this.notificationService.error('Location information is unavailable');
        break;
      case error.TIMEOUT:
        this.notificationService.error('Location request timed out');
        break;
      default:
        this.notificationService.error('An unknown error occurred');
        break;
    }
  }

  // Methods moved to avoid duplication

  /**
   * Fit map to bounds
   */
  fitMapToBounds(): void {
    if (this.mapMarkers.length === 0) return;

    const bounds = {
      north: Math.max(...this.mapMarkers.map((m) => m.latitude)),
      south: Math.min(...this.mapMarkers.map((m) => m.latitude)),
      east: Math.max(...this.mapMarkers.map((m) => m.longitude)),
      west: Math.min(...this.mapMarkers.map((m) => m.longitude)),
    };

    this.mapComponent.fitBounds(bounds);
  }

  ngOnDestroy(): void {
    this.stopLocationMonitoring();
  }
}
