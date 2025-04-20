// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (telemetry-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TelemetryService } from '../../core/services/telemetry.service';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Telemetry Dashboard</h1>

      <div class="filter-section">
        <form [formGroup]="filterForm" class="filter-form">
          <mat-form-field appearance="outline">
            <mat-label>Date Range</mat-label>
            <mat-select formControlName="dateRange">
              <mat-option value="today">Today</mat-option>
              <mat-option value="yesterday">Yesterday</mat-option>
              <mat-option value="last7days">Last 7 Days</mat-option>
              <mat-option value="last30days">Last 30 Days</mat-option>
              <mat-option value="custom">Custom Range</mat-option>
            </mat-select>
          </mat-form-field>

          <ng-container *ngIf="filterForm.get('dateRange')?.value === 'custom'">
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </ng-container>

          <button mat-raised-button color="primary" (click)="applyFilters()">Apply Filters</button>
        </form>
      </div>

      <mat-tabs>
        <mat-tab label="Error Analysis">
          <div class="tab-content">
            <div class="loading-container" *ngIf="isLoadingErrors">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading error data...</p>
            </div>

            <div class="charts-container" *ngIf="!isLoadingErrors">
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Errors by Type</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <canvas #errorsByTypeChart></canvas>
                </mat-card-content>
              </mat-card>

              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Errors Over Time</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <canvas #errorsOverTimeChart></canvas>
                </mat-card-content>
              </mat-card>
            </div>

            <mat-card class="table-card" *ngIf="!isLoadingErrors">
              <mat-card-header>
                <mat-card-title>Recent Errors</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="errorDataSource" matSort>
                    <ng-container matColumnDef="timestamp">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Timestamp</th>
                      <td mat-cell *matCellDef="let error">
                        {{ error.timestamp | date: 'medium' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="errorCode">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Error Code</th>
                      <td mat-cell *matCellDef="let error">{{ error.errorCode }}</td>
                    </ng-container>

                    <ng-container matColumnDef="statusCode">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                      <td mat-cell *matCellDef="let error">{{ error.statusCode }}</td>
                    </ng-container>

                    <ng-container matColumnDef="url">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>URL</th>
                      <td mat-cell *matCellDef="let error">{{ error.url }}</td>
                    </ng-container>

                    <ng-container matColumnDef="userMessage">
                      <th mat-header-cell *matHeaderCellDef>User Message</th>
                      <td mat-cell *matCellDef="let error">{{ error.userMessage }}</td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef></th>
                      <td mat-cell *matCellDef="let error">
                        <button mat-icon-button color="primary" (click)="viewErrorDetails(error)">
                          <mat-icon>visibility</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="errorColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: errorColumns"></tr>
                  </table>

                  <mat-paginator
                    [pageSizeOptions]="[10, 25, 50]"
                    showFirstLastButtons
                  ></mat-paginator>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Performance Metrics">
          <div class="tab-content">
            <div class="loading-container" *ngIf="isLoadingPerformance">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading performance data...</p>
            </div>

            <div class="charts-container" *ngIf="!isLoadingPerformance">
              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Average Response Time by Endpoint</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <canvas #responseTimeByEndpointChart></canvas>
                </mat-card-content>
              </mat-card>

              <mat-card class="chart-card">
                <mat-card-header>
                  <mat-card-title>Response Time Trends</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <canvas #responseTimeTrendsChart></canvas>
                </mat-card-content>
              </mat-card>
            </div>

            <mat-card class="table-card" *ngIf="!isLoadingPerformance">
              <mat-card-header>
                <mat-card-title>Endpoint Performance</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="performanceDataSource" matSort>
                    <ng-container matColumnDef="url">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Endpoint</th>
                      <td mat-cell *matCellDef="let perf">{{ perf.url }}</td>
                    </ng-container>

                    <ng-container matColumnDef="method">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Method</th>
                      <td mat-cell *matCellDef="let perf">{{ perf.method }}</td>
                    </ng-container>

                    <ng-container matColumnDef="avgDuration">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Avg. Duration (ms)</th>
                      <td mat-cell *matCellDef="let perf">
                        {{ perf.avgDuration | number: '1.0-0' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="p95Duration">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>P95 Duration (ms)</th>
                      <td mat-cell *matCellDef="let perf">
                        {{ perf.p95Duration | number: '1.0-0' }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="count">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Request Count</th>
                      <td mat-cell *matCellDef="let perf">{{ perf.count }}</td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="performanceColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: performanceColumns"></tr>
                  </table>

                  <mat-paginator
                    [pageSizeOptions]="[10, 25, 50]"
                    showFirstLastButtons
                  ></mat-paginator>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tabs>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
      }

      .filter-section {
        margin-bottom: 20px;
      }

      .filter-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
      }

      .tab-content {
        padding: 20px 0;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
      }

      .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }

      .chart-card {
        height: 350px;
      }

      .table-card {
        margin-bottom: 20px;
      }

      .table-container {
        overflow-x: auto;
      }

      table {
        width: 100%;
      }
    `,
  ],
})
export class TelemetryDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('errorsByTypeChart') errorsByTypeChartRef!: ElementRef;
  @ViewChild('errorsOverTimeChart') errorsOverTimeChartRef!: ElementRef;
  @ViewChild('responseTimeByEndpointChart') responseTimeByEndpointChartRef!: ElementRef;
  @ViewChild('responseTimeTrendsChart') responseTimeTrendsChartRef!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  filterForm: FormGroup;

  isLoadingErrors = true;
  isLoadingPerformance = true;

  errorDataSource: any[] = [];
  performanceDataSource: any[] = [];

  errorColumns = ['timestamp', 'errorCode', 'statusCode', 'url', 'userMessage', 'actions'];
  performanceColumns = ['url', 'method', 'avgDuration', 'p95Duration', 'count'];

  // Chart instances
  errorsByTypeChart: Chart | null = null;
  errorsOverTimeChart: Chart | null = null;
  responseTimeByEndpointChart: Chart | null = null;
  responseTimeTrendsChart: Chart | null = null;

  constructor(
    private telemetryService: TelemetryService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      dateRange: ['last7days'],
      startDate: [null],
      endDate: [null],
    });
  }

  ngOnInit(): void {
    this.loadErrorData();
    this.loadPerformanceData();
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after data is loaded
  }

  applyFilters(): void {
    this.loadErrorData();
    this.loadPerformanceData();
  }

  loadErrorData(): void {
    this.isLoadingErrors = true;

    const filters = this.getFiltersFromForm();

    this.telemetryService.getErrorStatistics(filters).subscribe({
      next: data => {
        this.isLoadingErrors = false;

        // Process data for charts and tables
        this.errorDataSource = data.recentErrors || [];

        // Initialize charts
        this.initErrorCharts(data);
      },
      error: err => {
        console.error('Failed to load error data:', err);
        this.isLoadingErrors = false;
      },
    });
  }

  loadPerformanceData(): void {
    this.isLoadingPerformance = true;

    const filters = this.getFiltersFromForm();

    this.telemetryService.getPerformanceStatistics(filters).subscribe({
      next: data => {
        this.isLoadingPerformance = false;

        // Process data for charts and tables
        this.performanceDataSource = data.byEndpoint || [];

        // Initialize charts
        this.initPerformanceCharts(data);
      },
      error: err => {
        console.error('Failed to load performance data:', err);
        this.isLoadingPerformance = false;
      },
    });
  }

  getFiltersFromForm(): any {
    const filters: any = {};
    const dateRange = this.filterForm.get('dateRange')?.value;

    if (dateRange === 'custom') {
      const startDate = this.filterForm.get('startDate')?.value;
      const endDate = this.filterForm.get('endDate')?.value;

      if (startDate) {
        filters.startDate = startDate.toISOString();
      }

      if (endDate) {
        filters.endDate = endDate.toISOString();
      }
    } else {
      filters.dateRange = dateRange;
    }

    return filters;
  }

  initErrorCharts(data: any): void {
    // Destroy existing charts
    if (this.errorsByTypeChart) {
      this.errorsByTypeChart.destroy();
    }

    if (this.errorsOverTimeChart) {
      this.errorsOverTimeChart.destroy();
    }

    // Errors by Type chart
    if (data.byErrorCode && this.errorsByTypeChartRef) {
      const labels = Object.keys(data.byErrorCode);
      const values = Object.values(data.byErrorCode) as number[];

      this.errorsByTypeChart = new Chart(this.errorsByTypeChartRef.nativeElement, {
        type: 'pie',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
                '#8AC249',
                '#EA5545',
                '#F46A9B',
                '#EF9B20',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'Errors by Type',
            },
          },
        },
      });
    }

    // Errors Over Time chart
    if (data.byTimeRange && this.errorsOverTimeChartRef) {
      const labels = data.byTimeRange.map((item: any) => item.date);
      const values = data.byTimeRange.map((item: any) => item.count);

      this.errorsOverTimeChart = new Chart(this.errorsOverTimeChartRef.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Error Count',
              data: values,
              borderColor: '#FF6384',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Errors Over Time',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Error Count',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
          },
        },
      });
    }
  }

  initPerformanceCharts(data: any): void {
    // Destroy existing charts
    if (this.responseTimeByEndpointChart) {
      this.responseTimeByEndpointChart.destroy();
    }

    if (this.responseTimeTrendsChart) {
      this.responseTimeTrendsChart.destroy();
    }

    // Response Time by Endpoint chart
    if (data.byEndpoint && this.responseTimeByEndpointChartRef) {
      const endpoints = data.byEndpoint.map((item: any) => item.url);
      const avgDurations = data.byEndpoint.map((item: any) => item.avgDuration);
      const p95Durations = data.byEndpoint.map((item: any) => item.p95Duration);

      this.responseTimeByEndpointChart = new Chart(
        this.responseTimeByEndpointChartRef.nativeElement,
        {
          type: 'bar',
          data: {
            labels: endpoints,
            datasets: [
              {
                label: 'Average Duration (ms)',
                data: avgDurations,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1,
              },
              {
                label: 'P95 Duration (ms)',
                data: p95Durations,
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Response Time by Endpoint',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Duration (ms)',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Endpoint',
                },
              },
            },
          },
        }
      );
    }

    // Response Time Trends chart
    if (data.byTimeRange && this.responseTimeTrendsChartRef) {
      const dates = data.byTimeRange.map((item: any) => item.date);
      const avgDurations = data.byTimeRange.map((item: any) => item.avgDuration);

      this.responseTimeTrendsChart = new Chart(this.responseTimeTrendsChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Average Response Time (ms)',
              data: avgDurations,
              borderColor: '#4BC0C0',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Response Time Trends',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Duration (ms)',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Date',
              },
            },
          },
        },
      });
    }
  }

  viewErrorDetails(error: unknown): void {
    // Open a dialog or navigate to a details page
    console.warn('Error details:', error);
    // Implement dialog or navigation logic
  }
}
