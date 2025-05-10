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
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReviewService } from '../../../core/services/review.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { User } from '../../../core/models/user.interface'; // Import the User interface

// Define an interface for the Review data
interface ReviewData {
  _id?: string;
  rating: number;
  title: string;
  content: string;
  categories?: {
    communication?: number;
    appearance?: number;
    location?: number;
    value?: number;
  };
  isVerifiedMeeting?: boolean;
  meetingDate?: Date | string | null;
  advertiser: string; // Assuming advertiserId is a string ID
  ad?: string; // Assuming adId is a string ID
  user?: User; // Replaced 'any' with the imported User interface
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule,
    StarRatingComponent,
  ],
  template: `
    <mat-card class="review-form-card">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
        <mat-card-subtitle>Share your experience</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
          <div class="overall-rating">
            <h3>Overall Rating</h3>
            <app-star-rating
              [rating]="reviewForm.get('rating')?.value || 0"
              (ratingChange)="onRatingChange($event)"
              [readonly]="false"
            ></app-star-rating>
            <div
              class="rating-error"
              *ngIf="
                reviewForm.get('rating')?.hasError('required') && reviewForm.get('rating')?.touched
              "
            >
              Please select a rating
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Review Title</mat-label>
            <input matInput formControlName="title" placeholder="Summarize your experience" />
            <mat-error *ngIf="reviewForm.get('title')?.hasError('required')">
              Title is required
            </mat-error>
            <mat-error *ngIf="reviewForm.get('title')?.hasError('maxlength')">
              Title cannot exceed 100 characters
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Review Content</mat-label>
            <textarea
              matInput
              formControlName="content"
              placeholder="Share details of your experience"
              rows="5"
            ></textarea>
            <mat-error *ngIf="reviewForm.get('content')?.hasError('required')">
              Review content is required
            </mat-error>
            <mat-error *ngIf="reviewForm.get('content')?.hasError('minlength')">
              Review must be at least 20 characters
            </mat-error>
            <mat-error *ngIf="reviewForm.get('content')?.hasError('maxlength')">
              Review cannot exceed 1000 characters
            </mat-error>
          </mat-form-field>

          <mat-expansion-panel class="category-ratings">
            <mat-expansion-panel-header>
              <mat-panel-title> Category Ratings (Optional) </mat-panel-title>
              <mat-panel-description>
                Rate specific aspects of your experience
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div formGroupName="categories">
              <div class="category-rating">
                <label>Communication:</label>
                <app-star-rating
                  [rating]="reviewForm.get('categories.communication')?.value || 0"
                  (ratingChange)="onCategoryRatingChange('communication', $event)"
                  [readonly]="false"
                ></app-star-rating>
              </div>

              <div class="category-rating">
                <label>Appearance:</label>
                <app-star-rating
                  [rating]="reviewForm.get('categories.appearance')?.value || 0"
                  (ratingChange)="onCategoryRatingChange('appearance', $event)"
                  [readonly]="false"
                ></app-star-rating>
              </div>

              <div class="category-rating">
                <label>Location:</label>
                <app-star-rating
                  [rating]="reviewForm.get('categories.location')?.value || 0"
                  (ratingChange)="onCategoryRatingChange('location', $event)"
                  [readonly]="false"
                ></app-star-rating>
              </div>

              <div class="category-rating">
                <label>Value:</label>
                <app-star-rating
                  [rating]="reviewForm.get('categories.value')?.value || 0"
                  (ratingChange)="onCategoryRatingChange('value', $event)"
                  [readonly]="false"
                ></app-star-rating>
              </div>
            </div>
          </mat-expansion-panel>

          <mat-divider class="divider"></mat-divider>

          <div class="meeting-details">
            <mat-checkbox formControlName="isVerifiedMeeting" color="primary">
              I verify that I have met this advertiser
            </mat-checkbox>

            <mat-form-field appearance="outline" *ngIf="reviewForm.get('isVerifiedMeeting')?.value">
              <mat-label>Meeting Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="meetingDate" />
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="reviewForm.get('meetingDate')?.hasError('required')">
                Meeting date is required for verified meetings
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="resetForm()" [disabled]="loading">
              Cancel
            </button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="reviewForm.invalid || loading"
            >
              Submit Review
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      @use '../../../core/design/design-tokens' as ds;
      @use '../../../core/design/typography-mixins' as typography;

      :host {
        .review-form-card {
          margin: ds.$spacing-5 0;
          border-radius: ds.$border-radius-lg;
          box-shadow: ds.$shadow-md;
          background-color: ds.$color-surface;
        }

        .full-width {
          width: 100%;
          margin-bottom: ds.$spacing-4;
        }

        .overall-rating {
          margin-bottom: ds.$spacing-5;
        }

        .overall-rating h3 {
          @include typography.heading-xs;
          margin-bottom: ds.$spacing-3;
          color: ds.$color-text-primary;
        }

        .rating-error {
          color: ds.$color-error;
          @include typography.body-xs;
          margin-top: ds.$spacing-1;
        }

        .category-ratings {
          margin-bottom: ds.$spacing-5;
          background-color: ds.$color-surface-variant;
          border-radius: ds.$border-radius-md;

          .mat-expansion-panel-header {
            padding: ds.$spacing-3 ds.$spacing-4;
          }
          .mat-expansion-panel-content {
            padding: 0 ds.$spacing-4 ds.$spacing-4;
          }
        }

        .category-rating {
          display: flex;
          align-items: center;
          margin-bottom: ds.$spacing-3;
        }

        .category-rating label {
          min-width: 120px;
          @include typography.label;
          color: ds.$color-text-secondary;
          margin-right: ds.$spacing-3;
        }

        .divider {
          margin: ds.$spacing-5 0;
          border-top-color: ds.$color-border;
        }

        .meeting-details {
          margin-bottom: ds.$spacing-5;
          mat-checkbox {
            margin-bottom: ds.$spacing-3;
          }
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: ds.$spacing-3;
          margin-top: ds.$spacing-5;
        }

        mat-form-field.mat-mdc-form-field {
          .mdc-text-field--outlined {
            border-radius: ds.$border-radius-md;
            background-color: ds.$color-surface;

            .mdc-notched-outline__leading,
            .mdc-notched-outline__notch,
            .mdc-notched-outline__trailing {
              border-color: ds.$color-light-gray-2;
            }
          }

          .mat-mdc-input-element {
            @include typography.body-default;
            font-family: ds.$font-family-base;
            color: ds.$color-text-primary;

            &::placeholder {
              color: ds.$color-medium-gray-2;
              @include typography.body-default;
            }
          }

          .mdc-floating-label {
            @include typography.label;
            color: ds.$color-dark-gray-2;
          }

          &.mat-focused {
            .mdc-text-field--outlined {
              .mdc-notched-outline__leading,
              .mdc-notched-outline__notch,
              .mdc-notched-outline__trailing {
                border-width: 1px;
                border-color: ds.$color-primary;
              }
            }

            .mdc-floating-label {
              color: ds.$color-primary;
            }
          }

          &.mat-form-field-invalid {
            .mdc-text-field--outlined {
              .mdc-notched-outline__leading,
              .mdc-notched-outline__notch,
              .mdc-notched-outline__trailing {
                border-color: ds.$color-error;
              }
            }
            .mdc-floating-label {
              color: ds.$color-error;
            }
            .mat-mdc-input-element {
              caret-color: ds.$color-error;
            }
          }

          .mdc-text-field__input {
            padding: ds.$spacing-2 ds.$spacing-3;
          }

          textarea.mat-mdc-input-element {
            padding: ds.$spacing-2 ds.$spacing-3;
          }
        }
      }
    `,
  ],
})
export class ReviewFormComponent implements OnInit {
  @Input() advertiserId = '';
  @Input() adId = '';
  @Input() title = 'Write a Review';
  @Input() advertiserName = '';
  @Input() existingReview: ReviewData | null = null;
  @Output() reviewSubmitted = new EventEmitter<ReviewData>();
  @Output() submitted = new EventEmitter<ReviewData>();
  @Output() cancelled = new EventEmitter<void>();

  reviewForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private notificationService: NotificationService,
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      categories: this.fb.group({
        communication: [0],
        appearance: [0],
        location: [0],
        value: [0],
      }),
      isVerifiedMeeting: [false],
      meetingDate: [null],
    });

    this.reviewForm.get('isVerifiedMeeting')?.valueChanges.subscribe((isVerified) => {
      const meetingDateControl = this.reviewForm.get('meetingDate');
      if (isVerified) {
        meetingDateControl?.setValidators([Validators.required]);
      } else {
        meetingDateControl?.clearValidators();
      }
      meetingDateControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {}

  onRatingChange(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating);
  }

  onCategoryRatingChange(category: string, rating: number): void {
    this.reviewForm.get(`categories.${category}`)?.setValue(rating);
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (!this.advertiserId) {
      this.notificationService.error('Advertiser ID is required');
      return;
    }

    this.loading = true;

    const reviewData: ReviewData = {
      ...this.reviewForm.value,
      advertiser: this.advertiserId,
      ad: this.adId || undefined,
    };

    this.reviewService.createReview(reviewData).subscribe({
      next: (review) => {
        this.notificationService.success('Review submitted successfully');
        this.reviewSubmitted.emit(review);
        this.submitted.emit(review);
        this.loading = false;
        this.resetForm();
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.notificationService.error('Failed to submit review');
        this.loading = false;
      },
    });
  }

  resetForm(): void {
    this.reviewForm.reset({
      rating: 0,
      title: '',
      content: '',
      categories: {
        communication: 0,
        appearance: 0,
        location: 0,
        value: 0,
      },
      isVerifiedMeeting: false,
      meetingDate: null,
    });
    this.cancelled.emit();
  }
}
