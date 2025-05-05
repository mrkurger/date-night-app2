// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-stats.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { AdService } from '../../../core/services/ad.service';

@Component({
  selector: 'app-ad-stats',
  templateUrl: './ad-stats.component.html',
  styleUrls: ['./ad-stats.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule, DatePipe],
})
export class AdStatsComponent implements OnInit {
  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  viewsData: any[] = [];
  clicksData: any[] = [];
  adTitle = 'Loading...';
  displayedColumns: string[] = ['date', 'views', 'clicks', 'inquiries', 'conversionRate'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private route: ActivatedRoute,
    private adService: AdService,
  ) {}

  getTotalViews(data: any[]): number {
    return data.reduce((sum, item) => sum + (item.views || 0), 0);
  }

  getTotalClicks(data: any[]): number {
    return data.reduce((sum, item) => sum + (item.clicks || 0), 0);
  }

  getTotalInquiries(data: any[]): number {
    return data.reduce((sum, item) => sum + (item.inquiries || 0), 0);
  }

  getConversionRate(data: any[]): number {
    const totalClicks = this.getTotalClicks(data);
    const totalInquiries = this.getTotalInquiries(data);
    return totalClicks ? Math.round((totalInquiries / totalClicks) * 100) : 0;
  }

  ngOnInit() {
    const adId = this.route.snapshot.paramMap.get('id');
    if (adId) {
      this.loading = true;
      this.adService.getAdById(adId).subscribe({
        next: (ad) => {
          this.adTitle = ad.title;
          this.loadSampleData(); // Replace with real data when available
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading ad:', error);
          this.adTitle = 'Unknown Ad';
          this.loading = false;
        },
      });
    } else {
      this.adTitle = 'Unknown Ad';
      this.loadSampleData();
    }
  }

  getBarHeight(item: any, data: any[]): string {
    const maxValue = Math.max(...data.map((d) => d.value));
    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
    return `${percentage}%`;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  private loadSampleData() {
    const today = new Date();
    const sampleData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 100),
      clicks: Math.floor(Math.random() * 50),
      inquiries: Math.floor(Math.random() * 10),
      conversionRate: Math.random() * 100,
    }));

    this.dataSource.data = sampleData;

    // Set up paginator and sort after data is loaded
    setTimeout(() => {
      if (this.paginator) this.dataSource.paginator = this.paginator;
      if (this.sort) this.dataSource.sort = this.sort;
    });

    this.viewsData = sampleData.map((item) => ({
      name: item.date,
      value: item.views,
    }));
    this.clicksData = sampleData.map((item) => ({
      name: item.date,
      value: item.clicks,
    }));
  }
}
