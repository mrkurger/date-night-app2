import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (report-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';


export interface ReportDialogData {
  userId?: string;
  advertiserId?: string;
  adId?: string;
  type?: 'user' | 'ad' | 'message';
  contentId?: string;
  title?: string;
  contentType?: string;
}

@Component({
  selector: 'app-report-dialog',
  imports: [CommonModule, ReactiveFormsModule, NbCardModule, NbButtonModule, NbInputModule, NbFormFieldModule, NbSelectModule, NbSpinnerModule, NbIconModule],
  template: `
    <nb-card class="report-dialog">
      <nb-card-header class="dialog-header">
        <h2>Report Issue</h2>
        <button nbButton ghost (click)="onClose()">
          <nb-icon icon="close"></nb-icon>
        </button>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="reportForm" (ngSubmit)="onSubmit()">
          <nb-form-field class="full-width">
            <label class="label">Reason for report *</label>
            <nb-select formControlName="reason" placeholder="Select a reason" fullWidth>
              <nb-option value="inappropriate">Inappropriate content</nb-option>
              <nb-option value="spam">Spam</nb-option>
              <nb-option value="fake">Fake profile</nb-option>
              <nb-option value="offensive">Offensive behavior</nb-option>
              <nb-option value="scam">Scam attempt</nb-option>
              <nb-option value="other">Other</nb-option>
            </nb-select>
            <div
              class="text-danger"
              *ngIf="
                reportForm.get('reason')?.hasError('required') && reportForm.get('reason')?.touched
              "
            >
              Please select a reason
            </div>
          </nb-form-field>

          <nb-form-field class="full-width">
            <label class="label">Details *</label>
            <textarea
              nbInput
              formControlName="details"
              placeholder="Please provide specific details..."
              rows="5"
              fullWidth
            ></textarea>
            <div class="text-right">{{ reportForm.get('details')?.value?.length || 0 }}/500</div>
            <div
              class="text-danger"
              *ngIf="
                reportForm.get('details')?.hasError('required') &&
                reportForm.get('details')?.touched
              "
            >
              Please provide details
            </div>
            <div class="text-danger" *ngIf="reportForm.get('details')?.hasError('maxlength')">
              Maximum 500 characters
            </div>
          </nb-form-field>

          <div class="form-actions">
            <button nbButton type="button" status="basic" (click)="onClose()">Cancel</button>
            <button
              nbButton
              type="submit"
              status="danger"
              [disabled]="reportForm.invalid || submitted"
            >
              Submit Report
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [
    `
      .report-dialog {
        max-width: 600px;
        width: 100%;
      }

      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .full-width {
        width: 100%;
        margin-bottom: 1rem;
      }

      .text-right {
        text-align: right;
        font-size: 0.875rem;
        color: #8f9bb3;
      }

      .text-danger {
        color: #ff3d71;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class ReportDialogComponent {
  reportForm: FormGroup;
  submitted = false;
  data: ReportDialogData = {};

  constructor(
    private dialogRef: NbDialogRef<ReportDialogComponent>,
    private fb: FormBuilder,
  ) {
    this.reportForm = this.fb.group({
      reason: ['', Validators.required],
      details: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      return;
    }

    this.submitted = true;
    const reportData = this.reportForm.value;

    setTimeout(() => {
      this.dialogRef.close(reportData);
    }, 1000);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
