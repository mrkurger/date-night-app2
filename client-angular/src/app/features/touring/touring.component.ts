import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (touring.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TravelService, TouringAd } from '../../core/services/travel.service';
import { NotificationService } from '../../core/services/notification.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-touring',
  templateUrl: './touring.component.html',
  styleUrls: ['./touring.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class TouringComponent implements OnInit {
  touringAds: TouringAd[] = [];
  upcomingTours: TouringAd[] = [];
  loading = false;
  filterForm: FormGroup;

  // Norwegian counties for filter
  counties = [
    'Agder',
    'Innlandet',
    'Møre og Romsdal',
    'Nordland',
    'Oslo',
    'Rogaland',
    'Troms og Finnmark',
    'Trøndelag',
    'Vestfold og Telemark',
    'Vestland',
    'Viken',
  ];

  // Major cities for filter
  cities = [
    'Oslo',
    'Bergen',
    'Trondheim',
    'Stavanger',
    'Drammen',
    'Fredrikstad',
    'Kristiansand',
    'Sandnes',
    'Tromsø',
    'Ålesund',
  ];

  constructor(
    private travelService: TravelService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      county: [''],
      city: [''],
      days: [30],
    });
  }

  ngOnInit(): void {
    this.loadTouringAdvertisers();
    this.loadUpcomingTours();

    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.loadUpcomingTours();
    });
  }

  loadTouringAdvertisers(): void {
    this.loading = true;

    this.travelService
      .getTouringAdvertisers()
      .pipe(
        catchError((error) => {
          this.notificationService.error('Failed to load touring advertisers');
          console.error('Error loading touring advertisers:', error);
          return of({ success: false, count: 0,_data: [] });
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((response) => {
        if (response.success) {
          this.touringAds = response.data;
        }
      });
  }

  loadUpcomingTours(): void {
    const { county, city, days } = this.filterForm.value;

    this.loading = true;

    this.travelService
      .getUpcomingTours(city, county, days)
      .pipe(
        catchError((error) => {
          this.notificationService.error('Failed to load upcoming tours');
          console.error('Error loading upcoming tours:', error);
          return of({ success: false, count: 0,_data: [] });
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((response) => {
        if (response.success) {
          this.upcomingTours = response.data;
        }
      });
  }

  resetFilters(): void {
    this.filterForm.reset({
      county: '',
      city: '',
      days: 30,
    });
  }

  // Format date for display
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString();
  }
}
