import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbDialogRef, NbCardModule, NbButtonModule, NbIconModule } from '@nebular/theme';
import { ReviewFormComponent } from '../review-form/review-form.component';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (review-dialog.component)
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
}

export interface ReviewDialogData {
  advertiserId: string;
  advertiserName: string;
  adId?: string;
  existingReview?: ReviewData;
}

@Component({';
    selector: 'app-review-dialog',;
    imports: [CommonModule, NbCardModule, NbButtonModule, NbIconModule, ReviewFormComponent],;
    template: `;`
    ;
      ;
        {{ data.existingReview ? 'Edit Review' : 'Write a Review' }};
        ;
          ;
        ;
      ;

      ;
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
      .review-dialog-container {
        max-width: 800px;
        width: 100%;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `,;`
    ];
});
export class ReviewDialogComponen {t {
  constructor(;
    private dialogRef: NbDialogRef,;
    @Inject('REVIEW_DIALOG_DATA');
    public data: ReviewDialogData = {
      advertiserId: '',;
      advertiserName: '',;
    },;
  ) {}

  onReviewSubmitted(review: ReviewData): void {
    this.dialogRef.close(review);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
