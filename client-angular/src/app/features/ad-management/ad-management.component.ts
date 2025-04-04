import { Component, OnInit } from '@angular/core';
import { AdService } from '../../core/services/ad.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ad-management',
  templateUrl: './ad-management.component.html',
  styleUrls: ['./ad-management.component.css']
})
export class AdManagementComponent implements OnInit {
  ads: any[] = [];
  loading = false;
  error = '';

  constructor(
    private adService: AdService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAds();
  }

  private loadAds(): void {
    const currentUser = this.authService.getCurrentUser();
    this.loading = true;
    
    this.adService.getUserAds(currentUser.id).subscribe({
      next: (ads) => {
        this.ads = ads;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ads';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
