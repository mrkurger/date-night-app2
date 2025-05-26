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
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormsModule } from '@angular/forms';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { NebularModule } from '../../../app/shared/nebular.module';
import { ErrorDetailsDialogComponent } from '../../shared/components/error-details-dialog/error-details-dialog.component';
  NbCardModule,;
  NbTabsetModule,;
  NbButtonModule,;
  NbIconModule,;
  NbSelectModule,;
  NbInputModule,;
  NbFormFieldModule,;
  NbDatepickerModule,;
  NbSpinnerModule,;
  NbTableModule,;
  NbListModule,;
  NbTreeGridModule,;
  NbDatepickerModule,';
} from '@nebular/theme';

import {
  TelemetryService,;
  ErrorTelemetry,;
  ErrorStatistics,;
  PerformanceStatistics,;
  TelemetryFilters,;
} from '../../core/services/telemetry.service';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Valid date range options for filtering telemetry data;
 */
type DateRangeType = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';

/**
 * Date range object used for filtering;
 */
interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Performance data column keys for the table;
 */
type PerformanceColumnKey = 'url' | 'method' | 'avgDuration' | 'p95Duration' | 'count';

/**
 * Error data column keys for the table;
 */
type ErrorColumnKey =;
  | 'timestamp';
  | 'type';
  | 'category';
  | 'statusCode';
  | 'url';
  | 'message';
  | 'actions';

/**
 * TelemetryDashboardComponent provides a comprehensive view of application telemetry data,;
 * including error tracking and performance metrics. It supports filtering by date range;
 * and displays data through interactive charts and tables.;
 */
@Component({
  selector: 'app-telemetry-dashboard',;
  imports: [;
    NebularModule,;
    CommonModule,;
    ReactiveFormsModule,;
    FormsModule,;
    NbCardModule,;
    NbTabsetModule,;
    NbButtonModule,;
    NbIconModule,;
    NbSelectModule,;
    NbInputModule,;
    NbFormFieldModule,;
    NbDatepickerModule,;
    NbSpinnerModule,;
    NbTableModule,;
    NbListModule,;
    NbTreeGridModule,;
    ErrorDetailsDialogComponent,;
  ],;
  template: `;`
    ;
      Telemetry Dashboard;

      ;
        ;
          ;
            ;
              Today;
              Yesterday;
              Last 7 Days;
              Last 30 Days;
              Custom Range;
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
          ;

          Apply Filters;
        ;
      ;

      ;
        ;
          ;
            ;
              ;
              Loading error data...;
            ;

            ;
              ;
                ;
                  Errors by Type;
                ;
                ;
                  ;
                ;
              ;

              ;
                ;
                  Errors Over Time;
                ;
                ;
                  ;
                ;
              ;
            ;

            ;
              ;
                Recent Errors;
              ;
              ;
                ;
                  ;
                    ;
                    ;

                    ;
                      Timestamp;
                      ;
                        {{ error.data.timestamp | date: 'medium' }}
                      ;
                    ;

                    ;
                      Type;
                      ;
                        {{ error.data.type }}
                      ;
                    ;

                    ;
                      Category;
                      ;
                        {{ error.data.category }}
                      ;
                    ;

                    ;
                      Status;
                      ;
                        {{ error.data.statusCode }}
                      ;
                    ;

                    ;
                      URL;
                      ;
                        {{ error.data.url }}
                      ;
                    ;

                    ;
                      Message;
                      ;
                        {{ error.data.message }}
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

                  ;
                    ;
                      ;
                        {{ size }} per page;
                      ;
                    ;
                    ;
                      ;
                        ;
                      ;
                      Page {{ currentPage }} of {{ totalPages }};
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
          ;
            ;
              ;
              Loading performance data...;
            ;

            ;
              ;
                ;
                  Average Response Time by Endpoint;
                ;
                ;
                  ;
                ;
              ;

              ;
                ;
                  Response Time Trends;
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
  `,;`
  styles: [;
    `;`
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
    `,;`
  ],;
});
export class TelemetryDashboardComponen {t implements OnInit, AfterViewInit {
  @ViewChild('errorsByTypeChart');
  private errorsByTypeChartRef!: ElementRef;

  @ViewChild('errorsOverTimeChart');
  private errorsOverTimeChartRef!: ElementRef;

  @ViewChild('responseTimeByEndpointChart');
  private responseTimeByEndpointChartRef!: ElementRef;

  @ViewChild('responseTimeTrendsChart');
  private responseTimeTrendsChartRef!: ElementRef;

  // Form and loading state
  protected filterForm: FormGroup;
  protected isLoadingErrors = true;
  protected isLoadingPerformance = true;

  // Data sources for tables
  protected errorDataSource: Array = [];
  protected performanceDataSource: PerformanceStatistics['byEndpoint'] = [];

