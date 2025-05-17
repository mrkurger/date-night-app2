import {} from '../../../../shared/nebular.module';
import { NbTableModule, NbDialogService } from '@nebular/theme';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (error-dashboard.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { AppSortComponent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { AppSortHeaderComponent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';

import { NbPaginationChangeEvent } from '../../../../shared/components/custom-nebular-components/nb-paginator/nb-paginator.module';
import { AppSortEvent } from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.module';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TelemetryService } from '../../../../core/services/telemetry.service';
import { TelemetrySocketService } from '../../../../core/services/telemetry-socket.service';
import { ErrorCategory } from '../../../../core/interceptors/http-error.interceptor';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

// Define interfaces for pagination and sorting
interface ErrorData {
  timestamp: Date;
  errorCode: string;
  category: string;
  statusCode: number;
  url: string;
  userMessage: string;
  technicalMessage: string;
  method?: string;
  response?: any;
  context?: {
    requestDetails?: {
      headers?: any;
      body?: any;
    };
  };
}

@Component({
  selector: 'app-error-dashboard',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxChartsModule,

    AppSortComponent,
    AppSortHeaderComponent,
  ],
  templateUrl: './error-dashboard.component.html',
  styleUrls: ['./error-dashboard.component.scss'],
})
export class ErrorDashboardComponent implements OnInit, OnDestroy {
  @ViewChild(AppSortComponent) sort: AppSortComponent;
  @ViewChild('errorDetailsDialog') errorDetailsDialog!: TemplateRef<any>;

  filterForm: FormGroup;
  loading = false;
  isRealtime = false;
  isConnected = false;
  currentPage = 1;
  pageSize = 10;
  totalErrors = 0;
  errorCategories = Object.values(ErrorCategory);
  displayedColumns = ['timestamp', 'category', 'message', 'count', 'actions'];
  dataSource: any;
  selectedError: ErrorData | null = null;

  // Chart data
  errorTrendData: any[] = [];
  errorDistributionData: any[] = [];
  errorsByCategory: any[] = [];
  errorsByStatusCode: any[] = [];
  errorsOverTime: any[] = [];

  // Sorting
  sortColumn = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private telemetryService: TelemetryService,
    private telemetrySocketService: TelemetrySocketService,
    private dialogService: NbDialogService,
  ) {
    this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.setupRealtimeConnection();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.telemetrySocketService.disconnect();
  }

  private initializeFilterForm(): void {
    this.filterForm = this.formBuilder.group({
      category: [''],
      statusCode: [''],
      startDate: [null],
      endDate: [null],
    });
  }

  private setupRealtimeConnection(): void {
    this.telemetrySocketService
      .connect()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.isConnected = true;
          if (this.isRealtime) {
            this.subscribeToUpdates();
          }
        },
        (error) => {
          console.error('Socket connection error:', error);
          this.isConnected = false;
        },
      );
  }

  private subscribeToUpdates(): void {
    if (this.isConnected) {
      this.telemetrySocketService
        .onErrorUpdate()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (update) => {
            this.loadDashboardData();
          },
          (error) => {
            console.error('Error subscription error:', error);
          },
        );
    }
  }

  toggleRealtime(): void {
    this.isRealtime = !this.isRealtime;
    if (this.isRealtime && this.isConnected) {
      this.subscribeToUpdates();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    const filters = this.filterForm.value;

    this.telemetryService
      .getErrorDashboardData(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loading = false)),
      )
      .subscribe(
        (data) => {
          this.dataSource = this.transformData(data.errors);
          this.errorTrendData = this.transformTrendData(data.trends);
          this.errorDistributionData = this.transformDistributionData(data.distribution);
          this.totalErrors = data.total;
        },
        (error) => {
          console.error('Error loading dashboard data:', error);
        },
      );
  }

  private transformData(errors: any[]): ErrorData[] {
    return errors.map((error) => ({
      timestamp: new Date(error.timestamp),
      errorCode: error.errorCode,
      category: error.category,
      statusCode: error.statusCode,
      url: error.url,
      userMessage: error.userMessage,
      technicalMessage: error.technicalMessage,
    }));
  }

  private transformTrendData(trends: any[]): any[] {
    return [
      {
        name: 'Errors',
        series: trends.map((trend) => ({
          name: new Date(trend.date),
          value: trend.count,
        })),
      },
    ];
  }

  private transformDistributionData(distribution: any[]): any[] {
    return distribution.map((item) => ({
      name: item.category,
      value: item.count,
    }));
  }

  getCategoryStatus(category: string): string {
    const statusMap: { [key: string]: string } = {
      network: 'warning',
      authentication: 'danger',
      authorization: 'danger',
      validation: 'info',
      server: 'danger',
      client: 'warning',
      timeout: 'warning',
      rate_limit: 'info',
      not_found: 'basic',
      conflict: 'warning',
      unknown: 'basic',
    };
    return statusMap[category] || 'basic';
  }

  applyFilters(): void {
    this.loadDashboardData();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.loadDashboardData();
  }

  viewErrorDetails(error: ErrorData): void {
    this.selectedError = error;
    this.dialogService.open(this.errorDetailsDialog, {
      context: error,
      hasBackdrop: true,
      closeOnBackdropClick: true,
    });
  }

  onSort(sort: AppSortEvent): void {
    this.sortColumn = sort.active;
    this.sortDirection = sort.direction;
    this.loadDashboardData();
  }

  /**
   * Handle page change event from paginator
   */
  onPageChange(event: any): void {
    // Convert the event to NbPaginationChangeEvent format
    const paginationEvent: NbPaginationChangeEvent = {
      page: event.page || 1,
      pageSize: event.pageSize || this.pageSize,
    };

    this.currentPage = paginationEvent.page;
    this.pageSize = paginationEvent.pageSize;
    this.loadDashboardData();
  }

  getCategoryLabel(category: string): string {
    return category.replace('_', ' ').toUpperCase();
  }

  /**
   * Handle sort event from sort component
   */
  sortData(sort: AppSortEvent): void {
    // Implement sorting logic if needed, then reload data
    // Example: this.sortField = sort.active; this.sortDirection = sort.direction;
    this.loadDashboardData();
  }
}
