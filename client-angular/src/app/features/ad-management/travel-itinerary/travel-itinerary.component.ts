// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (travel-itinerary.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TravelService, TravelItinerary } from '../../../core/services/travel.service';
import { AdService } from '../../../core/services/ad.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap, switchMap, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  MapComponent,
  MapMarker as ComponentMapMarker,
} from '../../../shared/components/map/map.component';
import { LocationService } from '../../../core/services/location.service';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { NorwayCity, NorwayCounty } from '../../../core/constants/norway-locations';
import { MapService, MapMarker as ServiceMapMarker } from '../../../core/services/map.service';

@Component({
  selector: 'app-travel-itinerary',
  templateUrl: './travel-itinerary.component.html',
  styleUrls: ['./travel-itinerary.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MapComponent,
  ],
})
export class TravelItineraryComponent implements OnInit {
  @ViewChild('itineraryMap') itineraryMap?: MapComponent;
  @ViewChild('locationMap') locationMap?: MapComponent;

  adId: string;
  itineraryForm: FormGroup;
  itineraries: TravelItinerary[] = [];
  loading = false;
  submitting = false;
  editMode = false;
  currentItineraryId: string | null = null;

  // For custom tabs implementation
  activeTab = 0; // Default to first tab

  /**
   * Returns active itineraries filtered from the main itineraries array
   * Used in template to avoid filter operations in template bindings
   */
  getActiveItineraries(): TravelItinerary[] {
    return this.itineraries.filter((i) => i.status === 'active');
  }

  // For location tracking
  trackingLocation = false;
  currentPosition: { longitude: number; latitude: number } | null = null;

  /**
   * Handles tab change events
   * @param event The tab change event with index property
   */
  onTabChange(event: { index: number } | any): void {
    this.activeTab = event.index;

    // Update maps when switching to map tabs
    setTimeout(() => {
      if (event.index === 0 && this.locationMap) {
        this.locationMap.refreshMap();
      } else if ((event.index === 2 || event.index === 3) && this.itineraryMap) {
        this.itineraryMap.refreshMap();
      }
    }, 100);
  }

  // For map
  mapMarkers: ComponentMapMarker[] = [];
  selectedLocation: { latitude: number; longitude: number; address?: string } | null = null;

  // For location selection
  counties: string[] = [];
  cities: NorwayCity[] = [];
  filteredCities: NorwayCity[] = [];