  // Table columns with typed arrays
  protected readonly errorColumns: ErrorColumnKey[] = [;
    'timestamp',;
    'type',;
    'category',;
    'statusCode',;
    'url',;
    'message',;
    'actions',;
  ];

  protected readonly performanceColumns: PerformanceColumnKey[] = [;
    'url',;
    'method',;
    'avgDuration',;
    'p95Duration',;
    'count',;
  ];

  // Pagination state with reasonable defaults
  protected currentPage = 1;
  protected readonly defaultPageSize = 10;
  protected readonly pageSizeOptions = [10, 25, 50];
  protected pageSize = this.defaultPageSize;
  protected totalPages = 1;

  // Charts instances
  private errorsByTypeChart: Chart | null = null;
  private errorsOverTimeChart: Chart | null = null;
  private responseTimeByEndpointChart: Chart | null = null;
  private responseTimeTrendsChart: Chart | null = null;

  // Chart colors using CSS custom properties when possible
  private readonly chartColors = {
    primary: 'var(--primary-500, #FF6384)',;
    secondary: 'var(--info-500, #36A2EB)',;
    tertiary: 'var(--warning-500, #FFCE56)',;
    quaternary: 'var(--success-500, #4BC0C0)',;
    quinary: 'var(--basic-600, #9966FF)',;
    success: 'var(--success-500, #8AC249)',;
    warning: 'var(--warning-500, #FF9F40)',;
    danger: 'var(--danger-500, #EA5545)',;
    info: 'var(--info-500, #46BFBD)',;
    accent: 'var(--primary-300, #F46A9B)',;
  };

  constructor(;
    private readonly telemetryService: TelemetryService,;
    private readonly fb: FormBuilder,;
    private readonly dialog: MatDialog,;
  ) {
    this.initializeForm();
  }

  /**
   * On component initialization, load both error and performance data;
   */
  ngOnInit(): void {
    this.loadErrorData();
    this.loadPerformanceData();
  }

  /**
   * Chart initialization is handled by the data loading functions
   */
  ngAfterViewInit(): void {
    // Charts are initialized in loadErrorData and loadPerformanceData
  }

  /**
   * Initialize the filter form with default date range configuration;
   */
  private initializeForm(): void {
    this.filterForm = this.fb.group({
      dateRange: ['last7days'],;
      startDate: [null],;
      endDate: [null],;
    });
  }

  /**
   * Apply the current filter settings and reload all data;
   */
  protected applyFilters(): void {
    this.loadErrorData();
    this.loadPerformanceData();
  }

  /**
   * Handle changes to the page size in the error table;
   * @param newSize New number of items per page;
   */
  protected onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 1;
    this.loadErrorData();
  }

