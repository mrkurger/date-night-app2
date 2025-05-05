// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReviewFormComponent } from '../review-form/review-form.component';

export interface ReviewDialogData {
  advertiserId: string;
  advertiserName: string;
  adId?: string;
  existingReview?: any;
}

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, ReviewFormComponent],
  template: `
    <div class="review-dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.existingReview ? 'Edit Review' : 'Write a Review' }}</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <app-review-form
          [advertiserId]="data.advertiserId"
          [advertiserName]="data.advertiserName"
          [adId]="data.adId"
          [existingReview]="data.existingReview"
          (submitted)="onReviewSubmitted($event)"
          (cancelled)="onClose()"
        ></app-review-form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .review-dialog-container {
        min-width: 500px;
        max-width: 800px;
        padding: 0;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #eee;
      }

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      mat-dialog-content {
        padding: 0;
        margin: 0;
        max-height: 80vh;
        overflow-y: auto;
      }
    `,
  ],
})
export class ReviewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData,
  ) {}

  onReviewSubmitted(review: any): void {
    this.dialogRef.close(review);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
