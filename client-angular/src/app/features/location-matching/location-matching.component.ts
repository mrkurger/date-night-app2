import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MapComponent } from '../../shared/components/map/map.component';
import { GeocodingService } from '../../core/services/geocoding.service';
import { LocationService } from '../../core/services/location.service';
import { AdService } from '../../core/services/ad.service';
import { NotificationService } from '../../core/services/notification.service';
import { Observable, catchError, finalize, of } from 'rxjs';
import { NorwayCity, NorwayCounty } from '../../core/constants/norway-locations';

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
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MapComponent,
  ],
})
export class LocationMatchingComponent implements OnInit {
  searchForm: FormGroup;
  loading = false;
  results: LocationMatchResult[] = [];
  counties: string[] = [];
  cities: NorwayCity[] = [];
  filteredCities: NorwayCity[] = [];
  selectedLocation: { latitude: number; longitude: number; address?: string } | null = null;
  mapMarkers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private adService: AdService,
    private geocodingService: GeocodingService,
    private locationService: LocationService,
    private notificationService: NotificationService
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
    });
  }

  ngOnInit(): void {
    this.loadLocations();

    // Listen for county changes to update cities
    this.searchForm.get('location.county')?.valueChanges.subscribe(county => {
      if (county) {
        this.loadCitiesByCounty(county);
      }
    });

    // Listen for city changes to update coordinates
    this.searchForm.get('location.city')?.valueChanges.subscribe(city => {
      if (city && typeof city === 'string') {
        this.updateCityCoordinates(city);
      }
    });

    // Listen for useCurrentLocation changes
    this.searchForm.get('useCurrentLocation')?.valueChanges.subscribe(useCurrentLocation => {
      if (useCurrentLocation) {
        this.getCurrentLocation();
      }
    });
  }

  loadLocations(): void {
    // Load counties
    this.locationService.getCounties().subscribe(counties => {
      this.counties = counties;
    });
  }

  loadCitiesByCounty(county: string): void {
    this.locationService.getCitiesByCounty(county).subscribe(cities => {
      this.cities = cities;
      this.filteredCities = cities;
    });
  }

  updateCityCoordinates(city: string): void {
    const county = this.searchForm.get('location.county')?.value;
    if (!county) return;

    this.locationService.getCityCoordinates(city).subscribe(coordinates => {
      if (coordinates) {
        this.searchForm.get('location.coordinates')?.setValue(coordinates);
        this.selectedLocation = {
          latitude: coordinates[1],
          longitude: coordinates[0],
        };
        this.updateMapMarkers();
      } else {
        // If coordinates not found in local database, try geocoding
        this.geocodingService.geocodeLocation(city, county).subscribe(result => {
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

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.notificationService.error('Geolocation is not supported by your browser');
      this.searchForm.get('useCurrentLocation')?.setValue(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        // Update form with coordinates
        this.searchForm.get('location.coordinates')?.setValue([longitude, latitude]);
        this.selectedLocation = { latitude, longitude };

        // Get city and county from coordinates
        this.geocodingService.reverseGeocode(longitude, latitude).subscribe(result => {
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
      error => {
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
      .subscribe(result => {
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
      });
    }

    // Add result markers
    this.results.forEach(result => {
      if (result.location && result.location.coordinates) {
        this.mapMarkers.push({
          id: result._id,
          latitude: result.location.coordinates[1],
          longitude: result.location.coordinates[0],
          title: result.title,
          description: `${result.city}, ${result.county} (${result.distance.toFixed(1)} km)`,
          color: 'red',
        });
      }
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.searchForm.controls).forEach(key => {
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
      formValue.categories
    )
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to find location matches');
          console.error('Error searching for location matches:', error);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(results => {
        this.results = results;
        this.updateMapMarkers();

        if (results.length === 0) {
          this.notificationService.info('No matches found for your search criteria');
        }
      });
  }

  searchLocationMatches(
    longitude: number,
    latitude: number,
    radius: number,
    categories?: string[]
  ): Observable<LocationMatchResult[]> {
    // This would be replaced with a real API call to your backend
    return this.adService.searchByLocation(longitude, latitude, radius, categories);
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

  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(1)} km`;
  }

  /**
   * Handle marker click events on the map
   * @param marker The marker that was clicked
   */
  onMarkerClick(marker: any): void {
    if (marker.id === 'selected-location') {
      // This is the selected location marker, not a result
      return;
    }

    // Find the corresponding result
    const result = this.results.find(r => r._id === marker.id);
    if (result) {
      // Scroll to the result in the list
      const resultElement = document.getElementById(`result-${result._id}`);
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the result
        resultElement.classList.add('highlight');
        setTimeout(() => {
          resultElement.classList.remove('highlight');
        }, 2000);
      }
    }
  }
}
