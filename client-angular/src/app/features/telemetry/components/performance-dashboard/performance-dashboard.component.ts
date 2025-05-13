// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (performance-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit , Input} from '@angular/core';
import {
  NbPaginatorModule,
  NbSortModule,
  NbSortEvent,
} from '../../../../shared/components/custom-nebular-components';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import {
  NbCardModule,
  NbTableModule,
  NbFormFieldModule,
  NbInputModule,
  NbSelectModule,
  NbDatepickerModule,
  NbButtonModule,
  NbIconModule,
  NbSpinnerModule,
, NbSortEvent} from '@nebular/theme';
import {
  TelemetryService,
  PerformanceTelemetry,
} from '../../../../core/services/telemetry.service';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';

/**
 * Performance Dashboard Component
 *
 * Displays a dashboard for analyzing and monitoring application performance.
 * Features include:
 * - Filtering by URL, method, duration, date range
 * - Sorting by various columns
 * - Pagination for large datasets
 * - Performance metrics visualization
 */
@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NbCardModule,
    NbTableModule,
    NbFormFieldModule,
    NbInputModule,
    NbSelectModule,
    NbDatepickerModule,
    NbButtonModule,
    NbIconModule,
    NbSpinnerModule,
    ReactiveFormsModule,
    NbPaginatorModule,
    NbSortModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Performance Monitoring Dashboard</h1>

      <nb-card class="filter-card">
        <nb-card-header>
          <h5>Filters</h5>
        </nb-card-header>
        <nb-card-body>
          <form [formGroup]="filterForm" class="filter-form">
            <nb-form-field>
              <label>URL Contains</label>
              <input nbInput formControlName="url" placeholder="e.g., /api/users" />
            </nb-form-field>

            <nb-form-field>
              <label>HTTP Method</label>
              <nb-select formControlName="method" placeholder="Select method">
                <nb-option value="">All Methods</nb-option>
                <nb-option value="GET">GET</nb-option>
                <nb-option value="POST">POST</nb-option>
                <nb-option value="PUT">PUT</nb-option>
                <nb-option value="DELETE">DELETE</nb-option>
                <nb-option value="PATCH">PATCH</nb-option>
              </nb-select>
            </nb-form-field>

            <nb-form-field>
              <label>Min Duration (ms)</label>
              <input nbInput type="number" formControlName="minDuration" placeholder="e.g., 1000" />
            </nb-form-field>

            <nb-form-field>
              <label>From Date</label>
              <input nbInput [nbDatepicker]="fromPicker" formControlName="fromDate" />
              <nb-datepicker #fromPicker></nb-datepicker>
            </nb-form-field>

            <nb-form-field>
              <label>To Date</label>
              <input nbInput [nbDatepicker]="toPicker" formControlName="toDate" />
              <nb-datepicker #toPicker></nb-datepicker>
            </nb-form-field>

            <div class="filter-actions">
              <button nbButton status="primary" (click)="applyFilters()">
                <nb-icon icon="filter"></nb-icon> Apply Filters
              </button>
              <button nbButton status="basic" (click)="resetFilters()">
                <nb-icon icon="close"></nb-icon> Reset
              </button>
            </div>
          </form>
        </nb-card-body>
      </nb-card>

      <div class="dashboard-content">
        <div class="performance-stats">
          <nb-card class="stat-card">
            <nb-card-body>
              <div class="stat-value">{{ (performanceStats$ | async)?.totalRequests || 0 }}</div>
              <div class="stat-label">Total Requests</div>
            </nb-card-body>
          </nb-card>

          <nb-card class="stat-card">
            <nb-card-body>
              <div class="stat-value">
                {{ ((performanceStats$ | async)?.avgDuration | number: '1.0-0') || '0' }} ms
              </div>
              <div class="stat-label">Average Duration</div>
            </nb-card-body>
          </nb-card>

          <nb-card class="stat-card">
            <nb-card-body>
              <div class="stat-value">
                {{ ((performanceStats$ | async)?.p95Duration | number: '1.0-0') || '0' }} ms
              </div>
              <div class="stat-label">95th Percentile</div>
            </nb-card-body>
          </nb-card>

          <nb-card class="stat-card">
            <nb-card-body>
              <div class="stat-value">
                {{ ((performanceStats$ | async)?.maxDuration | number: '1.0-0') || '0' }} ms
              </div>
              <div class="stat-label">Max Duration</div>
            </nb-card-body>
          </nb-card>
        </div>

        <nb-card class="endpoints-list-card">
          <nb-card-header>
            <h5>Endpoint Performance</h5>
          </nb-card-header>
          <nb-card-body>
            <div class="loading-container" *ngIf="loading">
              <nb-spinner></nb-spinner>
            </div>

            <table
              nbTable
              [nbSort]="true"
              (nbSortChange)="sortData($event)"
              [nbSortActive]="sortField"
              [nbSortDirection]="sortDirection"
              *ngIf="!loading"
            >
              <thead>
                <tr>
                  <th nbSortHeader="timestamp">Timestamp</th>
                  <th nbSortHeader="method">Method</th>
                  <th>URL</th>
                  <th nbSortHeader="duration">Duration (ms)</th>
                  <th nbSortHeader="ttfb">TTFB (ms)</th>
                  <th nbSortHeader="responseSize">Response Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of performanceData">
                  <td>{{ item.timestamp | date: 'medium' }}</td>
                  <td>{{ item.method }}</td>
                  <td>{{ item.url }}</td>
                  <td [ngClass]="getDurationClass(item.duration)">
                    {{ item.duration | number: '1.0-0' }}
                  </td>
                  <td>{{ item.ttfb | number: '1.0-0' }}</td>
                  <td>{{ formatBytes(item.responseSize) }}</td>
                  <td>
                    <button nbButton ghost (click)="viewPerformanceDetails(item)">
                      <nb-icon icon="eye-outline"></nb-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <nb-paginator
              [total]="totalItems"
              [pageSize]="pageSize"
              [page]="pageIndex + 1"
              (pageChange)="pageChanged($event)"
            ></nb-paginator>
          </nb-card-body>
        </nb-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 1rem;
      }

      .filter-card {
        margin-bottom: 1.5rem;
      }

      .filter-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .stat-card {
        text-align: center;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 600;
        color: var(--text-primary-color);
      }

      .stat-label {
        color: var(--text-hint-color);
        margin-top: 0.5rem;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }

      .duration-normal {
        color: var(--color-success-600);
      }

      .duration-warning {
        color: var(--color-warning-600);
      }

      .duration-critical {
        color: var(--color-danger-600);
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
    `,
  ],
})
export class PerformanceDashboardComponent implements OnInit {
  // Performance data
  performanceData: PerformanceTelemetry[] = [];
  totalItems = 0;
  loading = true;

  // Pagination
  pageIndex = 0;
  pageSize = 10;

  // Sorting
  sortField = 'timestamp';
  sortDirection = 'desc';

  // Table columns
  displayedColumns = ['timestamp', 'method', 'url', 'duration', 'ttfb', 'responseSize', 'actions'];

  // Filter form
  filterForm: FormGroup;

  // Performance statistics
  performanceStats$: Observable<any>;

  constructor(
    private telemetryService: TelemetryService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      url: [''],
      method: [''],
      minDuration: [null],
      fromDate: [null],
      toDate: [null],
    });
  }

  ngOnInit(): void {
    this.loadPerformanceData();
    this.performanceStats$ = this.getPerformanceStatistics();
  }

  /**
   * Load performance data with current pagination, sorting, and filtering
   */
  loadPerformanceData(): void {
    this.loading = true;
    const filters = this.getFilters();

    this.telemetryService
      .getPerformanceStatistics({
        ...filters,
        page: this.pageIndex,
        limit: this.pageSize,
        sort: this.sortField,
        order: this.sortDirection,
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading performance data:', error);
          return of({ data: [], total: 0 });
        }),
      )
      .subscribe((response) => {
        this.performanceData = response.data;
        this.totalItems = response.total;
        this.loading = false;
      });
  }

  /**
   * Get performance statistics for the dashboard
   */
  getPerformanceStatistics(): Observable<any> {
    return this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      switchMap((filters) =>
        this.telemetryService
          .getPerformanceStatistics({
            ...this.getFilters(),
            stats: true,
          })
          .pipe(
            map(
              (data) =>
                data.statistics || {
                  totalRequests: 0,
                  avgDuration: 0,
                  p95Duration: 0,
                  maxDuration: 0,
                },
            ),
            catchError((error) => {
              console.error('Error loading performance stats:', error);
              return of({
                totalRequests: 0,
                avgDuration: 0,
                p95Duration: 0,
                maxDuration: 0,
              });
            }),
          ),
      ),
    );
  }

  /**
   * Handle page change event
   */
  pageChanged(page: number): void {
    this.pageIndex = page - 1;
    this.loadPerformanceData();
  }

  /**
   * Handle sort change event
   */
  sortData(sort: NbSortEvent): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction;
    this.loadPerformanceData();
  }

  /**
   * Apply filters from the form
   */
  applyFilters(): void {
    this.pageIndex = 0; // Reset to first page when filtering
    this.loadPerformanceData();
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      url: '',
      method: '',
      minDuration: null,
      fromDate: null,
      toDate: null,
    });
    this.pageIndex = 0;
    this.loadPerformanceData();
  }

  /**
   * Get current filters from the form
   */
  getFilters(): any {
    const filters = this.filterForm.value;
    const result: any = {};

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
      result.fromDate = filters.fromDate.toISOString();
    }

    if (filters.toDate) {
      result.toDate = filters.toDate.toISOString();
    }

    return result;
  }

  /**
   * Format bytes to human-readable format
   */
  formatBytes(bytes?: number): string {
    if (bytes === undefined || bytes === null) {
      return '-';
    }

    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
   * View detailed information for a performance record
   */
  viewPerformanceDetails(item: PerformanceTelemetry): void {
    // This would typically open a dialog with detailed performance information
    console.log('View performance details:', item);
    // Implementation for performance details dialog would go here
  }
}
