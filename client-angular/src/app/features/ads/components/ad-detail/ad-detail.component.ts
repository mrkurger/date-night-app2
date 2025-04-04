import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdService } from '../../../services/ad.service';

@Component({
  selector: 'app-ad-detail',
  templateUrl: './ad-detail.component.html',
  styleUrls: ['./ad-detail.component.css']
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
