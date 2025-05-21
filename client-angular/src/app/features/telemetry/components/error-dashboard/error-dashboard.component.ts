import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { ErrorCategory } from '../../../../core/interceptors/http-error.interceptor';
import { TelemetryService, ErrorTelemetry } from '../../../../core/services/telemetry.service';
import { FormGroup, FormBuilder } from '@angular/forms';

// PrimeNG Modules
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Error Dashboard Component
 *
 * Displays a dashboard for analyzing and monitoring application errors.
 * Features include:
 * - Filtering by error category, status code, date range
 * - Sorting by various columns
 * - Pagination for large datasets
 * - Detailed error information
 */
@Component({
  selector: 'app-error-dashboard',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    CardModule,
    ProgressSpinnerModule,
    TooltipModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="dashboard-container">
      <h1>Error Monitoring Dashboard</h1>

      <p-card styleClass="filter-card">
        <ng-template pTemplate="header">
          <h5>Filters</h5>
        </ng-template>
        <form [formGroup]="filterForm" class="filter-form">
          <div class="p-fluid p-grid p-formgrid">
            <div class="p-field p-col-12 p-md-3">
              <label htmlFor="category">Error Category</label>
              <p-dropdown
                inputId="category"
                [options]="errorCategories"
                formControlName="category"
                placeholder="All Categories"
                optionLabel="label"
                optionValue="value"
                [showClear]="true"
              ></p-dropdown>
            </div>

            <div class="p-field p-col-12 p-md-3">
              <label htmlFor="statusCode">Status Code</label>
              <input
                pInputText
                id="statusCode"
                type="number"
                formControlName="statusCode"
                placeholder="Status Code (e.g., 500)"
              />
            </div>

            <div class="p-field p-col-12 p-md-3">
              <label htmlFor="fromDate">From Date</label>
              <p-calendar
                inputId="fromDate"
                formControlName="fromDate"
                placeholder="From Date"
                [showIcon]="true"
              ></p-calendar>
            </div>

            <div class="p-field p-col-12 p-md-3">
              <label htmlFor="toDate">To Date</label>
              <p-calendar
                inputId="toDate"
                formControlName="toDate"
                placeholder="To Date"
                [showIcon]="true"
              ></p-calendar>
            </div>
          </div>

          <div class="filter-actions">
            <p-button
              label="Apply Filters"
              icon="pi pi-filter"
              (click)="applyFilters()"
              styleClass="p-button-primary"
            ></p-button>
            <p-button
              label="Reset"
              icon="pi pi-times"
              (click)="resetFilters()"
              styleClass="p-button-outlined"
            ></p-button>
          </div>
        </form>
      </p-card>

      <div class="dashboard-content">
        <div class="error-stats">
          <p-card styleClass="stat-card">
            <div class="stat-value">{{ (errorStats$ | async)?.totalErrors || 0 }}</div>
            <div class="stat-label">Total Errors</div>
          </p-card>

          <p-card styleClass="stat-card">
            <div class="stat-value">{{ (errorStats$ | async)?.uniqueErrors || 0 }}</div>
            <div class="stat-label">Unique Error Codes</div>
          </p-card>

          <p-card styleClass="stat-card">
            <div class="stat-value">{{ (errorStats$ | async)?.serverErrors || 0 }}</div>
            <div class="stat-label">Server Errors</div>
          </p-card>

          <p-card styleClass="stat-card">
            <div class="stat-value">{{ (errorStats$ | async)?.clientErrors || 0 }}</div>
            <div class="stat-label">Client Errors</div>
          </p-card>
        </div>

        <p-card styleClass="error-list-card">
          <ng-template pTemplate="header">
            <h5>Recent Errors</h5>
          </ng-template>
          <div class="loading-container" *ngIf="loading">
            <p-progressSpinner></p-progressSpinner>
          </div>

          <p-table
            [value]="errors"
            [paginator]="true"
            [rows]="pageSize"
            [totalRecords]="totalErrors"
            (onPage)="pageChanged($event)"
            [sortField]="sortField"
            [sortOrder]="sortDirection === 'desc' ? -1 : 1"
            (onSort)="sortDataPrime($event)"
            *ngIf="!loading"
            responsiveLayout="scroll"
          >
            <ng-template pTemplate="header">
              <tr>
                <th *ngFor="let col of displayedColumnsPrime" [pSortableColumn]="col.field">
                  {{ col.header }}
                  <p-sortIcon [field]="col.field"></p-sortIcon>
                </th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-error>
              <tr>
                <td>{{ error.timestamp | date: 'medium' }}</td>
                <td>{{ error.statusCode || 'N/A' }}</td>
                <td>{{ error.category }}</td>
                <td>{{ error.type }}</td>
                <td>{{ error.message }}</td>
                <td>{{ error.count }}</td>
                <td>
                  <p-button
                    icon="pi pi-eye"
                    styleClass="p-button-text p-button-rounded"
                    (click)="viewErrorDetails(error)"
                    pTooltip="View Details"
                    tooltipPosition="top"
                  ></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td [attr.colspan]="displayedColumnsPrime.length + 1">
                  No errors found matching the current filters.
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
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
        color: var(--text-basic-color);
      }

      .filter-card {
        margin-bottom: 20px;
      }

      .filter-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
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

      .error-stats {
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
        color: var(--text-primary-color);
      }

      .stat-label {
        font-size: 1rem;
        color: var(--text-hint-color);
      }

      .error-list-card {
        width: 100%;
      }

      .error-table {
        width: 100%;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 20px;
      }
    `,
  ],
})
export class ErrorDashboardComponent implements OnInit {
  // Error data
  errors: ErrorTelemetry[] = [];
  totalErrors = 0;
  loading = true;

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Sorting
  sortField = 'timestamp';
  sortDirection: 'asc' | 'desc' | '' = 'desc';

  // Table columns
  displayedColumnsPrime = [
    { field: 'timestamp', header: 'Timestamp' },
    { field: 'statusCode', header: 'Status Code' },
    { field: 'category', header: 'Category' },
    { field: 'type', header: 'Type' },
    { field: 'message', header: 'Message' },
    { field: 'count', header: 'Count' },
  ];

  // Filter form
  filterForm: FormGroup;

  // Error categories for filter dropdown
  errorCategories = Object.entries(ErrorCategory).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' '),
    value,
  }));

  // Error statistics
  errorStats$: Observable<any>;

  constructor(
    private telemetryService: TelemetryService,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({
      category: [''],
      statusCode: [''],
      fromDate: [null],
      toDate: [null],
    });

    // Initialize error statistics
    this.errorStats$ = this.getErrorStatistics();
  }

  ngOnInit(): void {
    this.loadErrors();
  }

  /**
   * Load errors with current pagination, sorting, and filtering
   */
  loadErrors(): void {
    this.loading = true;

    const filters = this.getFilters();

    this.telemetryService
      .getErrorStatistics({
        ...filters,
        page: this.currentPage,
        limit: this.pageSize,
        _sort: this.sortField,
        order: this.sortDirection,
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading error data:', error);
          this.loading = false;
          return of({ errors: [], total: 0 });
        }),
      )
      .subscribe((data) => {
        this.errors = data.errors || [];
        this.totalErrors = data.total || 0;
        this.loading = false;
      });
  }

  /**
   * Get error statistics for the dashboard
   */
  getErrorStatistics(): Observable<any> {
    return this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      switchMap(() => {
        const filters = this.getFilters();
        return this.telemetryService
          .getErrorStatistics({
            ...filters,
            stats: true,
          })
          .pipe(
            map(
              (data) =>
                data.statistics || {
                  totalErrors: 0,
                  uniqueErrors: 0,
                  serverErrors: 0,
                  clientErrors: 0,
                },
            ),
            catchError(() =>
              of({
                totalErrors: 0,
                uniqueErrors: 0,
                serverErrors: 0,
                clientErrors: 0,
              }),
            ),
          );
      }),
    );
  }

  /**
   * Handle page change event
   */
  pageChanged(event: any): void {
    this.currentPage = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.loadErrors();
  }

  /**
   * Handle sort change event
   */
  sortDataPrime(event: any): void {
    this.sortField = event.field;
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.loadErrors();
  }

  /**
   * Apply filters from the form
   */
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.loadErrors();
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      category: '',
      statusCode: '',
      fromDate: null,
      toDate: null,
    });
    this.currentPage = 1;
    this.loadErrors();
  }

  /**
   * Get current filters from the form
   */
  getFilters(): any {
    const filters: any = {};
    const formValues = this.filterForm.value;

    if (formValues.category) {
      filters.category = formValues.category;
    }

    if (formValues.statusCode) {
      filters.statusCode = formValues.statusCode;
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
   * View detailed information for an error
   */
  viewErrorDetails(error: ErrorTelemetry): void {
    // This would typically open a dialog with detailed error information
    // eslint-disable-next-line no-console
    console.log('View error details:', error);
    // Implementation for error details dialog would go here
  }
}