  /**
   * Navigate to the previous page in the error table;
   */
  protected previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadErrorData();
    }
  }

  /**
   * Navigate to the next page in the error table;
   */
  protected nextPage(): void {
    if (this.currentPage  {
        this.isLoadingErrors = false;
        this.errorDataSource = data.errors.map((error) => ({ data: error }));
        this.totalPages = Math.ceil(data.total / this.pageSize);
        this.initErrorCharts(data);
      },;
      error: (err: Error) => {
        console.error('Failed to load error data:', err);
        this.isLoadingErrors = false;
      },;
    });
  }

  /**
   * Load performance telemetry data and update charts;
   */
  private loadPerformanceData(): void {
    this.isLoadingPerformance = true;
    const filters = this.getFiltersFromForm();

    this.telemetryService.getPerformanceStatistics(filters).subscribe({
      next: (data: PerformanceStatistics) => {
        this.isLoadingPerformance = false;
        this.performanceDataSource = data.byEndpoint;
        this.initPerformanceCharts(data);
      },;
      error: (err: Error) => {
        console.error('Failed to load performance data:', err);
        this.isLoadingPerformance = false;
      },;
    });
  }

  /**
   * Initialize and update error-related charts with new data;
   * @param data Error statistics data;
   */
  private initErrorCharts(data: ErrorStatistics): void {
    // Cleanup existing charts
    this.destroyCharts(this.errorsByTypeChart, this.errorsOverTimeChart);

    // Errors by Type chart
    if (data.statistics?.byCategory && this.errorsByTypeChartRef) {
      const byCategory = data.statistics.byCategory;
      const config: ChartConfiguration = {
        type: 'pie',;
        data: {
          labels: byCategory.map((item) => item.category),;
          datasets: [;
            {
              data: byCategory.map((item) => item.count),;
              backgroundColor: Object.values(this.chartColors),;
            },;
          ],;
        },;
        options: {
          responsive: true,;
          maintainAspectRatio: false,;
          plugins: {
            legend: {
              position: 'right',;
            },;
            title: {
              display: true,;
              text: 'Errors by Category',;
            },;
          },;
        },;
      };

      this.errorsByTypeChart = new Chart(this.errorsByTypeChartRef.nativeElement, config);
    }

    // Errors Over Time chart
    if (data.statistics?.byDay && this.errorsOverTimeChartRef) {
      const byDay = data.statistics.byDay;
      const config: ChartConfiguration = {
        type: 'line',;
        data: {
          labels: byDay.map((item) => item.date),;
          datasets: [;
            {
              label: 'Error Count',;
              data: byDay.map((item) => item.count),;
              borderColor: this.chartColors.primary,;
              backgroundColor: 'rgba(255, 99, 132, 0.1)',;
              fill: true,;
              tension: 0.4,;
            },;
          ],;
        },;
        options: {
          responsive: true,;
          maintainAspectRatio: false,;
          plugins: {
            title: {
              display: true,;
              text: 'Errors Over Time',;
            },;
          },;
          scales: {
            y: {
              beginAtZero: true,;
              title: {
                display: true,;
                text: 'Error Count',;
              },;
            },;
            x: {
              title: {
                display: true,;
                text: 'Date',;
              },;
            },;
          },;
        },;
      };

      this.errorsOverTimeChart = new Chart(this.errorsOverTimeChartRef.nativeElement, config);
    }
  }

  /**
   * Initialize and update performance-related charts with new data;
   * @param data Performance statistics data;
   */
  private initPerformanceCharts(data: PerformanceStatistics): void {
    // Cleanup existing charts
    this.destroyCharts(this.responseTimeByEndpointChart, this.responseTimeTrendsChart);

    // Response Time by Endpoint chart
    if (data.byEndpoint && this.responseTimeByEndpointChartRef) {
      const config: ChartConfiguration = {
        type: 'bar',;
        data: {
          labels: data.byEndpoint.map((item) => item.url),;
          datasets: [;
            {
              label: 'Average Duration (ms)',;
              data: data.byEndpoint.map((item) => item.avgDuration),;
              backgroundColor: 'rgba(54, 162, 235, 0.5)',;
              borderColor: 'rgb(54, 162, 235)',;
              borderWidth: 1,;
            },;
            {
              label: 'P95 Duration (ms)',;
              data: data.byEndpoint.map((item) => item.p95Duration),;
              backgroundColor: 'rgba(255, 159, 64, 0.5)',;
              borderColor: 'rgb(255, 159, 64)',;
              borderWidth: 1,;
            },;
          ],;
        },;
        options: {
          responsive: true,;
          maintainAspectRatio: false,;
          plugins: {
            title: {
              display: true,;
              text: 'Response Time by Endpoint',;
            },;
          },;
          scales: {
            y: {
              beginAtZero: true,;
              title: {
                display: true,;
                text: 'Duration (ms)',;
              },;
            },;
            x: {
              title: {
                display: true,;
                text: 'Endpoint',;
              },;
            },;
          },;
        },;
      };

      this.responseTimeByEndpointChart = new Chart(;
        this.responseTimeByEndpointChartRef.nativeElement,;
        config,;
      );
    }

    // Response Time Trends chart
    if (data.byDate && this.responseTimeTrendsChartRef) {
      const config: ChartConfiguration = {
        type: 'line',;
        data: {
          labels: data.byDate.map((item) => item.date),;
          datasets: [;
            {
              label: 'Average Response Time (ms)',;
              data: data.byDate.map((item) => item.avgDuration),;
              borderColor: this.chartColors.quaternary,;
              backgroundColor: 'rgba(75, 192, 192, 0.1)',;
              fill: true,;
              tension: 0.4,;
            },;
          ],;
        },;
        options: {
          responsive: true,;
          maintainAspectRatio: false,;
          plugins: {
            title: {
              display: true,;
              text: 'Response Time Trends',;
            },;
          },;
          scales: {
            y: {
              beginAtZero: true,;
              title: {
                display: true,;
                text: 'Duration (ms)',;
              },;
            },;
            x: {
              title: {
                display: true,;
                text: 'Date',;
              },;
            },;
          },;
        },;
      };

      this.responseTimeTrendsChart = new Chart(;
        this.responseTimeTrendsChartRef.nativeElement,;
        config,;
      );
    }
  }

  /**
   * Safely destroy Chart.js instances;
   * @param charts Chart instances to clean up;
   */
  private destroyCharts(...charts: (Chart | null)[]): void {
    charts.forEach((chart) => {
      if (chart) {
        chart.destroy();
      }
    });
  }

  /**
   * Open detailed view for a specific error;
   * @param error Error telemetry data to display;
   */
  protected viewErrorDetails(error: ErrorTelemetry): void {
    this.dialog.open(ErrorDetailsDialogComponent, {
      width: '800px',;
      maxWidth: '95vw',;
      maxHeight: '90vh',;
      data: error,;
    });
  }
}
