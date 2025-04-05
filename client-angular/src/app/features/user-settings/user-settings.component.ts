import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MainLayoutComponent]
})
export class UserSettingsComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  notificationForm: FormGroup;
  privacyForm: FormGroup;
  loading = false;
  user: any = null;
  activeTab = 'profile';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^\+?[0-9]{8,15}$/)],
      bio: ['']
    });
    
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
    
    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      chatNotifications: [true],
      marketingEmails: [false],
      newMatchNotifications: [true]
    });
    
    this.privacyForm = this.fb.group({
      profileVisibility: ['public'],
      showOnlineStatus: [true],
      allowMessaging: ['all'],
      dataSharing: [false]
    });
  }
  
  ngOnInit(): void {
    this.loadUserData();
  }
  
  loadUserData(): void {
    this.loading = true;
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = user;
        
        // Populate profile form
        this.profileForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || ''
        });
        
        // Populate notification settings if available
        if (user.notificationSettings) {
          this.notificationForm.patchValue({
            emailNotifications: user.notificationSettings.emailNotifications ?? true,
            chatNotifications: user.notificationSettings.chatNotifications ?? true,
            marketingEmails: user.notificationSettings.marketingEmails ?? false,
            newMatchNotifications: user.notificationSettings.newMatchNotifications ?? true
          });
        }
        
        // Populate privacy settings if available
        if (user.privacySettings) {
          this.privacyForm.patchValue({
            profileVisibility: user.privacySettings.profileVisibility || 'public',
            showOnlineStatus: user.privacySettings.showOnlineStatus ?? true,
            allowMessaging: user.privacySettings.allowMessaging || 'all',
            dataSharing: user.privacySettings.dataSharing ?? false
          });
        }
      }
      this.loading = false;
    });
  }
  
  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.notificationService.error('Please fix the form errors before submitting');
      return;
    }
    
    this.loading = true;
    const profileData = this.profileForm.value;
    
    this.authService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.success('Profile updated successfully');
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Failed to update profile');
        console.error('Error updating profile:', error);
      }
    });
  }
  
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.notificationService.error('Please fix the form errors before submitting');
      return;
    }
    
    this.loading = true;
    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };
    
    this.authService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.success('Password changed successfully');
        this.passwordForm.reset();
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Failed to change password');
        console.error('Error changing password:', error);
      }
    });
  }
  
  saveNotificationSettings(): void {
    this.loading = true;
    const notificationSettings = this.notificationForm.value;
    
    this.authService.updateNotificationSettings(notificationSettings).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.success('Notification settings updated');
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Failed to update notification settings');
        console.error('Error updating notification settings:', error);
      }
    });
  }
  
  savePrivacySettings(): void {
    this.loading = true;
    const privacySettings = this.privacyForm.value;
    
    this.authService.updatePrivacySettings(privacySettings).subscribe({
      next: (response) => {
        this.loading = false;
        this.notificationService.success('Privacy settings updated');
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Failed to update privacy settings');
        console.error('Error updating privacy settings:', error);
      }
    });
  }
  
  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.loading = true;
      
      this.authService.deleteAccount().subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success('Your account has been deleted');
          // Redirect to home page
          window.location.href = '/';
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error('Failed to delete account');
          console.error('Error deleting account:', error);
        }
      });
    }
  }
}