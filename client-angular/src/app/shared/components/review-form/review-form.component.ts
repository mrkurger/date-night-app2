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
import {
  NbCardModule,
  NbInputModule,
  NbFormFieldModule,
  NbCheckboxModule,
  NbButtonModule,
  NbDatepickerModule,
  NbIconModule,
  NbStepperModule,
  NbSelectModule,
  NbTooltipModule,
} from '@nebular/theme';

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
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbInputModule,
    NbFormFieldModule,
    NbCheckboxModule,
    NbButtonModule,
    NbDatepickerModule,
    NbIconModule,
    NbStepperModule,
    NbSelectModule,
    NbTooltipModule,
  ],
  template: `<div>Review Form Component</div>`,
  styles: [],
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
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      isAnonymous: [false],
      categories: this.fb.group({
        communication: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
        appearance: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
        location: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
        value: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      }),
      isVerifiedMeeting: [false],
      meetingDate: [null],
    });

    if (this.existingReview) {
      this.reviewForm.patchValue(this.existingReview);
    }
  }

  submitReview() {
    if (this.reviewForm.invalid) {
      return;
    }

    const reviewData: ReviewData = {
      ...this.reviewForm.value,
      advertiser: this.advertiserId,
    };

    this.submitted.emit(reviewData);
  }

  cancel() {
    this.cancelled.emit();
  }
}
