import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdService } from '../../core/services/ad.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-ad-management',
  templateUrl: './ad-management.component.html',
  styleUrls: ['./ad-management.component.scss']
})
export class AdManagementComponent implements OnInit {
  ads: any[] = [];
  loading = false;
  error = '';
  isAdmin = false;

  constructor(
    private adService: AdService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAds();
    this.checkUserRole();
  }

  private loadAds(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

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

  private checkUserRole(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isAdmin = user.role === 'admin';
      }
    });
  }
}
