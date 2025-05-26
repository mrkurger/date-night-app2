import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NebularModule } from '../../nebular.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-form.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

export interface ReviewData {
  adId?: string;
  userId?: string;
  advertiserId?: string;
  rating: number;
  title: string;
  content: string;
  categories: {
    communication: number;
    appearance: number;
    location: number;
    value: number;
  };
  isAnonymous?: boolean;
  isVerifiedMeeting?: boolean;
  meetingDate?: string | null;
}

@Component({';
  selector: 'app-review-form',;
  imports: [CommonModule, ReactiveFormsModule, NebularModule],;
  template: `;`
    ;
      Review {{ advertiserName }};
      Edit Your Review;

      ;
        ;
          ;
            Title *;
            ;
            ;
          ;

          ;
            Your Review *;
            ;
            ;
          ;

          ;
            Overall Rating *;
            ;
            ;
          ;

          Category Ratings *;
          ;
            ;
              Communication;
              ;
            ;
            ;
              Appearance;
              ;
            ;
            ;
              Location Accuracy;
              ;
            ;
            ;
              Value for Money;
              ;
            ;
          ;

          ;
            Post as anonymous;
          ;

          ;
            I can confirm this meeting took place;
          ;

          ;
            Meeting Date (Optional);
            ;
          ;
        ;
        ;
          Cancel;
          ;
            Submit Review;
          ;
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
      .review-form {
        max-width: 700px;
        margin: auto;
      }
      .form-group {
        margin-bottom: 1.5rem;
      }
      .category-ratings {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
      .label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
    `,;`
  ],;
});
export class ReviewFormComponen {t implements OnInit {
  @Input() advertiserId!: string;
  @Input() advertiserName!: string;
  @Input() adId?: string;
  @Input() existingReview?: ReviewData;

  @Output() submitted = new EventEmitter();
  @Output() cancelled = new EventEmitter();

  reviewForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.reviewForm = this.fb.group({
      title: [;
        this.existingReview?.title || '',;
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)],;
      ],;
      content: [;
        this.existingReview?.content || '',;
        [Validators.required, Validators.minLength(10), Validators.maxLength(2000)],;
      ],;
      rating: [;
        this.existingReview?.rating || 0,;
        [Validators.required, Validators.min(1), Validators.max(5)],;
      ],;
      isAnonymous: [this.existingReview?.isAnonymous || false],;
      categories: this.fb.group({
        communication: [;
          this.existingReview?.categories?.communication || 0,;
          [Validators.required, Validators.min(1), Validators.max(5)],;
        ],;
        appearance: [;
          this.existingReview?.categories?.appearance || 0,;
          [Validators.required, Validators.min(1), Validators.max(5)],;
        ],;
        location: [;
          this.existingReview?.categories?.location || 0,;
          [Validators.required, Validators.min(1), Validators.max(5)],;
        ],;
        value: [;
          this.existingReview?.categories?.value || 0,;
          [Validators.required, Validators.min(1), Validators.max(5)],;
        ],;
      }),;
      isVerifiedMeeting: [this.existingReview?.isVerifiedMeeting || false],;
      meetingDate: [this.existingReview?.meetingDate || null],;
    });
  }

  submitReview() {
    this.reviewForm.markAllAsTouched();
    if (this.reviewForm.invalid) {
      return;
    }

    const reviewData: ReviewData = {
      ...this.existingReview,;
      ...this.reviewForm.value,;
      advertiserId: this.advertiserId,;
      adId: this.adId,;
    };

    this.submitted.emit(reviewData);
  }

  cancel() {
    this.cancelled.emit();
  }
}
