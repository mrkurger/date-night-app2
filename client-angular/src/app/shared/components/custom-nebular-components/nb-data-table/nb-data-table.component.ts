import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { SelectItem } from 'primeng/selectitem';
export interface TableColumn<T = any> {
  prop: keyof T;
  name: string;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  renderFn?: (value: any, row: T) => string;
}

@Component({
  selector: 'app-primeng-data-table',
  template: `
    <p-card>
      <ng-container *ngIf="showHeader">
        <ng-template pTemplate="header">
          <div class="header-container">
            <h5 class="title">{{ title }}</h5>
            <div class="actions">
              <ng-content select="[tableActions]"></ng-content>
            </div>
          </div>
        </ng-template>
      </ng-container>

      <ng-template pTemplate="content">
        <div class="table-responsive">
          <p-table
            [value]="data"
            [paginator]="showPaginator"
            [rows]="pageSize"
            [columns]="visibleColumns"
            [loading]="loading"
            [resizableColumns]="true"
            [scrollable]="true"
            [scrollHeight]="'400px'"
            (onSort)="onSort($event)"
          >
            <ng-template pTemplate="header" let-columns>
              <tr>
                <th
                  *ngFor="let column of columns"
                  [pSortableColumn]="column.sortable ? column.prop : null"
                >
                  {{ column.name }}
                  <p-sortIcon *ngIf="column.sortable" [field]="column.prop"></p-sortIcon>
                </th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-row let-columns="columns">
              <tr>
                <td *ngFor="let column of columns">
                  <ng-container *ngIf="column.renderFn; else defaultCell">
                    {{ column.renderFn(row[column.prop], row) }}
                  </ng-container>
                  <ng-template #defaultCell>
                    {{ row[column.prop] }}
                  </ng-template>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!loading && (!data || data.length === 0)">
          {{ emptyMessage }}
        </div>
      </ng-template>

      <ng-container *ngIf="showPaginator">
        <ng-template pTemplate="footer">
          <div class="footer-container">
            <div class="page-size">
              <span>Items per page:</span>
              <p-dropdown
                [options]="pageSizes.map(size => ({ label: size.toString(), value: size }))"
                [(ngModel)]="pageSize"
                (onChange)="onPageSizeChange($event.value)"
              ></p-dropdown>
            </div>

            <div class="pagination">
              <button
                pButton
                icon="pi pi-chevron-left"
                class="p-button-text"
                [disabled]="currentPage === 1"
                (click)="onPageChange(currentPage - 1)"
              ></button>
              <span class="page-info"> Page {{ currentPage }} of {{ totalPages }} </span>
              <button
                pButton
                icon="pi pi-chevron-right"
                class="p-button-text"
                [disabled]="currentPage === totalPages"
                (click)="onPageChange(currentPage + 1)"
              ></button>
            </div>
          </div>
        </ng-template>
      </ng-container>
    </p-card>
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

      .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .empty-state {
        text-align: center;
        padding: 1rem;
        color: var(--text-secondary-color);
      }

      .footer-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .page-info {
        margin: 0 1rem;
      }
    `,
  ],
  standalone: true,
  imports: [Table, SelectItem],
})
export class PrimeNGDataTableComponent {
  @Input() title = '';
  @Input() data: any[] = [];
  @Input() visibleColumns: TableColumn[] = [];
  @Input() pageSize = 10;
  @Input() pageSizes: number[] = [5, 10, 20, 50];
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() loading = false;
  @Input() emptyMessage = 'No data available';
  @Input() showHeader = true;
  @Input() showPaginator = true;

  @Output() sortChange = new EventEmitter<any>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() pageChange = new EventEmitter<number>();

  onSort(event: any) {
    this.sortChange.emit(event);
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }
}
