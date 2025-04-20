// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (pager.component)
//
// COMMON CUSTOMIZATIONS:
// - MAX_VISIBLE_PAGES: Maximum number of page buttons to show (default: 5)
//   Related to: pager.component.html
// - SHOW_FIRST_LAST: Whether to show first/last page buttons (default: true)
//   Related to: pager.component.html
// ===================================================
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Emerald Pager Component
 *
 * A pagination component for navigating through pages of results.
 * This component provides a flexible pagination system with various styles and options.
 *
 * Documentation: https://docs-emerald.condorlabs.io/Pager
 */
@Component({
  selector: 'emerald-pager',
  templateUrl: './pager.component.html',
  styleUrls: ['./pager.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class PagerComponent implements OnChanges {
  /**
   * The current page number (1-based)
   */
  @Input() currentPage = 1;

  /**
   * The total number of pages
   */
  @Input() totalPages = 1;

  /**
   * The maximum number of page buttons to show
   */
  @Input() maxVisiblePages = 5;

  /**
   * Whether to show first/last page buttons
   */
  @Input() showFirstLast = true;

  /**
   * Whether to show previous/next page buttons
   */
  @Input() showPrevNext = true;

  /**
   * Whether to show the page size selector
   */
  @Input() showPageSize = false;

  /**
   * The available page sizes
   */
  @Input() pageSizes: number[] = [10, 25, 50, 100];

  /**
   * The current page size
   */
  @Input() pageSize = 10;

  /**
   * The style of the pager
   * - 'default': Standard pagination with page numbers
   * - 'simple': Simple previous/next buttons
   * - 'compact': Compact pagination with limited page numbers
   */
  @Input() style: 'default' | 'simple' | 'compact' = 'default';

  /**
   * The size of the pager
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * The alignment of the pager
   */
  @Input() align: 'left' | 'center' | 'right' = 'center';

  /**
   * Emitted when the page changes
   */
  @Output() pageChange = new EventEmitter<number>();

  /**
   * Emitted when the page size changes
   */
  @Output() pageSizeChange = new EventEmitter<number>();

  /**
   * The array of visible page numbers
   */
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
      // If total pages is less than or equal to max visible pages, show all pages
      this.visiblePages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      // Calculate the range of visible pages
      const halfVisible = Math.floor(this.maxVisiblePages / 2);
      let start = Math.max(this.currentPage - halfVisible, 1);
      const end = Math.min(start + this.maxVisiblePages - 1, this.totalPages);

      // Adjust start if end is at max
      if (end === this.totalPages) {
        start = Math.max(end - this.maxVisiblePages + 1, 1);
      }

      // Create the array of visible pages
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
   * Go to the previous page
   */
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Go to the next page
   */
  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Go to the first page
   */
  goToFirstPage(): void {
    if (this.currentPage !== 1) {
      this.goToPage(1);
    }
  }

  /**
   * Go to the last page
   */
  goToLastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.goToPage(this.totalPages);
    }
  }

  /**
   * Change the page size
   */
  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newPageSize = parseInt(select.value, 10);

    if (newPageSize !== this.pageSize) {
      this.pageSizeChange.emit(newPageSize);
    }
  }
}
