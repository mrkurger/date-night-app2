import { NbDialogRef, , ,  } from '@nebular/theme';
import { _NebularModule } from '../../nebular.module';

import { Component, Inject } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';

import { ReviewFormComponent } from '../review-form/review-form.component';

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

export interface ReviewDialogData {
  advertiserId: string;
  advertiserName: string;
  adId?: string;
  existingReview?: ReviewData;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [CommonModule, ReviewFormComponent],
  template: `
    <nb-card class="review-dialog-container">
      <nb-card-header class="dialog-header">
        <h2>{{ data.existingReview ? 'Edit Review' : 'Write a Review' }}</h2>
        <button nbButton ghost (click)="onClose()">
          <nb-icon icon="close"></nb-icon>
        </button>
      </nb-card-header>

      <nb-card-body>
        <app-review-form
          [advertiserId]="data.advertiserId"
          [advertiserName]="data.advertiserName"
          [adId]="data.adId"
          [existingReview]="data.existingReview"
          (submitted)="onReviewSubmitted($event)"
          (cancelled)="onClose()"
        ></app-review-form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [
    `
      .review-dialog-container {
        max-width: 800px;
        width: 100%;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `,
  ],
})
export class ReviewDialogComponent {
  constructor(
    private dialogRef: NbDialogRef<ReviewDialogComponent>,
    @Inject('REVIEW_DIALOG_DATA')
    public data: ReviewDialogData = {
      advertiserId: '',
      advertiserName: '',
    },
  ) {}

  onReviewSubmitted(review: ReviewData): void {
    this.dialogRef.close(review);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
