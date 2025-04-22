// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (alert-form-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
import {
  Alert,
  AlertSeverity,
  AlertConditionType,
  AlertTimeWindow,
  AlertChannel,
} from '../../../../core/models/alert.model';
import { ErrorCategory } from '../../../../core/interceptors/http-error.interceptor';

@Component({
  selector: 'app-alert-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Alert' : 'Create Alert' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="alertForm">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Alert Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter alert name" />
            <mat-error *ngIf="alertForm.get('name')?.hasError('required')">
              Name is required
            </mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea
              matInput
              formControlName="description"
              placeholder="Enter alert description"
              rows="2"
            ></textarea>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Severity</mat-label>
            <mat-select formControlName="severity">
              <mat-option *ngFor="let severity of severityOptions" [value]="severity.value">
                {{ severity.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-slide-toggle formControlName="enabled" color="primary"> Enabled </mat-slide-toggle>
        </div>

        <mat-divider></mat-divider>

        <h3>Alert Condition</h3>
        <div formGroupName="condition">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Condition Type</mat-label>
              <mat-select formControlName="type" (selectionChange)="onConditionTypeChange()">
                <mat-option *ngFor="let type of conditionTypeOptions" [value]="type.value">
                  {{ type.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Time Window</mat-label>
              <mat-select formControlName="timeWindow">
                <mat-option *ngFor="let window of timeWindowOptions" [value]="window.value">
                  {{ window.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Threshold</mat-label>
              <input matInput type="number" formControlName="threshold" min="1" />
              <mat-error *ngIf="alertForm.get('condition.threshold')?.hasError('required')">
                Threshold is required
              </mat-error>
              <mat-error *ngIf="alertForm.get('condition.threshold')?.hasError('min')">
                Threshold must be at least 1
              </mat-error>
            </mat-form-field>

            <!-- Conditional fields based on condition type -->
            <ng-container [ngSwitch]="alertForm.get('condition.type')?.value">
              <!-- Error Code -->
              <mat-form-field appearance="outline" *ngSwitchCase="'error_code'">
                <mat-label>Error Code</mat-label>
                <input matInput formControlName="errorCode" placeholder="e.g. network_error" />
                <mat-error *ngIf="alertForm.get('condition.errorCode')?.hasError('required')">
                  Error code is required
                </mat-error>
              </mat-form-field>

              <!-- Status Code -->
              <mat-form-field appearance="outline" *ngSwitchCase="'status_code'">
                <mat-label>Status Code</mat-label>
                <input matInput type="number" formControlName="statusCode" placeholder="e.g. 500" />
                <mat-error *ngIf="alertForm.get('condition.statusCode')?.hasError('required')">
                  Status code is required
                </mat-error>
              </mat-form-field>

              <!-- Error Category -->
              <mat-form-field appearance="outline" *ngSwitchCase="'error_category'">
                <mat-label>Error Category</mat-label>
                <mat-select formControlName="errorCategory">
                  <mat-option
                    *ngFor="let category of errorCategoryOptions"
                    [value]="category.value"
                  >
                    {{ category.label }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="alertForm.get('condition.errorCategory')?.hasError('required')">
                  Error category is required
                </mat-error>
              </mat-form-field>

              <!-- Endpoint -->
              <mat-form-field appearance="outline" *ngSwitchCase="'performance_threshold'">
                <mat-label>Endpoint (optional)</mat-label>
                <input matInput formControlName="endpoint" placeholder="e.g. /api/users" />
              </mat-form-field>

              <!-- Pattern -->
              <mat-form-field appearance="outline" *ngSwitchCase="'error_pattern'">
                <mat-label>Error Pattern</mat-label>
                <input matInput formControlName="pattern" placeholder="e.g. *database*" />
                <mat-error *ngIf="alertForm.get('condition.pattern')?.hasError('required')">
                  Pattern is required
                </mat-error>
              </mat-form-field>
            </ng-container>
          </div>
        </div>

        <mat-divider></mat-divider>

        <h3>Notifications</h3>
        <div formArrayName="notifications">
          <div
            *ngFor="let notification of notificationsArray.controls; let i = index"
            [formGroupName]="i"
            class="notification-item"
          >
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Notification Channel</mat-label>
                <mat-select formControlName="channel" (selectionChange)="onChannelChange(i)">
                  <mat-option *ngFor="let channel of channelOptions" [value]="channel.value">
                    {{ channel.label }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <button
                mat-icon-button
                color="warn"
                type="button"
                (click)="removeNotification(i)"
                [disabled]="notificationsArray.length <= 1"
                matTooltip="Remove notification"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>

            <!-- Channel-specific fields -->
            <div class="form-row" [ngSwitch]="notification.get('channel')?.value">
              <!-- Email -->
              <mat-form-field appearance="outline" class="full-width" *ngSwitchCase="'email'">
                <mat-label>Email Address</mat-label>
                <input matInput formControlName="email" placeholder="Enter email address" />
                <mat-error *ngIf="notification.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="notification.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>

              <!-- Slack -->
              <mat-form-field appearance="outline" class="full-width" *ngSwitchCase="'slack'">
                <mat-label>Slack Webhook URL</mat-label>
                <input
                  matInput
                  formControlName="slackWebhook"
                  placeholder="Enter Slack webhook URL"
                />
                <mat-error *ngIf="notification.get('slackWebhook')?.hasError('required')">
                  Slack webhook URL is required
                </mat-error>
              </mat-form-field>

              <!-- Webhook -->
              <mat-form-field appearance="outline" class="full-width" *ngSwitchCase="'webhook'">
                <mat-label>Webhook URL</mat-label>
                <input matInput formControlName="webhookUrl" placeholder="Enter webhook URL" />
                <mat-error *ngIf="notification.get('webhookUrl')?.hasError('required')">
                  Webhook URL is required
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Message template -->
            <div class="form-row" *ngIf="notification.get('channel')?.value !== 'ui'">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Message Template (optional)</mat-label>
                <textarea
                  matInput
                  formControlName="messageTemplate"
                  placeholder="Enter custom message template"
                  rows="2"
                ></textarea>
                <mat-hint>Use {{ variables }} for dynamic content</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <div class="form-row">
            <button mat-button color="primary" type="button" (click)="addNotification()">
              <mat-icon>add</mat-icon> Add Notification Channel
            </button>
          </div>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="alertForm.invalid"
        (click)="saveAlert()"
      >
        {{ isEditMode ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: 500px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
        align-items: center;
      }

      .full-width {
        width: 100%;
      }

      mat-divider {
        margin: 24px 0;
      }

      h3 {
        margin-top: 0;
        margin-bottom: 16px;
      }

      .notification-item {
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 16px;
      }
    `,
  ],
})
export class AlertFormDialogComponent implements OnInit {
  alertForm: FormGroup;
  isEditMode = false;

  // Options for dropdowns
  severityOptions = [
    { value: AlertSeverity.INFO, label: 'Info' },
    { value: AlertSeverity.WARNING, label: 'Warning' },
    { value: AlertSeverity.ERROR, label: 'Error' },
    { value: AlertSeverity.CRITICAL, label: 'Critical' },
  ];

  conditionTypeOptions = [
    { value: AlertConditionType.ERROR_COUNT, label: 'Error Count' },
    { value: AlertConditionType.ERROR_RATE, label: 'Error Rate' },
    { value: AlertConditionType.PERFORMANCE_THRESHOLD, label: 'Performance Threshold' },
    { value: AlertConditionType.ERROR_PATTERN, label: 'Error Pattern' },
    { value: AlertConditionType.STATUS_CODE, label: 'Status Code' },
    { value: AlertConditionType.ERROR_CATEGORY, label: 'Error Category' },
  ];

  timeWindowOptions = [
    { value: AlertTimeWindow.MINUTES_5, label: '5 minutes' },
    { value: AlertTimeWindow.MINUTES_15, label: '15 minutes' },
    { value: AlertTimeWindow.MINUTES_30, label: '30 minutes' },
    { value: AlertTimeWindow.HOURS_1, label: '1 hour' },
    { value: AlertTimeWindow.HOURS_6, label: '6 hours' },
    { value: AlertTimeWindow.HOURS_12, label: '12 hours' },
    { value: AlertTimeWindow.HOURS_24, label: '24 hours' },
  ];

  channelOptions = [
    { value: AlertChannel.UI, label: 'UI Notification' },
    { value: AlertChannel.EMAIL, label: 'Email' },
    { value: AlertChannel.SLACK, label: 'Slack' },
    { value: AlertChannel.WEBHOOK, label: 'Webhook' },
  ];

  // Available variables for message templates
  variables = 'errorMessage, timestamp, count, endpoint';

  errorCategoryOptions = [
    { value: ErrorCategory.NETWORK, label: 'Network' },
    { value: ErrorCategory.AUTHENTICATION, label: 'Authentication' },
    { value: ErrorCategory.AUTHORIZATION, label: 'Authorization' },
    { value: ErrorCategory.VALIDATION, label: 'Validation' },
    { value: ErrorCategory.SERVER, label: 'Server' },
    { value: ErrorCategory.CLIENT, label: 'Client' },
    { value: ErrorCategory.TIMEOUT, label: 'Timeout' },
    { value: ErrorCategory.RATE_LIMIT, label: 'Rate Limit' },
    { value: ErrorCategory.NOT_FOUND, label: 'Not Found' },
    { value: ErrorCategory.CONFLICT, label: 'Conflict' },
    { value: ErrorCategory.UNKNOWN, label: 'Unknown' },
  ];

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    public dialogRef: MatDialogRef<AlertFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { alert?: Alert }
  ) {
    this.alertForm = this.createAlertForm();

    if (data?.alert) {
      this.isEditMode = true;
      this.populateForm(data.alert);
    }
  }

  ngOnInit(): void {}

  /**
   * Create the alert form
   */
  createAlertForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      enabled: [true],
      severity: [AlertSeverity.WARNING, Validators.required],
      condition: this.fb.group({
        type: [AlertConditionType.ERROR_COUNT, Validators.required],
        threshold: [10, [Validators.required, Validators.min(1)]],
        timeWindow: [AlertTimeWindow.MINUTES_15, Validators.required],
        errorCode: [''],
        statusCode: [null],
        errorCategory: [''],
        endpoint: [''],
        pattern: [''],
      }),
      notifications: this.fb.array([this.createNotificationGroup()]),
    });
  }

  /**
   * Create a notification form group
   */
  createNotificationGroup(): FormGroup {
    return this.fb.group({
      channel: [AlertChannel.UI, Validators.required],
      email: [''],
      slackWebhook: [''],
      webhookUrl: [''],
      messageTemplate: [''],
    });
  }

  /**
   * Get the notifications form array
   */
  get notificationsArray(): FormArray {
    return this.alertForm.get('notifications') as FormArray;
  }

  /**
   * Add a new notification
   */
  addNotification(): void {
    this.notificationsArray.push(this.createNotificationGroup());
  }

  /**
   * Remove a notification
   * @param index Index of the notification to remove
   */
  removeNotification(index: number): void {
    if (this.notificationsArray.length > 1) {
      this.notificationsArray.removeAt(index);
    }
  }

  /**
   * Handle condition type change
   */
  onConditionTypeChange(): void {
    const conditionType = this.alertForm.get('condition.type')?.value;
    const conditionGroup = this.alertForm.get('condition') as FormGroup;

    // Reset validators
    conditionGroup.get('errorCode')?.clearValidators();
    conditionGroup.get('statusCode')?.clearValidators();
    conditionGroup.get('errorCategory')?.clearValidators();
    conditionGroup.get('pattern')?.clearValidators();

    // Set validators based on condition type
    switch (conditionType) {
      case AlertConditionType.ERROR_COUNT:
      case AlertConditionType.ERROR_RATE:
        // No additional validators needed
        break;
      case AlertConditionType.STATUS_CODE:
        conditionGroup.get('statusCode')?.setValidators([Validators.required]);
        break;
      case AlertConditionType.ERROR_CATEGORY:
        conditionGroup.get('errorCategory')?.setValidators([Validators.required]);
        break;
      case AlertConditionType.ERROR_PATTERN:
        conditionGroup.get('pattern')?.setValidators([Validators.required]);
        break;
    }

    // Update validators
    conditionGroup.get('errorCode')?.updateValueAndValidity();
    conditionGroup.get('statusCode')?.updateValueAndValidity();
    conditionGroup.get('errorCategory')?.updateValueAndValidity();
    conditionGroup.get('pattern')?.updateValueAndValidity();
  }

  /**
   * Handle notification channel change
   * @param index Index of the notification
   */
  onChannelChange(index: number): void {
    const notificationGroup = this.notificationsArray.at(index) as FormGroup;
    const channel = notificationGroup.get('channel')?.value;

    // Reset validators
    notificationGroup.get('email')?.clearValidators();
    notificationGroup.get('slackWebhook')?.clearValidators();
    notificationGroup.get('webhookUrl')?.clearValidators();

    // Set validators based on channel
    switch (channel) {
      case AlertChannel.EMAIL:
        notificationGroup.get('email')?.setValidators([Validators.required, Validators.email]);
        break;
      case AlertChannel.SLACK:
        notificationGroup.get('slackWebhook')?.setValidators([Validators.required]);
        break;
      case AlertChannel.WEBHOOK:
        notificationGroup.get('webhookUrl')?.setValidators([Validators.required]);
        break;
    }

    // Update validators
    notificationGroup.get('email')?.updateValueAndValidity();
    notificationGroup.get('slackWebhook')?.updateValueAndValidity();
    notificationGroup.get('webhookUrl')?.updateValueAndValidity();
  }

  /**
   * Populate the form with an existing alert
   * @param alert Alert to populate the form with
   */
  populateForm(alert: Alert): void {
    // Set basic fields
    this.alertForm.patchValue({
      name: alert.name,
      description: alert.description || '',
      enabled: alert.enabled,
      severity: alert.severity,
      condition: {
        type: alert.condition.type,
        threshold: alert.condition.threshold,
        timeWindow: alert.condition.timeWindow,
        errorCode: alert.condition.errorCode || '',
        statusCode: alert.condition.statusCode || null,
        errorCategory: alert.condition.errorCategory || '',
        endpoint: alert.condition.endpoint || '',
        pattern: alert.condition.pattern || '',
      },
    });

    // Set notifications
    this.notificationsArray.clear();
    if (alert.notifications && alert.notifications.length > 0) {
      alert.notifications.forEach(notification => {
        const notificationGroup = this.createNotificationGroup();
        notificationGroup.patchValue({
          channel: notification.channel,
          email: notification.email || '',
          slackWebhook: notification.slackWebhook || '',
          webhookUrl: notification.webhookUrl || '',
          messageTemplate: notification.messageTemplate || '',
        });
        this.notificationsArray.push(notificationGroup);
      });
    } else {
      // Add default notification if none exists
      this.notificationsArray.push(this.createNotificationGroup());
    }

    // Update validators
    this.onConditionTypeChange();
    for (let i = 0; i < this.notificationsArray.length; i++) {
      this.onChannelChange(i);
    }
  }

  /**
   * Save the alert
   */
  saveAlert(): void {
    if (this.alertForm.invalid) {
      return;
    }

    const formValue = this.alertForm.value;
    const alert: Alert = {
      name: formValue.name,
      description: formValue.description,
      enabled: formValue.enabled,
      severity: formValue.severity,
      condition: {
        type: formValue.condition.type,
        threshold: formValue.condition.threshold,
        timeWindow: formValue.condition.timeWindow,
      },
      notifications: formValue.notifications,
    };

    // Add conditional fields based on condition type
    switch (formValue.condition.type) {
      case AlertConditionType.ERROR_COUNT:
      case AlertConditionType.ERROR_RATE:
        // No additional fields needed
        break;
      case AlertConditionType.STATUS_CODE:
        alert.condition.statusCode = formValue.condition.statusCode;
        break;
      case AlertConditionType.ERROR_CATEGORY:
        alert.condition.errorCategory = formValue.condition.errorCategory;
        break;
      case AlertConditionType.PERFORMANCE_THRESHOLD:
        if (formValue.condition.endpoint) {
          alert.condition.endpoint = formValue.condition.endpoint;
        }
        break;
      case AlertConditionType.ERROR_PATTERN:
        alert.condition.pattern = formValue.condition.pattern;
        break;
    }

    if (this.isEditMode && this.data.alert?.id) {
      // Update existing alert
      this.alertService.updateAlert(this.data.alert.id, alert).subscribe(
        updatedAlert => {
          this.dialogRef.close(updatedAlert);
        },
        error => {
          console.error('Error updating alert:', error);
        }
      );
    } else {
      // Create new alert
      this.alertService.createAlert(alert).subscribe(
        newAlert => {
          this.dialogRef.close(newAlert);
        },
        error => {
          console.error('Error creating alert:', error);
        }
      );
    }
  }
}
