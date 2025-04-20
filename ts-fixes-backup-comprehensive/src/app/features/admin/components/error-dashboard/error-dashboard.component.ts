// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (error-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TelemetryService } from '../../../../core/services/telemetry.service';
import { TelemetrySocketService } from '../../../../core/services/telemetry-socket.service';
import { ErrorCategory } from '../../../../core/interceptors/http-error.interceptor';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

@Component({
  selector: 'app-error-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
    ReactiveFormsModule,
    NgxChartsModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Error Monitoring Dashboard</h1>

      <div class="dashboard-header">
        <div class="filter-section">
          <form [formGroup]="filterForm" class="filter-form">
            <mat-form-field appearance="outline">
              <mat-label>Error Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="">All Categories</mat-option>
                <mat-option *ngFor="let category of errorCategories" [value]="category.value">
                  {{ category.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status Code</mat-label>
              <input matInput formControlName="statusCode" placeholder="e.g. 404, 500" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date Range</mat-label>
              <mat-date-range-input [rangePicker]="picker">
                <input matStartDate formControlName="startDate" placeholder="Start date" />
                <input matEndDate formControlName="endDate" placeholder="End date" />
              </mat-date-range-input>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-date-range-picker #picker></mat-date-range-picker>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="applyFilters()">
              Apply Filters
            </button>

            <button mat-button (click)="resetFilters()">Reset</button>
          </form>
        </div>

        <div class="realtime-toggle">
          <mat-slide-toggle
            [checked]="realtimeEnabled"
            (change)="toggleRealtime($event.checked)"
            color="primary"
            matTooltip="Enable real-time updates"
          >
            Real-time Updates
          </mat-slide-toggle>

          <div class="connection-status" *ngIf="realtimeEnabled">
            <div class="status-indicator" [ngClass]="{ connected: isConnected }"></div>
            <span>{{ isConnected ? 'Connected' : 'Connecting...' }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Errors by Category</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container" *ngIf="!isLoading; else loadingTemplate">
              <ngx-charts-pie-chart
                [results]="errorsByCategory"
                [gradient]="true"
                [legend]="true"
                [labels]="true"
                [doughnut]="true"
              >
              </ngx-charts-pie-chart>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Errors by Status Code</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container" *ngIf="!isLoading; else loadingTemplate">
              <ngx-charts-bar-vertical
                [results]="errorsByStatusCode"
                [gradient]="true"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                xAxisLabel="Status Code"
                yAxisLabel="Count"
              >
              </ngx-charts-bar-vertical>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Errors Over Time</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chart-container" *ngIf="!isLoading; else loadingTemplate">
              <ngx-charts-line-chart
                [results]="errorsOverTime"
                [gradient]="true"
                [xAxis]="true"
                [yAxis]="true"
                [showXAxisLabel]="true"
                [showYAxisLabel]="true"
                xAxisLabel="Date"
                yAxisLabel="Count"
              >
              </ngx-charts-line-chart>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="error-list-card">
        <mat-card-header>
          <mat-card-title>Recent Errors</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container" *ngIf="!isLoading; else loadingTemplate">
            <table mat-table [dataSource]="recentErrors" matSort (matSortChange)="sortData($event)">
              <!-- Timestamp Column -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Timestamp</th>
                <td mat-cell *matCellDef="let error">{{ error.timestamp | date: 'medium' }}</td>
              </ng-container>

              <!-- Error Code Column -->
              <ng-container matColumnDef="errorCode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Error Code</th>
                <td mat-cell *matCellDef="let error">{{ error.errorCode }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let error">{{ error.statusCode }}</td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                <td mat-cell *matCellDef="let error">
                  <mat-chip [ngClass]="'category-' + error.category">
                    {{ getCategoryLabel(error.category) }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- URL Column -->
              <ng-container matColumnDef="url">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>URL</th>
                <td mat-cell *matCellDef="let error" class="url-cell">{{ error.url }}</td>
              </ng-container>

              <!-- Message Column -->
              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef>Message</th>
                <td mat-cell *matCellDef="let error">{{ error.userMessage }}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let error">
                  <button mat-icon-button (click)="viewErrorDetails(error)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            <mat-paginator
              [length]="totalErrors"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="onPageChange($event)"
            >
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading data...</p>
      </div>
    </ng-template>

    <ng-template #errorDetailsTemplate>
      <div class="error-details-dialog">
        <h2>Error Details</h2>
        <div class="error-details-content">
          <div class="error-header">
            <div class="error-title">
              <h3>{{ selectedError?.errorCode }}</h3>
              <mat-chip [ngClass]="'category-' + selectedError?.category">
                {{ getCategoryLabel(selectedError?.category) }}
              </mat-chip>
            </div>
            <div class="error-meta">
              <p><strong>Status:</strong> {{ selectedError?.statusCode }}</p>
              <p><strong>Timestamp:</strong> {{ selectedError?.timestamp | date: 'medium' }}</p>
            </div>
          </div>

          <div class="error-messages">
            <p><strong>User Message:</strong> {{ selectedError?.userMessage }}</p>
            <p><strong>Technical Message:</strong> {{ selectedError?.technicalMessage }}</p>
          </div>

          <div class="error-request">
            <h4>Request Details</h4>
            <p><strong>URL:</strong> {{ selectedError?.url }}</p>
            <p><strong>Method:</strong> {{ selectedError?.method }}</p>
            <div *ngIf="selectedError?.context?.requestDetails">
              <h5>Headers</h5>
              <pre>{{ selectedError?.context?.requestDetails?.headers | json }}</pre>

              <h5>Body</h5>
              <pre>{{ selectedError?.context?.requestDetails?.body | json }}</pre>
            </div>
          </div>

          <div class="error-response" *ngIf="selectedError?.response">
            <h4>Response</h4>
            <pre>{{ selectedError?.response | json }}</pre>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
      }

      .filter-section {
        flex: 1;
      }

      .filter-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
      }

      .realtime-toggle {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        margin-left: 20px;
      }

      .connection-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
      }

      .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #f44336;
        transition: background-color 0.3s ease;
      }

      .status-indicator.connected {
        background-color: #4caf50;
      }

      .dashboard-content {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }

      .chart-card {
        height: 400px;
      }

      .chart-container {
        height: 320px;
      }

      .error-list-card {
        margin-bottom: 20px;
      }

      .table-container {
        overflow-x: auto;
      }

      table {
        width: 100%;
      }

      .url-cell {
        max-width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 320px;
      }

      .category-network {
        background-color: #ff9800;
      }

      .category-authentication {
        background-color: #f44336;
      }

      .category-authorization {
        background-color: #e91e63;
      }

      .category-validation {
        background-color: #9c27b0;
      }

      .category-server {
        background-color: #673ab7;
      }

      .category-client {
        background-color: #3f51b5;
      }

      .category-timeout {
        background-color: #2196f3;
      }

      .category-rate_limit {
        background-color: #03a9f4;
      }

      .category-not_found {
        background-color: #00bcd4;
      }

      .category-conflict {
        background-color: #009688;
      }

      .category-unknown {
        background-color: #607d8b;
      }

      .error-details-dialog {
        padding: 20px;
      }

      .error-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .error-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .error-messages,
      .error-request,
      .error-response {
        margin-bottom: 20px;
      }

      pre {
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        overflow: auto;
        max-height: 200px;
      }
    `,
  ],
})
export class ErrorDashboardComponent implements OnInit, OnDestroy {
  // Error categories for dropdown
  errorCategories = [
    { value: ErrorCategory.NETWORK, label: 'Network' },
    { value: ErrorCategory.AUTHENTICATION, label: 'Authentication' },
    { value: ErrorCategory.AUTHORIZATION, label: 'Authorization' },
    { value: ErrorCategory.VALIDATION, label: 'Validation' },
    { value: ErrorCategory.SERVER, label: 'Server' },
    { value: ErrorCategory.CLIENT, label: 'Client' },
    { value: ErrorCategory.TIMEOUT, label: 'Timeout' },
    { value: ErrorCategory.RATE_LIMIT, label: 'Rate Limit' },
    { value: ErrorCategory.NOT_FOUND, label: 'Not Found' },
    { value: ErrorCategory.CONFLICT, label: 'Conflict' },
    { value: ErrorCategory.UNKNOWN, label: 'Unknown' },
  ];

  // Chart data
  errorsByCategory: any[] = [];
  errorsByStatusCode: any[] = [];
  errorsOverTime: any[] = [];

  // Table data
  recentErrors: any[] = [];
  displayedColumns: string[] = [
    'timestamp',
    'errorCode',
    'status',
    'category',
    'url',
    'message',
    'actions',
  ];

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalErrors = 0;

  // Filtering
  filterForm: FormGroup;

  // State
  isLoading = false;
  selectedError: any = null;

  // Real-time updates
  realtimeEnabled = false;
  isConnected = false;
  private destroy$ = new Subject<void>();

  constructor(
    private telemetryService: TelemetryService,
    private telemetrySocketService: TelemetrySocketService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      statusCode: [''],
      startDate: [null],
      endDate: [null],
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();

    // Subscribe to connection status changes
    this.telemetrySocketService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isConnected = status;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Disconnect from WebSocket if connected
    if (this.realtimeEnabled) {
      this.telemetrySocketService.disconnect();
    }
  }

  /**
   * Toggle real-time updates
   * @param enabled Whether real-time updates should be enabled
   */
  toggleRealtime(enabled: boolean): void {
    this.realtimeEnabled = enabled;

    if (enabled) {
      // Connect to WebSocket and subscribe to error updates
      this.telemetrySocketService.connect();

      // Subscribe to error statistics updates
      this.telemetrySocketService.errorStatisticsUpdate$
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          // Update charts with new data
          this.errorsByCategory = this.transformCategoryData(data.byCategory);
          this.errorsByStatusCode = this.transformStatusCodeData(data.byStatusCode);
          this.errorsOverTime = this.transformTimeSeriesData(data.byDate);

          // Update total count if available
          if (data.totalCount !== undefined) {
            this.totalErrors = data.totalCount;
          }
        });

      // Subscribe to individual error updates
      this.telemetrySocketService.errorTelemetry$
        .pipe(takeUntil(this.destroy$))
        .subscribe(error => {
          // Add new error to the top of the list
          this.recentErrors = [error, ...this.recentErrors.slice(0, this.pageSize - 1)];

          // Increment total count
          this.totalErrors++;
        });

      // Subscribe to the errors channel
      this.telemetrySocketService.subscribe('errors');
    } else {
      // Disconnect from WebSocket
      this.telemetrySocketService.disconnect();

      // Reload data from REST API
      this.loadDashboardData();
    }
  }

  /**
   * Load dashboard data from the REST API
   */
  loadDashboardData(): void {
    this.isLoading = true;

    // Get filter values
    const filters = {
      category: this.filterForm.get('category')?.value,
      statusCode: this.filterForm.get('statusCode')?.value,
      startDate: this.filterForm.get('startDate')?.value
        ? this.formatDate(this.filterForm.get('startDate')?.value)
        : undefined,
      endDate: this.filterForm.get('endDate')?.value
        ? this.formatDate(this.filterForm.get('endDate')?.value)
        : undefined,
      page: this.pageIndex,
      pageSize: this.pageSize,
    };

    // Load error statistics
    this.telemetryService
      .getErrorStatistics(filters)
      .pipe(
        catchError(error => {
          console.error('Failed to load error statistics:', error);
          return of({
            byCategory: [],
            byStatusCode: [],
            byDate: [],
            recentErrors: [],
            totalCount: 0,
          });
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(data => {
        // Transform data for charts
        this.errorsByCategory = this.transformCategoryData(data.byCategory);
        this.errorsByStatusCode = this.transformStatusCodeData(data.byStatusCode);
        this.errorsOverTime = this.transformTimeSeriesData(data.byDate);

        // Set table data
        this.recentErrors = data.recentErrors;
        this.totalErrors = data.totalCount;
      });
  }

  transformCategoryData(data: any[]): any[] {
    return data.map(item => ({
      name: this.getCategoryLabel(item.category),
      value: item.count,
    }));
  }

  transformStatusCodeData(data: any[]): any[] {
    return data.map(item => ({
      name: item.statusCode.toString(),
      value: item.count,
    }));
  }

  transformTimeSeriesData(data: any[]): any[] {
    // Group by day and create time series
    const groupedByDay = data.reduce((acc, item) => {
      const date = new Date(item.date);
      const day = date.toISOString().split('T')[0];

      if (!acc[day]) {
        acc[day] = 0;
      }

      acc[day] += item.count;
      return acc;
    }, {});

    // Convert to series format
    const series = Object.keys(groupedByDay).map(day => ({
      name: day,
      value: groupedByDay[day],
    }));

    // Sort by date
    series.sort((a, b) => a.name.localeCompare(b.name));

    return [
      {
        name: 'Errors',
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

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadDashboardData();
  }

  sortData(sort: Sort): void {
    // Implement sorting logic
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.loadDashboardData();
  }

  viewErrorDetails(error: any): void {
    this.selectedError = error;
    // In a real implementation, you might open a dialog or navigate to a details page
    console.log('Error details:', error);
  }

  getCategoryLabel(categoryValue: string): string {
    const category = this.errorCategories.find(c => c.value === categoryValue);
    return category ? category.label : 'Unknown';
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
