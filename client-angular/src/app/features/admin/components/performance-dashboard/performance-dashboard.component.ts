import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TelemetryService } from '../../../../core/services/telemetry.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (performance-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

// PrimeNG imports

// PrimeNG table event interface
interface TableLazyLoadEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: number;
}

@Component({';
  selector: 'app-performance-dashboard',
  imports: [;
    CommonModule,
    NebularModule,
    TableModule,
    CalendarModule,
    ButtonModule,
    ReactiveFormsModule,
    NgxChartsModule,,
    CardModule,
    DropdownModule,
    ProgressSpinnerModule,
    InputTextModule;
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './performance-dashboard.component.html',
  styleUrls: ['./performance-dashboard.component.scss'],
})
export class PerformanceDashboardComponen {t implements OnInit {
  // Chart data
  responseTimeByEndpoint: any[] = []
  responseTimeDistribution: any[] = []
  responseTimeOverTime: any[] = []

  // Table data
  slowestEndpoints: any[] = []
  displayedColumns: string[] = [;
    'url',
    'method',
    'avgDuration',
    'p95Duration',
    'maxDuration',
    'count',
  ]

  // Pagination
  pageSize = 10;
  pageIndex = 0;

  // Sorting
  sortColumn = 'avgDuration';
  sortDirection: 'asc' | 'desc' | '' = 'desc';
  totalEndpoints = 0;

  // Filtering
  filterForm: FormGroup;

  // State
  isLoading = false;

  profileVisibilityOptions = [;
    { label: 'Public - Visible to everyone', value: 'public' },
    { label: 'Registered Users - Only visible to registered users', value: 'registered' },
    { label: 'Private - Only visible to users you\'ve matched with', value: 'private' }
  ]

  allowMessagingOptions = [;
    { label: 'Everyone', value: 'all' },
    { label: 'Only Matches', value: 'matches' },
    { label: 'No One (Disable messaging)', value: 'none' }
  ]

  contentDensityOptions = [;
    { label: 'Compact', value: 'compact' },
    { label: 'Normal', value: 'normal' },
    { label: 'Comfortable', value: 'comfortable' }
  ]

  cardSizeOptions = [;
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ]

  defaultViewTypeOptions = [;
    { label: 'Netflix View', value: 'netflix' },
    { label: 'Tinder View', value: 'tinder' },
    { label: 'List View', value: 'list' }
  ]

  constructor(;
    private telemetryService: TelemetryService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      url: [''],
      method: [''],
      minDuration: [''],
      dateRange: [null], // PrimeNG calendar range selection
    })
  }

  ngOnInit(): void {
    this.loadDashboardData()
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Get filter values
    const dateRange = this.filterForm.get('dateRange')?.value;
    const filters = {
      url: this.filterForm.get('url')?.value,
      method: this.filterForm.get('method')?.value,
      minDuration: this.filterForm.get('minDuration')?.value,
      startDate: dateRange && dateRange[0] ? this.formatDate(dateRange[0]) : undefined,
      endDate: dateRange && dateRange[1] ? this.formatDate(dateRange[1]) : undefined,
      page: this.pageIndex.toString(), // Convert page to string
      pageSize: this.pageSize.toString(), // Convert pageSize to string
    }

    // Load performance statistics
    this.telemetryService;
      .getPerformanceStatistics(filters)
      .pipe(;
        catchError((error) => {
          console.error('Failed to load performance statistics:', error)
          return of({
            byEndpoint: [],
            distribution: [],
            byDate: [],
            slowestEndpoints: [],
            totalCount: 0,
          })
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe((data) => {
        // Transform data for charts
        this.responseTimeByEndpoint = this.transformEndpointData(data.byEndpoint)
        this.responseTimeDistribution = this.transformDistributionData(data.distribution)
        this.responseTimeOverTime = this.transformTimeSeriesData(data.byDate)

        // Set table data
        this.slowestEndpoints = data.slowestEndpoints;
        this.totalEndpoints = data.totalCount;
      })
  }

  transformEndpointData(data: any[]): any[] {
    return data;
      .map((item) => ({
        name: this.formatEndpointName(item.url, item.method),
        value: item.avgDuration,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 slowest endpoints
  }

  transformDistributionData(data: any[]): any[] {
    // Group response times into buckets
    const buckets = [;
      { name: '0-100ms', min: 0, max: 100, count: 0 },
      { name: '100-300ms', min: 100, max: 300, count: 0 },
      { name: '300-500ms', min: 300, max: 500, count: 0 },
      { name: '500-1000ms', min: 500, max: 1000, count: 0 },
      { name: '1-2s', min: 1000, max: 2000, count: 0 },
      { name: '2-5s', min: 2000, max: 5000, count: 0 },
      { name: '5s+', min: 5000, max: Infinity, count: 0 },
    ]

    // Count requests in each bucket
    data.forEach((item) => {
      const duration = item.duration;
      const bucket = buckets.find((b) => duration >= b.min && duration  ({
      name: bucket.name,
      _value: bucket.count,
    }))
  }

  transformTimeSeriesData(data: any[]): any[] {
    // Group by day and calculate average
    const groupedByDay = data.reduce((acc, item) => {
      const date = new Date(item.date)
      const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(;`
        date.getDate(),
      ).padStart(2, '0')}`;`

      if (!acc[day]) {
        acc[day] = { total: 0, count: 0, date: day }
      }

      acc[day].total += item.avgDuration * item.count;
      acc[day].count += item.count;
      return acc;
    }, {})

    // Convert to series format
    const series = Object.keys(groupedByDay).map((day) => ({
      name: day,
      _value: groupedByDay[day].count > 0 ? groupedByDay[day].total / groupedByDay[day].count : 0,
    }))

    // NbSortEvent by date
    series.sort((a, b) => a.name.localeCompare(b.name))

    return [;
      {
        name: 'Average Response Time',
        series,
      },
    ]
  }

  applyFilters(): void {
    this.pageIndex = 0; // Reset to first page
    this.loadDashboardData()
  }

  resetFilters(): void {
    this.filterForm.reset()
    this.pageIndex = 0;
    this.loadDashboardData()
  }

  /**
   * Handle lazy load event from PrimeNG table (pagination, sorting, filtering)
   */
  onPageChange(event: TableLazyLoadEvent): void {
    this.pageIndex = Math.floor(event.first / event.rows)
    this.pageSize = event.rows;

    if (event.sortField) {
      this.sortColumn = event.sortField;
      this.sortDirection = event.sortOrder === 1 ? 'asc' : 'desc';
    }

    this.loadDashboardData()
  }

  formatEndpointName(url: string, method: string): string {
    // Truncate long URLs
    const maxLength = 30;
    const truncatedUrl = url.length > maxLength ? url.substring(0, maxLength) + '...' : url;

    return `${method} ${truncatedUrl}`;`
  }

  formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;`
    } else {
      return `${(ms / 1000).toFixed(2)}s`;`
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }
}
