// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (user-settings.component.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { UserSettingsComponent } from './user-settings.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserPreferencesService } from '../../core/services/user-preferences.service';
import { CommonTestModule, MockMainLayoutComponent } from '../../testing/common-test.module';
import { createMockService } from '../../testing/test-utils';

describe('UserSettingsComponent', () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;
  let authService: AuthService;
  let notificationService: NotificationService;
  let themeService: ThemeService;
  let userPreferencesService: UserPreferencesService;
  let router: Router;

  // Mock user data
  const mockUser = {
    _id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    bio: 'Test bio',
    notificationSettings: {
      emailNotifications: true,
      chatNotifications: true,
      marketingEmails: false,
      newMatchNotifications: true,
    },
    privacySettings: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowMessaging: 'all',
      dataSharing: false,
    },
  };

  // Mock services
  class MockAuthService {
    currentUser$ = of(mockUser);

    updateProfile() {
      return of({ success: true });
    }

    changePassword() {
      return of({ success: true });
    }

    updateNotificationSettings() {
      return of({ success: true });
    }

    updatePrivacySettings() {
      return of({ success: true });
    }

    deleteAccount() {
      return of({ success: true });
    }
  }

  class MockNotificationService {
    success() {}
    error() {}
  }

  class MockThemeService {
    theme$ = of('system');

    getCurrentTheme() {
      return 'system';
    }

    setTheme(theme: string) {}
  }

  class MockUserPreferencesService {
    preferences$ = of({
      defaultViewType: 'netflix',
      contentDensity: 'comfortable',
      cardSize: 'medium',
      savedFilters: {},
      recentlyViewed: [],
      favorites: [],
    });

    contentDensityOptions = [
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'compact', label: 'Compact' },
      { value: 'condensed', label: 'Condensed' },
    ];

    cardSizeOptions = [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ];

    getPreferences() {
      return {
        defaultViewType: 'netflix',
        contentDensity: 'comfortable',
        cardSize: 'medium',
        savedFilters: {},
        recentlyViewed: [],
        favorites: [],
      };
    }

    updatePreferences() {}

    setDefaultViewType() {}

    setContentDensity() {}

    setCardSize() {}

    saveFilter() {}

    getSavedFilter() {}

    deleteSavedFilter() {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonTestModule,
        RouterTestingModule,
        UserSettingsComponent,
        MockMainLayoutComponent,
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: ThemeService, useClass: MockThemeService },
        { provide: UserPreferencesService, useClass: MockUserPreferencesService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    notificationService = TestBed.inject(NotificationService);
    themeService = TestBed.inject(ThemeService);
    userPreferencesService = TestBed.inject(UserPreferencesService);
    router = TestBed.inject(Router);

    // Spy on router navigation
    spyOn(router, 'navigateByUrl').and.stub();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load user data on init', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.user).toEqual(mockUser);
      expect(component.profileForm.value).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        bio: 'Test bio',
      });
      expect(component.notificationForm.value).toEqual({
        emailNotifications: true,
        chatNotifications: true,
        marketingEmails: false,
        newMatchNotifications: true,
      });
      expect(component.privacyForm.value).toEqual({
        profileVisibility: 'public',
        showOnlineStatus: true,
        allowMessaging: 'all',
        dataSharing: false,
      });
      expect(component.loading).toBeFalse();
    }));

    it('should load theme settings on init', fakeAsync(() => {
      spyOn(themeService, 'getCurrentTheme').and.returnValue('system');

      component.ngOnInit();
      tick();

      expect(component.currentTheme).toBe('system');
    }));

    it('should load display settings on init', fakeAsync(() => {
      spyOn(userPreferencesService, 'getPreferences').and.returnValue({
        defaultViewType: 'netflix',
        contentDensity: 'comfortable',
        cardSize: 'medium',
        savedFilters: {},
        recentlyViewed: [],
        favorites: [],
      });

      component.ngOnInit();
      tick();

      expect(component.displayForm.value).toEqual({
        defaultViewType: 'netflix',
        contentDensity: 'comfortable',
        cardSize: 'medium',
      });
    }));
  });

  describe('form operations', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should update profile when saveProfile is called', () => {
      spyOn(authService, 'updateProfile').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.saveProfile();

      expect(authService.updateProfile).toHaveBeenCalledWith(component.profileForm.value);
      expect(notificationService.success).toHaveBeenCalledWith('Profile updated successfully');
      expect(component.loading).toBeFalse();
    });

    it('should show error when profile form is invalid', () => {
      component.profileForm.controls['name'].setValue(''); // Make form invalid
      spyOn(notificationService, 'error').and.callThrough();

      component.saveProfile();

      expect(notificationService.error).toHaveBeenCalledWith(
        'Please fix the form errors before submitting'
      );
    });

    it('should change password when changePassword is called', () => {
      component.passwordForm.setValue({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
        confirmPassword: 'newPassword',
      });

      spyOn(authService, 'changePassword').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.changePassword();

      expect(authService.changePassword).toHaveBeenCalledWith({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
      });
      expect(notificationService.success).toHaveBeenCalledWith('Password changed successfully');
      expect(component.loading).toBeFalse();
    });

    it('should update notification settings when saveNotificationSettings is called', () => {
      spyOn(authService, 'updateNotificationSettings').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.saveNotificationSettings();

      expect(authService.updateNotificationSettings).toHaveBeenCalledWith(
        component.notificationForm.value
      );
      expect(notificationService.success).toHaveBeenCalledWith('Notification settings updated');
      expect(component.loading).toBeFalse();
    });

    it('should update privacy settings when savePrivacySettings is called', () => {
      spyOn(authService, 'updatePrivacySettings').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.savePrivacySettings();

      expect(authService.updatePrivacySettings).toHaveBeenCalledWith(component.privacyForm.value);
      expect(notificationService.success).toHaveBeenCalledWith('Privacy settings updated');
      expect(component.loading).toBeFalse();
    });
  });

  describe('account operations', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should delete account and navigate to home page', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(authService, 'deleteAccount').and.callThrough();
      spyOn(notificationService, 'success').and.callThrough();

      component.deleteAccount();
      tick();

      expect(authService.deleteAccount).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalledWith('Your account has been deleted');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
      expect(component.loading).toBeFalse();
    }));

    it('should not delete account when user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(authService, 'deleteAccount').and.callThrough();

      component.deleteAccount();

      expect(authService.deleteAccount).not.toHaveBeenCalled();
    });

    it('should handle error when deleting account fails', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(authService, 'deleteAccount').and.returnValue(
        throwError(() => new Error('Delete failed'))
      );
      spyOn(notificationService, 'error').and.callThrough();
      spyOn(console, 'error').and.callThrough();

      component.deleteAccount();
      tick();

      expect(notificationService.error).toHaveBeenCalledWith('Failed to delete account');
      expect(console.error).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    }));
  });

  describe('utility methods', () => {
    it('should set active tab', () => {
      component.setActiveTab('password');
      expect(component.activeTab).toBe('password');

      component.setActiveTab('notifications');
      expect(component.activeTab).toBe('notifications');
    });

    it('should validate password match', () => {
      component.passwordForm.setValue({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
        confirmPassword: 'differentPassword',
      });

      expect(component.passwordForm.hasError('passwordMismatch')).toBeTrue();

      component.passwordForm.setValue({
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
        confirmPassword: 'newPassword',
      });

      expect(component.passwordForm.hasError('passwordMismatch')).toBeFalse();
    });
  });

  describe('theme and display settings', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should set theme when setTheme is called', () => {
      spyOn(themeService, 'setTheme');

      component.setTheme('dark');

      expect(themeService.setTheme).toHaveBeenCalledWith('dark');
    });

    it('should save display settings when saveDisplaySettings is called', () => {
      spyOn(userPreferencesService, 'updatePreferences');
      spyOn(notificationService, 'success');

      component.displayForm.patchValue({
        defaultViewType: 'list',
        contentDensity: 'compact',
        cardSize: 'large',
      });

      component.saveDisplaySettings();

      expect(userPreferencesService.updatePreferences).toHaveBeenCalledWith({
        defaultViewType: 'list',
        contentDensity: 'compact',
        cardSize: 'large',
      });
      expect(notificationService.success).toHaveBeenCalledWith(
        'Display settings saved successfully'
      );
    });

    it('should handle errors when saving display settings', () => {
      spyOn(userPreferencesService, 'updatePreferences').and.throwError('Update failed');
      spyOn(notificationService, 'error');
      spyOn(console, 'error');

      component.saveDisplaySettings();

      expect(notificationService.error).toHaveBeenCalledWith('Failed to save display settings');
      expect(console.error).toHaveBeenCalled();
    });

    it('should reset display settings to defaults when resetDisplaySettings is called', () => {
      spyOn(component, 'saveDisplaySettings');

      // First change the values
      component.displayForm.patchValue({
        defaultViewType: 'list',
        contentDensity: 'condensed',
        cardSize: 'small',
      });

      // Then reset
      component.resetDisplaySettings();

      // Check that values were reset
      expect(component.displayForm.value).toEqual({
        defaultViewType: 'netflix',
        contentDensity: 'comfortable',
        cardSize: 'medium',
      });

      // Check that save was called
      expect(component.saveDisplaySettings).toHaveBeenCalled();
    });
  });
});
