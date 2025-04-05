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
  standalone: true,
  imports: [CommonModule]
})
export class AdDetailsComponent implements OnInit {
  ad: Ad | null = null;
  loading = true;
  error: string | null = null;
  isOwner = false;
  currentImageIndex = 0;
  currentImage = '';
  favorites: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adService: AdService,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService
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
            this.currentImage = ad.media[0].url;
          } else if (ad.images && ad.images.length > 0) {
            this.currentImage = ad.images[0];
          }

          // Check if the current user is the owner
          const currentUser = this.authService.getCurrentUser();
          if (currentUser && ad.advertiser === currentUser._id) {
            this.isOwner = true;
          }
        },
        error: (err) => {
          console.error('Error fetching ad details:', err);
          this.error = 'Failed to load ad details. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Ad ID not found';
      this.loading = false;
    }
  }

  loadFavorites(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userService.getFavorites().subscribe({
        next: (favorites) => this.favorites = favorites,
        error: (err) => console.error('Error loading favorites:', err)
      });
    }
  }

  nextImage(): void {
    if (this.ad && this.ad.media && this.ad.media.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.ad.media.length;
      this.currentImage = this.ad.media[this.currentImageIndex].url;
    } else if (this.ad && this.ad.images && this.ad.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.ad.images.length;
      this.currentImage = this.ad.images[this.currentImageIndex];
    }
  }

  prevImage(): void {
    if (this.ad && this.ad.media && this.ad.media.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.ad.media.length) % this.ad.media.length;
      this.currentImage = this.ad.media[this.currentImageIndex].url;
    } else if (this.ad && this.ad.images && this.ad.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.ad.images.length) % this.ad.images.length;
      this.currentImage = this.ad.images[this.currentImageIndex];
    }
  }

  startChat(): void {
    if (this.ad) {
      // Navigate to chat with the advertiser
      this.router.navigate(['/chat', this.ad.advertiser]);
    }
  }

  toggleFavorite(): void {
    if (!this.ad) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isFavorite()) {
      this.userService.removeFavorite(this.ad._id).subscribe({
        next: () => {
          this.favorites = this.favorites.filter(id => id !== this.ad?._id);
          this.notificationService.success('Removed from favorites');
        },
        error: (err) => {
          console.error('Error removing from favorites:', err);
          this.notificationService.error('Failed to remove from favorites');
        }
      });
    } else {
      this.userService.addFavorite(this.ad._id).subscribe({
        next: () => {
          this.favorites.push(this.ad?._id || '');
          this.notificationService.success('Added to favorites');
        },
        error: (err) => {
          console.error('Error adding to favorites:', err);
          this.notificationService.error('Failed to add to favorites');
        }
      });
    }
  }

  isFavorite(): boolean {
    return this.ad ? this.favorites.includes(this.ad._id) : false;
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
        }
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
        this.notificationService.success(`Ad ${newStatus ? 'activated' : 'deactivated'} successfully`);
      },
      error: (err) => {
        console.error('Error toggling ad status:', err);
        this.notificationService.error('Failed to update ad status');
      }
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
        }
      });
    }
  }
}