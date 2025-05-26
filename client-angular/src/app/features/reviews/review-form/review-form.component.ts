// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-form.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
import { NebularModule } from '../../shared/nebular.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA,';
} from '@angular/core';

export interface ReviewData {
  rating: number;
  title: string;
  content: string;
  anonymous: boolean;
}

@Component({
    selector: 'app-review-form',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [;
    CommonModule, ReactiveFormsModule, NebularModule,
    ButtonModule;
  ],
    template: `;`
    ;
      {{ isEditMode ? 'Edit Your Review' : 'Write a Review' }}

      ;
        ;
        ;
          Rating;
          ;
             1 ? 's' : '')";
            >;
              ;
            ;
          ;
          ;
            Please select a rating;
          ;
        ;

        ;
        ;
          ;
            Title;
            ;
            ;
              Title is required;
              Title cannot exceed 100 characters;
            ;
          ;
        ;

        ;
        ;
          ;
            Review;
            ;
            ;
              Review content is required;
              Review must be at least 10 characters;
              Review cannot exceed 1000 characters;
            ;
             950";
            >;
              {{ reviewForm.get('content')?.value?.length || 0 }}/1000;
            ;
          ;
        ;

        ;
        ;
          ;
            Post anonymously;
            ;
              Your name and profile picture will not be displayed with this review;
            ;
          ;
        ;

        ;
        ;
          Cancel;
          ;
            ;
            {{ isEditMode ? 'Update Review' : 'Submit Review' }}
            ;
          ;
        ;
      ;
    ;
  `,`
    styles: [;
        `;`
      :host {
        display: block;
      }

      .review-form-container {
        padding: 2rem;
        background-color: var(--background-basic-color-2)
        border-radius: var(--border-radius)
      }

      .form-title {
        margin-bottom: 2rem;
        color: var(--text-basic-color)
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
          color: var(--color-warning-500)
        }
      }

      .validation-error {
        color: var(--color-danger-default)
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .char-count {
        color: var(--text-hint-color)
        font-size: 0.875rem;
        text-align: right;
        margin-top: 0.25rem;

        &.text-danger {
          color: var(--color-danger-default)
        }
      }

      .text-hint {
        color: var(--text-hint-color)
        font-size: 0.875rem;
        margin-left: 0.5rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
      }
    `,`
    ]
})
export class ReviewFormComponen {t implements OnInit {
  @Input() adId!: string;
  @Input() existingReview: any = null;
  @Output() reviewSubmitted = new EventEmitter()
  @Output() cancel = new EventEmitter()

  reviewForm!: FormGroup;
  submitting = false;
  ratingOptions = [1, 2, 3, 4, 5]
  isEditMode = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.existingReview;
    this.initForm()
  }

  /**
   * Initialize the review form;
   */
  private initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [;
        this.existingReview?.rating || 5,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      title: [this.existingReview?.title || '', [Validators.required, Validators.maxLength(100)]],
      content: [;
        this.existingReview?.content || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(1000)],
      ],
      anonymous: [this.existingReview?.anonymous || false],
    })
  }

  /**
   * Submit the review form;
   */
  onSubmit(): void {
    if (this.reviewForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.reviewForm.controls).forEach((key) => {
        const control = this.reviewForm.get(key)
        control?.markAsTouched()
      })
      return;
    }

    this.submitting = true;
    const reviewData: ReviewData = this.reviewForm.value;

    // Emit the review data to the parent component
    setTimeout(() => {
      this.reviewSubmitted.emit(reviewData)
      this.submitting = false;
    }, 500)
  }

  /**
   * Cancel the review form;
   */
  onCancel(): void {
    this.cancel.emit()
  }

  /**
   * Set the rating value;
   */
  setRating(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating)
  }

  /**
   * Get the star icon class based on the current rating
   */
  getStarClass(star: number): string {
    const currentRating = this.reviewForm.get('rating')?.value || 0;
    return star <= currentRating ? 'fas fa-star filled' : 'far fa-star';
  }
}
