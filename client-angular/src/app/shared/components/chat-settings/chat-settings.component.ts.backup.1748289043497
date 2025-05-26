// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (chat-settings.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ChatService } from '../../../core/services/chat.service';

// Types
interface IChatSettings {
  messageExpiryEnabled: boolean;
  messageExpiryTime: number;
  encryptionEnabled: boolean;
}

/**
 * Chat Settings Component
 *
 * Provides a configurable UI for chat room settings including:
 * - Message auto-deletion with configurable timeframes
 * - End-to-end encryption toggle
 *
 * @remarks
 * This component integrates with ChatService to persist settings
 */
@Component({
  selector: 'app-chat-settings',
  imports: [
    CardModule,
    ButtonModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    InputSwitchModule,
    MessageModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    RippleModule,
  ],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <h3>Chat Settings</h3>
      </ng-template>

      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
        <div class="settings-group">
          <div class="field-checkbox">
            <p-inputSwitch formControlName="messageExpiryEnabled"></p-inputSwitch>
            <label class="ml-2">Enable Message Auto-Deletion</label>
          </div>
          <p class="hint-text">Messages will be automatically deleted after the specified time</p>

          <div class="field" *ngIf="settingsForm.get('messageExpiryEnabled')?.value">
            <label>Message Expiry Time</label>
            <p-dropdown
              [options]="expiryTimeOptions"
              formControlName="messageExpiryTime"
              optionLabel="label"
              optionValue="value"
              [style]="{ width: '100%' }"
            ></p-dropdown>
          </div>
        </div>

        <div class="settings-group">
          <div class="field-checkbox">
            <p-inputSwitch formControlName="encryptionEnabled"></p-inputSwitch>
            <label class="ml-2">Enable End-to-End Encryption</label>
          </div>
          <p class="hint-text">
            Messages will be encrypted and can only be read by chat participants
          </p>
        </div>

        <p-message
          *ngIf="saveError"
          severity="error"
          text="Failed to save settings. Please try again."
          styleClass="settings-alert"
        ></p-message>
        <p-message
          *ngIf="saveSuccess"
          severity="success"
          text="Settings saved successfully!"
          styleClass="settings-alert"
        ></p-message>

        <div class="settings-actions">
          <button
            pButton
            pRipple
            type="button"
            (click)="resetForm()"
            [disabled]="isSaving"
            class="p-button-text"
            icon="pi pi-refresh"
            label="Reset"
          ></button>
          <button
            pButton
            pRipple
            type="submit"
            [disabled]="settingsForm.invalid || isSaving"
            icon="pi pi-save"
            [label]="isSaving ? 'Saving...' : 'Save Settings'"
          >
            <p-progressSpinner
              *ngIf="isSaving"
              [style]="{ width: '16px', height: '16px' }"
              strokeWidth="4"
            ></p-progressSpinner>
          </button>
        </div>
      </form>
    </p-card>
  `,
  styles: [
    `
      .settings-group {
        margin-bottom: var(--content-padding);

        .hint-text {
          margin: 0.5rem 0 1rem;
          color: var(--text-color-secondary);
          font-size: 0.875rem;
        }
      }

      .settings-alert {
        margin-bottom: 1rem;
        display: block;
      }

      .settings-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 2rem;
      }

      .field {
        margin-bottom: 1rem;
      }

      .field-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      :host ::ng-deep {
        .p-inputswitch {
          margin-right: 0.5rem;
        }

        .p-progressspinner {
          width: 16px;
          height: 16px;
          margin-right: 0.5rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ChatSettingsComponent implements OnInit {
  @Input() roomId!: string;
  @Input() settings: IChatSettings = {
    messageExpiryEnabled: false,
    messageExpiryTime: 24,
    encryptionEnabled: true,
  };

  @Output() settingsChanged = new EventEmitter<IChatSettings>();

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

  /**
   * Component constructor - initializes form builder and chat service
   */
  profileVisibilityOptions = [
    { label: 'Public - Visible to everyone', value: 'public' },
    { label: 'Registered Users - Only visible to registered users', value: 'registered' },
    { label: 'Private - Only visible to users you\'ve matched with', value: 'private' }
  ];

  allowMessagingOptions = [
    { label: 'Everyone', value: 'all' },
    { label: 'Only Matches', value: 'matches' },
    { label: 'No One (Disable messaging)', value: 'none' }
  ];

  contentDensityOptions = [
    { label: 'Compact', value: 'compact' },
    { label: 'Normal', value: 'normal' },
    { label: 'Comfortable', value: 'comfortable' }
  ];

  cardSizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ];

  defaultViewTypeOptions = [
    { label: 'Netflix View', value: 'netflix' },
    { label: 'Tinder View', value: 'tinder' },
    { label: 'List View', value: 'list' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Angular lifecycle hook - component initialization
   */
  ngOnInit(): void {
    this.initForm();
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
    const messageExpiryEnabledControl = this.settingsForm.get('messageExpiryEnabled');
    if (messageExpiryEnabledControl) {
      messageExpiryEnabledControl.valueChanges.subscribe((enabled: boolean) => {
        const expiryTimeControl = this.settingsForm.get('messageExpiryTime');
        if (expiryTimeControl) {
          if (enabled === true) {
            expiryTimeControl.enable();
          } else {
            expiryTimeControl.disable();
          }
        }
      });
    }

    // Initialize disabled state
    if (this.settings.messageExpiryEnabled !== true) {
      const expiryTimeControl = this.settingsForm.get('messageExpiryTime');
      if (expiryTimeControl) {
        expiryTimeControl.disable();
      }
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

    // Configure message auto-deletion using ChatService
    if (settings.messageExpiryEnabled === true) {
      const ttlInMilliseconds = this.chatService.convertHoursToMilliseconds(
        settings.messageExpiryTime,
      );

      this.chatService
        .configureMessageAutoDeletion(this.roomId, true, ttlInMilliseconds)
        .pipe(
          catchError((error) => {
            console.error('Error configuring message auto-deletion:', error);
            return of(false);
          }),
        )
        .subscribe((success) => {
          this.isSaving = false;

          if (success) {
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
    } else {
      // Disable auto-deletion
      this.chatService
        .configureMessageAutoDeletion(this.roomId, false, 0)
        .pipe(
          catchError((error) => {
            console.error('Error disabling message auto-deletion:', error);
            return of(false);
          }),
        )
        .subscribe((success) => {
          this.isSaving = false;

          if (success) {
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
  }
}
