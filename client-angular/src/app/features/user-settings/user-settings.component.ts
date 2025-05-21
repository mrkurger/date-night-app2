import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../app/shared/nebular.module';
import {
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
  NbIconModule,
  NbSpinnerModule,
  NbAlertModule,
  NbTooltipModule,
  NbBadgeModule,
  NbTagModule,
  NbSelectModule,
  NbCheckboxModule,
  NbRadioModule,
  NbTabsetModule,
} from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService, ThemeName } from '../../core/services/theme.service';
import {
  UserPreferencesService,
  ContentDensity,
  CardSize,
} from '../../core/services/user-preferences.service';
import { Subscription } from 'rxjs';
import { User } from '../../core/models/user.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-settings',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    NebularModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    NbSpinnerModule,
    NbAlertModule,
    NbTooltipModule,
    NbBadgeModule,
    NbTagModule,
    NbSelectModule,
    NbCheckboxModule,
    NbRadioModule,
    NbTabsetModule,
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
              <nb-tabset
                fullWidth
                (changeTab)="setActiveTab($event.tabTitle.toLowerCase())"
                class="settings-tabset"
              >
                <nb-tab tabTitle="profile" [active]="activeTab === 'profile'">
                  <ng-template nbTabIcon>
                    <nb-icon icon="person-outline"></nb-icon>
                  </ng-template>
                  <!-- Content will be moved into nb-tab blocks or handled by activeTab in a single content area -->
                </nb-tab>
                <nb-tab tabTitle="security" [active]="activeTab === 'security'">
                  <ng-template nbTabIcon>
                    <nb-icon icon="lock-outline"></nb-icon>
                  </ng-template>
                </nb-tab>
                <nb-tab tabTitle="notifications" [active]="activeTab === 'notifications'">
                  <ng-template nbTabIcon>
                    <nb-icon icon="bell-outline"></nb-icon>
                  </ng-template>
                </nb-tab>
                <nb-tab tabTitle="privacy" [active]="activeTab === 'privacy'">
                  <ng-template nbTabIcon>
                    <nb-icon icon="shield-outline"></nb-icon>
                  </ng-template>
                </nb-tab>
                <nb-tab tabTitle="display" [active]="activeTab === 'display'">
                  <ng-template nbTabIcon>
                    <nb-icon icon="monitor-outline"></nb-icon>
                  </ng-template>
                </nb-tab>
              </nb-tabset>

              <!-- Settings Content Area -->
              <div class="settings-body">
                <!-- Loading State -->
                <div class="settings-loading" *ngIf="loading">
                  <nb-spinner status="primary" size="large"></nb-spinner>
                  <p>Loading your settings...</p>
                </div>

                <!-- Profile Settings Panel -->
                <div class="settings-panel" *ngIf="activeTab === 'profile' && !loading">
                  <h2 class="panel-title">Profile Information</h2>
                  <p class="panel-description">
                    Update your personal information and profile details
                  </p>
                  <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
                    <nb-form-field>
                      <label for="name">Full Name</label>
                      <input
                        nbInput
                        fullWidth
                        type="text"
                        id="name"
                        formControlName="name"
                        [status]="
                          profileForm.get('name')?.invalid && profileForm.get('name')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="person-outline"></nb-icon>
                      <div
                        *ngIf="profileForm.get('name')?.invalid && profileForm.get('name')?.touched"
                      >
                        <p
                          class="caption status-danger"
                          *ngIf="profileForm.get('name')?.errors?.['required']"
                        >
                          Name is required
                        </p>
                        <p
                          class="caption status-danger"
                          *ngIf="profileForm.get('name')?.errors?.['minlength']"
                        >
                          Name must be at least 2 characters
                        </p>
                      </div>
                    </nb-form-field>
                    <nb-form-field>
                      <label for="email">Email</label>
                      <input
                        nbInput
                        fullWidth
                        type="email"
                        id="email"
                        formControlName="email"
                        [status]="
                          profileForm.get('email')?.invalid && profileForm.get('email')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="email-outline"></nb-icon>
                      <div
                        *ngIf="
                          profileForm.get('email')?.invalid && profileForm.get('email')?.touched
                        "
                      >
                        <p
                          class="caption status-danger"
                          *ngIf="profileForm.get('email')?.errors?.['required']"
                        >
                          Email is required
                        </p>
                        <p
                          class="caption status-danger"
                          *ngIf="profileForm.get('email')?.errors?.['email']"
                        >
                          Please enter a valid email address
                        </p>
                      </div>
                    </nb-form-field>
                    <nb-form-field>
                      <label for="phone">Phone</label>
                      <input
                        nbInput
                        fullWidth
                        type="tel"
                        id="phone"
                        formControlName="phone"
                        [status]="
                          profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched
                            ? 'danger'
                            : 'basic'
                        "
                      />
                      <nb-icon nbSuffix icon="phone-outline"></nb-icon>
                      <div
                        *ngIf="
                          profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched
                        "
                      >
                        <p
                          class="caption status-danger"
                          *ngIf="profileForm.get('phone')?.errors?.['pattern']"
                        >
                          Please enter a valid phone number
                        </p>
                      </div>
                      <p class="caption hint-text">Format: +47 12345678</p>
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
                      <p class="caption hint-text">Tell others a bit about yourself</p>
                    </nb-form-field>
                    <div class="form-actions">
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="profileForm.invalid || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon> Save Profile
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Security Settings Panel -->
                <div class="settings-panel" *ngIf="activeTab === 'security' && !loading">
                  <h2 class="panel-title">Security Settings</h2>
                  <p class="panel-description">Manage your password and account security</p>
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
                      <div
                        *ngIf="
                          passwordForm.get('currentPassword')?.invalid &&
                          passwordForm.get('currentPassword')?.touched
                        "
                      >
                        <p
                          class="caption status-danger"
                          *ngIf="passwordForm.get('currentPassword')?.errors?.['required']"
                        >
                          Current password is required
                        </p>
                      </div>
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
                      <div
                        *ngIf="
                          passwordForm.get('newPassword')?.invalid &&
                          passwordForm.get('newPassword')?.touched
                        "
                      >
                        <p
                          class="caption status-danger"
                          *ngIf="passwordForm.get('newPassword')?.errors?.['required']"
                        >
                          New password is required
                        </p>
                        <p
                          class="caption status-danger"
                          *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']"
                        >
                          Password must be at least 6 characters
                        </p>
                      </div>
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
                      <div
                        *ngIf="
                          passwordForm.get('confirmPassword')?.invalid &&
                          passwordForm.get('confirmPassword')?.touched
                        "
                      >
                        <p
                          class="caption status-danger"
                          *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']"
                        >
                          Please confirm your new password
                        </p>
                        <p
                          class="caption status-danger"
                          *ngIf="passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']"
                        >
                          Passwords do not match
                        </p>
                      </div>
                    </nb-form-field>
                    <div class="form-actions">
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="passwordForm.invalid || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon> Update Password
                      </button>
                    </div>
                  </form>
                  <div class="danger-zone">
                    <h3 class="danger-title">Danger Zone</h3>
                    <div class="danger-action">
                      <div class="danger-info">
                        <h4>Delete Account</h4>
                        <p>
                          Permanently delete your account and all associated data. This action
                          cannot be undone.
                        </p>
                      </div>
                      <button nbButton status="danger" (click)="deleteAccount()">
                        <nb-icon icon="trash-2-outline"></nb-icon> Delete Account
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Notification Settings Panel -->
                <div class="settings-panel" *ngIf="activeTab === 'notifications' && !loading">
                  <h2 class="panel-title">Notification Preferences</h2>
                  <p class="panel-description">Control how and when you receive notifications</p>
                  <form [formGroup]="notificationForm" (ngSubmit)="saveNotificationSettings()">
                    <div class="form-toggle-group">
                      <nb-toggle
                        formControlName="emailNotifications"
                        status="primary"
                        labelPosition="start"
                        >Email Notifications</nb-toggle
                      >
                      <p class="caption hint-text">Receive notifications via email</p>

                      <nb-toggle
                        formControlName="chatNotifications"
                        status="primary"
                        labelPosition="start"
                        >Chat Notifications</nb-toggle
                      >
                      <p class="caption hint-text">Receive notifications for new chat messages</p>

                      <nb-toggle
                        formControlName="newMatchNotifications"
                        status="primary"
                        labelPosition="start"
                        >New Match Notifications</nb-toggle
                      >
                      <p class="caption hint-text">
                        Receive notifications when someone likes your profile
                      </p>

                      <nb-toggle
                        formControlName="marketingEmails"
                        status="primary"
                        labelPosition="start"
                        >Marketing Emails</nb-toggle
                      >
                      <p class="caption hint-text">Receive promotional emails and updates</p>
                    </div>
                    <div class="form-actions">
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="notificationForm.invalid || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon> Save Notification Settings
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Privacy Settings Panel -->
                <div class="settings-panel" *ngIf="activeTab === 'privacy' && !loading">
                  <h2 class="panel-title">Privacy Settings</h2>
                  <p class="panel-description">Control your privacy and data sharing preferences</p>
                  <form [formGroup]="privacyForm" (ngSubmit)="savePrivacySettings()">
                    <nb-form-field>
                      <label for="profileVisibility">Profile Visibility</label>
                      <nb-select
                        fullWidth
                        id="profileVisibility"
                        formControlName="profileVisibility"
                      >
                        <nb-option value="public">Public - Visible to everyone</nb-option>
                        <nb-option value="registered"
                          >Registered Users - Only visible to registered users</nb-option
                        >
                        <nb-option value="private"
                          >Private - Only visible to users you've matched with</nb-option
                        >
                      </nb-select>
                    </nb-form-field>

                    <nb-toggle
                      formControlName="showOnlineStatus"
                      status="primary"
                      labelPosition="start"
                      >Show Online Status</nb-toggle
                    >
                    <p class="caption hint-text">Allow others to see when you're online</p>

                    <nb-form-field>
                      <label for="allowMessaging">Who Can Message You</label>
                      <nb-select fullWidth id="allowMessaging" formControlName="allowMessaging">
                        <nb-option value="all">Everyone</nb-option>
                        <nb-option value="matches">Only Matches</nb-option>
                        <nb-option value="none">No One (Disable messaging)</nb-option>
                      </nb-select>
                    </nb-form-field>

                    <nb-toggle formControlName="dataSharing" status="primary" labelPosition="start"
                      >Data Sharing for Service Improvement</nb-toggle
                    >
                    <p class="caption hint-text">
                      Allow anonymous usage data to be collected to improve our services
                    </p>

                    <div class="form-actions">
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="privacyForm.invalid || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon> Save Privacy Settings
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Display Settings Panel -->
                <div class="settings-panel" *ngIf="activeTab === 'display' && !loading">
                  <h2 class="panel-title">Display Settings</h2>
                  <p class="panel-description">Customize your viewing experience</p>
                  <form [formGroup]="displayForm" (ngSubmit)="saveDisplaySettings()">
                    <div class="theme-section">
                      <h3>Theme</h3>
                      <nb-radio-group
                        [(ngModel)]="currentTheme"
                        name="themeSelection"
                        [ngModelOptions]="{ standalone: true }"
                      >
                        <nb-radio value="light" (click)="setTheme('light')">Light</nb-radio>
                        <nb-radio value="dark" (click)="setTheme('dark')">Dark</nb-radio>
                        <nb-radio value="system" (click)="setTheme('system')">System</nb-radio>
                      </nb-radio-group>
                      <!-- TODO: Re-add theme preview boxes if desired, styled appropriately -->
                    </div>
                    <nb-form-field>
                      <label for="defaultViewType">Default View Type</label>
                      <nb-select fullWidth id="defaultViewType" formControlName="defaultViewType">
                        <nb-option value="netflix">Netflix Style</nb-option>
                        <nb-option value="grid">Grid View</nb-option>
                        <!-- Assuming grid is a valid type -->
                        <nb-option value="list">List View</nb-option>
                        <nb-option value="tinder">Tinder Style</nb-option>
                      </nb-select>
                      <p class="caption hint-text">
                        Choose your preferred view when browsing profiles
                      </p>
                    </nb-form-field>
                    <nb-form-field>
                      <label for="contentDensity">Content Density</label>
                      <nb-select fullWidth id="contentDensity" formControlName="contentDensity">
                        <nb-option
                          *ngFor="let option of contentDensityOptions"
                          [value]="option.value"
                          >{{ option.label }}</nb-option
                        >
                      </nb-select>
                      <p class="caption hint-text">Adjust how compact content appears</p>
                    </nb-form-field>
                    <nb-form-field>
                      <label for="cardSize">Card Size</label>
                      <nb-select fullWidth id="cardSize" formControlName="cardSize">
                        <nb-option *ngFor="let option of cardSizeOptions" [value]="option.value">{{
                          option.label
                        }}</nb-option>
                      </nb-select>
                      <p class="caption hint-text">Choose the size of profile cards</p>
                    </nb-form-field>

                    <!-- Preview section can remain as is if it's custom HTML for display only -->
                    <div class="display-preview" *ngIf="false">
                      <!-- Temporarily hide preview -->
                      <h4>Preview</h4>
                      <div
                        class="preview-container"
                        [attr.data-density]="displayForm.get('contentDensity')?.value"
                        [attr.data-size]="displayForm.get('cardSize')?.value"
                      >
                        <div class="preview-card">
                          <div class="preview-card-image"></div>
                          <div class="preview-card-content">
                            <div class="preview-card-title"></div>
                            <div class="preview-card-text"></div>
                          </div>
                        </div>
                        <div class="preview-card">
                          <div class="preview-card-image"></div>
                          <div class="preview-card-content">
                            <div class="preview-card-title"></div>
                            <div class="preview-card-text"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="form-actions">
                      <button nbButton ghost status="basic" (click)="resetDisplaySettings()">
                        <nb-icon icon="refresh-outline"></nb-icon> Reset to Defaults
                      </button>
                      <button
                        nbButton
                        status="primary"
                        type="submit"
                        [disabled]="displayForm.pristine || loading"
                      >
                        <nb-icon icon="save-outline"></nb-icon> Save Display Settings
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <!-- End .settings-body -->
            </nb-card-body>
          </nb-card>
        </div>
      </nb-layout-column>
    </nb-layout>
  `,
  styles: [
    `
      :host nb-layout-column {
        padding: 0; // Remove padding if settings-container handles it
      }
      .settings-container {
        max-width: 900px; // Adjusted max-width
        margin: 2rem auto;
        padding: 1rem; // Padding for the overall container
      }

      nb-card-header {
        padding-bottom: 1rem; // Add some space below header before tabs
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

      nb-card-body {
        padding: 0; // Remove card body padding if tab content handles it
      }

      .settings-tabset {
        // Styles for the tabset itself if needed
      }

      // Styles for the content within each tab panel
      .settings-body {
        padding: 1.5rem; // Padding for the actual content area of each tab
      }

      .settings-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        p {
          margin-top: 1rem;
        }
      }

      .settings-panel {
        margin-bottom: 2rem; // Space between panels if they were ever to stack (not with tabs)
        .panel-title {
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid nb-theme(border-basic-color-3);
          padding-bottom: 0.5rem;
        }
        .panel-description {
          color: nb-theme(text-hint-color);
          margin-bottom: 1.5rem;
        }
      }

      nb-form-field {
        margin-bottom: 1.5rem;
        label {
          margin-bottom: 0.5rem; // Ensure label has space
          display: block; // Make label take full width
        }
      }

      // Styling for error messages and hints
      .caption.status-danger {
        margin-top: 0.25rem;
      }
      .caption.hint-text,
      p.caption {
        color: nb-theme(text-hint-color);
        font-size: nb-theme(text-caption-font-size);
        line-height: nb-theme(text-caption-line-height);
        display: block; // Make it behave like a block for margin
        margin-top: 0.25rem;
      }

      textarea[nbInput] {
        min-height: 80px;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        justify-content: flex-end;
      }

      .form-toggle-group {
        nb-toggle {
          display: block; // Make each toggle take full width for better layout
          margin-bottom: 0.5rem;
        }
        nb-toggle + p.caption.hint-text {
          margin-bottom: 1rem; // Space after hint for next toggle
        }
      }

      // Specific to privacy toggles if they need different spacing
      .settings-panel nb-toggle + p.caption.hint-text {
        margin-bottom: 1rem; // Ensure space after hints for toggles too
      }

      .danger-zone {
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        border-top: 2px solid nb-theme(color-danger-default);
        .danger-title {
          color: nb-theme(color-danger-default);
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        .danger-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: nb-theme(background-basic-color-2); // Slight emphasis
          padding: 1rem;
          border-radius: nb-theme(card-border-radius);
          .danger-info {
            h4 {
              margin-top: 0;
              margin-bottom: 0.25rem;
            }
            p {
              margin-bottom: 0;
              color: nb-theme(text-hint-color);
              font-size: 0.875rem;
            }
          }
        }
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
          flex-wrap: wrap; // Allow wrapping for smaller screens
          gap: 1rem;
          .theme-preview-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          }
          .theme-preview {
            width: 80px;
            height: 60px;
            border: 1px solid nb-theme(border-basic-color-4);
            border-radius: nb-theme(radio-border-radius);
            margin-bottom: 0.5rem;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            .theme-preview-header {
              height: 20px;
            }
            .theme-preview-content {
              flex-grow: 1;
            }
          }
          .theme-preview-light {
            .theme-preview-header {
              background-color: #edf1f7;
            }
            .theme-preview-content {
              background-color: #ffffff;
            }
          }
          .theme-preview-dark {
            .theme-preview-header {
              background-color: #1a2138;
            }
            .theme-preview-content {
              background-color: #222b45;
            }
          }
          .theme-preview-system {
            // Represent system with a split or gradient maybe
            .theme-preview-header {
              background: linear-gradient(to right, #edf1f7 50%, #1a2138 50%);
            }
            .theme-preview-content {
              background: linear-gradient(to right, #ffffff 50%, #222b45 50%);
            }
          }
        }
      }

      .display-preview {
        margin-top: 2rem;
        padding: 1rem;
        border: 1px dashed nb-theme(border-basic-color-3);
        border-radius: nb-theme(card-border-radius);
        h4 {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        .preview-container {
          display: flex;
          gap: 1rem;
          // Basic styling for preview cards
          .preview-card {
            border: 1px solid nb-theme(border-basic-color-4);
            border-radius: nb-theme(card-border-radius);
            width: 120px; // Example size
            .preview-card-image {
              height: 60px;
              background-color: nb-theme(background-basic-color-3);
            }
            .preview-card-content {
              padding: 0.5rem;
            }
            .preview-card-title {
              height: 1em;
              background-color: nb-theme(background-basic-color-2);
              margin-bottom: 0.5rem;
            }
            .preview-card-text {
              height: 2em;
              background-color: nb-theme(background-basic-color-2);
            }
          }
          // TODO: Add dynamic styling based on [attr.data-density] and [attr.data-size]
        }
      }

      // Ensure hints and error messages are correctly styled within nb-form-field
      nb-form-field .caption {
        display: block;
        margin-top: 0.25rem;
      }
      nb-form-field .caption.status-danger {
        color: nb-theme(text-danger-color);
      }
      nb-form-field .caption:not(.status-danger) {
        color: nb-theme(text-hint-color);
      }
    `,
  ],
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  notificationForm: FormGroup;
  privacyForm: FormGroup;
  displayForm: FormGroup;
  loading = false;
  currentTheme: ThemeName = 'system';
  contentDensityOptions: { value: ContentDensity['value']; label: string }[] = [];
  cardSizeOptions: { value: CardSize['value']; label: string }[] = [];
  activeTab: string = 'profile';
  error: string | null = null;
  private destroy$ = new Subject<void>();

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
      profileVisibility: ['public'],
      allowFriendRequests: [true],
      allowMessagesFromUnknown: [true],
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [false],
      pushNotifications: [false],
      smsNotifications: [false],
    });

    this.privacyForm = this.fb.group({
      dataSharing: [false],
      activityVisibility: ['friends'],
    });

    this.passwordForm = this.fb.group({
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(8)]],
      confirmNewPassword: [''],
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
    this.authService
      .getCurrentUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
      });
  }

  private updateFormsWithUserData(user: User): void {
    this.profileForm.patchValue({
      profileVisibility: user.privacySettings?.profileVisibility || 'public',
      allowFriendRequests: user.privacySettings?.allowFriendRequests !== false,
      allowMessagesFromUnknown: user.privacySettings?.allowMessagesFromUnknown !== false,
    });

    this.notificationForm.patchValue({
      emailNotifications: user.notificationSettings?.emailNotifications ?? false,
      pushNotifications: user.notificationSettings?.pushNotifications ?? false,
      smsNotifications: user.notificationSettings?.sms ?? false,
    });

    this.privacyForm.patchValue({
      dataSharing: user.privacySettings?.dataSharing ?? false,
      activityVisibility: user.privacySettings?.activityVisibility || 'friends',
    });

    this.passwordForm.patchValue({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });

    this.displayForm.patchValue({
      defaultViewType: user.preferences?.defaultViewType || 'netflix',
      contentDensity: user.preferences?.contentDensity || 'comfortable',
      cardSize: user.preferences?.cardSize || 'medium',
    });
  }

  private loadThemeSettings(): void {
    this.currentTheme = this.themeService.getCurrentTheme();
    this.displayForm.patchValue({ theme: this.currentTheme }, { emitEvent: false });
    this.subscriptions.push(
      this.themeService.theme$.subscribe((themeName) => {
        this.currentTheme = themeName;
        this.displayForm.get('theme')?.setValue(themeName, { emitEvent: false });
      }),
      this.displayForm.get('theme')!.valueChanges.subscribe((themeValue) => {
        if (this.isValidThemeName(themeValue)) {
          this.themeService.setTheme(themeValue);
        }
      }),
    );
  }

  private isValidThemeName(theme: string): theme is ThemeName {
    return ['light', 'dark', 'system', 'default', 'cosmic'].includes(theme);
  }

  setTheme(theme: ThemeName): void {
    if (this.isValidThemeName(theme)) {
      this.themeService.setTheme(theme);
    } else {
      console.warn('Attempted to set invalid theme:', theme);
    }
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
      const displaySettings = this.displayForm.value;
      if (this.isValidThemeName(displaySettings.theme)) {
        // this.themeService.setTheme(displaySettings.theme); // Already handled by valueChanges or direct setTheme call
      }
      this.userPreferencesService.updatePreferences({
        defaultViewType: displaySettings.defaultViewType,
        contentDensity: displaySettings.contentDensity,
        cardSize: displaySettings.cardSize,
        // Persist theme via userPreferencesService if it's responsible for that
        // theme: displaySettings.theme
      });
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

  setActiveTab(tabTitle: string): void {
    this.activeTab = tabTitle.toLowerCase();
  }
}
