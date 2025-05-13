import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-form.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { LocationService } from '../../../core/services/location.service';
import { NorwayCity } from '../../../core/constants/norway-locations';
import { NebularModule } from '../../../shared/nebular.module';
import { NbErrorComponent } from '../../../shared/components/custom-nebular-components/nb-error/nb-error.component';

@Component({
  selector: 'app-ad-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NebularModule, NbErrorComponent
    NbCardModule,
    NbFormFieldModule,
    NbSelectModule,
    NbIconModule,],
  templateUrl: './ad-form.component.html',
  styleUrls: ['./ad-form.component.scss'],
})
export class AdFormComponent implements OnInit {
  @Input() initialData?: any;
  @Output() formSubmit = new EventEmitter<any>();

  adForm: FormGroup;
  isEditMode = false;
  adId: string | null = null;
  loading = false;
  categories = ['Escort', 'Stripper', 'Massage', 'Companion', 'Other'];
  counties: string[] = [];
  cities: NorwayCity[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: NbToastrService,
    private locationService: LocationService,
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      price: [null, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      category: ['', Validators.required],
      images: [[]],
      isActive: [true],
      isTouring: [false],
      tourDates: [[]],
      services: [[]],
      contactInfo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.initialData) {
      this.adForm.patchValue(this.initialData);
    }

    this.loading = true;
    this.locationService.getCounties().subscribe((counties) => {
      this.counties = counties;
      this.loading = false;
    });

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.adId = params.get('id');
          this.isEditMode = !!this.adId;

          if (this.isEditMode && this.adId) {
            this.loading = true;
            return of({
              title: 'Sample Ad',
              description: 'This is a sample ad description',
              category: 'Escort',
              price: 200,
              county: 'Oslo',
              city: 'Oslo',
              isActive: true,
            });
          }
          return of(null);
        }),
        tap((ad) => {
          if (ad) {
            this.adForm.patchValue(ad);
            if (ad.county) {
              this.loadCitiesForCounty(ad.county);
            }
          }
          this.loading = false;
        }),
      )
      .subscribe();
  }

  onCountyChange(): void {
    const county = this.adForm.get('county')?.value;
    if (county) {
      this.loadCitiesForCounty(county);
      this.adForm.get('city')?.setValue('');
    }
  }

  private loadCitiesForCounty(county: string): void {
    this.locationService.getCitiesByCounty(county).subscribe((cities) => {
      this.cities = cities;
    });
  }

  onSubmit(): void {
    if (this.adForm.valid) {
      this.formSubmit.emit(this.adForm.value);
    }
  }

  get f() {
    return this.adForm.controls;
  }

  onCancel(): void {
    this.router.navigate(['../list'], { relativeTo: this.route });
  }
}
