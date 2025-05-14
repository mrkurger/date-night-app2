import { NbIconModule } from '@nebular/theme';
import { NbSelectModule } from '@nebular/theme';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NbPaginationChangeEvent } from './nb-paginator.module';

@Component({
  selector: 'nb-paginator',
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbIconModule, NbSelectModule],
  template: `
    <div class="paginator-container">
      <div class="paginator-range-actions">
        <div class="paginator-range-label">
          {{ getRangeLabel() }}
        </div>

        <div class="paginator-navigation">
          <button
            nbButton
            ghost
            [disabled]="isFirstPage()"
            (click)="firstPage()"
            aria-label="First page"
          >
            <nb-icon icon="arrowhead-left-outline"></nb-icon>
          </button>

          <button
            nbButton
            ghost
            [disabled]="isFirstPage()"
            (click)="previousPage()"
            aria-label="Previous page"
          >
            <nb-icon icon="arrow-left-outline"></nb-icon>
          </button>

          <button
            nbButton
            ghost
            [disabled]="isLastPage()"
            (click)="nextPage()"
            aria-label="Next page"
          >
            <nb-icon icon="arrow-right-outline"></nb-icon>
          </button>

          <button
            nbButton
            ghost
            [disabled]="isLastPage()"
            (click)="lastPage()"
            aria-label="Last page"
          >
            <nb-icon icon="arrowhead-right-outline"></nb-icon>
          </button>
        </div>
      </div>

      <div class="paginator-page-size" *ngIf="pageSizeOptions.length > 0">
        <label for="pageSizeSelect">Items per page:</label>
        <nb-select
          id="pageSizeSelect"
          [(selected)]="pageSize"
          (selectedChange)="changePageSize($event)"
          size="small"
        >
          <nb-option *ngFor="let option of pageSizeOptions" [value]="option">
            {{ option }}
          </nb-option>
        </nb-select>
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

      .paginator-range-actions {
        display: flex;
        align-items: center;
      }

      .paginator-range-label {
        margin-right: 1rem;
      }

      .paginator-navigation {
        display: flex;
        align-items: center;
      }

      .paginator-navigation button {
        margin: 0 0.25rem;
      }

      .paginator-page-size {
        display: flex;
        align-items: center;
      }

      .paginator-page-size label {
        margin-right: 0.5rem;
      }
    `,
  ],
})
export class /*DEPRECATED:NbPaginatorComponent*/ implements OnInit {
  @Input() length: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [];
  @Input() page: number = 0;
  @Input() showFirstLastButtons: boolean = true;

  @Output() page$ = new EventEmitter<NbPaginationChangeEvent>();

  ngOnInit(): void {
    if (this.pageSizeOptions.length > 0 && !this.pageSizeOptions.includes(this.pageSize)) {
      this.pageSize = this.pageSizeOptions[0];
    }
  }

  nextPage(): void {
    if (!this.isLastPage()) {
      this.page++;
      this.emitPageEvent();
    }
  }

  previousPage(): void {
    if (!this.isFirstPage()) {
      this.page--;
      this.emitPageEvent();
    }
  }

  firstPage(): void {
    if (!this.isFirstPage()) {
      this.page = 0;
      this.emitPageEvent();
    }
  }

  lastPage(): void {
    const lastPageIndex = this.getNumberOfPages() - 1;
    if (this.page !== lastPageIndex) {
      this.page = lastPageIndex;
      this.emitPageEvent();
    }
  }

  changePageSize(pageSize: number): void {
    // When changing page size, keep the same data range visible
    const startIndex = this.page * this.pageSize;
    this.pageSize = pageSize;
    this.page = Math.floor(startIndex / pageSize);
    this.emitPageEvent();
  }

  getRangeLabel(): string {
    if (this.length === 0) {
      return '0 of 0';
    }

    const startIndex = this.page * this.pageSize + 1;
    const endIndex = Math.min(startIndex + this.pageSize - 1, this.length);
    return `${startIndex} - ${endIndex} of ${this.length}`;
  }

  private emitPageEvent(): void {
    this.page$.emit({
      page: this.page,
      pageSize: this.pageSize,
    });
  }

  isFirstPage(): boolean {
    return this.page === 0;
  }

  isLastPage(): boolean {
    return this.page === this.getNumberOfPages() - 1;
  }

  getNumberOfPages(): number {
    return Math.ceil(this.length / this.pageSize);
  }
}
