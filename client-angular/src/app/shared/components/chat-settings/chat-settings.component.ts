import { NbToggleModule } from '@nebular/theme';
import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbAlertModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat-settings.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface ChatSettings {
  messageExpiryEnabled: boolean;
  messageExpiryTime: number;
  encryptionEnabled: boolean;
}

@Component({
  selector: 'app-chat-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NbCardModule, NbButtonModule, NbIconModule, NbFormFieldModule, NbInputModule, NbSelectModule, NbToggleModule, NbSpinnerModule, NbAlertModule],
  template: `
    <nb-card>
      <nb-card-header>
        <h3>Chat Settings</h3>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
          <div class="settings-group">
            <nb-toggle formControlName="messageExpiryEnabled" status="primary">
              Enable Message Auto-Deletion
            </nb-toggle>
            <p class="hint-text">Messages will be automatically deleted after the specified time</p>

            <nb-form-field *ngIf="settingsForm.get('messageExpiryEnabled')?.value">
              <label>Message Expiry Time</label>
              <nb-select fullWidth formControlName="messageExpiryTime">
                <nb-option *ngFor="let option of expiryTimeOptions" [value]="option.value">
                  {{ option.label }}
                </nb-option>
              </nb-select>
            </nb-form-field>
          </div>

          <div class="settings-group">
            <nb-toggle formControlName="encryptionEnabled" status="primary">
              Enable End-to-End Encryption
            </nb-toggle>
            <p class="hint-text">
              Messages will be encrypted and can only be read by chat participants
            </p>
          </div>

          <nb-alert *ngIf="saveError" status="danger" class="settings-alert">
            Failed to save settings. Please try again.
          </nb-alert>

          <nb-alert *ngIf="saveSuccess" status="success" class="settings-alert">
            Settings saved successfully!
          </nb-alert>

          <div class="settings-actions">
            <button
              nbButton
              ghost
              status="basic"
              type="button"
              (click)="resetForm()"
              [disabled]="isSaving"
            >
              <nb-icon icon="refresh-outline"></nb-icon>
              Reset
            </button>
            <button
              nbButton
              status="primary"
              type="submit"
              [disabled]="settingsForm.invalid || isSaving"
            >
              <nb-spinner *ngIf="isSaving" size="small"></nb-spinner>
              <nb-icon *ngIf="!isSaving" icon="save-outline"></nb-icon>
              Save Settings
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [
    `
      .settings-group {
        margin-bottom: var(--nb-theme-margin-lg); /* was nb-theme(margin-lg) */

        .hint-text {
          margin: var(--nb-theme-margin-xs) 0 var(--nb-theme-margin); /* was nb-theme(margin-xs) 0 nb-theme(margin) */
          color: var(--nb-theme-text-hint-color); /* was nb-theme(text-hint-color) */
          font-size: var(
            --nb-theme-text-caption-font-size
          ); /* was nb-theme(text-caption-font-size) */
        }
      }

      .settings-alert {
        margin-bottom: var(--nb-theme-margin); /* was nb-theme(margin) */
      }

      .settings-actions {
        display: flex;
        gap: var(--nb-theme-spacing); /* was nb-theme(spacing) */
        justify-content: flex-end;
        margin-top: var(--nb-theme-margin-lg); /* was nb-theme(margin-lg) */
      }

      /* Dark theme adjustments */
      :host-context([data-theme='dark']) {
        .hint-text {
          color: var(--nb-theme-text-hint-color); /* was nb-theme(text-hint-color) */
        }
      }
    `,
  ],
})
export class ChatSettingsComponent implements OnInit {
  @Input() roomId!: string;
  @Input() settings: ChatSettings = {
    messageExpiryEnabled: false,
    messageExpiryTime: 24,
    encryptionEnabled: true,
  };

  @Output() settingsChanged = new EventEmitter<ChatSettings>();

  settingsForm!: FormGroup;
  isSaving = false;
  saveError = false;
  saveSuccess = false;

  // Predefined expiry time options in hours
  expiryTimeOptions = [
    { value: 1, label: '1 hour' },
    { value: 6, label: '6 hours' },
    { value: 12, label: '12 hours' },
    { value: 24, label: '1 day' },
    { value: 72, label: '3 days' },
    { value: 168, label: '1 week' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * Initialize the settings form
   */
  private initForm(): void {
    this.settingsForm = this.fb.group({
      messageExpiryEnabled: [this.settings.messageExpiryEnabled],
      messageExpiryTime: [
        this.settings.messageExpiryTime,
        [Validators.required, Validators.min(1)],
      ],
      encryptionEnabled: [this.settings.encryptionEnabled],
    });

    // Disable messageExpiryTime when messageExpiryEnabled is false
    this.settingsForm.get('messageExpiryEnabled')?.valueChanges.subscribe((enabled) => {
      const expiryTimeControl = this.settingsForm.get('messageExpiryTime');
      if (enabled) {
        expiryTimeControl?.enable();
      } else {
        expiryTimeControl?.disable();
      }
    });

    // Initialize disabled state
    if (!this.settings.messageExpiryEnabled) {
      this.settingsForm.get('messageExpiryTime')?.disable();
    }
  }

  /**
   * Save the chat settings
   */
  saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.saveError = false;
    this.saveSuccess = false;

    const settings = this.settingsForm.value;

    this.http
      .put<{ success: boolean }>(
        `${environment.apiUrl}/chat/rooms/${this.roomId}/settings`,
        settings,
      )
      .pipe(
        catchError((error) => {
          console.error('Error saving chat settings:', error);
          return of({ success: false });
        }),
      )
      .subscribe((response) => {
        this.isSaving = false;

        if (response.success) {
          this.saveSuccess = true;
          this.settingsChanged.emit(settings);

          // Hide success message after 3 seconds
          setTimeout(() => {
            this.saveSuccess = false;
          }, 3000);
        } else {
          this.saveError = true;
        }
      });
  }

  /**
   * Reset the form to the original settings
   */
  resetForm(): void {
    this.settingsForm.patchValue({
      messageExpiryEnabled: this.settings.messageExpiryEnabled,
      messageExpiryTime: this.settings.messageExpiryTime,
      encryptionEnabled: this.settings.encryptionEnabled,
    });

    this.saveError = false;
    this.saveSuccess = false;
  }
}
