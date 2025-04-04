import { Component, OnInit } from '@angular/core';
import { AdService } from '../../core/services/ad.service';

@Component({
  selector: 'app-tinder',
  template: `
    <div class="container mt-4">
      <div *ngIf="currentAd" class="card swipe-card">
        <img [src]="currentAd.imageUrl" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">{{currentAd.title}}</h5>
          <p class="card-text">{{currentAd.description}}</p>
        </div>
        <div class="card-footer">
          <button (click)="onSwipe('left')" class="btn btn-danger">×</button>
          <button (click)="onSwipe('right')" class="btn btn-success">♥</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .swipe-card {
      max-width: 600px;
      margin: 0 auto;
    }
  `]
})
export class TinderComponent implements OnInit {
  ads: any[] = [];
  currentAd: any = null;
  loading = false;

  constructor(private adService: AdService) {}

  ngOnInit(): void {
    this.loadSwipeAds();
  }

  loadSwipeAds(): void {
    this.loading = true;
    this.adService.getSwipeAds().subscribe({
      next: (ads) => {
        this.ads = ads;
        this.currentAd = this.ads[0];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load ads for swiping', err);
        this.loading = false;
      }
    });
  }

  onSwipe(direction: 'left' | 'right'): void {
    if (!this.currentAd) return;

    this.adService.recordSwipe(this.currentAd.id, direction).subscribe({
      next: () => {
        this.ads.shift();
        this.currentAd = this.ads[0];
      },
      error: (err) => console.error('Failed to record swipe', err)
    });
  }
}
