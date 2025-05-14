import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbTagModule } from '@nebular/theme';
import { NbBadgeModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (advertiser-profile.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AdService } from '../../core/services/ad.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MainLayoutComponent } from '../../shared/components/main-layout/main-layout.component';
import { Ad } from '../../core/models/ad.interface';

/**
 * Advertiser Profile Component
 *
 * Displays and manages an advertiser's profile information using Nebular UI components.
 * Features include:
 * - Profile viewing with responsive layout
 * - Profile editing with form validation
 * - Media gallery with thumbnails
 * - Status badges (Featured, Touring)
 * - Actions (Edit, Delete, Upgrade)
 *
 * Uses Nebular components:
 * - NbCard for layout containers
 * - NbBadge for status indicators
 * - NbForm components for editing
 * - NbButton for actions
 * - NbIcon for visual indicators
 * - NbSpinner for loading states
 */
@Component({
  selector: 'app-advertiser-profile',
  templateUrl: './advertiser-profile.component.html',
  styleUrls: ['./advertiser-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MainLayoutComponent, NbCardModule, NbButtonModule, NbIconModule, NbSpinnerModule, NbFormFieldModule, NbInputModule, NbSelectModule, NbTagModule, NbBadgeModule, NbLayoutModule],
})
export class AdvertiserProfileComponent implements OnInit {
  ad: Ad | null = null;
  loading = true;
  error: string | null = null;
  isOwner = false;
  editMode = false;
  adForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AdService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      isTouring: [false],
      tags: [''],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const adId = params.get('id');
      if (adId) {
        this.loadAd(adId);
      } else {
        this.error = 'Ad ID not provided';
        this.loading = false;
      }
    });
  }

  loadAd(adId?: string): void {
    this.loading = true;

    // If adId is not provided, use the one from the route
    const id = adId || this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Ad ID not provided';
      this.loading = false;
      return;
    }

    this.adService.getAdById(id).subscribe({
      next: (ad) => {
        this.ad = ad;
        this.loading = false;

        // Check if current user is the owner
        this.authService.currentUser$.subscribe((user) => {
          if (user && ad.userId === user._id) {
            this.isOwner = true;
          }
        });

        // Initialize form with ad data
        this.adForm.patchValue({
          title: ad.title,
          description: ad.description,
          location: ad.location,
          price: ad.price || 0,
          category: ad.category,
          isTouring: ad.isTouring || false,
          tags: ad.tags ? ad.tags.join(', ') : '',
        });
      },
      error: (err) => {
        this.error = 'Failed to load ad details';
        this.loading = false;
        console.error('Error loading ad:', err);
      },
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  saveChanges(): void {
    if (this.adForm.invalid) {
      this.notificationService.error('Please fix the form errors before submitting');
      return;
    }

    if (!this.ad) return;

    const updatedAd = {
      ...this.ad,
      ...this.adForm.value,
      tags: this.adForm.value.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag),
    };

    this.loading = true;
    this.adService.updateAd(this.ad._id, updatedAd).subscribe({
      next: (ad) => {
        this.ad = ad;
        this.loading = false;
        this.editMode = false;
        this.notificationService.success('Ad updated successfully');
      },
      error: (err) => {
        this.error = 'Failed to update ad';
        this.loading = false;
        console.error('Error updating ad:', err);
        this.notificationService.error('Failed to update ad');
      },
    });
  }

  cancelEdit(): void {
    this.editMode = false;

    // Reset form to original values
    if (this.ad) {
      this.adForm.patchValue({
        title: this.ad.title,
        description: this.ad.description,
        location: this.ad.location,
        price: this.ad.price || 0,
        category: this.ad.category,
        isTouring: this.ad.isTouring || false,
        tags: this.ad.tags ? this.ad.tags.join(', ') : '',
      });
    }
  }

  deleteAd(): void {
    if (!this.ad) return;

    if (confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      this.loading = true;
      this.adService.deleteAd(this.ad._id).subscribe({
        next: () => {
          this.notificationService.success('Ad deleted successfully');
          // Navigate to my ads page
          this.router.navigateByUrl('/my-ads');
        },
        error: (err) => {
          this.error = 'Failed to delete ad';
          this.loading = false;
          console.error('Error deleting ad:', err);
          this.notificationService.error('Failed to delete ad');
        },
      });
    }
  }

  upgradeToFeatured(): void {
    if (!this.ad) return;

    // Navigate to upgrade page with ad ID
    this.router.navigateByUrl(`/upgrade?adId=${this.ad._id}`);
  }

  getMediaUrl(index = 0): string {
    if (!this.ad) return '/assets/images/default-profile.jpg';

    if (this.ad.media && this.ad.media.length > index) {
      return this.ad.media[index].url;
    }

    if (this.ad.images && this.ad.images.length > index) {
      const image = this.ad.images[index];
      // Handle both string and object types
      return typeof image === 'string' ? image : image.url;
    }

    return '/assets/images/default-profile.jpg';
  }

  getMediaIndices(): number[] {
    if (!this.ad) return [];

    const mediaLength = this.ad.media?.length || 0;
    const imagesLength = this.ad.images?.length || 0;
    const totalLength = Math.max(mediaLength, imagesLength);

    return Array.from({ length: totalLength }, (_, i) => i);
  }
}
