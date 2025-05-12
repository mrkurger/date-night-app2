// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (alert-form-dialog.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {
  NbDialogRef,
  NB_DIALOG_CONFIG,
  NbButtonModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbToggleModule,
  NbCheckboxModule,
  NbIconModule,
  NbAccordionModule,
  NbCardModule,
} from '@nebular/theme';
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
  templateUrl: './alert-form-dialog.component.html',
  styleUrls: ['./alert-form-dialog.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NbButtonModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbToggleModule,
    NbCheckboxModule,
    NbIconModule,
    NbAccordionModule,
    NbCardModule,
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
    public dialogRef: NbDialogRef<AlertFormDialogComponent>,
    @Inject(NB_DIALOG_CONFIG) public data: { alert?: Alert },
  ) {
    this.alertForm = this.createAlertForm();

    if (data?.alert) {
      this.isEditMode = true;
      this.populateForm(data.alert);
    }
  }

  ngOnInit(): void {
    // Initialize form and load any existing alert data if in edit mode
    this.initializeForm();
  }

  private initializeForm(): void {
    if (this.data && this.data.alert) {
      // In edit mode, populate form with existing alert data
      this.alertForm.patchValue(this.data.alert);
    }
  }

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
      alert.notifications.forEach((notification) => {
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
        (updatedAlert) => {
          this.dialogRef.close(updatedAlert);
        },
        (error) => {
          console.error('Error updating alert:', error);
        },
      );
    } else {
      // Create new alert
      this.alertService.createAlert(alert).subscribe(
        (newAlert) => {
          this.dialogRef.close(newAlert);
        },
        (error) => {
          console.error('Error creating alert:', error);
        },
      );
    }
  }
}
