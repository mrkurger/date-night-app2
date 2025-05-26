// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (performance-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

import {
import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { AppSortEvent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.module';
import { AppSortComponent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { AppSortHeaderComponent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { NbDatepickerModule } from '@nebular/theme';
import { TableModule } from 'primeng/table';
  TelemetryService,
  PerformanceTelemetry,';
} from '../../../../core/services/telemetry.service';

// Custom pagination event interface
interface PaginationChangeEvent {
  page: number;
  pageSize: number;
}

/**
 * Performance Dashboard Component;
 *;
 * Displays a dashboard for analyzing and monitoring application performance.;
 * Features include:;
 * - Filtering by URL, method, duration, date range;
 * - Sorting by various columns;
 * - Pagination for large datasets;
 * - Performance metrics visualization;
 */
@Component({
  selector: 'app-performance-dashboard',
  imports: [;
    CommonModule,
    NebularModule,
    ReactiveFormsModule,
    AppSortComponent,
    AppSortHeaderComponent,
    NbDatepickerModule,,
    TableModule;
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `;`
    ;
      Performance Monitoring Dashboard;

      ;
        ;
          Filters;
        ;
        ;
          ;
            ;
              URL Contains;
              ;
            ;

            ;
              HTTP Method;
              ;
                All Methods;
                GET;
                POST;
                PUT;
                DELETE;
                PATCH;
              ;
            ;

            ;
              Min Duration (ms)
              ;
            ;

            ;
              From Date;
              ;
              ;
            ;

            ;
              To Date;
              ;
              ;
            ;

            ;
              ;
                 Apply Filters;
              ;
              ;
                 Reset;
              ;
            ;
          ;
        ;
      ;

      ;
        ;
          ;
            ;
              {{ (performanceStats$ | async)?.totalRequests || 0 }}
              Total Requests;
            ;
          ;

          ;
            ;
              ;
                {{ ((performanceStats$ | async)?.avgDuration | number: '1.0-0') || '0' }} ms;
              ;
              Average Duration;
            ;
          ;

          ;
            ;
              ;
                {{ ((performanceStats$ | async)?.p95Duration | number: '1.0-0') || '0' }} ms;
              ;
              95th Percentile;
            ;
          ;

          ;
            ;
              ;
                {{ ((performanceStats$ | async)?.maxDuration | number: '1.0-0') || '0' }} ms;
              ;
              Max Duration;
            ;
          ;
        ;

        ;
          ;
            Endpoint Performance;
          ;
          ;
            ;
              ;
            ;

            ;
              ;
                ;
                  ;
                    ;
                      ;
                        Timestamp;
                      ;
                    ;
                    ;
                      ;
                        Method;
                      ;
                    ;
                    ;
                      ;
                        URL;
                      ;
                    ;
                    ;
                      ;
                        Duration (ms)
                      ;
                    ;
                    ;
                      ;
                        TTFB (ms)
                      ;
                    ;
                    ;
                      ;
                        Response Size;
                      ;
                    ;
                    Actions;
                  ;
                ;
                ;
                  ;
                    {{ item.timestamp | date: 'medium' }}
                    {{ item.method }}
                    {{ item.url }}
                    ;
                      {{ item.duration | number: '1.0-0' }}
                    ;
                    {{ item.ttfb | number: '1.0-0' }}
                    {{ formatBytes(item.responseSize) }}
                    ;
                      ;
                        ;
                      ;
                    ;
                  ;
                ;
              ;
            ;

            ;
              ;
                Previous;
              ;
              Page {{ pageIndex + 1 }}
              = totalItems";
                (click)="onPageChange({ page: pageIndex + 2, pageSize: pageSize })";
              >;
                Next;
              ;
            ;
          ;
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      .dashboard-container {
        padding: 1rem;
      }

      .filter-card {
        margin-bottom: 1.5rem;
      }

      .filter-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
        gap: 1rem;
        padding: 1rem;
      }

      .filter-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }

      .performance-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .stat-card {
        text-align: center;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 600;
        color: var(--text-primary-color)
      }

      .stat-label {
        color: var(--text-hint-color)
        margin-top: 0.5rem;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }

      .duration-normal {
        color: var(--color-success-600)
      }

      .duration-warning {
        color: var(--color-warning-600)
      }

      .duration-critical {
        color: var(--color-danger-600)
      }

      table {
        width: 100%;
      }

      th {
        font-weight: 600;
      }

      td {
        padding: 0.75rem;
      }
    `,`
  ],
})
export class PerformanceDashboardComponen {t implements OnInit {
  // Performance data
  performanceData: PerformanceTelemetry[] = []
  totalItems = 0;
  loading = true;

  // Pagination
  pageIndex = 0;
  pageSize = 10;

  // Table columns
  displayedColumns = ['timestamp', 'method', 'url', 'duration', 'ttfb', 'responseSize', 'actions']

  // Filter form
  filterForm: FormGroup;

  // Performance statistics
  performanceStats$: Observable;

  // Sorting
  sortField = 'timestamp';
  sortDirection: 'asc' | 'desc' | '' = 'desc';

  constructor(;
    private telemetryService: TelemetryService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      url: [''],
      method: [''],
      minDuration: [''],
      fromDate: [null],
      toDate: [null],
    })

    this.performanceStats$ = this.getPerformanceStatistics()
  }

  ngOnInit(): void {
    this.loadDashboardData()
  }

  /**
   * Load performance data with current pagination, sorting, and filtering;
   */
  loadDashboardData(): void {
    this.loading = true;
    const filters = this.getFilters()

    this.telemetryService;
      .getPerformanceStatistics({
        ...filters,
        page: this.pageIndex,
        pageSize: this.pageSize,
        sortField: this.sortField,
        sortDirection: this.sortDirection,
      })
      .pipe(;
        catchError((error) => {
          console.error('Error loading performance data:', error)
          return of({ data: [], total: 0 })
        }),
      )
      .subscribe((response) => {
        this.performanceData = response.data;
        this.totalItems = response.total;
        this.loading = false;
      })
  }

  /**
   * Get performance statistics for the dashboard;
   */
  getPerformanceStatistics(): Observable {
    return this.filterForm.valueChanges.pipe(;
      startWith(this.filterForm.value),
      switchMap((filters) =>;
        this.telemetryService;
          .getPerformanceStatistics({
            ...this.getFilters(),
            stats: true,
          })
          .pipe(;
            map(;
              (data) =>;
                data.statistics || {
                  totalRequests: 0,
                  avgDuration: 0,
                  p95Duration: 0,
                  maxDuration: 0,
                },
            ),
            catchError((error) => {
              console.error('Error loading performance stats:', error)
              return of({
                totalRequests: 0,
                avgDuration: 0,
                p95Duration: 0,
                maxDuration: 0,
              })
            }),
          ),
      ),
    )
  }

  /**
   * Handle page change event from paginator;
   */
  onPageChange(event: PaginationChangeEvent): void {
    this.pageIndex = event.page - 1; // Convert 1-based to 0-based index
    this.pageSize = event.pageSize;
    this.loadDashboardData()
  }

  /**
   * Apply filters from the form;
   */
  applyFilters(): void {
    this.pageIndex = 0; // Reset to first page when filtering
    this.loadDashboardData()
  }

  /**
   * Reset all filters;
   */
  resetFilters(): void {
    this.filterForm.reset({
      url: '',
      method: '',
      minDuration: null,
      fromDate: null,
      toDate: null,
    })
    this.pageIndex = 0;
    this.loadDashboardData()
  }

  /**
   * Get current filters from the form;
   */
  getFilters(): any {
    const filters = this.filterForm.value;
    const result: any = {}

    if (filters.url) {
      result.url = filters.url;
    }

    if (filters.method) {
      result.method = filters.method;
    }

    if (filters.minDuration) {
      result.minDuration = filters.minDuration;
    }

    if (filters.fromDate) {
      result.fromDate = filters.fromDate.toISOString()
    }

    if (filters.toDate) {
      result.toDate = filters.toDate.toISOString()
    }

    return result;
  }

  /**
   * Format bytes to human-readable format;
   */
  formatBytes(bytes?: number): string {
    if (bytes === undefined || bytes === null) {
      return '-';
    }

    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get CSS class based on duration
   */
  getDurationClass(duration: number): string {
    if (duration < 1000) {
      return 'duration-normal';
    } else if (duration < 3000) {
      return 'duration-warning';
    } else {
      return 'duration-critical';
    }
  }

  /**
   * View detailed information for a performance record;
   */
  viewPerformanceDetails(item: PerformanceTelemetry): void {
    // This would typically open a dialog with detailed performance information
    // eslint-disable-next-line no-console
    console.log('View performance details:', item)
    // Implementation for performance details dialog would go here
  }

  onSortChange(event: AppSortEvent): void {
    this.sortField = event.active;
    this.sortDirection = event.direction;
    this.loadDashboardData()
  }
}
