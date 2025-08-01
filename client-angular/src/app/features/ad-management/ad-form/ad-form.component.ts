import {
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NebularModule } from '../../../../app/shared/nebular.module';
import { Ad } from '../../../core/models/ad.interface';
import { CategoryService } from '../../../core/services/category.service';
import { LocationService } from '../../../core/services/location.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,';
} from '@angular/core';

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

@Component({
  selector: 'app-ad-form',
  templateUrl: './ad-form.component.html',
  styleUrls: ['./ad-form.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [;
    NebularModule, CommonModule,
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
    NbAlertModule,,
    DropdownModule,
    ProgressSpinnerModule,
    InputTextModule;
  ]
})
export class AdFormComponen {t implements OnInit {
  @Input() ad: Ad | null = null;

  @Input() submitButtonText = 'Save';
  @Input() isSubmitting = false;
  @Input() error: string | null = null;
  @Output() formSubmit = new EventEmitter()
  @Output() formCancel = new EventEmitter()

  adForm: FormGroup;
  categories: string[] = []
  locations: string[] = []
  uploadedImages: File[] = []
  imagePreviewUrls: string[] = []

  profileVisibilityOptions = [;
    { label: 'Public - Visible to everyone', value: 'public' },
    { label: 'Registered Users - Only visible to registered users', value: 'registered' },
    { label: 'Private - Only visible to users you\'ve matched with', value: 'private' }
  ]

  allowMessagingOptions = [;
    { label: 'Everyone', value: 'all' },
    { label: 'Only Matches', value: 'matches' },
    { label: 'No One (Disable messaging)', value: 'none' }
  ]

  contentDensityOptions = [;
    { label: 'Compact', value: 'compact' },
    { label: 'Normal', value: 'normal' },
    { label: 'Comfortable', value: 'comfortable' }
  ]

  cardSizeOptions = [;
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ]

  defaultViewTypeOptions = [;
    { label: 'Netflix View', value: 'netflix' },
    { label: 'Tinder View', value: 'tinder' },
    { label: 'List View', value: 'list' }
  ]

  constructor(;
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private locationService: LocationService,
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [;
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(2000)],
      ],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      location: ['', Validators.required],
      isTouring: [false],
      tags: [''],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      isActive: [true]
    })
  }

  ngOnInit(): void {
    this.loadCategories()
    this.loadLocations()

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
        isActive: this.ad.isActive !== false
      })

      if (this.ad.images && this.ad.images.length > 0) {
        this.imagePreviewUrls = this.ad.images.map((img) =>;
          typeof img === 'string' ? img : img.url,
        )
      }
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err)
      }
    })
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (err) => {
        console.error('Error loading locations:', err)
      }
    })
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i ) => {
            if (e.target && e.target.result) {
              this.imagePreviewUrls.push(e.target.result as string)
            }
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  removeImage(index: number): void {
    this.imagePreviewUrls.splice(index, 1)
    if (index  tag.trim())
        .filter((tag: string) => tag)

      const adData: Ad = {
        ...formData,
        tags,
        // Keep existing images if any
        images: this.ad?.images || [],
        // Add ID if editing
        _id: this.ad?._id,
      }

      this.formSubmit.emit(adData)
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.adForm.controls).forEach((key) => {
        this.adForm.get(key)?.markAsTouched()
      })
    }
  }

  onCancel(): void {
    this.formCancel.emit()
  }
}
