import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'nb-data-table-paginator',
    template: `
    <div class="paginator-container">
      <div class="page-size">
        <span class="page-size-label">Items per page:</span>
        <nb-select size="small" [(ngModel)]="pageSize" (selectedChange)="onPageSizeChange($event)">
          <nb-option *ngFor="let size of pageSizes" [value]="size">
            {{ size }}
          </nb-option>
        </nb-select>
      </div>

      <div class="page-info">
        {{ getPageInfo() }}
      </div>

      <div class="page-navigation">
        <button nbButton ghost size="small" [disabled]="page === 1" (click)="onPageChange(1)">
          <nb-icon icon="chevron-left-outline"></nb-icon>
          <nb-icon icon="chevron-left-outline"></nb-icon>
        </button>

        <button
          nbButton
          ghost
          size="small"
          [disabled]="page === 1"
          (click)="onPageChange(page - 1)"
        >
          <nb-icon icon="chevron-left-outline"></nb-icon>
        </button>

        <div class="page-numbers">
          <ng-container *ngFor="let pageNum of getVisiblePages()">
            <button
              nbButton
              [ghost]="pageNum !== page"
              [status]="pageNum === page ? 'primary' : 'basic'"
              size="small"
              (click)="onPageChange(pageNum)"
            >
              {{ pageNum }}
            </button>
          </ng-container>
        </div>

        <button
          nbButton
          ghost
          size="small"
          [disabled]="page === totalPages"
          (click)="onPageChange(page + 1)"
        >
          <nb-icon icon="chevron-right-outline"></nb-icon>
        </button>

        <button
          nbButton
          ghost
          size="small"
          [disabled]="page === totalPages"
          (click)="onPageChange(totalPages)"
        >
          <nb-icon icon="chevron-right-outline"></nb-icon>
          <nb-icon icon="chevron-right-outline"></nb-icon>
        </button>
      </div>
    </div>
  `,
    styles: [
        `
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
    `,
    ],
    standalone: false
})
export class NbDataTablePaginatorComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() pageSizes = [5, 10, 20, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  getPageInfo(): string {
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.total);
    return `${start}-${end} of ${this.total}`;
  }

  getVisiblePages(): number[] {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number;

    range.push(1);

    for (let i = this.page - delta; i <= this.page + delta; i++) {
      if (i < this.totalPages && i > 1) {
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
