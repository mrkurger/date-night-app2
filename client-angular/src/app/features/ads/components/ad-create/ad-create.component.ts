import { Input } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';

import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NebularModule],
  templateUrl: './ad-create.component.html',
  styles: [
    `
      .ad-form-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 30px;
      }
    `,
  ],
})
export class AdCreateComponent implements OnInit {
  adForm: FormGroup;
  categories: string[] = ['Dating', 'Relationship', 'Short-term', 'Long-term', 'Casual', 'Serious'];
  imagePreviewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: [
        '',
        [Validators.required, Validators.minLength(20), Validators.maxLength(1000)],
      ],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      images: [[]],
    });
  }

  ngOnInit(): void {
    // Initialize the component
  }

  onSubmit(): void {
    if (this.adForm.valid) {
      // Process the form data
      // eslint-disable-next-line no-console
      console.log('Form submitted', this.adForm.value);

      // Navigate back to the list
      this.router.navigate(['/ads']);
    } else {
      // Mark all fields as touched to trigger validation
      Object.keys(this.adForm.controls).forEach((key) => {
        const control = this.adForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onAddImage(): void {
    // In a real application, this would open a file picker
    // For now, we'll just set a dummy image URL
    this.imagePreviewUrl = 'https://via.placeholder.com/300x200';

    const images = this.adForm.get('images')?.value || [];
    images.push(this.imagePreviewUrl);
    this.adForm.get('images')?.setValue(images);
  }

  onRemoveImage(): void {
    this.imagePreviewUrl = null;
    this.adForm.get('images')?.setValue([]);
  }

  onCancel(): void {
    this.router.navigate(['/ads']);
  }
}
