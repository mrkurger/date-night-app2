import {
  NbDialogRef,
  NB_DIALOG_CONFIG,
  ,
  ,
  ,
  ,
  ,
  ,
} from '@nebular/theme';
import { _NebularModule } from '../../nebular.module';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (response-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  _FormControl,
} from '@angular/forms';

import { _SharedModule } from '../../shared.module';

export interface ResponseDialogData {
  title: string;
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
        <p>{{ data?.message }}</p>
        <form [formGroup]="responseForm">
          <nb-form-field>
            <textarea
              nbInput
              fullWidth
              formControlName="response"
              [placeholder]="data?.placeholder || 'Enter your response'"
              [rows]="4"
            ></textarea>
            <div class="form-field-errors">
              <span *ngIf="responseForm.get('response')?.errors?.['required']" class="text-danger">
                Response is required
              </span>
              <span *ngIf="responseForm.get('response')?.errors?.['minlength']" class="text-danger">
                Response must be at least {{ data?.minLength }} characters
              </span>
              <span *ngIf="responseForm.get('response')?.errors?.['maxlength']" class="text-danger">
                Response cannot exceed {{ data?.maxLength }} characters
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
        >
          <nb-icon icon="checkmark-circle-2-outline" pack="eva" *ngIf="!isSubmitting"></nb-icon>
          <nb-spinner size="small" *ngIf="isSubmitting"></nb-spinner>
          Submit
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      :host {
        nb-card {
          max-width: 600px;
          width: 100%;
        }

        nb-card-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        form {
          margin-top: 1rem;
        }

        textarea {
          width: 100%;
        }
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
})
export class ResponseDialogComponent implements OnInit {
  responseForm: FormGroup;
  isSubmitting = false;

  // Alias for isSubmitting to support tests
  get submitting(): boolean {
    return this.isSubmitting;
  }

  constructor(
    private dialogRef: NbDialogRef<ResponseDialogComponent>,
    private fb: FormBuilder,
    @Inject(NB_DIALOG_CONFIG) public data: ResponseDialogData,
  ) {
    this.responseForm = this.fb.group({
      response: [
        '',
        [
          Validators.required,
          Validators.minLength(data?.minLength || 1),
          Validators.maxLength(data?.maxLength || 1000),
        ],
      ],
    });
  }

  ngOnInit(): void {
    // Update validators with actual min/max lengths if needed
    const currentValidators = this.responseForm.get('response')?.validator;
    if (currentValidators) {
      this.responseForm
        .get('response')
        ?.setValidators([
          currentValidators,
          Validators.minLength(this.data?.minLength || 1),
          Validators.maxLength(this.data?.maxLength || 1000),
        ]);
      this.responseForm.get('response')?.updateValueAndValidity();
    }
  }

  // Alias for submit() to support tests
  onSubmit(): void {
    this.submit();
  }

  submit(): void {
    if (this.responseForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    // Simulate API call
    setTimeout(() => {
      this.dialogRef.close(this.responseForm.value.response);
      this.isSubmitting = false;
    }, 1000);
  }

  // Method to close the dialog
  onClose(): void {
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
