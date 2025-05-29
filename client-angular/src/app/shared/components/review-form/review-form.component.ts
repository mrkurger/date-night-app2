import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 *
 */
@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div>Review Form Placeholder</div>`,
})
export class ReviewFormComponent {
  @Input() existingReview: any;
  @Input() advertiserId: string = '';
  @Input() adId: string = '';
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  /**
   *
   */
  submitReview(): void {
    this.submitted.emit({});
  }

  /**
   *
   */
  cancel(): void {
    this.cancelled.emit();
  }
}
