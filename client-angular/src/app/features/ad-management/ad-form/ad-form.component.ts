import { Component, OnInit, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NbCardModule,
  NbFormFieldModule,
  NbSelectModule,
  NbIconModule,
  NbButtonModule,
  NbInputModule,
  NbCheckboxModule,
  NbTagModule,
  NbSpinnerModule,
  NbAlertModule,
} from '@nebular/theme';

import { Ad } from '../../../core/models/ad.interface';
import { CategoryService } from '../../../core/services/category.service';
import { LocationService } from '../../../core/services/location.service';

@Component({
  selector: 'app-ad-form',
  templateUrl: './ad-form.component.html',
  styleUrls: ['./ad-form.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbFormFieldModule,
    NbSelectModule,
    NbIconModule,
    NbButtonModule,
    NbInputModule,
    NbCheckboxModule,
    NbTagModule,
    NbSpinnerModule,
    NbAlertModule,
  ],
})
export class AdFormComponent implements OnInit {
  @Input() ad: Ad | null = null;
  @Input() submitButtonText = 'Save';
  @Input() isSubmitting = false;
  @Input() error: string | null = null;
  @Output() formSubmit = new EventEmitter<Ad>();
  @Output() formCancel = new EventEmitter<void>();

  adForm: FormGroup;
  categories: string[] = [];
  locations: string[] = [];
  uploadedImages: File[] = [];
  imagePreviewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private locationService: LocationService
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      location: ['', Validators.required],
      isTouring: [false],
      tags: [''],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadLocations();

    if (this.ad) {
      this.adForm.patchValue({
        title: this.ad.title,
        description: this.ad.description,
        price: this.ad.price || 0,
        category: this.ad.category,
        location: this.ad.location,
        isTouring: this.ad.isTouring || false,
        tags: this.ad.tags ? this.ad.tags.join(', ') : '',
        contactEmail: this.ad.contactEmail || '',
        contactPhone: this.ad.contactPhone || '',
        isActive: this.ad.isActive !== false,
      });

      if (this.ad.images && this.ad.images.length > 0) {
        this.imagePreviewUrls = this.ad.images.map(img => 
          typeof img === 'string' ? img : img.url
        );
      }
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (err) => {
        console.error('Error loading locations:', err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.type.match('image.*')) {
          this.uploadedImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviewUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeImage(index: number): void {
    this.imagePreviewUrls.splice(index, 1);
    if (index < this.uploadedImages.length) {
      this.uploadedImages.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.adForm.valid) {
      const formData = this.adForm.value;
      
      // Process tags
      const tags = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag);
      
      const adData: Ad = {
        ...formData,
        tags,
        // Keep existing images if any
        images: this.ad?.images || [],
        // Add ID if editing
        _id: this.ad?._id,
      };
      
      this.formSubmit.emit(adData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.adForm.controls).forEach(key => {
        this.adForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}
