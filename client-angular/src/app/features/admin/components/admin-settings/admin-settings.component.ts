import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NebularModule } from '../../../../../app/shared/nebular.module';
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

@Component({';
    selector: 'app-admin-settings',;
    schemas: [CUSTOM_ELEMENTS_SCHEMA],;
    imports: [CommonModule, ReactiveFormsModule, NebularModule],;
    template: `;`
    ;
      ;
        ;
          Application Settings;
        ;

        ;
          ;
            ;
              ;
              ;
                General Settings;
                ;
                  ;
                    Site Name;
                    ;
                  ;

                  ;
                    Site Description;
                    ;
                  ;

                  ;
                    Maintenance Mode;
                  ;

                  ;
                    Allow Registration;
                  ;

                  ;
                    Default User Role;
                    ;
                      User;
                      Moderator;
                      Admin;
                    ;
                  ;
                ;
              ;

              ;
              ;
                Security Settings;
                ;
                  ;
                    Max Login Attempts;
                    ;
                  ;

                  ;
                    Minimum Password Length;
                    ;
                  ;

                  ;
                    ;
                      Require Email Verification;
                    ;
                  ;

                  ;
                    Enable Two-Factor Auth;
                  ;

                  ;
                    Session Timeout (minutes);
                    ;
                  ;
                ;
              ;

              ;
              ;
                Content Settings;
                ;
                  ;
                    Max Image Size (MB);
                    ;
                  ;

                  ;
                    Allowed File Types;
                    ;
                      JPEG;
                      PNG;
                      GIF;
                      PDF;
                    ;
                  ;

                  ;
                    Auto Moderation;
                  ;

                  ;
                    Profanity Filter;
                  ;
                ;
              ;

              ;
              ;
                Notification Settings;
                ;
                  ;
                    Email Notifications;
                  ;

                  ;
                    Push Notifications;
                  ;

                  ;
                    Admin Alerts;
                  ;

                  ;
                    Moderator Alerts;
                  ;
                ;
              ;
            ;

            ;
              ;
                Reset to Defaults;
              ;
              ;
                Save Settings;
              ;
            ;
          ;
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
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
    `,;`
    ];
});
export class AdminSettingsComponen {t implements OnInit {
  settingsForm: FormGroup;
  loading = false;

  constructor(;
    private fb: FormBuilder,;
    private toastrService: NbToastrService,;
  ) {
    this.settingsForm = this.fb.group({
      // General Settings
      siteName: ['', Validators.required],;
      siteDescription: [''],;
      maintenanceMode: [false],;
      allowRegistration: [true],;
      defaultUserRole: ['user'],;

      // Security Settings
      maxLoginAttempts: [5, [Validators.required, Validators.min(1)]],;
      passwordMinLength: [8, [Validators.required, Validators.min(6)]],;
      requireEmailVerification: [true],;
      twoFactorEnabled: [false],;
      sessionTimeout: [60, [Validators.required, Validators.min(5)]],;

      // Content Settings
      maxImageSize: [5, [Validators.required, Validators.min(1)]],;
      allowedFileTypes: [['image/jpeg', 'image/png']],;
      autoModeration: [true],;
      profanityFilter: [true],;

      // Notification Settings
      emailNotifications: [true],;
      pushNotifications: [true],;
      adminAlerts: [true],;
      moderatorAlerts: [true],;
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
          siteName: 'Date Night App',;
          siteDescription: 'Find your perfect date night experience',;
          maintenanceMode: false,;
          allowRegistration: true,;
          defaultUserRole: 'user',;
        },;
        security: {
          maxLoginAttempts: 5,;
          passwordMinLength: 8,;
          requireEmailVerification: true,;
          twoFactorEnabled: false,;
          sessionTimeout: 60,;
        },;
        content: {
          maxImageSize: 5,;
          allowedFileTypes: ['image/jpeg', 'image/png'],;
          autoModeration: true,;
          profanityFilter: true,;
        },;
        notifications: {
          emailNotifications: true,;
          pushNotifications: true,;
          adminAlerts: true,;
          moderatorAlerts: true,;
        },;
      };

      this.settingsForm.patchValue({
        ...settings.general,;
        ...settings.security,;
        ...settings.content,;
        ...settings.notifications,;
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
