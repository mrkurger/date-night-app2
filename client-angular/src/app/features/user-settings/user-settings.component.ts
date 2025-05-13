import { NbToggleModule } from '@nebular/theme';
import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NbCardModule,
  NbButtonModule,
  NbIconModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbCheckboxModule,
  NbRadioModule,
  NbTabsetModule,
  NbSpinnerModule,
  NbToggleModule,
  NbLayoutModule,
} from '@nebular/theme';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import {
  UserPreferencesService,
  ContentDensity,
  CardSize,
} from '../../core/services/user-preferences.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbRadioModule,
    NbTabsetModule,
    NbSpinnerModule,
    NbToggleModule,
    NbLayoutModule,
  ],
  template: `
    <nb-layout>
      <nb-layout-column>
        <div class="settings-container">
          <nb-card>
            <nb-card-header>
              <h1>Account Settings</h1>
              <p class="subtitle">Manage your account preferences and personal information</p>
            </nb-card-header>

            <nb-card-body>
              <nb-tabset fullWidth>
                <!-- Profile Tab -->
                <nb-tab tabTitle="Profile" tabIcon="person-outline">
                  <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                    <nb-form-field>
                      <label for="name">Full Name</label>
                      <input
                        nbInput
                        fullWidth
                        id="name"
                        formControlName="name"
                        [status]="
                          profileForm.get('name')?.invalid && profileForm.get('name')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="person-outline"></nb-icon>
                    </nb-form-field>

                    <nb-form-field>
                      <label for="email">Email</label>
                      <input
                        nbInput
                        fullWidth
                        id="email"
                        formControlName="email"
                        [status]="
                          profileForm.get('email')?.invalid && profileForm.get('email')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="email-outline"></nb-icon>
                    </nb-form-field>

                    <nb-form-field>
                      <label for="phone">Phone</label>
                      <input
                        nbInput
                        fullWidth
                        id="phone"
                        formControlName="phone"
                        [status]="
                          profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="phone-outline"></nb-icon>
                    </nb-form-field>

                    <nb-form-field>
                      <label for="bio">Bio</label>
                      <textarea
                        nbInput
                        fullWidth
                        id="bio"
                        formControlName="bio"
                        rows="4"
                      ></textarea>
                    </nb-form-field>

                    <div class="form-actions">
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="profileForm.invalid || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon>
                        Save Profile
                      </button>
                    </div>
                  </form>
                </nb-tab>

                <!-- Security Tab -->
                <nb-tab tabTitle="Security" tabIcon="lock-outline">
                  <form [formGroup]="passwordForm" (ngSubmit)="savePassword()">
                    <nb-form-field>
                      <label for="currentPassword">Current Password</label>
                      <input
                        nbInput
                        fullWidth
                        type="password"
                        id="currentPassword"
                        formControlName="currentPassword"
                        [status]="
                          passwordForm.get('currentPassword')?.invalid &&
                          passwordForm.get('currentPassword')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="lock-outline"></nb-icon>
                    </nb-form-field>

                    <nb-form-field>
                      <label for="newPassword">New Password</label>
                      <input
                        nbInput
                        fullWidth
                        type="password"
                        id="newPassword"
                        formControlName="newPassword"
                        [status]="
                          passwordForm.get('newPassword')?.invalid &&
                          passwordForm.get('newPassword')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="lock-outline"></nb-icon>
                    </nb-form-field>

                    <nb-form-field>
                      <label for="confirmPassword">Confirm Password</label>
                      <input
                        nbInput
                        fullWidth
                        type="password"
                        id="confirmPassword"
                        formControlName="confirmPassword"
                        [status]="
                          passwordForm.get('confirmPassword')?.invalid &&
                          passwordForm.get('confirmPassword')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="lock-outline"></nb-icon>
                    </nb-form-field>

                    <div class="form-actions">
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="passwordForm.invalid || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon>
                        Update Password
                      </button>
                    </div>
                  </form>
                </nb-tab>

                <!-- Notifications Tab -->
                <nb-tab tabTitle="Notifications" tabIcon="bell-outline">
                  <form [formGroup]="notificationForm" (ngSubmit)="saveNotificationSettings()">
                    <nb-toggle
                      formControlName="emailNotifications"
                      status="primary"
                      labelPosition="start"
                    >
                      Email Notifications
                    </nb-toggle>
                    <p class="hint-text">Receive notifications via email</p>

                    <nb-toggle
                      formControlName="chatNotifications"
                      status="primary"
                      labelPosition="start"
                    >
                      Chat Notifications
                    </nb-toggle>
                    <p class="hint-text">Receive notifications for new chat messages</p>

                    <nb-toggle
                      formControlName="marketingEmails"
                      status="primary"
                      labelPosition="start"
                    >
                      Marketing Emails
                    </nb-toggle>
                    <p class="hint-text">Receive promotional emails and updates</p>

                    <nb-toggle
                      formControlName="newMatchNotifications"
                      status="primary"
                      labelPosition="start"
                    >
                      New Match Notifications
                    </nb-toggle>
                    <p class="hint-text">Receive notifications when someone likes your profile</p>

                    <div class="form-actions">
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="notificationForm.invalid || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon>
                        Save Notification Settings
                      </button>
                    </div>
                  </form>
                </nb-tab>

                <!-- Privacy Tab -->
                <nb-tab tabTitle="Privacy" tabIcon="shield-outline">
                  <form [formGroup]="privacyForm" (ngSubmit)="savePrivacySettings()">
                    <nb-form-field>
                      <label for="profileVisibility">Profile Visibility</label>
                      <nb-select
                        fullWidth
                        id="profileVisibility"
                        formControlName="profileVisibility"
                      >
                        <nb-option value="public">Public - Visible to everyone</nb-option>
                        <nb-option value="registered">
                          Registered Users - Only visible to registered users
                        </nb-option>
                        <nb-option value="private">
                          Private - Only visible to users you've matched with
                        </nb-option>
                      </nb-select>
                    </nb-form-field>

                    <nb-toggle
                      formControlName="showOnlineStatus"
                      status="primary"
                      labelPosition="start"
                    >
                      Show Online Status
                    </nb-toggle>
                    <p class="hint-text">Allow others to see when you're online</p>

                    <nb-form-field>
                      <label for="allowMessaging">Who Can Message You</label>
                      <nb-select fullWidth id="allowMessaging" formControlName="allowMessaging">
                        <nb-option value="all">Everyone</nb-option>
                        <nb-option value="matches">Only Matches</nb-option>
                        <nb-option value="none">No One (Disable messaging)</nb-option>
                      </nb-select>
                    </nb-form-field>

                    <nb-toggle formControlName="dataSharing" status="primary" labelPosition="start">
                      Data Sharing for Service Improvement
                    </nb-toggle>
                    <p class="hint-text">
                      Allow anonymous usage data to be collected to improve our services
                    </p>

                    <div class="form-actions">
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="privacyForm.invalid || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon>
                        Save Privacy Settings
                      </button>
                    </div>
                  </form>
                </nb-tab>

                <!-- Display Tab -->
                <nb-tab tabTitle="Display" tabIcon="monitor-outline">
                  <form [formGroup]="displayForm" (ngSubmit)="saveDisplaySettings()">
                    <div class="theme-section">
                      <h3>Theme</h3>
                      <nb-radio-group
                        [(ngModel)]="currentTheme"
                        [ngModelOptions]="{ standalone: true }"
                      >
                        <nb-radio value="light">Light</nb-radio>
                        <nb-radio value="dark">Dark</nb-radio>
                        <nb-radio value="system">System</nb-radio>
                      </nb-radio-group>
                    </div>

                    <nb-form-field>
                      <label for="defaultViewType">Default View Type</label>
                      <nb-select fullWidth id="defaultViewType" formControlName="defaultViewType">
                        <nb-option value="netflix">Netflix Style</nb-option>
                        <nb-option value="grid">Grid View</nb-option>
                        <nb-option value="list">List View</nb-option>
                        <nb-option value="tinder">Tinder Style</nb-option>
                      </nb-select>
                    </nb-form-field>

                    <nb-form-field>
                      <label for="contentDensity">Content Density</label>
                      <nb-select fullWidth id="contentDensity" formControlName="contentDensity">
                        <nb-option
                          *ngFor="let option of contentDensityOptions"
                          [value]="option.value"
                        >
                          {{ option.label }}
                        </nb-option>
                      </nb-select>
                    </nb-form-field>

                    <nb-form-field>
                      <label for="cardSize">Card Size</label>
                      <nb-select fullWidth id="cardSize" formControlName="cardSize">
                        <nb-option *ngFor="let option of cardSizeOptions" [value]="option.value">
                          {{ option.label }}
                        </nb-option>
                      </nb-select>
                    </nb-form-field>

                    <div class="form-actions">
                      <button nbButton ghost status="basic" (click)="resetDisplaySettings()">
                        <nb-icon icon="refresh-outline"></nb-icon>
                        Reset to Defaults
                      </button>
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="displayForm.pristine || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon>
                        Save Display Settings
                      </button>
                    </div>
                  </form>
                </nb-tab>
              </nb-tabset>
            </nb-card-body>
          </nb-card>
        </div>
      </nb-layout-column>
    </nb-layout>
  `,
  styles: [
    `
      .settings-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      nb-card-header {
        h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 600;
        }

        .subtitle {
          margin: 0.5rem 0 0;
          color: nb-theme(text-hint-color);
        }
      }

      nb-form-field {
        margin-bottom: 1.5rem;
      }

      .hint-text {
        margin: 0.25rem 0 1rem;
        color: nb-theme(text-hint-color);
        font-size: 0.875rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        justify-content: flex-end;
      }

      .theme-section {
        margin-bottom: 2rem;

        h3 {
          margin: 0 0 1rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        nb-radio-group {
          display: flex;
          gap: 1rem;
        }
      }

      nb-toggle {
        margin-bottom: 0.5rem;
      }

      /* Dark theme adjustments */
      :host-context([data-theme='dark']) {
        .hint-text {
          color: nb-theme(text-hint-color);
        }
      }
    `,
  ],
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  notificationForm: FormGroup;
  privacyForm: FormGroup;
  displayForm: FormGroup;
  loading = false;
  user: any = null;
  currentTheme: 'light' | 'dark' | 'system' = 'system';
  contentDensityOptions: { value: ContentDensity['value']; label: string }[] = [];
  cardSizeOptions: { value: CardSize['value']; label: string }[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private themeService: ThemeService,
    private userPreferencesService: UserPreferencesService,
    private router: Router,
  ) {
    this.initializeForms();
    this.initializeOptions();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^\+?[0-9]{8,15}$/)],
      bio: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      chatNotifications: [true],
      marketingEmails: [false],
      newMatchNotifications: [true],
    });

    this.privacyForm = this.fb.group({
      profileVisibility: ['public'],
      showOnlineStatus: [true],
      allowMessaging: ['all'],
      dataSharing: [false],
    });

    this.displayForm = this.fb.group({
      defaultViewType: ['netflix'],
      contentDensity: ['comfortable'],
      cardSize: ['medium'],
    });
  }

  private initializeOptions(): void {
    this.contentDensityOptions = [
      { value: 'compact', label: 'Compact' },
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'condensed', label: 'Condensed' },
    ];

    this.cardSizeOptions = [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ];
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadThemeSettings();
    this.loadDisplaySettings();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadUserData(): void {
    this.loading = true;
    this.subscriptions.push(
      this.authService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.updateFormsWithUserData(user);
          }
          this.loading = false;
        },
        error: (error) => {
          this.notificationService.error('Failed to load user data');
          this.loading = false;
        },
      }),
    );
  }

  private updateFormsWithUserData(user: any): void {
    // Profile form
    this.profileForm.patchValue({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
    });

    // Notification settings
    if (user.notificationSettings) {
      this.notificationForm.patchValue({
        emailNotifications: user.notificationSettings.emailNotifications ?? true,
        chatNotifications: user.notificationSettings.chatNotifications ?? true,
        marketingEmails: user.notificationSettings.marketingEmails ?? false,
        newMatchNotifications: user.notificationSettings.newMatchNotifications ?? true,
      });
    }

    // Privacy settings
    if (user.privacySettings) {
      this.privacyForm.patchValue({
        profileVisibility: user.privacySettings.profileVisibility || 'public',
        showOnlineStatus: user.privacySettings.showOnlineStatus ?? true,
        allowMessaging: user.privacySettings.allowMessaging || 'all',
        dataSharing: user.privacySettings.dataSharing ?? false,
      });
    }
  }

  private loadThemeSettings(): void {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.subscriptions.push(
      this.themeService.theme$.subscribe((theme) => {
        this.currentTheme = theme;
      }),
    );
  }

  private loadDisplaySettings(): void {
    const preferences = this.userPreferencesService.getPreferences();
    this.displayForm.patchValue({
      defaultViewType: preferences.defaultViewType,
      contentDensity: preferences.contentDensity,
      cardSize: preferences.cardSize,
    });

    this.subscriptions.push(
      this.userPreferencesService.preferences$.subscribe((prefs) => {
        this.displayForm.patchValue(
          {
            defaultViewType: prefs.defaultViewType,
            contentDensity: prefs.contentDensity,
            cardSize: prefs.cardSize,
          },
          { emitEvent: false },
        );
      }),
    );
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.notificationService.error('Please fix the form errors before submitting');
      return;
    }

    this.loading = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.notificationService.success('Profile updated successfully');
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to update profile');
        this.loading = false;
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.notificationService.error('Please fix the form errors before submitting');
      return;
    }

    this.loading = true;
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.notificationService.success('Password updated successfully');
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to update password');
        this.loading = false;
      },
    });
  }

  saveNotificationSettings(): void {
    this.loading = true;
    this.authService.updateNotificationSettings(this.notificationForm.value).subscribe({
      next: () => {
        this.notificationService.success('Notification settings updated');
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to update notification settings');
        this.loading = false;
      },
    });
  }

  savePrivacySettings(): void {
    this.loading = true;
    this.authService.updatePrivacySettings(this.privacyForm.value).subscribe({
      next: () => {
        this.notificationService.success('Privacy settings updated');
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to update privacy settings');
        this.loading = false;
      },
    });
  }

  saveDisplaySettings(): void {
    this.loading = true;
    try {
      this.userPreferencesService.updatePreferences(this.displayForm.value);
      this.notificationService.success('Display settings saved successfully');
      this.displayForm.markAsPristine();
    } catch (error) {
      this.notificationService.error('Failed to save display settings');
    } finally {
      this.loading = false;
    }
  }

  resetDisplaySettings(): void {
    const defaultSettings = {
      defaultViewType: 'netflix' as const,
      contentDensity: 'comfortable' as const,
      cardSize: 'medium' as const,
    };

    this.displayForm.patchValue(defaultSettings);
    this.userPreferencesService.updatePreferences(defaultSettings);
    this.notificationService.success('Display settings reset to defaults');
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
}
