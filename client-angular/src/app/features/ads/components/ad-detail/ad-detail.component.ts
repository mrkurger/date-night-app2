import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdService } from '../../../../core/services/ad.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-detail',
  templateUrl: './ad-detail.component.html',
  styles: [`
    .ad-detail-container {
      padding: 20px;
    }
    .ad-title {
      font-size: 24px;
      margin-bottom: 15px;
    }
    .ad-description {
      margin-bottom: 20px;
    }
    .ad-image {
      max-width: 100%;
      margin-bottom: 15px;
    }
    .action-buttons {
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class AdDetailComponent implements OnInit {
  ad: any;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private adService: AdService) {}

  ngOnInit(): void {
    const adId = this.route.snapshot.paramMap.get('id');
    if (!adId) {
      this.error = 'Ad ID missing';
      return;
    }
    this.adService.getAdById(adId).subscribe({
      next: data => { this.ad = data; this.loading = false; },
      error: err => { this.error = 'Failed to load ad details'; this.loading = false; }
    });
  }
}
