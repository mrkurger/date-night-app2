import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Review Dialog Placeholder</div>`,
})
export class ReviewDialogComponent {
  /**
   *
   */
  onReviewSubmitted(review: any): void {
    console.log('Review submitted:', review);
  }

  /**
   *
   */
  onClose(): void {
    console.log('Dialog closed');
  }
}
