import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ReviewData {
  rating: number;
  title: string;
  content: string;
  anonymous: boolean;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
})
export class ReviewFormComponent implements OnInit {
  @Input() adId!: string;
  @Input() existingReview: any = null;
  @Output() reviewSubmitted = new EventEmitter<ReviewData>();
  @Output() cancel = new EventEmitter<void>();

  reviewForm!: FormGroup;
  submitting = false;
  ratingOptions = [1, 2, 3, 4, 5];
  isEditMode = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEditMode = !!this.existingReview;
    this.initForm();
  }

  /**
   * Initialize the review form
   */
  private initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [
        this.existingReview?.rating || 5,
        [Validators.required, Validators.min(1), Validators.max(5)],
      ],
      title: [this.existingReview?.title || '', [Validators.required, Validators.maxLength(100)]],
      content: [
        this.existingReview?.content || '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(1000)],
      ],
      anonymous: [this.existingReview?.anonymous || false],
    });
  }

  /**
   * Submit the review form
   */
  onSubmit(): void {
    if (this.reviewForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.reviewForm.controls).forEach(key => {
        const control = this.reviewForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    const reviewData: ReviewData = this.reviewForm.value;

    // Emit the review data to the parent component
    setTimeout(() => {
      this.reviewSubmitted.emit(reviewData);
      this.submitting = false;
    }, 500);
  }

  /**
   * Cancel the review form
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Set the rating value
   */
  setRating(rating: number): void {
    this.reviewForm.get('rating')?.setValue(rating);
  }

  /**
   * Get the star icon class based on the current rating
   */
  getStarClass(star: number): string {
    const currentRating = this.reviewForm.get('rating')?.value || 0;
    return star <= currentRating ? 'fas fa-star filled' : 'far fa-star';
  }
}
