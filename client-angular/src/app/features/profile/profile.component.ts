import { Input } from '@angular/core';
import { NebularModule } from '../shared/nebular.module';

import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (profile.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/user.interface';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NebularModule],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  userProfile: UserProfile | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: [''],
      phoneNumber: [''],
      'location.city': [''],
      'location.country': [''],
      'preferences.notifications': [true],
      'preferences.darkMode': [false],
      'preferences.language': ['en'],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService
      .getCurrentUser()
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to load profile: ' + error.message;
          return of(null);
        }),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe((user) => {
        if (user) {
          // Convert User to UserProfile
          this.userProfile = {
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName,
            avatar: user.profile?.avatar,
            bio: user.profile?.bio,
            location: user.profile?.location,
            preferences: user.preferences || {
              emailNotifications: true,
              pushNotifications: true,
              theme: 'light',
              language: 'en',
            },
          };
          this.updateFormValues();
        }
      });
  }

  updateFormValues(): void {
    if (!this.userProfile) return;

    this.profileForm.patchValue({
      firstName: this.userProfile.firstName || '',
      lastName: this.userProfile.lastName || '',
      bio: this.userProfile.bio || '',
      phoneNumber: '',
      'location.city': this.userProfile.location?.city || '',
      'location.country': this.userProfile.location?.country || '',
      'preferences.notifications': this.userProfile.preferences?.pushNotifications ?? true,
      'preferences.darkMode': false,
      'preferences.language': this.userProfile.preferences?.language || 'en',
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/profile/edit']);
  }

  navigateToAds(): void {
    this.router.navigate(['/ad-management']);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create FormData to support file uploads
    const formData = new FormData();
    const formValues = this.profileForm.value;

    // Add form values to FormData
    Object.keys(formValues).forEach((key) => {
      if (key.includes('.')) {
        // Handle nested properties
        const [parent, child] = key.split('.');
        const parentObj = this.profileForm.get(key)?.value;

        if (parentObj !== null && parentObj !== undefined) {
          // If we already have a JSON string for this parent, parse it
          const existingJson = formData.get(parent);
          const parentData = existingJson ? JSON.parse(existingJson as string) : {};

          // Add/update the child property
          parentData[child] = formValues[key];

          // Set the updated JSON string
          formData.set(parent, JSON.stringify(parentData));
        }
      } else {
        // Handle regular properties
        if (formValues[key] !== null && formValues[key] !== undefined) {
          formData.append(key, formValues[key]);
        }
      }
    });

    // Add profile image if selected
    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    this.userService
      .updateProfile(formData)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to update profile: ' + error.message;
          return of(null);
        }),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe((response) => {
        if (response) {
          this.successMessage = 'Profile updated successfully';
          // Convert User to UserProfile
          this.userProfile = {
            firstName: response.profile?.firstName,
            lastName: response.profile?.lastName,
            avatar: response.profile?.avatar,
            bio: response.profile?.bio,
            location: response.profile?.location,
            preferences: response.preferences || {
              emailNotifications: true,
              pushNotifications: true,
              theme: 'light',
              language: 'en',
            },
          };
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
}
