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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './chat-settings.component.html',
  styleUrls: ['./chat-settings.component.scss'],
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
    private http: HttpClient
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
    this.settingsForm.get('messageExpiryEnabled')?.valueChanges.subscribe(enabled => {
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
        settings
      )
      .pipe(
        catchError(error => {
          console.error('Error saving chat settings:', error);
          return of({ success: false });
        })
      )
      .subscribe(response => {
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
