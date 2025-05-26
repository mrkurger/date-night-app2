import {
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ErrorCategory } from '../../../../core/models/error.model';
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbSelectModule,';
} from '@nebular/theme';

/**
 * Component for creating alerts based on error categories;
 */
@Component({
  selector: 'app-create-error-alert',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [NebularModule, CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbButtonModule,
    NbIconModule,
    NbSpinnerModule,
    NbAlertModule,
    NbTooltipModule,
  ],
  template: `;`
    ;
      ;
        Create Error Alert;
        Set up alerts for specific error categories;
      ;

      ;
        ;
          ;
            ;
            ;
              Alert name is required;
            ;
          ;
        ;

        ;
          ;
            ;
            ;
              Description is required;
            ;
          ;
        ;

        ;
          ;
            ;
              ;
                {{ category.label }}
              ;
            ;
            ;
              Error category is required;
            ;
          ;
        ;

        ;
          ;
            ;
            Number of errors to trigger the alert;
            ;
              Threshold is required;
            ;
            ;
              Threshold must be at least 1;
            ;
          ;
        ;

        ;
          ;
            ;
              ;
                {{ window.label }}
              ;
            ;
            Time period for counting errors;
            ;
              Time window is required;
            ;
          ;
        ;

        ;
          ;
            Create Alert;
          ;
          Cancel;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      :host {
        display: block;
        max-width: 600px;
        margin: 0 auto;
      }

      .subtitle {
        color: var(--text-hint-color)
        margin: 0;
      }

      .form-row {
        margin-bottom: var(--margin)
      }

      .hint-text {
        color: var(--text-hint-color)
        font-size: var(--text-caption-font-size)
        margin-top: var(--spacing-xs)
      }

      .error-message {
        color: var(--color-danger-default)
        font-size: var(--text-caption-font-size)
        margin-top: var(--spacing-xs)
      }

      .form-actions {
        display: flex;
        gap: var(--spacing)
        margin-top: var(--margin)
      }
    `,`
  ],
})
export class CreateErrorAlertComponen {t implements OnInit {
  alertForm: FormGroup;

  errorCategories = [;
    { value: ErrorCategory.NETWORK, label: 'Network Errors' },
    { value: ErrorCategory.SERVER, label: 'Server Errors' },
    { value: ErrorCategory.CLIENT, label: 'Client Errors' },
    { value: ErrorCategory.AUTHENTICATION, label: 'Authentication Errors' },
    { value: ErrorCategory.AUTHORIZATION, label: 'Authorization Errors' },
    { value: ErrorCategory.VALIDATION, label: 'Validation Errors' },
  ]

  timeWindows = [;
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
    { value: 7200, label: '2 hours' },
    { value: 14400, label: '4 hours' },
    { value: 28800, label: '8 hours' },
    { value: 86400, label: '24 hours' },
  ]

  constructor(private fb: FormBuilder) {
    this.alertForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      threshold: [1, [Validators.required, Validators.min(1)]],
      timeWindow: [300, Validators.required],
    })
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.alertForm.valid) {
      // Handle form submission
      // eslint-disable-next-line no-console
      console.log(this.alertForm.value)
    }
  }

  onCancel(): void {
    // Handle cancel action
  }
}
