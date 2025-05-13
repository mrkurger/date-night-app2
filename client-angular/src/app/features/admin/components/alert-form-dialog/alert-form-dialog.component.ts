import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NbDialogRef,
  NbCardModule,
  NbButtonModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbCheckboxModule,
  NbIconModule,
} from '@nebular/theme';
import {
  Alert,
  AlertSeverity,
  AlertConditionType,
  AlertTimeWindow,
  AlertChannel,
} from '../../../../core/models/alert.model';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-alert-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbIconModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <h3>{{ alert ? 'Edit Alert' : 'Create Alert' }}</h3>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="alertForm" (ngSubmit)="onSubmit()">
          <!-- Basic Information -->
          <nb-form-field>
            <label>Name</label>
            <input nbInput formControlName="name" placeholder="Alert name" />
          </nb-form-field>

          <nb-form-field>
            <label>Description</label>
            <textarea
              nbInput
              formControlName="description"
              placeholder="Alert description"
            ></textarea>
          </nb-form-field>

          <nb-form-field>
            <label>Severity</label>
            <nb-select formControlName="severity">
              <nb-option *ngFor="let severity of severityOptions" [value]="severity">
                {{ AlertSeverity[severity] }}
              </nb-option>
            </nb-select>
          </nb-form-field>

          <!-- Condition -->
          <div formGroupName="condition">
            <nb-form-field>
              <label>Condition Type</label>
              <nb-select formControlName="type">
                <nb-option *ngFor="let type of conditionTypeOptions" [value]="type">
                  {{ AlertConditionType[type] }}
                </nb-option>
              </nb-select>
            </nb-form-field>

            <nb-form-field *ngIf="showThresholdField()">
              <label>Threshold</label>
              <input
                nbInput
                type="number"
                formControlName="threshold"
                placeholder="Threshold value"
              />
            </nb-form-field>

            <nb-form-field *ngIf="showTimeWindowField()">
              <label>Time Window</label>
              <nb-select formControlName="timeWindow">
                <nb-option *ngFor="let window of timeWindowOptions" [value]="window">
                  {{ getTimeWindowLabel(window) }}
                </nb-option>
              </nb-select>
            </nb-form-field>

            <nb-form-field *ngIf="showPatternField()">
              <label>Pattern</label>
              <input nbInput formControlName="pattern" placeholder="Error pattern" />
            </nb-form-field>

            <nb-form-field *ngIf="showStatusCodeField()">
              <label>Status Code</label>
              <input
                nbInput
                type="number"
                formControlName="statusCode"
                placeholder="HTTP status code"
              />
            </nb-form-field>
          </div>

          <!-- Notification Channels -->
          <div class="channels-section">
            <label>Notification Channels</label>
            <div class="channels-grid">
              <nb-checkbox
                *ngFor="let channel of channelOptions"
                [checked]="isChannelSelected(channel)"
                (checkedChange)="toggleChannel(channel)"
              >
                {{ channel }}
              </nb-checkbox>
            </div>
          </div>

          <!-- Enabled State -->
          <nb-checkbox formControlName="enabled">Enable Alert</nb-checkbox>
        </form>
      </nb-card-body>
      <nb-card-footer>
        <button nbButton status="basic" (click)="close()">Cancel</button>
        <button nbButton status="primary" (click)="onSubmit()" [disabled]="!alertForm.valid">
          {{ alert ? 'Update' : 'Create' }}
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
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
    `,
  ],
})
export class AlertFormDialogComponent {
  @Input() alert?: Alert;
  variables: string[] = ['userId', 'errorCode', 'timestamp', 'url', 'method']; // Available variables for dynamic content

  alertForm: FormGroup;
  protected AlertSeverity = AlertSeverity;
  protected AlertConditionType = AlertConditionType;

  severityOptions = Object.values(AlertSeverity);
  conditionTypeOptions = Object.values(AlertConditionType);
  timeWindowOptions = Object.values(AlertTimeWindow);
  channelOptions: AlertChannel[] = ['ui', 'email', 'slack', 'webhook'];

  constructor(
    private dialogRef: NbDialogRef<AlertFormDialogComponent>,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
  ) {
    this.alertForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      severity: [AlertSeverity.INFO, Validators.required],
      condition: this.formBuilder.group({
        type: [AlertConditionType.ERROR_COUNT, Validators.required],
        threshold: [null],
        timeWindow: [AlertTimeWindow.MINUTES_5],
        pattern: [''],
        statusCode: [null],
      }),
      channels: [['ui'], Validators.required],
      enabled: [true],
    });

    if (this.alert) {
      this.alertForm.patchValue(this.alert);
    }
  }

  showThresholdField(): boolean {
    const type = this.alertForm.get('condition.type')?.value;
    return [
      AlertConditionType.ERROR_COUNT,
      AlertConditionType.ERROR_RATE,
      AlertConditionType.PERFORMANCE_THRESHOLD,
    ].includes(type);
  }

  showTimeWindowField(): boolean {
    const type = this.alertForm.get('condition.type')?.value;
    return [
      AlertConditionType.ERROR_COUNT,
      AlertConditionType.ERROR_RATE,
      AlertConditionType.PERFORMANCE_THRESHOLD,
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
      case AlertTimeWindow.MINUTES_5:
        return '5 minutes';
      case AlertTimeWindow.MINUTES_15:
        return '15 minutes';
      case AlertTimeWindow.MINUTES_30:
        return '30 minutes';
      case AlertTimeWindow.HOURS_1:
        return '1 hour';
      case AlertTimeWindow.HOURS_6:
        return '6 hours';
      case AlertTimeWindow.HOURS_12:
        return '12 hours';
      case AlertTimeWindow.HOURS_24:
        return '24 hours';
      default:
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
        this.alertService
          .updateAlert(this.alert.id, formValue)
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
