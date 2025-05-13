import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (create-error-alert.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  NbCardModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbButtonModule,
  NbToastrModule,
  NbToastrService,
  NbSpinnerModule,
} from '@nebular/theme';
import { AlertService } from '../../../../core/services/alert.service';
import { ErrorCategory } from '../../../../core/interceptors/http-error.interceptor';
import { AlertTimeWindow } from '../../../../core/models/alert.model';

/**
 * Component for creating alerts based on error categories
 */
@Component({
  selector: 'app-create-error-alert',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbButtonModule,
    NbToastrModule,
    NbSpinnerModule,
    ReactiveFormsModule,
  ],
  template: `
    <nb-card class="create-alert-card">
      <nb-card-header>
        <nb-card-title>Create Error Alert</mat-card-title>
        <nb-card-subtitle>Set up alerts for specific error categories</mat-card-subtitle>
      </nb-card-header>

      <nb-card-content>
        <form [formGroup]="alertForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Alert Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g., Critical Server Errors" />
            <mat-error *ngIf="alertForm.get('name')?.hasError('required')">
              Alert name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="3"
              placeholder="e.g., Alert for monitoring server errors"
            ></textarea>
            <mat-error *ngIf="alertForm.get('description')?.hasError('required')">
              Description is required
            </mat-error>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Error Category</mat-label>
              <mat-select formControlName="category">
                <mat-option *ngFor="let category of errorCategories" [value]="category.value">
                  {{ category.label }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="alertForm.get('category')?.hasError('required')">
                Error category is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Threshold</mat-label>
              <input matInput type="number" formControlName="threshold" min="1" />
              <mat-hint>Number of errors to trigger the alert</mat-hint>
              <mat-error *ngIf="alertForm.get('threshold')?.hasError('required')">
                Threshold is required
              </mat-error>
              <mat-error *ngIf="alertForm.get('threshold')?.hasError('min')">
                Threshold must be at least 1
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Time Window</mat-label>
              <mat-select formControlName="timeWindow">
                <mat-option *ngFor="let window of timeWindows" [value]="window.value">
                  {{ window.label }}
                </mat-option>
              </mat-select>
              <mat-hint>Time period for counting errors</mat-hint>
              <mat-error *ngIf="alertForm.get('timeWindow')?.hasError('required')">
                Time window is required
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="resetForm()">Reset</button>
            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="alertForm.invalid || isSubmitting"
            >
              <span *ngIf="!isSubmitting">Create Alert</span>
              <mat-spinner diameter="24" *ngIf="isSubmitting"></mat-spinner>
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [
    `
      .create-alert-card {
        max-width: 800px;
        margin: 20px auto;
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }

      .form-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 16px;
      }

      .form-row mat-form-field {
        flex: 1 1 200px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 24px;
      }

      button[type='submit'] {
        min-width: 120px;
      }
    `,
  ],
})
export class CreateErrorAlertComponent implements OnInit {
  alertForm: FormGroup;
  isSubmitting = false;

  // Error categories for dropdown
  errorCategories = Object.entries(ErrorCategory).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' '),
    value,
  }));

  // Time windows for dropdown
  timeWindows = [
    { label: '5 minutes', value: AlertTimeWindow.MINUTES_5 },
    { label: '15 minutes', value: AlertTimeWindow.MINUTES_15 },
    { label: '30 minutes', value: AlertTimeWindow.MINUTES_30 },
    { label: '1 hour', value: AlertTimeWindow.HOURS_1 },
    { label: '6 hours', value: AlertTimeWindow.HOURS_6 },
    { label: '12 hours', value: AlertTimeWindow.HOURS_12 },
    { label: '24 hours', value: AlertTimeWindow.HOURS_24 },
  ];

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private snackBar: NbToastrService,
  ) {
    this.alertForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: [ErrorCategory.SERVER, Validators.required],
      threshold: [5, [Validators.required, Validators.min(1)]],
      timeWindow: [AlertTimeWindow.HOURS_1, Validators.required],
    });
  }

  ngOnInit(): void {
    // Initialize form with default values
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.alertForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValues = this.alertForm.value;

    this.alertService
      .createErrorCategoryAlert(
        formValues.category,
        formValues.name,
        formValues.description,
        formValues.threshold,
        formValues.timeWindow,
      )
      .subscribe({
        next: (alert) => {
          this.isSubmitting = false;
          this.snackBar.open(`Alert "${alert.name}" created successfully`, 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar'],
          });
          this.resetForm();
        },
        error: (error) => {
          this.isSubmitting = false;
          this.snackBar.open(`Error creating alert: ${error.message || 'Unknown error'}`, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  /**
   * Reset the form to default values
   */
  resetForm(): void {
    this.alertForm.reset({
      name: '',
      description: '',
      category: ErrorCategory.SERVER,
      threshold: 5,
      timeWindow: AlertTimeWindow.HOURS_1,
    });
  }
}
