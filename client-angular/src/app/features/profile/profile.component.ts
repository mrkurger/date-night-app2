
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (profile.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit 
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
    Object.keys(formValues).forEach(key => {
      if (key.includes('.')) {
        // Handle nested properties
        const [parent, child] = key.split('.');
        const parentObj = this.profileForm.get(key)?.value;
        
        if (parentObj !== null && parentObj !== undefined) {
          // If we already have a JSON string for this parent, parse it
          const existingJson = formData.get(parent);
          let parentData = existingJson ? JSON.parse(existingJson as string) : {};
          
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
    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
    if (fileInput?.files && fileInput.files.length > 0) {
      formData.append('profileImage', fileInput.files[0]);
    }

    this.userService.updateProfile(formData)
      .pipe(
        catchError(error => {
          this.errorMessage = 'Failed to update profile: ' + error.message;
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        if (response) {
          this.successMessage = 'Profile updated successfully';
          this.userProfile = response;
        }
      });
  }
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserProfile } from '../../core/models/user.interface';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  userProfile: UserProfile | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      bio: [''],
      phoneNumber: [''],
      'location.city': [''],
      'location.country': [''],
      'preferences.notifications': [true],
      'preferences.privacy': ['public']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUser()
      .pipe(
        catchError(error => {
          this.errorMessage = 'Failed to load profile: ' + error.message;
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(user => {
        if (user) {
          this.userProfile = user as UserProfile;
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
      phoneNumber: this.userProfile.phoneNumber || '',
      'location.city': this.userProfile.location?.city || '',
      'location.country': this.userProfile.location?.country || '',
      'preferences.notifications': this.userProfile.preferences?.notifications ?? true,
      'preferences.privacy': this.userProfile.preferences?.privacy || 'public'
    });
  }

  navigateToEdit(): void {
    this.router.navigate(['/profile/edit']);
  }

  navigateToAds(): void {
    this.router.navigate(['/ad-management']);
  }
}
