import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdService } from '../../core/services/ad.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';
import { Ad } from '../../core/models/ad.interface';

@Component({
  selector: 'app-advertiser-profile',
  templateUrl: './advertiser-profile.component.html',
  styleUrls: ['./advertiser-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MainLayoutComponent]
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
    private adService: AdService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      location: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      isTouring: [false],
      tags: ['']
    });
  }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const adId = params.get('id');
      if (adId) {
        this.loadAd(adId);
      } else {
        this.error = 'Ad ID not provided';
        this.loading = false;
      }
    });
  }
  
  loadAd(adId: string): void {
    this.loading = true;
    this.adService.getAdById(adId).subscribe({
      next: (ad) => {
        this.ad = ad;
        this.loading = false;
        
        // Check if current user is the owner
        this.authService.currentUser$.subscribe(user => {
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
          tags: ad.tags ? ad.tags.join(', ') : ''
        });
      },
      error: (err) => {
        this.error = 'Failed to load ad details';
        this.loading = false;
        console.error('Error loading ad:', err);
      }
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
      tags: this.adForm.value.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
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
      }
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
        tags: this.ad.tags ? this.ad.tags.join(', ') : ''
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
          window.location.href = '/my-ads';
        },
        error: (err) => {
          this.error = 'Failed to delete ad';
          this.loading = false;
          console.error('Error deleting ad:', err);
          this.notificationService.error('Failed to delete ad');
        }
      });
    }
  }
  
  upgradeToFeatured(): void {
    if (!this.ad) return;
    
    // Navigate to upgrade page with ad ID
    window.location.href = `/upgrade?adId=${this.ad._id}`;
  }
  
  getMediaUrl(index: number = 0): string {
    if (!this.ad) return '/assets/images/default-profile.jpg';
    
    if (this.ad.media && this.ad.media.length > index) {
      return this.ad.media[index].url;
    }
    
    if (this.ad.images && this.ad.images.length > index) {
      return this.ad.images[index];
    }
    
    return '/assets/images/default-profile.jpg';
  }
}