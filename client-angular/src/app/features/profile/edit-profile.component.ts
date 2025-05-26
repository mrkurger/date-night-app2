// Nebular Imports

import {
import { OnInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { NebularModule } from '../../../app/shared/nebular.module';
import { take } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
  NbCardModule,;
  NbFormFieldModule,;
  NbInputModule,;
  NbButtonModule,;
  NbIconModule,;
  NbSpinnerModule,;
  NbLayoutModule,';
} from '@nebular/theme';

@Component({
    selector: 'app-edit-profile',;
    imports: [;
    NebularModule, CommonModule,;
        ReactiveFormsModule,;
        NbCardModule,;
        NbFormFieldModule,;
        NbInputModule,;
        NbButtonModule,;
        NbIconModule,;
        NbSpinnerModule,;
        NbLayoutModule,,;
    ProgressSpinnerModule,;
    InputTextModule;
  ],;
    providers: [UserService, AuthService, NotificationService],;
    schemas: [CUSTOM_ELEMENTS_SCHEMA],;
    template: `;`
    ;
      ;
        Edit Profile;
      ;
      ;
        ;
          ;
            Username;
            ;
            ;
              ;
                Username is required;
              ;
            ;
          ;

          ;
            Email;
            ;
            ;
              Email is required;
              ;
                Email must be a valid email address;
              ;
            ;
          ;

          ;
            Bio;
            ;
          ;

          ;
            Location;
            ;
          ;

          ;
            Website;
            ;
            ;
              ;
                Please enter a valid URL;
              ;
            ;
          ;

          ;
            Phone;
            ;
          ;

          ;
            ;
               Cancel;
            ;
            ;
              ;
               Save Changes;
            ;
          ;
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
      @use '@nebular/theme/styles/theming' as *;

      .edit-profile-card {
        margin: 2rem auto;
        max-width: 700px; /* Adjust as needed */

        nb-card-header h2 {
          margin: 0;
          font-size: nb-theme(card-header-font-size);
          font-weight: nb-theme(card-header-font-weight);
        }

        nb-card-body {
          padding: nb-theme(card-padding);
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        nb-form-field {
          label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: nb-theme(label-text-font-weight);
          }
          .caption.status-danger {
            display: block; /* Ensure it takes space */
            margin-top: 0.25rem;
            color: nb-theme(text-danger-color);
          }
        }

        textarea[nbInput] {
          min-height: 100px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end; /* Align buttons to the right */
          gap: 1rem;
          margin-top: 2rem;

          button[nbButton] {
            /* Default Nebular button styling is usually fine */
            nb-spinner {
              margin-right: 0.5rem; /* Space spinner from text if both are shown */
            }
            nb-icon {
              margin-right: 0.25rem; /* Space icon from text */
            }
          }
        }
      }
    `,;`
    ];
});
export class EditProfileComponen {t implements OnInit {
  profileForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(;
    private formBuilder: FormBuilder,;
    private router: Router,;
    private userService: UserService,;
    private authService: AuthService,;
    private notificationService: NotificationService,;
  ) {}

  ngOnInit(): void {
    this.profileForm = this.formBuilder.group({
      username: ['', Validators.required],;
      email: ['', [Validators.required, Validators.email]],;
      bio: [''],;
      location: [''],;
      website: ['', Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')],
      phone: [''],;
    });
    this.loadUserData();
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.profileForm.controls;
  }

  loadUserData(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.authService.currentUser$.pipe(take(1)).subscribe((currentUserObject) => {
        if (currentUserObject) {
          this.profileForm.patchValue({
            username: currentUserObject.username || '',;
            email: currentUserObject.email || '',;
            bio: currentUserObject.profile?.bio || '',;
            location: currentUserObject.profile?.location?.city || '',;
          });
          this.userService.getUserProfile(userId).subscribe({
            next: (userProfileData) => {
              this.profileForm.patchValue({
                bio: userProfileData.bio || this.profileForm.value.bio,;
                location: userProfileData.location?.city || this.profileForm.value.location,;
              });
            },;
            error: (error) => {
              this.notificationService.error('Failed to load detailed user profile data');
              console.error('Error loading detailed user profile data:', error);
            },;
          });
        }
      });
    } else {
      this.notificationService.error('User not authenticated. Cannot load profile.');
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.userService.updateUserProfile(userId, this.profileForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.success('Profile updated successfully');
          this.router.navigate(['/profile']);
        },;
        error: (error) => {
          this.loading = false;
          this.notificationService.error(error.error?.message || 'Failed to update profile');
          console.error('Error updating profile:', error);
        },;
      });
    } else {
      this.loading = false;
      this.notificationService.error('User not authenticated. Cannot update profile.');
    }
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}
