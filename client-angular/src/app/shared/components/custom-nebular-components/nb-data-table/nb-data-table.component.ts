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
        <nb-data-table-header
          [title]="title"
          [columns]="columns"
          [selectedColumns]="visibleColumns"
          (columnsChange)="onColumnsChange($event)"
        >
        </nb-data-table-header>
      </nb-card-header>

      <nb-card-body>
        <div class="table-responsive">
          <table [nbTreeGrid]="dataSource" [nbSort]="dataSource" (sort)="onSort($event)">
            <!-- Table Header -->
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

            <!-- Table Body -->
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

        <!-- Loading Spinner -->
        <div class="spinner-container" *ngIf="loading">
          <nb-spinner status="primary"></nb-spinner>
        </div>

        <!-- No Data Message -->
        <div class="no-data" *ngIf="!loading && (!data || data.length === 0)">
          {{ noDataMessage }}
        </div>
      </nb-card-body>

      <nb-card-footer *ngIf="showPaginator">
        <nb-data-table-paginator
          [page]="currentPage"
          [pageSize]="pageSize"
          [total]="totalItems"
          (pageChange)="onPageChange($event)"
        >
        </nb-data-table-paginator>
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

      .no-data {
        text-align: center;
        padding: 2rem;
        color: nb-theme(text-hint-color);
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
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() noDataMessage = 'No data available';

  @Output() sortChange = new EventEmitter<NbSortRequest>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() filterChange = new EventEmitter<{ column: TableColumn<T>; value: any }>();
  @Output() columnsChange = new EventEmitter<TableColumn<T>[]>();

  dataSource!: NbTreeGridDataSource<T>;
  visibleColumns: TableColumn<T>[] = [];
  showFilter = false;
  activeFilterColumn: TableColumn<T> | null = null;
  filters: { [key: string]: any } = {};
  sortColumn: string | null = null;
  sortDirection: NbSortDirection = NbSortDirection.NONE;

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
        column: this.activeFilterColumn,
        value,
      });
    }
    this.showFilter = false;
  }

  onColumnsChange(columns: TableColumn<T>[]) {
    this.visibleColumns = columns;
    this.columnsChange.emit(columns);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.pageChange.emit(page);
  }
}
