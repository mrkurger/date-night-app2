// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (report-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

import {
import { NbDialogRef, NB_DIALOG_CONFIG } from '@nebular/theme';
import { NebularModule } from '../../nebular.module';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
  FormBuilder,;
  FormGroup,;
  ReactiveFormsModule,;
  Validators,;
  FormControl,';
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
  selector: 'app-report-dialog',;
  imports: [CommonModule, ReactiveFormsModule, NebularModule],;
  template: `;`
    ;
      ;
        {{ data?.title || 'Report Issue' }};
        ;
          ;
        ;
      ;
      ;
        ;
          ;
            Reason for report *;
            ;
              Inappropriate content;
              Spam;
              Fake profile;
              Offensive behavior;
              Scam attempt;
              Other;
            ;
            ;
              Please select a reason.;
            ;
          ;

          ;
            Details *;
            ;
            ;
              {{ reportForm.get('details')?.value?.length || 0 }}/500;
            ;
            ;
              Details are required.;
            ;
            ;
              Details cannot exceed 500 characters.;
            ;
          ;

          ;
            Cancel;
            ;
              Submit Report;
            ;
          ;
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
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
    `,;`
  ],;
});
export class ReportDialogComponen {t implements OnInit {
  reportForm!: FormGroup;
  submitted = false;
  data: ReportDialogData;

  constructor(;
    protected dialogRef: NbDialogRef,;
    private fb: FormBuilder,;
    @Optional() @Inject(NB_DIALOG_CONFIG) private injectedData?: ReportDialogData,;
  ) {
    this.data = this.injectedData || {};
  }

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reason: ['', Validators.required],;
      details: ['', [Validators.required, Validators.maxLength(500)]],;
      userId: [this.data?.userId],;
      advertiserId: [this.data?.advertiserId],;
      adId: [this.data?.adId],;
      type: [this.data?.type],;
      contentId: [this.data?.contentId],;
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
      ...this.data,;
      ...this.reportForm.value,;
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
