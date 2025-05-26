import { NbDialogRef, NB_DIALOG_CONFIG } from '@nebular/theme';
import { NebularModule } from '../../nebular.module';

import { Component, Inject, OnInit, Optional } from '@angular/core';
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
  imports: [CommonModule, ReactiveFormsModule, NebularModule],
  template: `
    <nb-card class="report-dialog">
      <nb-card-header class="dialog-header">
        <h2>{{ data?.title || 'Report Issue' }}</h2>
        <button nbButton ghost (click)="onClose()">
          <nb-icon icon="close-outline"></nb-icon>
        </button>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="reportForm" (ngSubmit)="onSubmit()">
          <nb-form-field class="full-width">
            <label class="label" for="reason">Reason for report *</label>
            <nb-select formControlName="reason" placeholder="Select a reason" fullWidth id="reason">
              <nb-option value="inappropriate">Inappropriate content</nb-option>
              <nb-option value="spam">Spam</nb-option>
              <nb-option value="fake">Fake profile</nb-option>
              <nb-option value="offensive">Offensive behavior</nb-option>
              <nb-option value="scam">Scam attempt</nb-option>
              <nb-option value="other">Other</nb-option>
            </nb-select>
            <p
              class="caption status-danger"
              *ngIf="reportForm.get('reason')?.invalid && reportForm.get('reason')?.touched"
            >
              Please select a reason.
            </p>
          </nb-form-field>

          <nb-form-field class="full-width">
            <label class="label" for="details">Details *</label>
            <textarea
              nbInput
              formControlName="details"
              placeholder="Please provide specific details..."
              rows="5"
              fullWidth
              id="details"
            ></textarea>
            <div class="text-right" *ngIf="reportForm.get('details')?.value">
              {{ reportForm.get('details')?.value?.length || 0 }}/500
            </div>
            <p
              class="caption status-danger"
              *ngIf="reportForm.get('details')?.errors?.['required'] && reportForm.get('details')?.touched"
            >
              Details are required.
            </p>
            <p
              class="caption status-danger"
              *ngIf="reportForm.get('details')?.errors?.['maxlength'] && reportForm.get('details')?.touched"
            >
              Details cannot exceed 500 characters.
            </p>
          </nb-form-field>

          <div class="form-actions">
            <button nbButton type="button" status="basic" (click)="onClose()">Cancel</button>
            <button
              nbButton
              type="submit"
              status="danger"
              [disabled]="reportForm.invalid || submitted"
              [class.btn-loading]="submitted"
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
        min-width: 400px;
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
        color: var(--text-hint-color);
      }

      .btn-loading {
        cursor: wait;
      }
    `,
  ],
})
export class ReportDialogComponent implements OnInit {
  reportForm!: FormGroup;
  submitted = false;
  data: ReportDialogData;

  constructor(
    protected dialogRef: NbDialogRef<ReportDialogComponent>,
    private fb: FormBuilder,
    @Optional() @Inject(NB_DIALOG_CONFIG) private injectedData?: ReportDialogData,
  ) {
    this.data = this.injectedData || {};
  }

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reason: ['', Validators.required],
      details: ['', [Validators.required, Validators.maxLength(500)]],
      userId: [this.data?.userId],
      advertiserId: [this.data?.advertiserId],
      adId: [this.data?.adId],
      type: [this.data?.type],
      contentId: [this.data?.contentId],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.reportForm.markAllAsTouched();

    if (this.reportForm.invalid) {
      this.submitted = false;
      return;
    }

    const reportData = {
      ...this.data,
      ...this.reportForm.value,
    };

    console.log('Submitting report:', reportData);
    setTimeout(() => {
      this.dialogRef.close(reportData);
      this.submitted = false;
    }, 1000);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
