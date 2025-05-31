import { CommonModule } from '@angular/common';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { IUser } from '../../core/models/user.interface';
import { AdService } from '../../core/services/ad.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserService } from '../../core/services/user.service';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';
import { TooltipModule } from 'primeng/tooltip';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (advertiser-profile.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

/**
 * Advertiser Profile Component;
 *;
 * Displays and manages an advertiser's profile information using Nebular UI components.;
 * Features include:;
 * - Profile viewing with responsive layout;
 * - Profile editing with form validation;
 * - Media gallery with thumbnails;
 * - Status badges (Featured, Touring)
 * - Actions (Edit, Delete, Upgrade)
 *;
 * Uses Nebular components:;
 * - NbCard for layout containers;
 * - NbBadge for status indicators;
 * - NbForm components for editing;
 * - NbButton for actions;
 * - NbIcon for visual indicators;
 * - NbSpinner for loading states;
 */
@Component({
  selector: 'app-advertiser-profile',
  templateUrl: './advertiser-profile.component.html',
  styleUrls: ['./advertiser-profile.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MainLayoutComponent,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    InputTextModule,
    BadgeModule,
    ChipModule,
    DropdownModule,
    TooltipModule,
    MessagesModule,
  ],
})
export class AdvertiserProfileComponent implements OnInit {
  advertiser: IUser | null = null;
  loading = true;
  error: string | null = null;
  isOwner = false;
  editMode = false;
  profileForm: FormGroup;

  /**
   *
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly fb: FormBuilder,
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      profile: this.fb.group({
        firstName: [''],
        lastName: [''],
        bio: [''],
      }),
    });
  }

  /**
   *
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const advertiserId = params.get('id');
      if (advertiserId) {
        this.loadAdvertiser(advertiserId);
      } else {
        this.error = 'Advertiser ID not provided';
        this.loading = false;
      }
    });
  }

  /**
   *
   */
  loadAdvertiser(advertiserId?: string): void {
    this.loading = true;

    const id = advertiserId || this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Advertiser ID not provided';
      this.loading = false;
      return;
    }

    this.userService.getUser(id).subscribe({
      next: (advertiserData) => {
        this.advertiser = advertiserData;
        this.loading = false;

        this.authService.currentUser$.subscribe((currentUser) => {
          if (currentUser && advertiserData._id === currentUser._id) {
            this.isOwner = true;
          }
        });

        this.profileForm.patchValue({
          username: advertiserData.username,
          email: advertiserData.email,
          profile: {
            firstName: advertiserData.profile?.firstName || '',
            lastName: advertiserData.profile?.lastName || '',
            bio: advertiserData.profile?.bio || '',
          },
        });
      },
      error: (err) => {
        this.error = 'Failed to load advertiser details';
        this.loading = false;
        console.error('Error loading advertiser:', err);
      },
    });
  }

  /**
   *
   */
  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  /**
   *
   */
  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.notificationService.error('Please fix the form errors before submitting');
      return;
    }

    if (!this.advertiser) return;

    const updatedAdvertiser = {
      ...this.advertiser,
      ...this.profileForm.value,
    };

    this.loading = true;
    this.userService.updateUser(this.advertiser._id, updatedAdvertiser).subscribe({
      next: (updatedData) => {
        this.advertiser = updatedData;
        this.loading = false;
        this.editMode = false;
        this.notificationService.success('Profile updated successfully');
      },
      error: (err) => {
        this.error = 'Failed to update profile';
        this.loading = false;
        console.error('Error updating profile:', err);
        this.notificationService.error('Failed to update profile');
      },
    });
  }

  /**
   *
   */
  cancelEdit(): void {
    this.editMode = false;

    if (this.advertiser) {
      this.profileForm.patchValue({
        username: this.advertiser.username,
        email: this.advertiser.email,
        profile: {
          firstName: this.advertiser.profile?.firstName || '',
          lastName: this.advertiser.profile?.lastName || '',
          bio: this.advertiser.profile?.bio || '',
        },
      });
    }
  }

  /**
   *
   */
  deleteAd(): void {
    if (!this.advertiser) return;

    if (confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      this.loading = true;
      this.userService.deleteUser(this.advertiser._id).subscribe({
        next: () => {
          this.notificationService.success('Profile deleted successfully');
          this.router.navigateByUrl('/browse');
        },
        error: (err) => {
          this.error = 'Failed to delete profile';
          this.loading = false;
          console.error('Error deleting profile:', err);
          this.notificationService.error('Failed to delete profile');
        },
      });
    }
  }

  /**
   *
   */
  upgradeToFeatured(): void {
    if (!this.advertiser) return;

    this.notificationService.info('Feature not applicable for user profiles directly.');
  }

  /**
   *
   */
  getMediaUrl(index = 0): string {
    return '/assets/images/default-profile.jpg';
  }

  /**
   *
   */
  getMediaIndices(): number[] {
    return [];
  }
}
