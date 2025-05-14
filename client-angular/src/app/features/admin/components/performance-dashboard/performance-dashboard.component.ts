import { NbDatepickerModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';

import { NbCardModule } from '@nebular/theme';
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (performance-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';

import { TelemetryService } from '../../../../core/services/telemetry.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AppSortComponent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { AppSortHeaderComponent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { NbPaginationChangeEvent } from '../../../../shared/components/custom-nebular-components/nb-paginator/nb-paginator.module';
import { AppSortEvent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.module';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule, NbTabsetModule, NbTableModule, NbFormFieldModule, NbInputModule, NbSelectModule, NbDatepickerModule, NbSpinnerModule, NbTagModule, NbIconModule, AppSortComponent, AppSortHeaderComponent, ReactiveFormsModule, NgxChartsModule],
  templateUrl: './performance-dashboard.component.html',
  styleUrls: ['./performance-dashboard.component.scss'],
})
export class PerformanceDashboardComponent implements OnInit {
  // Chart data
  responseTimeByEndpoint: any[] = [];
  responseTimeDistribution: any[] = [];
  responseTimeOverTime: any[] = [];

  // Table data
  slowestEndpoints: any[] = [];
  displayedColumns: string[] = [
    'url',
    'method',
    'avgDuration',
    'p95Duration',
    'maxDuration',
    'count',
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalEndpoints = 0;

  // Filtering
  filterForm: FormGroup;

  // State
  isLoading = false;

  constructor(
    private telemetryService: TelemetryService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      url: [''],
      method: [''],
      minDuration: [''],
      startDate: [null],
      endDate: [null],
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Get filter values
    const filters = {
      url: this.filterForm.get('url')?.value,
      method: this.filterForm.get('method')?.value,
      minDuration: this.filterForm.get('minDuration')?.value,
      startDate: this.filterForm.get('startDate')?.value
        ? this.formatDate(this.filterForm.get('startDate')?.value)
        : undefined,
      endDate: this.filterForm.get('endDate')?.value
        ? this.formatDate(this.filterForm.get('endDate')?.value)
        : undefined,
      page: this.pageIndex.toString(), // Convert page to string
      pageSize: this.pageSize.toString(), // Convert pageSize to string
    };

    // Load performance statistics
    this.telemetryService
      .getPerformanceStatistics(filters)
      .pipe(
        catchError((error) => {
          console.error('Failed to load performance statistics:', error);
          return of({
            byEndpoint: [],
            distribution: [],
            byDate: [],
            slowestEndpoints: [],
            totalCount: 0,
          });
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe((data) => {
        // Transform data for charts
        this.responseTimeByEndpoint = this.transformEndpointData(data.byEndpoint);
        this.responseTimeDistribution = this.transformDistributionData(data.distribution);
        this.responseTimeOverTime = this.transformTimeSeriesData(data.byDate);

        // Set table data
        this.slowestEndpoints = data.slowestEndpoints;
        this.totalEndpoints = data.totalCount;
      });
  }

  transformEndpointData(data: any[]): any[] {
    return data
      .map((item) => ({
        name: this.formatEndpointName(item.url, item.method),
        value: item.avgDuration,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 slowest endpoints
  }

  transformDistributionData(data: any[]): any[] {
    // Group response times into buckets
    const buckets = [
      { name: '0-100ms', min: 0, max: 100, count: 0 },
      { name: '100-300ms', min: 100, max: 300, count: 0 },
      { name: '300-500ms', min: 300, max: 500, count: 0 },
      { name: '500-1000ms', min: 500, max: 1000, count: 0 },
      { name: '1-2s', min: 1000, max: 2000, count: 0 },
      { name: '2-5s', min: 2000, max: 5000, count: 0 },
      { name: '5s+', min: 5000, max: Infinity, count: 0 },
    ];

    // Count requests in each bucket
    data.forEach((item) => {
      const duration = item.duration;
      const bucket = buckets.find((b) => duration >= b.min && duration < b.max);
      if (bucket) {
        bucket.count += item.count;
      }
    });

    // Format for chart
    return buckets.map((bucket) => ({
      name: bucket.name,
      value: bucket.count,
    }));
  }

  transformTimeSeriesData(data: any[]): any[] {
    // Group by day and calculate average
    const groupedByDay = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const day = date.toISOString().split('T')[0];

      if (!acc[day]) {
        acc[day] = { total: 0, count: 0 };
      }

      acc[day].total += item.avgDuration * item.count;
      acc[day].count += item.count;
      return acc;
    }, {});

    // Convert to series format
    const series = Object.keys(groupedByDay).map((day) => ({
      name: day,
      value: groupedByDay[day].count > 0 ? groupedByDay[day].total / groupedByDay[day].count : 0,
    }));

    // NbSortEvent by date
    series.sort((a, b) => a.name.localeCompare(b.name));

    return [
      {
        name: 'Average Response Time',
        series,
      },
    ];
  }

  applyFilters(): void {
    this.pageIndex = 0; // Reset to first page
    this.loadDashboardData();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.pageIndex = 0;
    this.loadDashboardData();
  }

  /**
   * Handle page change event from paginator
   */
  onPageChange(event: NbPaginationChangeEvent): void {
    this.pageIndex = event.page - 1; // Convert 1-based to 0-based index
    this.pageSize = event.pageSize;
    this.loadDashboardData();
  }

  /**
   * Handle sort event from sort component
   */
  sortData(sort: AppSortEvent): void {
    // Implement sorting logic if needed, then reload data
    // Example: this.sortField = sort.active; this.sortDirection = sort.direction;
    this.loadDashboardData();
  }

  formatEndpointName(url: string, method: string): string {
    // Truncate long URLs
    const maxLength = 30;
    const truncatedUrl = url.length > maxLength ? url.substring(0, maxLength) + '...' : url;

    return `${method} ${truncatedUrl}`;
  }

  formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
