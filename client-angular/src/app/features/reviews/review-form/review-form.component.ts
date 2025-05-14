import { NbIconModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-form.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


export interface ReviewData {
  rating: number;
  title: string;
  content: string;
  anonymous: boolean;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NbButtonModule, NbFormFieldModule, NbInputModule, NbSelectModule, NbIconModule, NbSpinnerModule, NbCheckboxModule],
  template: `
    <div class="review-form-container">
      <h3 class="form-title">{{ isEditMode ? 'Edit Your Review' : 'Write a Review' }}</h3>

      <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
        <!-- Rating -->
        <div class="form-group">
          <label class="form-label">Rating</label>
          <div class="star-rating">
            <button
              nbButton
              ghost
              *ngFor="let star of ratingOptions"
              class="star-button"
              [class.filled]="star <= (reviewForm.get('rating')?.value || 0)"
              (click)="setRating(star)"
              type="button"
              [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')"
            >
              <nb-icon
                [icon]="star <= (reviewForm.get('rating')?.value || 0) ? 'star' : 'star-outline'"
              ></nb-icon>
            </button>
          </div>
          <span
            class="validation-error"
            *ngIf="reviewForm.get('rating')?.invalid && reviewForm.get('rating')?.touched"
          >
            Please select a rating
          </span>
        </div>

        <!-- Title -->
        <div class="form-group">
          <nb-form-field>
            <label for="title">Title</label>
            <input
              nbInput
              fullWidth
              id="title"
              formControlName="title"
              [status]="
                reviewForm.get('title')?.invalid && reviewForm.get('title')?.touched
                  ? 'danger'
                  : 'basic'
              "
              placeholder="Summarize your experience"
            />
            <span
              class="validation-error"
              *ngIf="reviewForm.get('title')?.invalid && reviewForm.get('title')?.touched"
            >
              <span *ngIf="reviewForm.get('title')?.errors?.['required']">Title is required</span>
              <span *ngIf="reviewForm.get('title')?.errors?.['maxlength']"
                >Title cannot exceed 100 characters</span
              >
            </span>
          </nb-form-field>
        </div>

        <!-- Content -->
        <div class="form-group">
          <nb-form-field>
            <label for="content">Review</label>
            <textarea
              nbInput
              fullWidth
              id="content"
              formControlName="content"
              [status]="
                reviewForm.get('content')?.invalid && reviewForm.get('content')?.touched
                  ? 'danger'
                  : 'basic'
              "
              placeholder="Share details of your experience"
              rows="5"
            ></textarea>
            <span
              class="validation-error"
              *ngIf="reviewForm.get('content')?.invalid && reviewForm.get('content')?.touched"
            >
              <span *ngIf="reviewForm.get('content')?.errors?.['required']"
                >Review content is required</span
              >
              <span *ngIf="reviewForm.get('content')?.errors?.['minlength']"
                >Review must be at least 10 characters</span
              >
              <span *ngIf="reviewForm.get('content')?.errors?.['maxlength']"
                >Review cannot exceed 1000 characters</span
              >
            </span>
            <span
              class="char-count"
              [class.text-danger]="reviewForm.get('content')?.value?.length > 950"
            >
              {{ reviewForm.get('content')?.value?.length || 0 }}/1000
            </span>
          </nb-form-field>
        </div>

        <!-- Anonymous -->
        <div class="form-group">
          <nb-checkbox formControlName="anonymous">
            Post anonymously
            <span class="text-hint">
              Your name and profile picture will not be displayed with this review
            </span>
          </nb-checkbox>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button nbButton status="basic" (click)="onCancel()" type="button">Cancel</button>
          <button
            nbButton
            status="primary"
            type="submit"
            [disabled]="reviewForm.invalid || submitting"
          >
            <nb-icon icon="save-outline"></nb-icon>
            {{ isEditMode ? 'Update Review' : 'Submit Review' }}
            <nb-spinner *ngIf="submitting" size="small"></nb-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .review-form-container {
        padding: 2rem;
        background-color: var(--background-basic-color-2);
        border-radius: var(--border-radius);
      }

      .form-title {
        margin-bottom: 2rem;
        color: var(--text-basic-color);
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .star-rating {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .star-button {
        padding: 0;
        min-width: auto;

        &.filled nb-icon {
          color: var(--color-warning-500);
        }
      }

      .validation-error {
        color: var(--color-danger-default);
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .char-count {
        color: var(--text-hint-color);
        font-size: 0.875rem;
        text-align: right;
        margin-top: 0.25rem;

        &.text-danger {
          color: var(--color-danger-default);
        }
      }

      .text-hint {
        color: var(--text-hint-color);
        font-size: 0.875rem;
        margin-left: 0.5rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
      }
    `,
  ],
})
export class ReviewFormComponent implements OnInit {
  @Input() adId!: string;
  @Input() existingReview: any = null;
  @Output() reviewSubmitted = new EventEmitter<ReviewData>();
  @Output() cancel = new EventEmitter<void>();

  reviewForm!: FormGroup;
  submitting = false;
  ratingOptions = [1, 2, 3, 4, 5];
  isEditMode = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.existingReview;
    this.initForm();
  }

  /**
   * Initialize the review form
   */
  private initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [
        this.existingReview?.rating || 5,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      title: [this.existingReview?.title || '', [Validators.required, Validators.maxLength(100)]],
      content: [
        this.existingReview?.content || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(1000)],
      ],
      anonymous: [this.existingReview?.anonymous || false],
    });
  }

  /**
   * Submit the review form
   */
  onSubmit(): void {
    if (this.reviewForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.reviewForm.controls).forEach((key) => {
        const control = this.reviewForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const reviewData: ReviewData = this.reviewForm.value;

    // Emit the review data to the parent component
    setTimeout(() => {
      this.reviewSubmitted.emit(reviewData);
      this.submitting = false;
    }, 500);
  }

  /**
   * Cancel the review form
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Set the rating value
   */
  setRating(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating);
  }

  /**
   * Get the star icon class based on the current rating
   */
  getStarClass(star: number): string {
    const currentRating = this.reviewForm.get('rating')?.value || 0;
    return star <= currentRating ? 'fas fa-star filled' : 'far fa-star';
  }
}