  // View state
  showMap = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private travelService: TravelService,
    private adService: AdService,
    private notificationService: NotificationService,
    private locationService: LocationService,
    private geocodingService: GeocodingService,
    private mapService: MapService,
    private snackBar: MatSnackBar,
  ) {
    this.adId = this.route.snapshot.paramMap.get('id') || '';

    this.itineraryForm = this.fb.group({
      destination: this.fb.group({
        city: ['', [Validators.required]],
        county: ['', [Validators.required]],
        country: ['Norway'],
        location: this.fb.group({
          type: ['Point'],
          coordinates: [null],
        }),
      }),
      arrivalDate: [null, [Validators.required]],
      departureDate: [null, [Validators.required]],
      accommodation: this.fb.group({
        name: [''],
        address: [''],
        location: this.fb.group({
          type: ['Point'],
          coordinates: [null],
        }),
        showAccommodation: [false],
      }),
      notes: [''],
      status: ['planned'],
    });
  }

  ngOnInit(): void {
    this.loadItineraries();
    this.loadLocations();

    // Listen for county changes to update cities
    this.itineraryForm.get('destination.county')?.valueChanges.subscribe((county) => {
      if (county) {
        this.loadCitiesByCounty(county);
      }
    });

    // Listen for city changes to update coordinates
    this.itineraryForm.get('destination.city')?.valueChanges.subscribe((city) => {
      if (city && typeof city === 'string') {
        this.updateCityCoordinates(city);
      }
    });

    // Subscribe to map markers updates
    this.mapService.markers$.subscribe((markers) => {
      if (this.itineraryMap) {
        // Convert service markers to component markers
        const componentMarkers: ComponentMapMarker[] = markers.map((marker) => ({
          id: marker.id,
          latitude: marker.latitude,
          longitude: marker.longitude,
          title: marker.title || '',
          description: marker.description || '',
          color: this.getStatusColor(marker.status || 'planned'),
        }));
        this.itineraryMap.updateMarkers(componentMarkers);
      }
    });

    // Subscribe to selected marker updates
    this.mapService.selectedMarker$.subscribe((marker) => {
      if (marker) {
        const itinerary = this.itineraries.find((i) => i._id === marker.id);
        if (itinerary) {
          this.editItinerary(itinerary);
        }
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
    const county = this.itineraryForm.get('destination.county')?.value;
    if (!county) return;

    this.locationService.getCityCoordinates(city).subscribe((coordinates) => {
      if (coordinates) {
        this.itineraryForm.get('destination.location.coordinates')?.setValue(coordinates);

        // Update map if available
        if (this.itineraryMap) {
          this.itineraryMap.setSelectedLocation(coordinates[1], coordinates[0]);
          this.itineraryMap.centerMap(coordinates[1], coordinates[0], 10);
        }
      } else {
        // If coordinates not found in local database, try geocoding
        this.geocodingService.geocodeLocation(city, county).subscribe((result) => {
          if (result && result.coordinates) {
            this.itineraryForm
              .get('destination.location.coordinates')
              ?.setValue(result.coordinates);

            // Update map if available
            if (this.itineraryMap) {
              this.itineraryMap.setSelectedLocation(result.coordinates[1], result.coordinates[0]);
              this.itineraryMap.centerMap(result.coordinates[1], result.coordinates[0], 10);
            }
          }
        });
      }
    });
  }

  loadItineraries(): void {
    this.loading = true;

    this.travelService
      .getItineraries(this.adId)
      .pipe(
        catchError((error) => {
          this.notificationService.error('Failed to load travel itineraries');
          console.error('Error loading itineraries:', error);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((itineraries) => {
        this.itineraries = itineraries;
        this.updateMapMarkers();
      });
  }

  updateMapMarkers(): void {
    const markers = this.itineraries
      .filter(
        (itinerary) =>
          itinerary.destination?.location?.coordinates && itinerary.status !== 'cancelled',
      )
      .map((itinerary) => {
        const [longitude, latitude] = itinerary.destination.location!.coordinates;
        const title = `${itinerary.destination.city}, ${itinerary.destination.county}`;
        const description = `${this.formatDate(itinerary.arrivalDate)} - ${this.formatDate(itinerary.departureDate)}`;
        const color = this.getStatusColor(itinerary.status);

        // Create component marker
        const componentMarker: ComponentMapMarker = {
          id: itinerary._id || '',
          latitude,
          longitude,
          title,
          description,
          color,
        };

        // Create service marker
        const serviceMarker: ServiceMapMarker = {
          ...componentMarker,
          status: itinerary.status,
        };

        return { componentMarker, serviceMarker };
      });

    // Update component map
    if (this.itineraryMap) {
      this.itineraryMap.updateMarkers(markers.map((m) => m.componentMarker));
    }

    // Update map service
    this.mapService.updateMarkers(markers.map((m) => m.serviceMarker));
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'planned':
        return '#17a2b8'; // info blue
      case 'active':
        return '#28a745'; // success green
      case 'completed':
        return '#6c757d'; // secondary gray
      case 'cancelled':
        return '#dc3545'; // danger red
      default:
        return '#495057'; // default to dark gray
    }
  }

  onSubmit(): void {
    if (this.itineraryForm.invalid) {
      this.markFormGroupTouched(this.itineraryForm);
      return;
    }

    const formData = this.itineraryForm.value;

    // Validate dates
    const arrivalDate = new Date(formData.arrivalDate);
    const departureDate = new Date(formData.departureDate);

    if (arrivalDate > departureDate) {
      this.notificationService.error('Arrival date must be before departure date');
      return;
    }

    this.submitting = true;

    let action$: Observable<any>;

    if (this.editMode && this.currentItineraryId) {
      // Update existing itinerary
      action$ = this.travelService
        .updateItinerary(this.adId, this.currentItineraryId, formData)
        .pipe(
          tap(() => {
            this.notificationService.success('Travel itinerary updated successfully');
            this.resetForm();
          }),
        );
    } else {
      // Add new itinerary
      action$ = this.travelService.addItinerary(this.adId, formData).pipe(
        tap(() => {
          this.notificationService.success('Travel itinerary added successfully');
          this.resetForm();
        }),
      );
    }

    action$
      .pipe(
        catchError((error) => {
          this.notificationService.error(error.error?.message || 'Failed to save travel itinerary');
          console.error('Error saving itinerary:', error);
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
        }),
      )
      .subscribe(() => {
        this.loadItineraries();
      });
  }

  editItinerary(itinerary: TravelItinerary): void {
    this.editMode = true;
    this.currentItineraryId = itinerary._id || null;

    // Convert dates to proper format for form
    const formattedItinerary = {
      ...itinerary,
      arrivalDate: new Date(itinerary.arrivalDate),
      departureDate: new Date(itinerary.departureDate),
    };

    this.itineraryForm.patchValue(formattedItinerary);

    // Switch to form tab
    this.activeTab = 0;

    // Update map if coordinates are available
    if (itinerary.destination?.location?.coordinates && this.itineraryMap) {
      const [longitude, latitude] = itinerary.destination.location.coordinates;
      this.itineraryMap.setSelectedLocation(latitude, longitude);
      this.itineraryMap.centerMap(latitude, longitude, 10);
    }
  }

  cancelItinerary(itinerary: TravelItinerary): void {
    if (!itinerary._id) return;

    if (!confirm('Are you sure you want to cancel this travel itinerary?')) {
      return;
    }

    this.travelService
      .cancelItinerary(this.adId, itinerary._id)
      .pipe(
        catchError((error) => {
          this.notificationService.error(
            error.error?.message || 'Failed to cancel travel itinerary',
          );
          console.error('Error cancelling itinerary:', error);
          return of(null);
        }),
      )
      .subscribe(() => {
        this.notificationService.success('Travel itinerary cancelled successfully');
        this.loadItineraries();
      });
  }

  resetForm(): void {
    this.itineraryForm.reset({
      destination: {
        country: 'Norway',
        location: {
          type: 'Point',
        },
      },
      status: 'planned',
      accommodation: {
        showAccommodation: false,
        location: {
          type: 'Point',
        },
      },
    });
    this.editMode = false;
    this.currentItineraryId = null;
    this.selectedLocation = null;

    // Reset map
    if (this.itineraryMap) {
      // Center back to Norway
      this.itineraryMap.centerMap(59.9139, 10.7522, 6);
    }
  }

  startLocationTracking(): void {
    if (!navigator.geolocation) {
      this.notificationService.error('Geolocation is not supported by your browser');
      return;
    }

    this.trackingLocation = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        // Update location map if available
        if (this.locationMap) {
          this.locationMap.setSelectedLocation(position.coords.latitude, position.coords.longitude);
          this.locationMap.centerMap(position.coords.latitude, position.coords.longitude, 13);
        }

        this.updateLocation();
      },
      (error) => {
        this.trackingLocation = false;

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

  updateLocation(): void {
    if (!this.currentPosition) return;

    this.travelService
      .updateLocation(this.adId, this.currentPosition.longitude, this.currentPosition.latitude)
      .pipe(
        catchError((error) => {
          this.notificationService.error(error.error?.message || 'Failed to update location');
          console.error('Error updating location:', error);
          return of(null);
        }),
        finalize(() => {
          this.trackingLocation = false;
        }),
        // Get address information for the current location
        switchMap((response) => {
          if (response && this.currentPosition) {
            return this.geocodingService
              .reverseGeocode(this.currentPosition.longitude, this.currentPosition.latitude)
              .pipe(
                map((addressInfo) => ({ response, addressInfo })),
                catchError(() => of({ response, addressInfo: null })),
              );
          }
          return of({ response: null, addressInfo: null });
        }),
      )
      .subscribe(({ response, addressInfo }) => {
        if (response) {
          let successMessage = 'Location updated successfully';

          if (addressInfo) {
            successMessage += ` (${addressInfo.city}, ${addressInfo.county})`;
          }

          this.notificationService.success(successMessage);
        }
      });
  }

  onMapLocationSelected(location: { latitude: number; longitude: number; address?: string }): void {
    this.selectedLocation = location;

    // Update form with selected location
    const coordinates: [number, number] = [location.longitude, location.latitude];
    this.itineraryForm.get('destination.location.coordinates')?.setValue(coordinates);

    // Try to get city and county information
    this.geocodingService
      .reverseGeocode(location.longitude, location.latitude)
      .subscribe((result) => {
        if (result) {
          this.itineraryForm.get('destination.city')?.setValue(result.city);
          this.itineraryForm.get('destination.county')?.setValue(result.county);
          this.itineraryForm.get('destination.country')?.setValue(result.country || 'Norway');
        }
      });
  }

  onMarkerClick(marker: ComponentMapMarker): void {
    this.mapService.selectMarker(marker as ServiceMapMarker);
  }

  // Helper to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Format date for display
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'planned':
        return 'badge-info';
      case 'active':
        return 'badge-success';
      case 'completed':
        return 'badge-secondary';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-light';
    }
  }
}
