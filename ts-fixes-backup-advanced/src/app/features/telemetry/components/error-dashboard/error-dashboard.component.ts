// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (error-dashboard.component)
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
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { TelemetryService, ErrorTelemetry } from '../../../../core/services/telemetry.service';
import { ErrorCategory } from '../../../../core/interceptors/http-error.interceptor';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';

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
    MatChipsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Error Monitoring Dashboard</h1>

      <mat-card class="filter-card">
        <mat-card-header>
          <mat-card-title>Filters</mat-card-title>
        </mat-card-header>
        <mat-card-content>
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
              <input matInput type="number" formControlName="statusCode" placeholder="e.g., 500" />
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
        <div class="error-stats">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ (errorStats$ | async)?.totalErrors || 0 }}</div>
              <div class="stat-label">Total Errors</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ (errorStats$ | async)?.uniqueErrors || 0 }}</div>
              <div class="stat-label">Unique Error Codes</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ (errorStats$ | async)?.serverErrors || 0 }}</div>
              <div class="stat-label">Server Errors</div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-value">{{ (errorStats$ | async)?.clientErrors || 0 }}</div>
              <div class="stat-label">Client Errors</div>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="error-list-card">
          <mat-card-header>
            <mat-card-title>Recent Errors</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="loading-container" *ngIf="loading">
              <mat-spinner diameter="40"></mat-spinner>
            </div>

            <table
              mat-table
              [dataSource]="errors"
              matSort
              (matSortChange)="sortData($event)"
              class="error-table"
              *ngIf="!loading"
            >
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Timestamp</th>
                <td mat-cell *matCellDef="let error">{{ error.timestamp | date: 'medium' }}</td>
              </ng-container>

              <ng-container matColumnDef="errorCode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Error Code</th>
                <td mat-cell *matCellDef="let error">{{ error.errorCode }}</td>
              </ng-container>

              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                <td mat-cell *matCellDef="let error">
                  <mat-chip [ngClass]="'category-' + error.context?.category">
                    {{ error.context?.category || 'unknown' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="statusCode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let error">{{ error.statusCode }}</td>
              </ng-container>

              <ng-container matColumnDef="userMessage">
                <th mat-header-cell *matHeaderCellDef>User Message</th>
                <td mat-cell *matCellDef="let error">{{ error.userMessage }}</td>
              </ng-container>

              <ng-container matColumnDef="url">
                <th mat-header-cell *matHeaderCellDef>URL</th>
                <td mat-cell *matCellDef="let error">{{ error.url }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let error">
                  <button mat-icon-button color="primary" (click)="viewErrorDetails(error)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>

            <div class="no-data-message" *ngIf="!loading && errors.length === 0">
              No errors found matching the current filters.
            </div>

            <mat-paginator
              [length]="totalErrors"
              [pageSize]="pageSize"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="pageChanged($event)"
              *ngIf="!loading && errors.length > 0"
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
        color: #3f51b5;
      }

      .stat-label {
        font-size: 1rem;
        color: #666;
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
        color: #666;
      }

      mat-chip.category-network {
        background-color: #ff9800;
      }
      mat-chip.category-authentication {
        background-color: #f44336;
      }
      mat-chip.category-authorization {
        background-color: #e91e63;
      }
      mat-chip.category-validation {
        background-color: #9c27b0;
      }
      mat-chip.category-server {
        background-color: #673ab7;
      }
      mat-chip.category-client {
        background-color: #3f51b5;
      }
      mat-chip.category-timeout {
        background-color: #2196f3;
      }
      mat-chip.category-rate_limit {
        background-color: #03a9f4;
      }
      mat-chip.category-not_found {
        background-color: #00bcd4;
      }
      mat-chip.category-conflict {
        background-color: #009688;
      }
      mat-chip.category-unknown {
        background-color: #607d8b;
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
  pageIndex = 0;
  pageSize = 10;

  // Sorting
  sortField = 'timestamp';
  sortDirection = 'desc';

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

  constructor(
    private telemetryService: TelemetryService,
    private fb: FormBuilder
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
        page: this.pageIndex,
        limit: this.pageSize,
        sort: this.sortField,
        order: this.sortDirection,
      })
      .pipe(
        catchError(error => {
          console.error('Error loading error data:', error);
          this.loading = false;
          return of({ errors: [], total: 0 });
        })
      )
      .subscribe(data => {
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
              data =>
                data.statistics || {
                  totalErrors: 0,
                  uniqueErrors: 0,
                  serverErrors: 0,
                  clientErrors: 0,
                }
            ),
            catchError(() =>
              of({
                totalErrors: 0,
                uniqueErrors: 0,
                serverErrors: 0,
                clientErrors: 0,
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
    this.loadErrors();
  }

  /**
   * Handle sort change event
   */
  sortData(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction || 'asc';
    this.loadErrors();
  }

  /**
   * Apply filters from the form
   */
  applyFilters(): void {
    this.pageIndex = 0; // Reset to first page when filtering
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
    this.pageIndex = 0;
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
    console.log('View error details:', error);
    // Implementation for error details dialog would go here
  }
}
