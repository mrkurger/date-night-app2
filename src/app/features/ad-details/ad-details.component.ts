import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdService, Ad } from '../../../core/services/ad.service'; // Assuming AdService and Ad type
import { AuthService } from '../../../core/services/auth.service'; // Assuming AuthService
import { User } from '../../../core/models/user.model'; // Assuming User model
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { NebularModule } from '../../../shared/nebular.module'; // Assuming this was there

@Component({
  selector: 'app-ad-details',
  templateUrl: './ad-details.component.html',
  styleUrls: ['./ad-details.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule /*, NebularModule*/], // Add other necessary imports
})
export class AdDetailsComponent implements OnInit, OnDestroy {
  ad: Ad | null = null;
  loading = true;
  error: string | null = null;
  currentImageIndex = 0;
  currentImage: { url: string; type?: string } | string | null = null;
  isOwner = false;
  currentUser$: Observable<User | null>;
  private routeSub: Subscription | undefined;
  private adSub: Subscription | undefined;
  private userSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private adService: AdService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAdDetails(id);
      } else {
        this.loading = false;
        this.error = 'Ad ID not found';
      }
    });
  }

  loadAdDetails(id: string): void {
    this.loading = true;
    this.error = null;
    this.adSub = this.adService.getAdById(id).subscribe({
      next: ad => {
        this.ad = ad;
        if (ad.images && ad.images.length > 0) {
          // Ensure currentImage is an object if ad.images[0] is a string for compatibility
          const firstImage = ad.images[0];
          this.currentImage = typeof firstImage === 'string' ? { url: firstImage } : firstImage;
        }
        this.userSub = this.currentUser$.subscribe(currentUser => {
          if (currentUser && ad.advertiser === currentUser._id) {
            // Problematic line from build output
            this.isOwner = true;
          }
        });
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.error = 'Failed to load ad details. Please try again.';
        console.error(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.adSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
    if (this.ad && this.ad.images) {
      const selectedImage = this.ad.images[this.currentImageIndex];
      this.currentImage =
        typeof selectedImage === 'string' ? { url: selectedImage } : selectedImage;
    }
  }

  prevImage(): void {
    if (this.ad && this.ad.images && this.ad.images.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.ad.images.length) % this.ad.images.length;
      const selectedImage = this.ad.images[this.currentImageIndex];
      this.currentImage =
        typeof selectedImage === 'string' ? { url: selectedImage } : selectedImage;
    }
  }

  nextImage(): void {
    if (this.ad && this.ad.images && this.ad.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.ad.images.length;
      const selectedImage = this.ad.images[this.currentImageIndex];
      this.currentImage =
        typeof selectedImage === 'string' ? { url: selectedImage } : selectedImage;
    }
  }

  editAd(): void {
    if (this.ad) {
      this.router.navigate(['/ads/edit', this.ad._id]); // Assuming _id is the identifier
    }
  }

  deleteAd(): void {
    if (this.ad && confirm('Are you sure you want to delete this ad?')) {
      this.adService.deleteAd(this.ad._id).subscribe({
        next: () => {
          this.router.navigate(['/ads']);
          // Optionally, show a success notification
        },
        error: err => {
          this.error = 'Failed to delete ad.';
          console.error(err);
          // Optionally, show an error notification
        },
      });
    }
  }
}
