import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';

import { NbTagModule } from '@nebular/theme';
import { NbCardModule } from '@nebular/theme';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  AppSortComponent,
  AppSortHeaderComponent,
} from '../../../../shared/components/custom-nebular-components/nb-sort/nb-sort.component';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { ErrorCategory } from '../../../../core/interceptors/http-error.interceptor';
import { TelemetryService, ErrorTelemetry } from '../../../../core/services/telemetry.service';
import { FormGroup, FormBuilder } from '@angular/forms';

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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NbCardModule, NbButtonModule, NbTableModule, NbFormFieldModule, NbInputModule, NbSelectModule, NbIconModule, NbTagModule, NbSpinnerModule, NbDatepickerModule],
  template: `
    <div class="dashboard-container">
      <h1>Error Monitoring Dashboard</h1>

      <nb-card class="filter-card">
        <nb-card-header>
          <h5>Filters</h5>
        </nb-card-header>
        <nb-card-body>
          <form [formGroup]="filterForm" class="filter-form">
            <nb-form-field>
              <nb-select fullWidth formControlName="category" placeholder="Error Category">
                <nb-option value="">All Categories</nb-option>
                <nb-option *ngFor="let category of errorCategories" [value]="category.value">
                  {{ category.label }}
                </nb-option>
              </nb-select>
            </nb-form-field>

            <nb-form-field>
              <input
                nbInput
                type="number"
                formControlName="statusCode"
                placeholder="Status Code (e.g., 500)"
              />
            </nb-form-field>

            <nb-form-field>
              <input
                nbInput
                [nbDatepicker]="fromPicker"
                formControlName="fromDate"
                placeholder="From Date"
              />
              <nb-datepicker #fromPicker></nb-datepicker>
            </nb-form-field>

            <nb-form-field>
              <input
                nbInput
                [nbDatepicker]="toPicker"
                formControlName="toDate"
                placeholder="To Date"
              />
              <nb-datepicker #toPicker></nb-datepicker>
            </nb-form-field>

            <div class="filter-actions">
              <button nbButton status="primary" (click)="applyFilters()">
                <nb-icon icon="funnel-outline"></nb-icon> Apply Filters
              </button>
              <button nbButton status="basic" (click)="resetFilters()">
                <nb-icon icon="close-outline"></nb-icon> Reset
              </button>
            </div>
          </form>
        </nb-card-body>
      </nb-card>

      <div class="dashboard-content">
        <div class="error-stats">
          <nb-card class="stat-card">
            <nb-card-body>
              <div class="stat-value">{{ (errorStats$ | async)?.totalErrors || 0 }}</div>
              <div class="stat-label">Total Errors</div>
            </nb-card-body>
          </nb-card>

          <nb-card class="stat-card">
            <nb-card-body>
              <div class="stat-value">{{ (errorStats$ | async)?.uniqueErrors || 0 }}</div>
              <div class="stat-label">Unique Error Codes</div>
            </nb-card-body>
          </nb-card>

          <nb-card class="stat-card">
            <nb-card-body>
              <div class="stat-value">{{ (errorStats$ | async)?.serverErrors || 0 }}</div>
              <div class="stat-label">Server Errors</div>
            </nb-card-body>
          </nb-card>

          <nb-card class="stat-card">
            <nb-card-body>
              <div class="stat-value">{{ (errorStats$ | async)?.clientErrors || 0 }}</div>
              <div class="stat-label">Client Errors</div>
            </nb-card-body>
          </nb-card>
        </div>

        <nb-card class="error-list-card">
          <nb-card-header>
            <h5>Recent Errors</h5>
          </nb-card-header>
          <nb-card-body>
            <div class="loading-container" *ngIf="loading">
              <nb-spinner></nb-spinner>
            </div>

            <table nbTable [nbSort]="sort" [dataSource]="errors" *ngIf="!loading">
              <tr nbTableHeaderRow *nbTableHeaderRowDef="displayedColumns"></tr>
              <tr nbTableRow *nbTableRowDef="let row; columns: displayedColumns"></tr>

              <ng-container nbColumnDef="timestamp">
                <th nbTableHeaderCell nbSortHeader *nbTableHeaderCellDef>Timestamp</th>
                <td nbTableCell *nbTableCellDef="let error">
                  {{ error.timestamp | date: 'medium' }}
                </td>
              </ng-container>

              <ng-container nbColumnDef="errorCode">
                <th nbTableHeaderCell nbSortHeader *nbTableHeaderCellDef>Error Code</th>
                <td nbTableCell *nbTableCellDef="let error">{{ error.errorCode }}</td>
              </ng-container>

              <ng-container nbColumnDef="category">
                <th nbTableHeaderCell nbSortHeader *nbTableHeaderCellDef>Category</th>
                <td nbTableCell *nbTableCellDef="let error">
                  <nb-tag
                    [status]="getCategoryStatus(error.context?.category)"
                    [text]="error.context?.category || 'unknown'"
                  >
                  </nb-tag>
                </td>
              </ng-container>

              <ng-container nbColumnDef="statusCode">
                <th nbTableHeaderCell nbSortHeader *nbTableHeaderCellDef>Status</th>
                <td nbTableCell *nbTableCellDef="let error">{{ error.statusCode }}</td>
              </ng-container>

              <ng-container nbColumnDef="userMessage">
                <th nbTableHeaderCell *nbTableHeaderCellDef>User Message</th>
                <td nbTableCell *nbTableCellDef="let error">{{ error.userMessage }}</td>
              </ng-container>

              <ng-container nbColumnDef="url">
                <th nbTableHeaderCell *nbTableHeaderCellDef>URL</th>
                <td nbTableCell *nbTableCellDef="let error">{{ error.url }}</td>
              </ng-container>

              <ng-container nbColumnDef="actions">
                <th nbTableHeaderCell *nbTableHeaderCellDef></th>
                <td nbTableCell *nbTableCellDef="let error">
                  <button nbButton ghost (click)="viewErrorDetails(error)">
                    <nb-icon icon="eye-outline"></nb-icon>
                  </button>
                </td>
              </ng-container>
            </table>

            <div class="no-data-message" *ngIf="!loading && errors.length === 0">
              No errors found matching the current filters.
            </div>

            <nb-paginator
              [total]="totalErrors"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (pageChange)="pageChanged($event)"
              *ngIf="!loading && errors.length > 0"
            >
            </nb-paginator>
          </nb-card-body>
        </nb-card>
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

      .filter-form nb-form-field {
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

      .no-data-message {
        text-align: center;
        padding: 20px;
        color: var(--text-hint-color);
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
  sortDirection: NbSortDirection = NbSortDirection.DESCENDING;

  // Table columns
  displayedColumns = [
    'timestamp',
    'errorCode',
    'category',
    'statusCode',
    'userMessage',
    'url',
    'actions',
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

  // Sort state
  @ViewChild(AppSortComponent) sort!: AppSortComponent;

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
        sort: this.sortField,
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
  pageChanged(event: { page: number; pageSize: number }): void {
    this.currentPage = event.page;
    this.pageSize = event.pageSize;
    this.loadErrors();
  }

  /**
   * Handle sort change event
   */
  sortData(sort: NbSortRequest): void {
    this.sortField = sort.column;
    this.sortDirection = sort.direction;
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

  getCategoryStatus(category: string | undefined): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'basic';
      case ErrorCategory.SERVER:
        return 'info';
      case ErrorCategory.CLIENT:
        return 'success';
      case ErrorCategory.AUTHENTICATION:
        return 'warning';
      case ErrorCategory.AUTHORIZATION:
        return 'danger';
      case ErrorCategory.VALIDATION:
        return 'control';
      case ErrorCategory.TIMEOUT:
        return 'warning';
      case ErrorCategory.UNKNOWN:
        return 'basic';
      default:
        return 'basic';
    }
  }
}
