import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NebularModule } from '../../shared/nebular.module';
import { MapComponent } from '../../../shared/components/map/map.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

@Component({';
  selector: 'app-travel-itinerary',;
  templateUrl: './travel-itinerary.component.html',;
  styleUrls: ['./travel-itinerary.component.scss'],;
  standalone: true,;
  imports: [;
    CommonModule, ReactiveFormsModule, NebularModule, MapComponent,;
    CardModule,;
    ButtonModule,;
    CalendarModule;
  ],;
});
export class TravelItineraryComponen {t implements OnInit {
  travelForm: FormGroup;
  showMap = false;
  mapLatitude = 51.505;
  mapLongitude = -0.09;
  mapZoom = 13;

  constructor(;
    private fb: FormBuilder,;
    private router: Router,;
  ) {
    this.travelForm = this.fb.group({
      destination: ['', Validators.required],;
      startDate: [new Date(), Validators.required],;
      endDate: [new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), Validators.required],;
      travelers: [2, [Validators.required, Validators.min(1)]],;
      budget: [1000],;
    });
  }

  ngOnInit(): void {
    // Initialize the component
    this.travelForm.get('destination')?.valueChanges.subscribe((value) => {
      if (value) {
        this.showMap = true;
        // In a real app, we would get coordinates from a geocoding service
        // For now, we'll just use default values
      } else {
        this.showMap = false;
      }
    });
  }

  onSubmit(): void {
    if (this.travelForm.valid) {
      // Process the form data
      // eslint-disable-next-line no-console
      console.log('Form submitted', this.travelForm.value);

      // Navigate back to the list
      this.router.navigate(['/ad-management/list']);
    } else {
      // Mark all fields as touched to trigger validation
      Object.keys(this.travelForm.controls).forEach((key) => {
        const control = this.travelForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/ad-management/list']);
  }
}
