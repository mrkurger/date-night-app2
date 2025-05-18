import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NbSortDirection, NbSortRequest, NbTreeGridDataSource } from '@nebular/theme';

export interface TableColumn<T = any> {
  prop: keyof T;
  name: string;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  renderFn?: (value: any, row: T) => string;
}

@Component({
  selector: 'nb-data-table',
  template: `
    <nb-card>
      <nb-card-header *ngIf="showHeader">
        <div class="header-container">
          <h5 class="title">{{ title }}</h5>
          <div class="actions">
            <ng-content select="[tableActions]"></ng-content>
          </div>
        </div>
      </nb-card-header>

      <nb-card-body>
        <div class="table-responsive">
          <table [nbTreeGrid]="dataSource" [nbSort]="dataSource" (sort)="onSort($event)">
            <tr nbTreeGridHeader>
              <th
                *ngFor="let column of visibleColumns"
                [nbSortHeader]="column.sortable ? column.prop : null"
                [nbSortDirection]="getSortDirection(column)"
                [class.sortable]="column.sortable"
              >
                {{ column.name }}
                <nb-icon
                  *ngIf="column.filterable"
                  icon="funnel-outline"
                  (click)="onFilterClick(column)"
                  class="filter-icon"
                >
                </nb-icon>
              </th>
            </tr>

            <tr nbTreeGridRow *nbTreeGridRowDef="let row; columns: getColumnProps()">
              <td
                nbTreeGridCell
                *nbTreeGridCellDef="let row; column: column"
                *ngFor="let column of visibleColumns"
              >
                <ng-container *ngIf="column.renderFn; else defaultCell">
                  {{ column.renderFn(row.data[column.prop], row.data) }}
                </ng-container>
                <ng-template #defaultCell>
                  {{ row.data[column.prop] }}
                </ng-template>
              </td>
            </tr>
          </table>
        </div>

        <!-- Loading State -->
        <div class="spinner-container" *ngIf="loading">
          <nb-spinner status="primary"></nb-spinner>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!loading && (!data || data.length === 0)">
          {{ emptyMessage }}
        </div>
      </nb-card-body>

      <nb-card-footer *ngIf="showPaginator">
        <div class="footer-container">
          <div class="page-size">
            <span>Items per page:</span>
            <nb-select [(ngModel)]="pageSize" (selectedChange)="onPageSizeChange($event)">
              <nb-option *ngFor="let size of pageSizes" [value]="size">{{ size }}</nb-option>
            </nb-select>
          </div>

          <div class="pagination">
            <button
              nbButton
              ghost
              [disabled]="currentPage === 1"
              (click)="onPageChange(currentPage - 1)"
            >
              <nb-icon icon="chevron-left-outline"></nb-icon>
            </button>
            <span class="page-info"> Page {{ currentPage }} of {{ totalPages }} </span>
            <button
              nbButton
              ghost
              [disabled]="currentPage === totalPages"
              (click)="onPageChange(currentPage + 1)"
            >
              <nb-icon icon="chevron-right-outline"></nb-icon>
            </button>
          </div>
        </div>
      </nb-card-footer>
    </nb-card>

    <!-- Filter Dialog -->
    <nb-data-table-filter
      *ngIf="showFilter"
      [column]="activeFilterColumn"
      [value]="filters[activeFilterColumn?.prop]"
      (filterChange)="onFilterChange($event)"
      (close)="showFilter = false"
    >
    </nb-data-table-filter>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .title {
        margin: 0;
        color: nb-theme(text-basic-color);
        font-weight: nb-theme(text-heading-5-font-weight);
      }

      .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th {
        padding: 1rem;
        border-bottom: 1px solid nb-theme(border-basic-color-3);
        font-weight: nb-theme(text-heading-6-font-weight);
        color: nb-theme(text-basic-color);
        background-color: nb-theme(background-basic-color-2);
        transition: background-color 0.2s;

        &.sortable {
          cursor: pointer;

          &:hover {
            background-color: nb-theme(background-basic-color-3);
          }
        }
      }

      td {
        padding: 1rem;
        border-bottom: 1px solid nb-theme(border-basic-color-2);
        color: nb-theme(text-basic-color);
      }

      .filter-icon {
        cursor: pointer;
        margin-left: 0.5rem;
        font-size: 1rem;
        color: nb-theme(text-hint-color);
        transition: color 0.2s;

        &:hover {
          color: nb-theme(text-basic-color);
        }
      }

      .spinner-container {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
        color: nb-theme(text-hint-color);
      }

      .footer-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .page-size {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        span {
          color: nb-theme(text-hint-color);
          font-size: nb-theme(text-caption-font-size);
        }
      }

      .pagination {
        display: flex;
        align-items: center;
        gap: 1rem;

        .page-info {
          color: nb-theme(text-hint-color);
          font-size: nb-theme(text-caption-font-size);
        }
      }
    `,
  ],
})
export class NbDataTableComponent<T = any> implements OnInit {
  @Input() data: T[] = [];
  @Input() columns: TableColumn<T>[] = [];
  @Input() title = '';
  @Input() loading = false;
  @Input() showHeader = true;
  @Input() showPaginator = true;
  @Input() pageSize = 10;
  @Input() pageSizes = [5, 10, 25, 50];
  @Input() currentPage = 1;
  @Input() emptyMessage = 'No data available';

  @Output() sortChange = new EventEmitter<NbSortRequest>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() filterChange = new EventEmitter<{ column: TableColumn<T>; value: any }>();
  @Output() columnsChange = new EventEmitter<TableColumn<T>[]>();

  dataSource!: NbTreeGridDataSource<T>;
  visibleColumns: TableColumn<T>[] = [];
  showFilter = false;
  activeFilterColumn: TableColumn<T> | null = null;
  filters: { [key: string]: any } = {};
  sortColumn: string | null = null;
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  ngOnInit() {
    this.visibleColumns = this.columns.filter((col) => !col.hidden);
  }

  getColumnProps(): string[] {
    return this.visibleColumns.map((col) => col.prop as string);
  }

  getSortDirection(column: TableColumn<T>): NbSortDirection {
    if (column.prop === this.sortColumn) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  onSort(sortRequest: NbSortRequest) {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
    this.sortChange.emit(sortRequest);
  }

  onFilterClick(column: TableColumn<T>) {
    this.activeFilterColumn = column;
    this.showFilter = true;
  }

  onFilterChange(value: any) {
    if (this.activeFilterColumn) {
      this.filters[this.activeFilterColumn.prop as string] = value;
      this.filterChange.emit({
        column: this.activeFilterColumn,_value,
      });
    }
    this.showFilter = false;
  }

  onColumnsChange(columns: TableColumn<T>[]) {
    this.visibleColumns = columns;
    this.columnsChange.emit(columns);
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.pageSizeChange.emit(size);
  }
}
