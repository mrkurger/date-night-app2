// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (telemetry-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormsModule } from '@angular/forms';
import { TelemetryService } from '../../core/services/telemetry.service';
import { Chart, registerables } from 'chart.js';
import {
  NbCardModule,
  NbTabsetModule,
  NbButtonModule,
  NbIconModule,
  NbSelectModule,
  NbInputModule,
  NbFormFieldModule,
  NbDatepickerModule,
  NbSpinnerModule,
  NbTableModule,
  NbListModule,
  NbTreeGridModule,
} from '@nebular/theme';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-telemetry-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NbCardModule,
    NbTabsetModule,
    NbButtonModule,
    NbIconModule,
    NbSelectModule,
    NbInputModule,
    NbFormFieldModule,
    NbDatepickerModule,
    NbSpinnerModule,
    NbTableModule,
    NbListModule,
    NbTreeGridModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Telemetry Dashboard</h1>

      <div class="filter-section">
        <form [formGroup]="filterForm" class="filter-form">
          <nb-form-field>
            <nb-select fullWidth formControlName="dateRange" placeholder="Date Range">
              <nb-option value="today">Today</nb-option>
              <nb-option value="yesterday">Yesterday</nb-option>
              <nb-option value="last7days">Last 7 Days</nb-option>
              <nb-option value="last30days">Last 30 Days</nb-option>
              <nb-option value="custom">Custom Range</nb-option>
            </nb-select>
          </nb-form-field>

          <ng-container *ngIf="filterForm.get('dateRange')?.value === 'custom'">
            <nb-form-field>
              <input
                nbInput
                fullWidth
                [nbDatepicker]="startPicker"
                formControlName="startDate"
                placeholder="Start Date"
              />
              <nb-datepicker #startPicker></nb-datepicker>
            </nb-form-field>

            <nb-form-field>
              <input
                nbInput
                fullWidth
                [nbDatepicker]="endPicker"
                formControlName="endDate"
                placeholder="End Date"
              />
              <nb-datepicker #endPicker></nb-datepicker>
            </nb-form-field>
          </ng-container>

          <button nbButton status="primary" (click)="applyFilters()">Apply Filters</button>
        </form>
      </div>

      <nb-tabset>
        <nb-tab tabTitle="Error Analysis">
          <div class="tab-content">
            <div class="loading-container" *ngIf="isLoadingErrors">
              <nb-spinner status="primary"></nb-spinner>
              <p>Loading error data...</p>
            </div>

            <div class="charts-container" *ngIf="!isLoadingErrors">
              <nb-card class="chart-card">
                <nb-card-header>
                  <h4>Errors by Type</h4>
                </nb-card-header>
                <nb-card-body>
                  <canvas #errorsByTypeChart></canvas>
                </nb-card-body>
              </nb-card>

              <nb-card class="chart-card">
                <nb-card-header>
                  <h4>Errors Over Time</h4>
                </nb-card-header>
                <nb-card-body>
                  <canvas #errorsOverTimeChart></canvas>
                </nb-card-body>
              </nb-card>
            </div>

            <nb-card class="table-card" *ngIf="!isLoadingErrors">
              <nb-card-header>
                <h4>Recent Errors</h4>
              </nb-card-header>
              <nb-card-body>
                <div class="table-container">
                  <table [nbTreeGrid]="errorDataSource">
                    <tr nbTreeGridHeaderRow *nbTreeGridHeaderRowDef="errorColumns"></tr>
                    <tr nbTreeGridRow *nbTreeGridRowDef="let row; columns: errorColumns"></tr>

                    <ng-container nbTreeGridColumn="timestamp">
                      <th nbTreeGridHeaderCell *nbTreeGridHeaderCellDef>Timestamp</th>
                      <td nbTreeGridCell *nbTreeGridCellDef="let error">
                        {{ error.data.timestamp | date: 'medium' }}
                      </td>
                    </ng-container>

                    <ng-container nbTreeGridColumn="errorCode">
                      <th nbTreeGridHeaderCell *nbTreeGridHeaderCellDef>Error Code</th>
                      <td nbTreeGridCell *nbTreeGridCellDef="let error">
                        {{ error.data.errorCode }}
                      </td>
                    </ng-container>

                    <ng-container nbTreeGridColumn="statusCode">
                      <th nbTreeGridHeaderCell *nbTreeGridHeaderCellDef>Status</th>
                      <td nbTreeGridCell *nbTreeGridCellDef="let error">
                        {{ error.data.statusCode }}
                      </td>
                    </ng-container>

                    <ng-container nbTreeGridColumn="url">
                      <th nbTreeGridHeaderCell *nbTreeGridHeaderCellDef>URL</th>
                      <td nbTreeGridCell *nbTreeGridCellDef="let error">
                        {{ error.data.url }}
                      </td>
                    </ng-container>

                    <ng-container nbTreeGridColumn="userMessage">
                      <th nbTreeGridHeaderCell *nbTreeGridHeaderCellDef>User Message</th>
                      <td nbTreeGridCell *nbTreeGridCellDef="let error">
                        {{ error.data.userMessage }}
                      </td>
                    </ng-container>

                    <ng-container nbTreeGridColumn="actions">
                      <th nbTreeGridHeaderCell *nbTreeGridHeaderCellDef></th>
                      <td nbTreeGridCell *nbTreeGridCellDef="let error">
                        <button nbButton ghost (click)="viewErrorDetails(error.data)">
                          <nb-icon icon="eye-outline"></nb-icon>
                        </button>
                      </td>
                    </ng-container>
                  </table>

                  <div class="pagination-container">
                    <nb-select [(ngModel)]="pageSize" (selectedChange)="onPageSizeChange($event)">
                      <nb-option [value]="10">10 per page</nb-option>
                      <nb-option [value]="25">25 per page</nb-option>
                      <nb-option [value]="50">50 per page</nb-option>
                    </nb-select>
                    <div class="pagination-controls">
                      <button
                        nbButton
                        ghost
                        [disabled]="currentPage === 1"
                        (click)="previousPage()"
                      >
                        <nb-icon icon="arrow-left"></nb-icon>
                      </button>
                      <span>Page {{ currentPage }} of {{ totalPages }}</span>
                      <button
                        nbButton
                        ghost
                        [disabled]="currentPage === totalPages"
                        (click)="nextPage()"
                      >
                        <nb-icon icon="arrow-right"></nb-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </nb-card-body>
            </nb-card>
          </div>
        </nb-tab>

        <nb-tab tabTitle="Performance Metrics">
          <div class="tab-content">
            <div class="loading-container" *ngIf="isLoadingPerformance">
              <nb-spinner status="primary"></nb-spinner>
              <p>Loading performance data...</p>
            </div>

            <div class="charts-container" *ngIf="!isLoadingPerformance">
              <nb-card class="chart-card">
                <nb-card-header>
                  <h4>Average Response Time by Endpoint</h4>
                </nb-card-header>
                <nb-card-body>
                  <canvas #responseTimeByEndpointChart></canvas>
                </nb-card-body>
              </nb-card>

              <nb-card class="chart-card">
                <nb-card-header>
                  <h4>Response Time Trends</h4>
                </nb-card-header>
                <nb-card-body>
                  <canvas #responseTimeTrendsChart></canvas>
                </nb-card-body>
              </nb-card>
            </div>
          </div>
        </nb-tab>
      </nb-tabset>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .dashboard-container {
        padding: 2rem;
      }

      h1 {
        margin-bottom: 2rem;
        color: var(--text-basic-color);
      }

      .filter-section {
        margin-bottom: 2rem;
      }

      .filter-form {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        flex-wrap: wrap;
      }

      nb-form-field {
        min-width: 200px;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        gap: 1rem;
      }

      .charts-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .chart-card {
        height: 100%;
      }

      .table-container {
        overflow-x: auto;
      }

      table {
        width: 100%;
      }

      .pagination-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding: 1rem 0;
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      nb-icon {
        color: var(--text-basic-color);
      }
    `,
  ],
})
export class TelemetryDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('errorsByTypeChart') errorsByTypeChartRef!: ElementRef;
  @ViewChild('errorsOverTimeChart') errorsOverTimeChartRef!: ElementRef;
  @ViewChild('responseTimeByEndpointChart') responseTimeByEndpointChartRef!: ElementRef;
  @ViewChild('responseTimeTrendsChart') responseTimeTrendsChartRef!: ElementRef;

  filterForm: FormGroup;
  isLoadingErrors = true;
  isLoadingPerformance = true;
  errorDataSource: any[] = [];
  performanceDataSource: any[] = [];
  errorColumns = ['timestamp', 'errorCode', 'statusCode', 'url', 'userMessage', 'actions'];
  performanceColumns = ['url', 'method', 'avgDuration', 'p95Duration', 'count'];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Charts
  errorsByTypeChart: Chart | null = null;
  errorsOverTimeChart: Chart | null = null;
  responseTimeByEndpointChart: Chart | null = null;
  responseTimeTrendsChart: Chart | null = null;

  constructor(
    private telemetryService: TelemetryService,
    private fb: FormBuilder,
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
    // Chart initialization will be handled by loadErrorData and loadPerformanceData
  }

  applyFilters(): void {
    this.loadErrorData();
    this.loadPerformanceData();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadErrorData();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadErrorData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadErrorData();
    }
  }

  loadErrorData(): void {
    this.isLoadingErrors = true;

    const filters = this.getFiltersFromForm();

    this.telemetryService.getErrorStatistics(filters).subscribe({
      next: (data) => {
        this.isLoadingErrors = false;

        // Process data for charts and tables
        this.errorDataSource = data.recentErrors || [];

        // Initialize charts
        this.initErrorCharts(data);
      },
      error: (err) => {
        console.error('Failed to load error data:', err);
        this.isLoadingErrors = false;
      },
    });
  }

  loadPerformanceData(): void {
    this.isLoadingPerformance = true;

    const filters = this.getFiltersFromForm();

    this.telemetryService.getPerformanceStatistics(filters).subscribe({
      next: (data) => {
        this.isLoadingPerformance = false;

        // Process data for charts and tables
        this.performanceDataSource = data.byEndpoint || [];

        // Initialize charts
        this.initPerformanceCharts(data);
      },
      error: (err) => {
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
        },
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
