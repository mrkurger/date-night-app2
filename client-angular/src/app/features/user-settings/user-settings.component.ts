import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// PrimeNG Components
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Message } from 'primeng/message';
import { MessageService } from 'primeng/messageservice';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';

type ThemeName = 'light' | 'dark' | 'system';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [MessagesModule, ProgressSpinnerModule, InputTextareaModule, TabViewModule, RadioButtonModule, CheckboxModule, DropdownModule, ButtonModule, InputTextModule, InputGroupModule, CardModule, MessageService, Message, 
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardModule,
    InputGroupModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    CheckboxModule,
    RadioButtonModule,
    TabViewModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    MessagesModule,
  ],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  providers: [MessageService],
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
