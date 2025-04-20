// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (performance-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
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
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Performance Monitoring Dashboard</h1>

      <mat-card class="filter-card">
        <mat-card-header>
          <mat-card-title>Filters</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="filter-form">
            <mat-form-field appearance="outline">
              <mat-label>URL Contains</mat-label>
              <input matInput formControlName="url" placeholder="e.g., /api/users" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>HTTP Method</mat-label>
              <mat-select formControlName="method">
                <mat-option value="">All Methods</mat-option>
                <mat-option value="GET">GET</mat-option>
                <mat-option value="POST">POST</mat-option>
                <mat-option value="PUT">PUT</mat-option>
                <mat-option value="DELETE">DELETE</mat-option>
                <mat-option value="PATCH">PATCH</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Min Duration (ms)</mat-label>
              <input
                matInput
                type="number"
                formControlName="minDuration"
                placeholder="e.g., 1000"
              />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>From Date</mat-label>
              <input matInput [matDatepicker]="fromPicker" formControlName="fromDate" />
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>To Date</mat-label>
              <input matInput [matDatepicker]="toPicker" formControlName="toDate" />
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>

            <div class="filter-actions">
              <button mat-raised-button color="primary" (click)="applyFilters()">
                <mat-icon>filter_list</mat-icon> Apply Filters
              </button>
              <button mat-button (click)="resetFilters()"><mat-icon>clear</mat-icon> Reset</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <div class="dashboard-content">
        <div class="performance-stats">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ (performanceStats$ | async)?.totalRequests || 0 }}</div>
              <div class="stat-label">Total Requests</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">
                {{ (performanceStats$ | async)?.avgDuration | number: '1.0-0' || 0 }} ms
              </div>
              <div class="stat-label">Average Duration</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">
                {{ (performanceStats$ | async)?.p95Duration | number: '1.0-0' || 0 }} ms
              </div>
              <div class="stat-label">95th Percentile</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">
                {{ (performanceStats$ | async)?.maxDuration | number: '1.0-0' || 0 }} ms
              </div>
              <div class="stat-label">Max Duration</div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="endpoints-list-card">
          <mat-card-header>
            <mat-card-title>Endpoint Performance</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="loading-container" *ngIf="loading">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <table
              mat-table
              [dataSource]="performanceData"
              matSort
              (matSortChange)="sortData($event)"
              class="performance-table"
              *ngIf="!loading"
            >
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Timestamp</th>
                <td mat-cell *matCellDef="let item">{{ item.timestamp | date: 'medium' }}</td>
              </ng-container>

              <ng-container matColumnDef="method">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Method</th>
                <td mat-cell *matCellDef="let item">{{ item.method }}</td>
              </ng-container>

              <ng-container matColumnDef="url">
                <th mat-header-cell *matHeaderCellDef>URL</th>
                <td mat-cell *matCellDef="let item">{{ item.url }}</td>
              </ng-container>

              <ng-container matColumnDef="duration">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Duration (ms)</th>
                <td mat-cell *matCellDef="let item" [ngClass]="getDurationClass(item.duration)">
                  {{ item.duration | number: '1.0-0' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="ttfb">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>TTFB (ms)</th>
                <td mat-cell *matCellDef="let item">{{ item.ttfb | number: '1.0-0' || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="responseSize">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Response Size</th>
                <td mat-cell *matCellDef="let item">{{ formatBytes(item.responseSize) }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" (click)="viewPerformanceDetails(item)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            <div class="no-data-message" *ngIf="!loading && performanceData.length === 0">
              No performance data found matching the current filters.
            </div>

            <mat-paginator
              [length]="totalItems"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="pageChanged($event)"
              *ngIf="!loading && performanceData.length > 0"
            >
            </mat-paginator>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
      }

      h1 {
        margin-bottom: 20px;
        color: #333;
      }

      .filter-card {
        margin-bottom: 20px;
      }

      .filter-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
      }

      .filter-form mat-form-field {
        flex: 1 1 200px;
      }

      .filter-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }

      .dashboard-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .performance-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 20px;
      }

      .stat-card {
        flex: 1 1 200px;
        text-align: center;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: #3f51b5;
      }

      .stat-label {
        font-size: 1rem;
        color: #666;
      }

      .endpoints-list-card {
        width: 100%;
      }

      .performance-table {
        width: 100%;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 20px;
      }

      .no-data-message {
        text-align: center;
        padding: 20px;
        color: #666;
      }

      .duration-normal {
        color: #4caf50;
      }

      .duration-warning {
        color: #ff9800;
      }

      .duration-critical {
        color: #f44336;
        font-weight: bold;
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
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      url: [''],
      method: [''],
      minDuration: [''],
      fromDate: [null],
      toDate: [null],
    });

    // Initialize performance statistics
    this.performanceStats$ = this.getPerformanceStatistics();
  }

  ngOnInit(): void {
    this.loadPerformanceData();
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
        catchError(error => {
          console.error('Error loading performance data:', error);
          this.loading = false;
          return of({ data: [], total: 0 });
        })
      )
      .subscribe(data => {
        this.performanceData = data.data || [];
        this.totalItems = data.total || 0;
        this.loading = false;
      });
  }

  /**
   * Get performance statistics for the dashboard
   */
  getPerformanceStatistics(): Observable<any> {
    return this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      switchMap(() => {
        const filters = this.getFilters();
        return this.telemetryService
          .getPerformanceStatistics({
            ...filters,
            stats: true,
          })
          .pipe(
            map(
              data =>
                data.statistics || {
                  totalRequests: 0,
                  avgDuration: 0,
                  p95Duration: 0,
                  maxDuration: 0,
                }
            ),
            catchError(() =>
              of({
                totalRequests: 0,
                avgDuration: 0,
                p95Duration: 0,
                maxDuration: 0,
              })
            )
          );
      })
    );
  }

  /**
   * Handle page change event
   */
  pageChanged(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPerformanceData();
  }

  /**
   * Handle sort change event
   */
  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction || 'asc';
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
      minDuration: '',
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
    const filters: any = {};
    const formValues = this.filterForm.value;

    if (formValues.url) {
      filters.url = formValues.url;
    }

    if (formValues.method) {
      filters.method = formValues.method;
    }

    if (formValues.minDuration) {
      filters.minDuration = formValues.minDuration;
    }

    if (formValues.fromDate) {
      filters.fromDate = formValues.fromDate.toISOString();
    }

    if (formValues.toDate) {
      filters.toDate = formValues.toDate.toISOString();
    }

    return filters;
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
    if (duration < 500) {
      return 'duration-normal';
    } else if (duration < 1000) {
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
