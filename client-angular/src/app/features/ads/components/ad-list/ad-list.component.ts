import { Component, OnInit } from '@angular/core';
import { AdService } from '../../../services/ad.service';

@Component({
  selector: 'app-ad-list',
  templateUrl: './ad-list.component.html',
  styleUrls: ['./ad-list.component.css']
})
export class AdListComponent implements OnInit {
  ads: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private adService: AdService) {}

  ngOnInit(): void {
    this.loadAds();
  }

  loadAds(): void {
    this.loading = true;
    this.adService.getAds().subscribe({
      next: data => { this.ads = data; this.loading = false; },
      error: err => { this.error = 'Failed to load ads'; this.loading = false; }
    });
  }
}
