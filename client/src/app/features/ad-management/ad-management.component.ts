import { Component, OnInit } from '@angular/core';
import { AdService } from '../../services/ad.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ad-management',
  templateUrl: './ad-management.component.html'
})
export class AdManagementComponent implements OnInit {
  ads: any[] = [];
  loading = false;
  error: string = '';
  
  constructor(private adService: AdService, private authService: AuthService) { }
  
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.loading = true;
    this.adService.getAds().subscribe({
      next: data => {
        this.ads = data.filter((ad: any) => ad.advertiser === currentUser._id);
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load your ads';
        this.loading = false;
        console.error(err);
      }
    });
  }
  // ...other methods for create, edit, update, delete...
}
