// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (response-dialog.component)
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

export interface ResponseDialogData {
  title: string;
  reviewTitle?: string;
  reviewContent?: string;
}

@Component({
  selector: 'app-response-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="response-dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.title || 'Respond to Review' }}</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="review-preview" *ngIf="data.reviewTitle || data.reviewContent">
          <h3 *ngIf="data.reviewTitle">{{ data.reviewTitle }}</h3>
          <p *ngIf="data.reviewContent">{{ data.reviewContent }}</p>
        </div>

        <form [formGroup]="responseForm" (ngSubmit)="onSubmit()">
          <p class="response-intro">
            Your response will be publicly visible alongside the review. This is your opportunity to
            address the reviewer's feedback.
          </p>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Your Response</mat-label>
            <textarea
              matInput
              formControlName="response"
              placeholder="Write your response here"
              rows="6"
            ></textarea>
            <mat-hint align="end"
              >{{ responseForm.get('response')?.value?.length || 0 }}/1000</mat-hint
            >
            <mat-error *ngIf="responseForm.get('response')?.hasError('required')">
              Response is required
            </mat-error>
            <mat-error *ngIf="responseForm.get('response')?.hasError('minlength')">
              Response must be at least 10 characters
            </mat-error>
            <mat-error *ngIf="responseForm.get('response')?.hasError('maxlength')">
              Response cannot exceed 1000 characters
            </mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="onClose()">Cancel</button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="responseForm.invalid || submitting"
            >
              <mat-icon *ngIf="submitting">hourglass_empty</mat-icon>
              Submit Response
            </button>
          </div>
        </form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .response-dialog-container {
        min-width: 500px;
        max-width: 700px;
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
        padding: 24px;
      }

      .review-preview {
        background-color: #f5f5f5;
        padding: 16px;
        border-radius: 4px;
        margin-bottom: 20px;
        border-left: 4px solid #2196f3;
      }

      .review-preview h3 {
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 16px;
        font-weight: 500;
      }

      .review-preview p {
        margin: 0;
        color: #555;
        font-style: italic;
      }

      .response-intro {
        margin-top: 0;
        margin-bottom: 20px;
        color: #555;
      }

      .full-width {
        width: 100%;
        margin-bottom: 20px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
    `,
  ],
})
export class ResponseDialogComponent {
  responseForm: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ResponseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResponseDialogData
  ) {
    this.responseForm = this.fb.group({
      response: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    });
  }

  onSubmit(): void {
    if (this.responseForm.invalid) {
      return;
    }

    this.submitting = true;

    // Close dialog with response text
    setTimeout(() => {
      this.dialogRef.close(this.responseForm.value.response);
      this.submitting = false;
    }, 500);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
