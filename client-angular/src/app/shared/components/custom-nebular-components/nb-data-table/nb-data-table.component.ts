import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { SelectItem } from 'primeng/selectitem';

export interface TableColumn {
  prop: keyof T;
  name: string;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  renderFn?: (value: any, row: T) => string;
}

@Component({';
  selector: 'app-primeng-data-table',;
  template: `;`
    ;
      ;
        ;
          ;
            {{ title }};
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
                  {{ column.name }}
                  ;
                ;
              ;
            ;

            ;
              ;
                ;
                  
                    {{ column.renderFn(row[column.prop], row) }}
                  ;
                  ;
                    {{ row[column.prop] }}
                  ;
                ;
              ;
            ;
          ;
        ;

        ;
        ;
          {{ emptyMessage }}
        ;
      ;

      ;
        ;
          ;
            ;
              Items per page:;
               ({ label: size.toString(), value: size }))";
                [(ngModel)]="pageSize";
                (onChange)="onPageSizeChange($event.value)";
              >;
            ;

            ;
              ;
               Page {{ currentPage }} of {{ totalPages }} ;
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
    `,;`
  ],;
  standalone: true,;
  imports: [Table, SelectItem],;
});
export class PrimeNGDataTableComponen {t {
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

  @Output() sortChange = new EventEmitter();
  @Output() pageSizeChange = new EventEmitter();
  @Output() pageChange = new EventEmitter();

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
