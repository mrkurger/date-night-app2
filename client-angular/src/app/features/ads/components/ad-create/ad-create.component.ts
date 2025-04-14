
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-create.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../shared/material.module';
import { AdService } from '../../../../core/services/ad.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AdCreateDTO } from '../../../../core/models/ad.interface';

interface ImagePreview {
  file: File;
  preview: string;
}

@Component({
  selector: 'app-ad-create',
  templateUrl: './ad-create.component.html',
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
    }
    .ad-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-field {
      width: 100%;
    }
    .error-message {
      color: #f44336;
      margin: 1rem 0;
      text-align: center;
    }
    .button-container {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .image-upload-section {
      margin: 1rem 0;
    }

    .file-upload-label {
      display: inline-block;
      margin-bottom: 0.5rem;
    }

    .image-preview-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .image-preview {
      position: relative;
      height: 150px;
      border-radius: 4px;
      overflow: hidden;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .remove-image {
      position: absolute;
      top: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.5) !important;
    }

    .image-error {
      margin-top: 0.5rem;
    }

    mat-hint {
      display: block;
      margin-top: 0.25rem;
      color: rgba(0, 0, 0, 0.6);
    }
  `],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterLink]
})
export class AdCreateComponent implements OnInit {
  adForm: FormGroup;
  categories: string[] = [];
  error: string | null = null;
  loading = false;
  selectedImages: ImagePreview[] = [];
  imageError: string | null = null;
  private readonly maxImages = 5;
  private readonly maxSizePerImage = 5 * 1024 * 1024; // 5MB

  constructor(
    private fb: FormBuilder,
    private adService: AdService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    this.imageError = null;

    // Check number of images
    if (this.selectedImages.length + files.length > this.maxImages) {
      this.imageError = `Maximum ${this.maxImages} images allowed`;
      return;
    }

    // Check file sizes and types
    for (const file of files) {
      if (file.size > this.maxSizePerImage) {
        this.imageError = `Image ${file.name} exceeds 5MB limit`;
        return;
      }
      if (!file.type.startsWith('image/')) {
        this.imageError = `File ${file.name} is not an image`;
        return;
      }
    }

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImages.push({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    input.value = '';
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imageError = null;
  }

  private loadCategories(): void {
    this.adService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => {
        this.error = 'Failed to load categories';
        console.error('Error loading categories:', err);
      }
    });
  }

  createAd(): void {
    if (this.adForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = new FormData();
    const adData: AdCreateDTO = this.adForm.value;

    // Append ad data
    Object.entries(adData).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Append images
    this.selectedImages.forEach(image => {
      formData.append('images', image.file);
    });

    this.adService.createAdWithImages(formData).subscribe({
      next: (ad) => {
        this.loading = false;
        this.notificationService.success('Ad created successfully');
        this.router.navigate(['/ads', ad._id]);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to create ad';
        this.notificationService.error(this.error);
        console.error('Error creating ad:', err);
      }
    });
  }
}
