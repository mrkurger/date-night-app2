import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

export interface ReportDialogData {
  title: string;
  contentType: 'review' | 'profile' | 'ad' | 'message';
}

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="report-dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.title || 'Report Content' }}</h2>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="reportForm" (ngSubmit)="onSubmit()">
          <p class="report-intro">
            Please select a reason for reporting this {{ data.contentType }}. Your report will be
            reviewed by our moderation team.
          </p>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Reason for Report</mat-label>
            <mat-select formControlName="reason">
              <mat-option *ngFor="let reason of reportReasons" [value]="reason.value">
                {{ reason.label }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="reportForm.get('reason')?.hasError('required')">
              Please select a reason
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Additional Details</mat-label>
            <textarea
              matInput
              formControlName="details"
              placeholder="Please provide any additional information that might help our moderation team"
              rows="4"
            ></textarea>
            <mat-hint align="end">{{ reportForm.get('details')?.value?.length || 0 }}/500</mat-hint>
            <mat-error *ngIf="reportForm.get('details')?.hasError('maxlength')">
              Additional details cannot exceed 500 characters
            </mat-error>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="onClose()">Cancel</button>
            <button
              mat-raised-button
              color="warn"
              type="submit"
              [disabled]="reportForm.invalid || submitting"
            >
              <mat-icon *ngIf="submitting">hourglass_empty</mat-icon>
              Submit Report
            </button>
          </div>
        </form>
      </mat-dialog-content>
    </div>
  `,
  styles: [
    `
      .report-dialog-container {
        min-width: 400px;
        max-width: 600px;
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
        color: #d32f2f;
      }

      mat-dialog-content {
        padding: 24px;
      }

      .report-intro {
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
export class ReportDialogComponent {
  reportForm: FormGroup;
  submitting = false;

  reportReasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'offensive', label: 'Offensive Language' },
    { value: 'spam', label: 'Spam or Misleading' },
    { value: 'fake', label: 'Fake or Fraudulent' },
    { value: 'harassment', label: 'Harassment or Bullying' },
    { value: 'privacy', label: 'Privacy Violation' },
    { value: 'other', label: 'Other' },
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReportDialogData
  ) {
    this.reportForm = this.fb.group({
      reason: ['', Validators.required],
      details: ['', Validators.maxLength(500)],
    });

    // Add specific reasons based on content type
    if (data.contentType === 'review') {
      this.reportReasons.unshift(
        { value: 'inaccurate', label: 'Inaccurate Information' },
        { value: 'notHelpful', label: 'Not Helpful or Relevant' }
      );
    } else if (data.contentType === 'profile') {
      this.reportReasons.unshift(
        { value: 'impersonation', label: 'Impersonation' },
        { value: 'scam', label: 'Scam or Fraud' }
      );
    } else if (data.contentType === 'ad') {
      this.reportReasons.unshift(
        { value: 'misleading', label: 'Misleading Information' },
        { value: 'prohibited', label: 'Prohibited Content' },
        { value: 'duplicate', label: 'Duplicate Listing' }
      );
    } else if (data.contentType === 'message') {
      this.reportReasons.unshift(
        { value: 'threats', label: 'Threats or Violence' },
        { value: 'solicitation', label: 'Unwanted Solicitation' }
      );
    }
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      return;
    }

    this.submitting = true;

    // Combine reason and details
    const formValue = this.reportForm.value;
    const reasonLabel =
      this.reportReasons.find(r => r.value === formValue.reason)?.label || formValue.reason;

    let reportText = reasonLabel;
    if (formValue.details) {
      reportText += ': ' + formValue.details;
    }

    // Close dialog with report text
    setTimeout(() => {
      this.dialogRef.close(reportText);
      this.submitting = false;
    }, 500);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
