import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  NbCardModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbButtonModule,
  NbIconModule,
} from '@nebular/theme';
import { ErrorCategory } from '../../../../core/models/error.model';

/**
 * Component for creating alerts based on error categories
 */
@Component({
  selector: 'app-create-error-alert',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbButtonModule,
    NbIconModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <h3>Create Error Alert</h3>
        <p class="subtitle">Set up alerts for specific error categories</p>
      </nb-card-header>

      <nb-card-body [formGroup]="alertForm">
        <div class="form-row">
          <nb-form-field>
            <input
              nbInput
              fullWidth
              formControlName="name"
              placeholder="Alert Name"
              [status]="
                alertForm.get('name')?.invalid && alertForm.get('name')?.touched
                  ? 'danger'
                  : 'basic'
              "
            />
            <span
              class="error-message"
              *ngIf="alertForm.get('name')?.hasError('required') && alertForm.get('name')?.touched"
            >
              Alert name is required
            </span>
          </nb-form-field>
        </div>

        <div class="form-row">
          <nb-form-field>
            <textarea
              nbInput
              fullWidth
              formControlName="description"
              placeholder="Description"
              rows="3"
              [status]="
                alertForm.get('description')?.invalid && alertForm.get('description')?.touched
                  ? 'danger'
                  : 'basic'
              "
            ></textarea>
            <span
              class="error-message"
              *ngIf="
                alertForm.get('description')?.hasError('required') &&
                alertForm.get('description')?.touched
              "
            >
              Description is required
            </span>
          </nb-form-field>
        </div>

        <div class="form-row">
          <nb-form-field>
            <nb-select
              fullWidth
              formControlName="category"
              placeholder="Error Category"
              [status]="
                alertForm.get('category')?.invalid && alertForm.get('category')?.touched
                  ? 'danger'
                  : 'basic'
              "
            >
              <nb-option *ngFor="let category of errorCategories" [value]="category.value">
                {{ category.label }}
              </nb-option>
            </nb-select>
            <span
              class="error-message"
              *ngIf="
                alertForm.get('category')?.hasError('required') &&
                alertForm.get('category')?.touched
              "
            >
              Error category is required
            </span>
          </nb-form-field>
        </div>

        <div class="form-row">
          <nb-form-field>
            <input
              nbInput
              fullWidth
              type="number"
              formControlName="threshold"
              placeholder="Threshold"
              [status]="
                alertForm.get('threshold')?.invalid && alertForm.get('threshold')?.touched
                  ? 'danger'
                  : 'basic'
              "
            />
            <span class="hint-text">Number of errors to trigger the alert</span>
            <span
              class="error-message"
              *ngIf="
                alertForm.get('threshold')?.hasError('required') &&
                alertForm.get('threshold')?.touched
              "
            >
              Threshold is required
            </span>
            <span
              class="error-message"
              *ngIf="
                alertForm.get('threshold')?.hasError('min') && alertForm.get('threshold')?.touched
              "
            >
              Threshold must be at least 1
            </span>
          </nb-form-field>
        </div>

        <div class="form-row">
          <nb-form-field>
            <nb-select
              fullWidth
              formControlName="timeWindow"
              placeholder="Time Window"
              [status]="
                alertForm.get('timeWindow')?.invalid && alertForm.get('timeWindow')?.touched
                  ? 'danger'
                  : 'basic'
              "
            >
              <nb-option *ngFor="let window of timeWindows" [value]="window.value">
                {{ window.label }}
              </nb-option>
            </nb-select>
            <span class="hint-text">Time period for counting errors</span>
            <span
              class="error-message"
              *ngIf="
                alertForm.get('timeWindow')?.hasError('required') &&
                alertForm.get('timeWindow')?.touched
              "
            >
              Time window is required
            </span>
          </nb-form-field>
        </div>

        <div class="form-actions">
          <button nbButton status="primary" (click)="onSubmit()" [disabled]="!alertForm.valid">
            Create Alert
          </button>
          <button nbButton status="basic" (click)="onCancel()">Cancel</button>
        </div>
      </nb-card-body>
    </nb-card>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 600px;
        margin: 0 auto;
      }

      .subtitle {
        color: var(--text-hint-color);
        margin: 0;
      }

      .form-row {
        margin-bottom: var(--margin);
      }

      .hint-text {
        color: var(--text-hint-color);
        font-size: var(--text-caption-font-size);
        margin-top: var(--spacing-xs);
      }

      .error-message {
        color: var(--color-danger-default);
        font-size: var(--text-caption-font-size);
        margin-top: var(--spacing-xs);
      }

      .form-actions {
        display: flex;
        gap: var(--spacing);
        margin-top: var(--margin);
      }
    `,
  ],
})
export class CreateErrorAlertComponent implements OnInit {
  alertForm: FormGroup;

  errorCategories = [
    { value: ErrorCategory.NETWORK, label: 'Network Errors' },
    { value: ErrorCategory.SERVER, label: 'Server Errors' },
    { value: ErrorCategory.CLIENT, label: 'Client Errors' },
    { value: ErrorCategory.AUTHENTICATION, label: 'Authentication Errors' },
    { value: ErrorCategory.AUTHORIZATION, label: 'Authorization Errors' },
    { value: ErrorCategory.VALIDATION, label: 'Validation Errors' },
  ];

  timeWindows = [
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 7200, label: '2 hours' },
    { value: 14400, label: '4 hours' },
    { value: 28800, label: '8 hours' },
    { value: 86400, label: '24 hours' },
  ];

  constructor(private fb: FormBuilder) {
    this.alertForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      threshold: [1, [Validators.required, Validators.min(1)]],
      timeWindow: [300, Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.alertForm.valid) {
      // Handle form submission
      // eslint-disable-next-line no-console
      console.log(this.alertForm.value);
    }
  }

  onCancel(): void {
    // Handle cancel action
  }
}
