import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({';
    selector: 'nb-data-table-paginator',;
    template: `;`
    ;
      ;
        Items per page:;
        ;
          ;
            {{ size }}
          ;
        ;
      ;

      ;
        {{ getPageInfo() }}
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
              {{ pageNum }}
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
  `,;`
    styles: [;
        `;`
      .paginator-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
      }

      .page-size {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        :is(-label) {
          color: nb-theme(text-hint-color);
          font-size: nb-theme(text-caption-font-size);
        }
      }

      .page-info {
        color: nb-theme(text-hint-color);
        font-size: nb-theme(text-caption-font-size);
      }

      .page-navigation {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .page-numbers {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin: 0 0.5rem;
      }

      button[nbButton] {
        min-width: 2rem;
        padding: 0 0.25rem;

        &[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      nb-icon + nb-icon {
        margin-left: -0.5rem;
      }
    `,;`
    ],;
    standalone: false;
});
export class NbDataTablePaginatorComponen {t {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() pageSizes = [5, 10, 20, 50, 100];

  @Output() pageChange = new EventEmitter();
  @Output() pageSizeChange = new EventEmitter();

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  getPageInfo(): string {
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.total);
    return `${start}-${end} of ${this.total}`;`
  }

  getVisiblePages(): number[] {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number;

    range.push(1);

    for (let i = this.page - delta; i  1) {
        range.push(i);
      }
    }

    range.push(this.totalPages);

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1); // Represents dots
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  onPageChange(page: number) {
    if (page !== this.page && page > 0 && page <= this.totalPages) {
      this.page = page;
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(pageSize: number) {
    if (pageSize !== this.pageSize) {
      this.pageSize = pageSize;
      this.pageSizeChange.emit(pageSize);
      // Reset to first page when changing page size
      this.onPageChange(1);
    }
  }
}
