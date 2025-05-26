import { NbDialogRef, NB_DIALOG_CONFIG } from '@nebular/theme';
import { NebularModule } from '../../nebular.module';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (response-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { SharedModule } from '../../shared.module';

export interface ResponseDialogData {
  title?: string;
  message?: string;
  reviewTitle?: string;
  reviewContent?: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

@Component({
  selector: 'app-response-dialog',
  template: `
    <nb-card>
      <nb-card-header>
        <h3>{{ data?.title || 'Response' }}</h3>
      </nb-card-header>
      <nb-card-body>
        <p *ngIf="data?.message">{{ data.message }}</p>
        <div *ngIf="data?.reviewTitle || data?.reviewContent" class="review-context">
          <h4 *ngIf="data.reviewTitle">Review: {{ data.reviewTitle }}</h4>
          <p *ngIf="data.reviewContent" class="review-content-preview">
            "{{ data.reviewContent | slice : 0 : 100
            }}{{ data.reviewContent && data.reviewContent.length > 100 ? '...' : '' }}"
          </p>
        </div>
        <form [formGroup]="responseForm">
          <nb-form-field>
            <label class="label" for="response">Your Response *</label>
            <textarea
              nbInput
              fullWidth
              formControlName="response"
              [placeholder]="data?.placeholder || 'Enter your response'"
              [rows]="data?.reviewContent ? 3 : 5"
              id="response"
            ></textarea>
            <div class="form-field-errors caption status-danger">
              <span
                *ngIf="responseForm.get('response')?.errors?.['required'] && responseForm.get('response')?.touched"
              >
                Response is required.
              </span>
              <span
                *ngIf="responseForm.get('response')?.errors?.['minlength'] && responseForm.get('response')?.touched"
              >
                Response must be at least
                {{ responseForm.get('response')?.errors?.['minlength']?.requiredLength }}
                characters.
              </span>
              <span
                *ngIf="responseForm.get('response')?.errors?.['maxlength'] && responseForm.get('response')?.touched"
              >
                Response cannot exceed
                {{ responseForm.get('response')?.errors?.['maxlength']?.requiredLength }}
                characters.
              </span>
            </div>
          </nb-form-field>
        </form>
      </nb-card-body>
      <nb-card-footer>
        <button nbButton status="basic" (click)="cancel()">Cancel</button>
        <button
          nbButton
          status="primary"
          [disabled]="responseForm.invalid || isSubmitting"
          (click)="submit()"
          [class.btn-loading]="isSubmitting"
        >
          <nb-icon icon="checkmark-circle-2-outline" pack="eva" *ngIf="!isSubmitting"></nb-icon>
          <nb-spinner size="small" *ngIf="isSubmitting"></nb-spinner>
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      :host nb-card {
        max-width: 600px;
        min-width: 400px;
        width: 100%;
      }

      :host nb-card-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      form {
        margin-top: 1rem;
      }

      .review-context {
        background-color: var(--background-basic-color-2);
        padding: 1rem;
        border-radius: var(--border-radius);
        margin-bottom: 1rem;
      }
      .review-context h4 {
        margin-top: 0;
        font-size: 1rem;
        font-weight: bold;
      }
      .review-content-preview {
        font-style: italic;
        color: var(--text-hint-color);
      }
      .btn-loading {
        cursor: wait;
      }
    `,
  ],
  imports: [CommonModule, ReactiveFormsModule, NebularModule, SharedModule],
})
export class ResponseDialogComponent implements OnInit {
  responseForm!: FormGroup;
  isSubmitting = false;
  data: ResponseDialogData;

  // Alias for isSubmitting to support tests
  get submitting(): boolean {
    return this.isSubmitting;
  }

  constructor(
    protected dialogRef: NbDialogRef<ResponseDialogComponent>,
    private fb: FormBuilder,
    @Optional() @Inject(NB_DIALOG_CONFIG) private injectedData?: ResponseDialogData,
  ) {
    this.data = this.injectedData || {};
    this.responseForm = this.fb.group({
      response: [
        '',
        [
          Validators.required,
          Validators.minLength(this.data?.minLength || 10),
          Validators.maxLength(this.data?.maxLength || 1000),
        ],
      ],
    });
  }

  ngOnInit(): void {
    // Validators are set in constructor based on data, no need to update here unless data changes post-init
  }

  // Alias for submit() to support tests
  onSubmit(): void {
    this.submit();
  }

  submit(): void {
    this.responseForm.markAllAsTouched();
    if (this.responseForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const responseValue = this.responseForm.get('response')?.value;
    // Simulate API call
    console.log('Submitting response:', responseValue);
    of(responseValue)
      .pipe(
        delay(1000),
        tap(() => {
          this.dialogRef.close(responseValue);
          this.isSubmitting = false;
        }),
      )
      .subscribe();
  }

  // Method to close the dialog
  onClose(): void {
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
