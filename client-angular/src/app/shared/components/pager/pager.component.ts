import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { NbFormFieldModule } from '@nebular/theme';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbButtonModule,
  NbIconModule,
  NbSelectModule,
  NbFormFieldModule,
  NbSelectComponent,
} from '@nebular/theme';

/**
 * Pager Component
 *
 * A modern pagination component using Nebular UI components.
 * Features customizable appearance, size, and various navigation options.
 */
@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbIconModule, NbSelectModule, NbFormFieldModule],
  template: `
    <nav
      class="pager"
      [class]="'pager--' + style + ' pager--' + size + ' pager--' + align"
      aria-label="pagination"
    >
      <!-- Page Size Selector -->
      <nb-form-field *ngIf="showPageSize" class="pager__size-select">
        <nb-select
          [selected]="pageSize"
          (selectedChange)="onPageSizeChange($event)"
          [size]="size"
          shape="semi-round"
        >
          <nb-option *ngFor="let size of pageSizes" [value]="size"> {{ size }} per page </nb-option>
        </nb-select>
      </nb-form-field>

      <!-- First Page Button -->
      <button
        *ngIf="showFirstLast && style !== 'simple'"
        nbButton
        ghost
        [size]="size"
        [disabled]="currentPage === 1"
        (click)="goToPage(1)"
        aria-label="First page"
      >
        <nb-icon icon="arrow-ios-double-left-outline"></nb-icon>
      </button>

      <!-- Previous Page Button -->
      <button
        *ngIf="showPrevNext"
        nbButton
        ghost
        [size]="size"
        [disabled]="currentPage === 1"
        (click)="goToPage(currentPage - 1)"
        aria-label="Previous page"
      >
        <nb-icon icon="arrow-ios-back-outline"></nb-icon>
      </button>

      <!-- Page Numbers -->
      <ng-container *ngIf="style !== 'simple'">
        <button
          *ngFor="let page of visiblePages"
          nbButton
          [ghost]="page !== currentPage"
          [status]="page === currentPage ? 'primary' : 'basic'"
          [size]="size"
          (click)="goToPage(page)"
          [attr.aria-current]="page === currentPage ? 'page' : null"
          [attr.aria-label]="'Page ' + page"
        >
          {{ page }}
        </button>
      </ng-container>

      <!-- Current/Total Pages Display (Simple Style) -->
      <span *ngIf="style === 'simple'" class="pager__info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>

      <!-- Next Page Button -->
      <button
        *ngIf="showPrevNext"
        nbButton
        ghost
        [size]="size"
        [disabled]="currentPage === totalPages"
        (click)="goToPage(currentPage + 1)"
        aria-label="Next page"
      >
        <nb-icon icon="arrow-ios-forward-outline"></nb-icon>
      </button>

      <!-- Last Page Button -->
      <button
        *ngIf="showFirstLast && style !== 'simple'"
        nbButton
        ghost
        [size]="size"
        [disabled]="currentPage === totalPages"
        (click)="goToPage(totalPages)"
        aria-label="Last page"
      >
        <nb-icon icon="arrow-ios-double-right-outline"></nb-icon>
      </button>
    </nav>
  `,
  styles: [
    `
      .pager {
        display: flex;
        align-items: center;
        gap: nb-theme(spacing-2);

        // Alignment variations
        &--left {
          justify-content: flex-start;
        }

        &--center {
          justify-content: center;
        }

        &--right {
          justify-content: flex-end;
        }

        // Style variations
        &--simple {
          .pager__info {
            color: nb-theme(text-hint-color);
            font-size: nb-theme(text-subtitle-2-font-size);
          }
        }

        &--compact {
          button {
            padding: 0 nb-theme(spacing-2);
          }
        }

        // Size variations
        &--small {
          font-size: nb-theme(text-button-small-font-size);

          .pager__info {
            font-size: nb-theme(text-caption-font-size);
          }
        }

        &--medium {
          font-size: nb-theme(text-button-medium-font-size);
        }

        &--large {
          font-size: nb-theme(text-button-large-font-size);

          .pager__info {
            font-size: nb-theme(text-subtitle-font-size);
          }
        }

        &__size-select {
          margin-right: nb-theme(spacing-3);
        }

        // Dark theme adjustments
        :host-context([data-theme='dark']) & {
          .pager__info {
            color: nb-theme(text-hint-color);
          }
        }
      }
    `,
  ],
})
export class PagerComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() maxVisiblePages = 5;
  @Input() showFirstLast = true;
  @Input() showPrevNext = true;
  @Input() showPageSize = false;
  @Input() pageSizes: number[] = [10, 25, 50, 100];
  @Input() pageSize = 10;
  @Input() style: 'default' | 'simple' | 'compact' = 'default';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() align: 'left' | 'center' | 'right' = 'center';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  visiblePages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['totalPages'] || changes['maxVisiblePages']) {
      this.calculateVisiblePages();
    }
  }

  /**
   * Calculate the visible page numbers based on the current page and total pages
   */
  calculateVisiblePages(): void {
    if (this.totalPages <= this.maxVisiblePages) {
      this.visiblePages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      const halfVisible = Math.floor(this.maxVisiblePages / 2);
      let start = Math.max(this.currentPage - halfVisible, 1);
      const end = Math.min(start + this.maxVisiblePages - 1, this.totalPages);

      if (end === this.totalPages) {
        start = Math.max(end - this.maxVisiblePages + 1, 1);
      }

      this.visiblePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  }

  /**
   * Go to a specific page
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.pageChange.emit(page);
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(newSize: number): void {
    if (newSize !== this.pageSize) {
      this.pageSizeChange.emit(newSize);
    }
  }
}
