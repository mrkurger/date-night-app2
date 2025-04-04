import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TravelService, TravelItinerary } from '../../../core/services/travel.service';
import { AdService } from '../../../core/services/ad.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-travel-itinerary',
  templateUrl: './travel-itinerary.component.html',
  styleUrls: ['./travel-itinerary.component.scss']
})
export class TravelItineraryComponent implements OnInit {
  adId: string;
  itineraryForm: FormGroup;
  itineraries: TravelItinerary[] = [];
  loading = false;
  submitting = false;
  editMode = false;
  currentItineraryId: string | null = null;
  
  // For location tracking
  trackingLocation = false;
  currentPosition: { longitude: number; latitude: number } | null = null;
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private travelService: TravelService,
    private adService: AdService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.adId = this.route.snapshot.paramMap.get('id') || '';
    
    this.itineraryForm = this.fb.group({
      destination: this.fb.group({
        city: ['', [Validators.required]],
        county: ['', [Validators.required]],
        country: ['Norway']
      }),
      arrivalDate: [null, [Validators.required]],
      departureDate: [null, [Validators.required]],
      accommodation: this.fb.group({
        name: [''],
        address: [''],
        showAccommodation: [false]
      }),
      notes: [''],
      status: ['planned']
    });
  }

  ngOnInit(): void {
    this.loadItineraries();
  }

  loadItineraries(): void {
    this.loading = true;
    
    this.travelService.getItineraries(this.adId)
      .pipe(
        catchError(error => {
          this.notificationService.error('Failed to load travel itineraries');
          console.error('Error loading itineraries:', error);
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(itineraries => {
        this.itineraries = itineraries;
      });
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
      action$ = this.travelService.updateItinerary(
        this.adId,
        this.currentItineraryId,
        formData
      ).pipe(
        tap(() => {
          this.notificationService.success('Travel itinerary updated successfully');
          this.resetForm();
        })
      );
    } else {
      // Add new itinerary
      action$ = this.travelService.addItinerary(
        this.adId,
        formData
      ).pipe(
        tap(() => {
          this.notificationService.success('Travel itinerary added successfully');
          this.resetForm();
        })
      );
    }
    
    action$
      .pipe(
        catchError(error => {
          this.notificationService.error(error.error?.message || 'Failed to save travel itinerary');
          console.error('Error saving itinerary:', error);
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
        })
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
      departureDate: new Date(itinerary.departureDate)
    };
    
    this.itineraryForm.patchValue(formattedItinerary);
  }

  cancelItinerary(itinerary: TravelItinerary): void {
    if (!itinerary._id) return;
    
    if (!confirm('Are you sure you want to cancel this travel itinerary?')) {
      return;
    }
    
    this.travelService.cancelItinerary(this.adId, itinerary._id)
      .pipe(
        catchError(error => {
          this.notificationService.error(error.error?.message || 'Failed to cancel travel itinerary');
          console.error('Error cancelling itinerary:', error);
          return of(null);
        })
      )
      .subscribe(() => {
        this.notificationService.success('Travel itinerary cancelled successfully');
        this.loadItineraries();
      });
  }

  resetForm(): void {
    this.itineraryForm.reset({
      destination: {
        country: 'Norway'
      },
      status: 'planned',
      accommodation: {
        showAccommodation: false
      }
    });
    this.editMode = false;
    this.currentItineraryId = null;
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
          longitude: position.coords.longitude
        };
        
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
      }
    );
  }

  updateLocation(): void {
    if (!this.currentPosition) return;
    
    this.travelService.updateLocation(
      this.adId,
      this.currentPosition.longitude,
      this.currentPosition.latitude
    )
      .pipe(
        catchError(error => {
          this.notificationService.error(error.error?.message || 'Failed to update location');
          console.error('Error updating location:', error);
          return of(null);
        }),
        finalize(() => {
          this.trackingLocation = false;
        })
      )
      .subscribe(response => {
        if (response) {
          this.notificationService.success('Location updated successfully');
        }
      });
  }

  // Helper to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
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