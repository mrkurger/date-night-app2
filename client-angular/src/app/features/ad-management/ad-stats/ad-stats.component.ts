import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (ad-stats.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdService } from '../../../core/services/ad.service';


@Component({
  selector: 'app-ad-stats',
  templateUrl: './ad-stats.component.html',
  styleUrls: ['./ad-stats.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, NbCardModule, NbSpinnerModule, NbTableModule, NbTreeGridModule, NbInputModule, NbFormFieldModule, NbIconModule, NbButtonModule, NbSelectModule],
})
export class AdStatsComponent implements OnInit {
  // Make Math available to the template
  Math = Math;

  loading = false;
  dataSource: any[] = [];
  viewsData: any[] = [];
  clicksData: any[] = [];
  adTitle = 'Loading...';
  displayedColumns: string[] = ['date', 'views', 'clicks', 'inquiries', 'conversionRate'];

  // Nebular pagination
  pageSize = 10;
  pageSizes = [5, 10, 25, 100];
  currentPage = 1;
  totalItems = 0;

  // Nebular sorting
  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  rawData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private adService: AdService,
    public dataSourceBuilder: NbTreeGridDataSourceBuilder<any>,
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
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource = this.dataSource.filter((item) =>
      Object.values(item).some(
        (val) => val && typeof val === 'string' && val.toLowerCase().includes(filterValue),
      ),
    );
    this.totalItems = this.dataSource.length;
    this.currentPage = 1;
  }

  onSort(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
    this.sortData();
  }

  sortData(): void {
    if (this.sortColumn && this.sortDirection !== NbSortDirection.NONE) {
      this.dataSource = [...this.dataSource].sort((a, b) => {
        const aValue = a[this.sortColumn];
        const bValue = b[this.sortColumn];
        const dir = this.sortDirection === NbSortDirection.ASCENDING ? 1 : -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * dir;
        }

        return (aValue - bValue) * dir;
      });
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
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

    this.rawData = sampleData;
    this.totalItems = sampleData.length;

    this.viewsData = sampleData.map((item) => ({
      name: item.date,
      value: item.views,
    }));
    this.clicksData = sampleData.map((item) => ({
      name: item.date,
      value: item.clicks,
    }));

    // Initialize the tree grid data source
    const formattedData = sampleData.map((item) => ({
      data: item,
    }));

    // Update dataSource with the correct type
    this.dataSource = formattedData;
  }

  // Helper method to get the data for the current page
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.rawData.slice(startIndex, startIndex + this.pageSize);
  }
}
