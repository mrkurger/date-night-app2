
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-form.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../shared/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { LocationService } from '../../../core/services/location.service';
import { NorwayCity } from '../../../core/constants/norway-locations';

@Component({
  selector: 'app-ad-form',
  templateUrl: './ad-form.component.html',
  styleUrls: ['./ad-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule
  ]
})
export class AdFormComponent implements OnInit {
  adForm: FormGroup;
  isEditMode = false;
  adId: string | null = null;
  loading = false;
  categories = [
    'Escort', 'Stripper', 'Massage', 'Companion', 'Other'
  ];
  counties: string[] = [];
  cities: NorwayCity[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private locationService: LocationService
  ) {
    this.adForm = this.createForm();
  }

  ngOnInit(): void {
    // Load counties
    this.loading = true;
    this.locationService.getCounties().subscribe(counties => {
      this.counties = counties;
      this.loading = false;
    });

    this.route.paramMap.pipe(
      switchMap(params => {
        this.adId = params.get('id');
        this.isEditMode = !!this.adId;
        
        if (this.isEditMode && this.adId) {
          this.loading = true;
          // In a real app, you would fetch the ad data from a service
          // return this.adService.getAd(this.adId);
          return of({
            title: 'Sample Ad',
            description: 'This is a sample ad description',
            category: 'Escort',
            price: 200,
            county: 'Oslo',
            city: 'Oslo',
            isActive: true
          });
        }
        return of(null);
      }),
      tap(ad => {
        if (ad) {
          this.adForm.patchValue(ad);
          
          // Load cities for the selected county
          if (ad.county) {
            this.loadCitiesForCounty(ad.county);
          }
        }
        this.loading = false;
      })
    ).subscribe();
  }
  
  /**
   * Load cities when county changes
   */
  onCountyChange(): void {
    const county = this.adForm.get('county')?.value;
    if (county) {
      this.loadCitiesForCounty(county);
      this.adForm.get('city')?.setValue(''); // Reset city when county changes
    }
  }
  
  /**
   * Load cities for a specific county
   */
  private loadCitiesForCounty(county: string): void {
    this.locationService.getCitiesByCounty(county).subscribe(cities => {
      this.cities = cities;
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      county: ['', Validators.required],
      city: ['', Validators.required],
      isActive: [true]
    });
  }

  onSubmit(): void {
    if (this.adForm.invalid) {
      return;
    }

    this.loading = true;
    const adData = this.adForm.value;

    // In a real app, you would save the ad data using a service
    // const request = this.isEditMode 
    //   ? this.adService.updateAd(this.adId, adData)
    //   : this.adService.createAd(adData);

    // Simulating API call
    setTimeout(() => {
      this.loading = false;
      this.snackBar.open(
        `Ad ${this.isEditMode ? 'updated' : 'created'} successfully!`, 
        'Close', 
        { duration: 3000 }
      );
      this.router.navigate(['../list'], { relativeTo: this.route });
    }, 1000);
  }

  onCancel(): void {
    this.router.navigate(['../list'], { relativeTo: this.route });
  }
}