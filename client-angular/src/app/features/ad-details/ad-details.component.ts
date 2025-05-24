// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-details.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdService } from '../../core/services/ad.service';
import { Ad } from '../../core/models/ad.interface';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-details',
  templateUrl: './ad-details.component.html',
  styleUrls: ['./ad-details.component.scss'],
  imports: [CommonModule],
})
export class AdDetailsComponent implements OnInit {
  ad: Ad | null = null;
  loading = true;
  error: string | null = null;
  isOwner = false;
  currentImageIndex = 0;
  currentImage: { url: string; type?: string } | null = null;
  currentImageUrl = '';
  favorites: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AdService,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadAdDetails();
    this.loadFavorites();
  }

  loadAdDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.adService.getAdById(id).subscribe({
        next: (ad) => {
          this.ad = ad;
          this.loading = false;

          // Set the current image
          if (ad.media && ad.media.length > 0) {
            this.currentImage = ad.media[0];
            this.currentImageUrl = ad.media[0].url;
          } else if (ad.images && ad.images.length > 0) {
            if (typeof ad.images[0] === 'string') {
              this.currentImage = { url: ad.images[0] };
            } else {
              this.currentImage = ad.images[0];
            }
            this.currentImageUrl =
              typeof ad.images[0] === 'string' ? ad.images[0] : ad.images[0].url;
          }

          // Check if the current user is the owner
          this.authService.currentUser$.subscribe((currentUser) => {
            if (currentUser && ad.advertiser === currentUser._id) {
              this.isOwner = true;
            } else {
              this.isOwner = false; // Ensure isOwner is reset if user is not owner or not logged in
            }
          });
        },
        error: (err) => {
          console.error('Error fetching ad details:', err);
          this.error = 'Failed to load ad details. Please try again.';
          this.loading = false;
        },
      });
    } else {
      this.error = 'Ad ID not found';
      this.loading = false;
    }
  }

  loadFavorites(): void {
    this.authService.currentUser$.subscribe((currentUser) => {
      if (currentUser) {
        this.userService.getFavorites().subscribe({
          next: (favorites) => (this.favorites = favorites),
          error: (err) => console.error('Error loading favorites:', err),
        });
      } else {
        this.favorites = []; // Clear favorites if no user
      }
    });
  }

  nextImage(): void {
    if (this.ad && this.ad.media && this.ad.media.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.ad.media.length;
      this.currentImage = this.ad.media[this.currentImageIndex];
      this.currentImageUrl = this.ad.media[this.currentImageIndex].url;
    } else if (this.ad && this.ad.images && this.ad.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.ad.images.length;
      if (typeof this.ad.images[this.currentImageIndex] === 'string') {
        this.currentImage = { url: this.ad.images[this.currentImageIndex] as string };
      } else {
        this.currentImage = this.ad.images[this.currentImageIndex] as {
          url: string;
          type?: string;
        };
      }
      this.currentImageUrl =
        typeof this.currentImage === 'string' ? this.currentImage : this.currentImage.url;
    }
  }

  prevImage(): void {
    if (this.ad && this.ad.media && this.ad.media.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.ad.media.length) % this.ad.media.length;
      this.currentImage = this.ad.media[this.currentImageIndex];
      this.currentImageUrl = this.ad.media[this.currentImageIndex].url;
    } else if (this.ad && this.ad.images && this.ad.images.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.ad.images.length) % this.ad.images.length;
      if (typeof this.ad.images[this.currentImageIndex] === 'string') {
        this.currentImage = { url: this.ad.images[this.currentImageIndex] as string };
      } else {
        this.currentImage = this.ad.images[this.currentImageIndex] as {
          url: string;
          type?: string;
        };
      }
      this.currentImageUrl =
        typeof this.currentImage === 'string' ? this.currentImage : this.currentImage.url;
    }
  }

  startChat(): void {
    if (this.ad) {
      // Navigate to chat with the advertiser
      const advertiserId =
        typeof this.ad.advertiser === 'object' ? this.ad.advertiser.username : this.ad.advertiser;
      this.router.navigate(['/chat', advertiserId]);
    }
  }

  getAdvertiserInitial(ad: Ad): string {
    if (!ad || !ad.advertiser) {
      return 'U';
    }

    if (typeof ad.advertiser === 'object') {
      return ad.advertiser.username.charAt(0);
    }

    return ad.advertiser.charAt(0);
  }

  getAdvertiserName(ad: Ad): string {
    if (!ad || !ad.advertiser) {
      return 'Unknown';
    }

    if (typeof ad.advertiser === 'object') {
      return ad.advertiser.username;
    }

    return ad.advertiser;
  }

  toggleFavorite(): void {
    if (!this.ad) return;

    this.authService.currentUser$.subscribe((currentUser) => {
      if (!currentUser) {
        this.router.navigate(['/auth/login']);
        return;
      }

      // Convert complex ID to string for comparison if needed
      const adIdStr = typeof this.ad._id === 'string' ? this.ad._id : JSON.stringify(this.ad._id);

      if (this.isFavorite()) {
        this.userService.removeFavorite(this.ad._id).subscribe({
          next: () => {
            this.favorites = this.favorites.filter((id) => id !== adIdStr);
            this.notificationService.success('Removed from favorites');
          },
          error: (err) => {
            console.error('Error removing from favorites:', err);
            this.notificationService.error('Failed to remove from favorites');
          },
        });
      } else {
        this.userService.addFavorite(this.ad._id).subscribe({
          next: () => {
            this.favorites.push(adIdStr);
            this.notificationService.success('Added to favorites');
          },
          error: (err) => {
            console.error('Error adding to favorites:', err);
            this.notificationService.error('Failed to add to favorites');
          },
        });
      }
    });
  }

  isFavorite(): boolean {
    if (!this.ad) return false;

    // Convert complex ID to string for comparison if needed
    const adIdStr = typeof this.ad._id === 'string' ? this.ad._id : JSON.stringify(this.ad._id);

    return this.favorites.includes(adIdStr);
  }

  reportAd(): void {
    if (!this.ad) return;

    // In a real app, this would open a dialog to collect the reason
    const reason = prompt('Please provide a reason for reporting this ad:');
    if (reason) {
      this.adService.reportAd(this.ad._id, reason).subscribe({
        next: () => {
          this.notificationService.success('Ad reported successfully');
        },
        error: (err) => {
          console.error('Error reporting ad:', err);
          this.notificationService.error('Failed to report ad');
        },
      });
    }
  }

  showPhone(): void {
    // In a real app, this would fetch the phone number from the backend
    alert('Phone number: +1234567890');
  }

  editAd(): void {
    if (this.ad) {
      this.router.navigate(['/ad-management/edit', this.ad._id]);
    }
  }

  toggleAdStatus(): void {
    if (!this.ad) return;

    const newStatus = !this.ad.isActive;
    this.adService.toggleActiveStatus(this.ad._id, newStatus).subscribe({
      next: () => {
        if (this.ad) this.ad.isActive = newStatus;
        this.notificationService.success(
          `Ad ${newStatus ? 'activated' : 'deactivated'} successfully`,
        );
      },
      error: (err) => {
        console.error('Error toggling ad status:', err);
        this.notificationService.error('Failed to update ad status');
      },
    });
  }

  deleteAd(): void {
    if (!this.ad) return;

    if (confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      this.adService.deleteAd(this.ad._id).subscribe({
        next: () => {
          this.notificationService.success('Ad deleted successfully');
          this.router.navigate(['/ad-management']);
        },
        error: (err) => {
          console.error('Error deleting ad:', err);
          this.notificationService.error('Failed to delete ad');
        },
      });
    }
  }
}
