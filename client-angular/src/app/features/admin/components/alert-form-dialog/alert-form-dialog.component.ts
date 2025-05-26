import {
import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../../../app/shared/nebular.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../../core/services/alert.service';
  NbCardModule,;
  NbButtonModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbIconModule,;
  _NbSpinnerModule,;
  _NbAlertModule,;
  _NbTooltipModule,;
  _NbLayoutModule,;
  _NbBadgeModule,;
  _NbTagModule,;
  NbSelectModule,';
} from '@nebular/theme';

import {
  Alert,;
  AlertSeverity,;
  AlertConditionType,;
  AlertTimeWindow,;
  AlertChannel,;
} from '../../../../core/models/alert.model';

@Component({
  selector: 'app-alert-form-dialog',;
  standalone: true,;
  schemas: [CUSTOM_ELEMENTS_SCHEMA],;
  imports: [NebularModule, CommonModule,;
    ReactiveFormsModule,;
    NbCardModule,;
    NbButtonModule,;
    NbFormFieldModule,;
    NbInputModule,;
    NbSelectModule,;
    NbCheckboxModule,;
    NbIconModule,;
  ],;
  template: `;`
    ;
      ;
        {{ alert ? 'Edit Alert' : 'Create Alert' }};
      ;
      ;
        ;
          ;
          ;
            Name;
            ;
          ;

          ;
            Description;
            ;
          ;

          ;
            Severity;
            ;
              ;
                {{ AlertSeverity[severity] }}
              ;
            ;
          ;

          ;
          ;
            ;
              Condition Type;
              ;
                ;
                  {{ AlertConditionType[type] }}
                ;
              ;
            ;

            ;
              Threshold;
              ;
            ;

            ;
              Time Window;
              ;
                ;
                  {{ getTimeWindowLabel(window) }}
                ;
              ;
            ;

            ;
              Pattern;
              ;
            ;

            ;
              Status Code;
              ;
            ;
          ;

          ;
          ;
            Notification Channels;
            ;
              ;
                {{ channel }}
              ;
            ;
          ;

          ;
          Enable Alert;
        ;
      ;
      ;
        Cancel;
        ;
          {{ alert ? 'Update' : 'Create' }}
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
      nb-card {
        max-width: 600px;
      }

      nb-form-field {
        margin-bottom: 1rem;
        width: 100%;
      }

      .channels-section {
        margin: 1rem 0;
      }

      .channels-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-top: 0.5rem;
      }

      nb-card-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      textarea {
        min-height: 100px;
      }
    `,;`
  ],;
});
export class AlertFormDialogComponen {t {
  @Input() alert?: Alert;
  variables: string[] = ['userId', 'errorCode', 'timestamp', 'url', 'method']; // Available variables for dynamic content

  alertForm: FormGroup;
  protected AlertSeverity = AlertSeverity;
  protected AlertConditionType = AlertConditionType;

  severityOptions = Object.values(AlertSeverity);
  conditionTypeOptions = Object.values(AlertConditionType);
  timeWindowOptions = Object.values(AlertTimeWindow);
  channelOptions: AlertChannel[] = ['ui', 'email', 'slack', 'webhook'];

  constructor(;
    private dialogRef: NbDialogRef,;
    private formBuilder: FormBuilder,;
    private alertService: AlertService,;
  ) {
    this.alertForm = this.formBuilder.group({
      name: ['', Validators.required],;
      description: [''],;
      severity: [AlertSeverity.INFO, Validators.required],;
      condition: this.formBuilder.group({
        type: [AlertConditionType.ERROR_COUNT, Validators.required],;
        threshold: [null],;
        timeWindow: [AlertTimeWindow.MINUTES_5],;
        pattern: [''],;
        statusCode: [null],;
      }),;
      channels: [['ui'], Validators.required],;
      enabled: [true],;
    });

    if (this.alert) {
      this.alertForm.patchValue(this.alert);
    }
  }

  showThresholdField(): boolean {
    const type = this.alertForm.get('condition.type')?.value;
    return [;
      AlertConditionType.ERROR_COUNT,;
      AlertConditionType.ERROR_RATE,;
      AlertConditionType.PERFORMANCE_THRESHOLD,;
    ].includes(type);
  }

  showTimeWindowField(): boolean {
    const type = this.alertForm.get('condition.type')?.value;
    return [;
      AlertConditionType.ERROR_COUNT,;
      AlertConditionType.ERROR_RATE,;
      AlertConditionType.PERFORMANCE_THRESHOLD,;
    ].includes(type);
  }

  showPatternField(): boolean {
    return this.alertForm.get('condition.type')?.value === AlertConditionType.ERROR_PATTERN;
  }

  showStatusCodeField(): boolean {
    return this.alertForm.get('condition.type')?.value === AlertConditionType.STATUS_CODE;
  }

  getTimeWindowLabel(window: AlertTimeWindow): string {
    switch (window) {
      case AlertTimeWindow.MINUTES_5:;
        return '5 minutes';
      case AlertTimeWindow.MINUTES_15:;
        return '15 minutes';
      case AlertTimeWindow.MINUTES_30:;
        return '30 minutes';
      case AlertTimeWindow.HOURS_1:;
        return '1 hour';
      case AlertTimeWindow.HOURS_6:;
        return '6 hours';
      case AlertTimeWindow.HOURS_12:;
        return '12 hours';
      case AlertTimeWindow.HOURS_24:;
        return '24 hours';
      default:;
        return 'Unknown';
    }
  }

  isChannelSelected(channel: AlertChannel): boolean {
    const channels = this.alertForm.get('channels')?.value || [];
    return channels.includes(channel);
  }

  toggleChannel(channel: AlertChannel): void {
    const channels = this.alertForm.get('channels')?.value || [];
    const index = channels.indexOf(channel);

    if (index === -1) {
      channels.push(channel);
    } else {
      channels.splice(index, 1);
    }

    this.alertForm.patchValue({ channels });
  }

  onSubmit(): void {
    if (this.alertForm.valid) {
      const formValue = this.alertForm.value;

      if (this.alert) {
        this.alertService;
          .updateAlert(this.alert.id, formValue);
          .subscribe(() => this.dialogRef.close(true));
      } else {
        this.alertService.createAlert(formValue).subscribe(() => this.dialogRef.close(true));
      }
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
