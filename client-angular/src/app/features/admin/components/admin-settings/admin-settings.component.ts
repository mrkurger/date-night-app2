import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NebularModule } from '../../../shared/nebular.module';
import { NbToastrService } from '@nebular/theme';

interface AppSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultUserRole: string;
  };
  security: {
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
  content: {
    maxImageSize: number;
    allowedFileTypes: string[];
    autoModeration: boolean;
    profanityFilter: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
    moderatorAlerts: boolean;
  };
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, NebularModule],
  template: `
    <div class="admin-settings">
      <nb-card>
        <nb-card-header>
          <h5>Application Settings</h5>
        </nb-card-header>

        <nb-card-body>
          <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
            <nb-accordion>
              <!-- General Settings -->
              <nb-accordion-item expanded>
                <nb-accordion-item-header>General Settings</nb-accordion-item-header>
                <nb-accordion-item-body>
                  <div class="form-group">
                    <label for="siteName">Site Name</label>
                    <input
                      nbInput
                      fullWidth
                      id="siteName"
                      formControlName="siteName"
                      placeholder="Enter site name"
                    />
                  </div>

                  <div class="form-group">
                    <label for="siteDescription">Site Description</label>
                    <textarea
                      nbInput
                      fullWidth
                      id="siteDescription"
                      formControlName="siteDescription"
                      placeholder="Enter site description"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="maintenanceMode">Maintenance Mode</nb-toggle>
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="allowRegistration">Allow Registration</nb-toggle>
                  </div>

                  <div class="form-group">
                    <label for="defaultUserRole">Default User Role</label>
                    <nb-select id="defaultUserRole" formControlName="defaultUserRole" fullWidth>
                      <nb-option value="user">User</nb-option>
                      <nb-option value="moderator">Moderator</nb-option>
                      <nb-option value="admin">Admin</nb-option>
                    </nb-select>
                  </div>
                </nb-accordion-item-body>
              </nb-accordion-item>

              <!-- Security Settings -->
              <nb-accordion-item>
                <nb-accordion-item-header>Security Settings</nb-accordion-item-header>
                <nb-accordion-item-body>
                  <div class="form-group">
                    <label for="maxLoginAttempts">Max Login Attempts</label>
                    <input
                      nbInput
                      fullWidth
                      type="number"
                      id="maxLoginAttempts"
                      formControlName="maxLoginAttempts"
                    />
                  </div>

                  <div class="form-group">
                    <label for="passwordMinLength">Minimum Password Length</label>
                    <input
                      nbInput
                      fullWidth
                      type="number"
                      id="passwordMinLength"
                      formControlName="passwordMinLength"
                    />
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="requireEmailVerification">
                      Require Email Verification
                    </nb-toggle>
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="twoFactorEnabled">Enable Two-Factor Auth</nb-toggle>
                  </div>

                  <div class="form-group">
                    <label for="sessionTimeout">Session Timeout (minutes)</label>
                    <input
                      nbInput
                      fullWidth
                      type="number"
                      id="sessionTimeout"
                      formControlName="sessionTimeout"
                    />
                  </div>
                </nb-accordion-item-body>
              </nb-accordion-item>

              <!-- Content Settings -->
              <nb-accordion-item>
                <nb-accordion-item-header>Content Settings</nb-accordion-item-header>
                <nb-accordion-item-body>
                  <div class="form-group">
                    <label for="maxImageSize">Max Image Size (MB)</label>
                    <input
                      nbInput
                      fullWidth
                      type="number"
                      id="maxImageSize"
                      formControlName="maxImageSize"
                    />
                  </div>

                  <div class="form-group">
                    <label for="allowedFileTypes">Allowed File Types</label>
                    <nb-select
                      id="allowedFileTypes"
                      formControlName="allowedFileTypes"
                      multiple
                      fullWidth
                    >
                      <nb-option value="image/jpeg">JPEG</nb-option>
                      <nb-option value="image/png">PNG</nb-option>
                      <nb-option value="image/gif">GIF</nb-option>
                      <nb-option value="application/pdf">PDF</nb-option>
                    </nb-select>
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="autoModeration">Auto Moderation</nb-toggle>
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="profanityFilter">Profanity Filter</nb-toggle>
                  </div>
                </nb-accordion-item-body>
              </nb-accordion-item>

              <!-- Notification Settings -->
              <nb-accordion-item>
                <nb-accordion-item-header>Notification Settings</nb-accordion-item-header>
                <nb-accordion-item-body>
                  <div class="form-group">
                    <nb-toggle formControlName="emailNotifications">Email Notifications</nb-toggle>
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="pushNotifications">Push Notifications</nb-toggle>
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="adminAlerts">Admin Alerts</nb-toggle>
                  </div>

                  <div class="form-group">
                    <nb-toggle formControlName="moderatorAlerts">Moderator Alerts</nb-toggle>
                  </div>
                </nb-accordion-item-body>
              </nb-accordion-item>
            </nb-accordion>

            <div class="form-actions">
              <button nbButton status="basic" type="button" (click)="resetSettings()">
                Reset to Defaults
              </button>
              <button nbButton status="primary" type="submit" [disabled]="settingsForm.invalid">
                Save Settings
              </button>
            </div>
          </form>
        </nb-card-body>
      </nb-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 100%;
      }

      .admin-settings {
        padding: 1rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
      }

      nb-accordion-item {
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class AdminSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private toastrService: NbToastrService,
  ) {
    this.settingsForm = this.fb.group({
      // General Settings
      siteName: ['', Validators.required],
      siteDescription: [''],
      maintenanceMode: [false],
      allowRegistration: [true],
      defaultUserRole: ['user'],

      // Security Settings
      maxLoginAttempts: [5, [Validators.required, Validators.min(1)]],
      passwordMinLength: [8, [Validators.required, Validators.min(6)]],
      requireEmailVerification: [true],
      twoFactorEnabled: [false],
      sessionTimeout: [60, [Validators.required, Validators.min(5)]],

      // Content Settings
      maxImageSize: [5, [Validators.required, Validators.min(1)]],
      allowedFileTypes: [['image/jpeg', 'image/png']],
      autoModeration: [true],
      profanityFilter: [true],

      // Notification Settings
      emailNotifications: [true],
      pushNotifications: [true],
      adminAlerts: [true],
      moderatorAlerts: [true],
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading = true;
    // TODO: Replace with actual API call
    setTimeout(() => {
      const settings: AppSettings = {
        general: {
          siteName: 'Date Night App',
          siteDescription: 'Find your perfect date night experience',
          maintenanceMode: false,
          allowRegistration: true,
          defaultUserRole: 'user',
        },
        security: {
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireEmailVerification: true,
          twoFactorEnabled: false,
          sessionTimeout: 60,
        },
        content: {
          maxImageSize: 5,
          allowedFileTypes: ['image/jpeg', 'image/png'],
          autoModeration: true,
          profanityFilter: true,
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          adminAlerts: true,
          moderatorAlerts: true,
        },
      };

      this.settingsForm.patchValue({
        ...settings.general,
        ...settings.security,
        ...settings.content,
        ...settings.notifications,
      });

      this.loading = false;
    }, 1000);
  }

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.toastrService.warning('Please fix form errors before saving');
      return;
    }

    this.loading = true;
    // TODO: Replace with actual API call
    setTimeout(() => {
      this.toastrService.success('Settings saved successfully');
      this.loading = false;
    }, 1000);
  }

  resetSettings() {
    if (confirm('Are you sure you want to reset all settings to their defaults?')) {
      this.loadSettings();
      this.toastrService.info('Settings reset to defaults');
    }
  }
}
