// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-form.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

@Component({
  selector: 'app-review-form',
  imports: [CommonModule, ReactiveFormsModule, NebularModule],
  template: `
    <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="review-form">
      <h3 *ngIf="!existingReview">Review {{ advertiserName }}</h3>
      <h3 *ngIf="existingReview">Edit Your Review</h3>

      <nb-card>
        <nb-card-body>
          <div class="form-group">
            <label for="title" class="label">Title *</label>
            <input
              nbInput
              fullWidth
              id="title"
              formControlName="title"
              placeholder="Summary of your experience"
            />
            <!-- Error messages for title -->
          </div>

          <div class="form-group">
            <label for="content" class="label">Your Review *</label>
            <textarea
              nbInput
              fullWidth
              id="content"
              formControlName="content"
              placeholder="Describe your experience in detail"
              rows="5"
            ></textarea>
            <!-- Error messages for content -->
          </div>

          <div class="form-group">
            <label class="label">Overall Rating *</label>
            <!--  Replace with NbRadioGroup or a star rating component -->
            <input type="number" nbInput formControlName="rating" min="1" max="5" />
          </div>

          <h4>Category Ratings *</h4>
          <div class="category-ratings" formGroupName="categories">
            <div class="form-group">
              <label for="communication">Communication</label>
              <input
                type="number"
                nbInput
                id="communication"
                formControlName="communication"
                min="1"
                max="5"
              />
            </div>
            <div class="form-group">
              <label for="appearance">Appearance</label>
              <input
                type="number"
                nbInput
                id="appearance"
                formControlName="appearance"
                min="1"
                max="5"
              />
            </div>
            <div class="form-group">
              <label for="location">Location Accuracy</label>
              <input
                type="number"
                nbInput
                id="location"
                formControlName="location"
                min="1"
                max="5"
              />
            </div>
            <div class="form-group">
              <label for="value">Value for Money</label>
              <input type="number" nbInput id="value" formControlName="value" min="1" max="5" />
            </div>
          </div>

          <div class="form-group">
            <nb-checkbox formControlName="isAnonymous">Post as anonymous</nb-checkbox>
          </div>

          <div class="form-group">
            <nb-checkbox formControlName="isVerifiedMeeting"
              >I can confirm this meeting took place</nb-checkbox
            >
          </div>

          <div class="form-group" *ngIf="reviewForm.get('isVerifiedMeeting')?.value">
            <label for="meetingDate">Meeting Date (Optional)</label>
            <input
              nbInput
              type="date"
              id="meetingDate"
              formControlName="meetingDate"
              placeholder="YYYY-MM-DD"
            />
          </div>
        </nb-card-body>
        <nb-card-footer class="form-actions">
          <button nbButton type="button" status="basic" (click)="cancel()">Cancel</button>
          <button nbButton status="primary" type="submit" [disabled]="reviewForm.invalid">
            Submit Review
          </button>
        </nb-card-footer>
      </nb-card>
    </form>
  `,
  styles: [
    `
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
    `,
  ],
})
export class ReviewFormComponent implements OnInit {
  @Input() advertiserId!: string;
  @Input() advertiserName!: string;
  @Input() adId?: string;
  @Input() existingReview?: ReviewData;

  @Output() submitted = new EventEmitter<ReviewData>();
  @Output() cancelled = new EventEmitter<void>();

  reviewForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.reviewForm = this.fb.group({
      title: [
        this.existingReview?.title || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      ],
      content: [
        this.existingReview?.content || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(2000)],
      ],
      rating: [
        this.existingReview?.rating || 0,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      isAnonymous: [this.existingReview?.isAnonymous || false],
      categories: this.fb.group({
        communication: [
          this.existingReview?.categories?.communication || 0,
          [Validators.required, Validators.min(1), Validators.max(5)],
        ],
        appearance: [
          this.existingReview?.categories?.appearance || 0,
          [Validators.required, Validators.min(1), Validators.max(5)],
        ],
        location: [
          this.existingReview?.categories?.location || 0,
          [Validators.required, Validators.min(1), Validators.max(5)],
        ],
        value: [
          this.existingReview?.categories?.value || 0,
          [Validators.required, Validators.min(1), Validators.max(5)],
        ],
      }),
      isVerifiedMeeting: [this.existingReview?.isVerifiedMeeting || false],
      meetingDate: [this.existingReview?.meetingDate || null],
    });
  }

  submitReview() {
    this.reviewForm.markAllAsTouched();
    if (this.reviewForm.invalid) {
      return;
    }

    const reviewData: ReviewData = {
      ...this.existingReview,
      ...this.reviewForm.value,
      advertiserId: this.advertiserId,
      adId: this.adId,
    };

    this.submitted.emit(reviewData);
  }

  cancel() {
    this.cancelled.emit();
  }
}
