import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbPaginationChangeEvent } from './nb-paginator.module';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginatorstate';

@Component({
  selector: 'nb-paginator',
  imports: [CommonModule, PaginatorModule],
  template: `
    <p-paginator
      (onPageChange)="onPrimePageChange($event)"
      [first]="page * pageSize"
      [rows]="pageSize"
      [totalRecords]="length"
      [rowsPerPageOptions]="pageSizeOptions"
      [showFirstLastIcon]="showFirstLastButtons"
      [showPageLinks]="true"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="{first} - {last} of {totalRecords}"
    ></p-paginator>
  `,
  styles: [
    `
      :host ::ng-deep .p-paginator {
        padding: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `,
  ],
})
export class NbPaginatorComponent implements OnInit {
  @Input() length: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [];
  @Input() page: number = 0;
  @Input() showFirstLastButtons: boolean = true;

  @Output() page$ = new EventEmitter<NbPaginationChangeEvent>();

  ngOnInit(): void {
    if (this.pageSizeOptions.length > 0 && !this.pageSizeOptions.includes(this.pageSize)) {
      if (this.pageSizeOptions.includes(10)) {
        this.pageSize = 10;
      } else {
        this.pageSize = this.pageSizeOptions[0];
      }
    }
    if (this.page < 0) {
      this.page = 0;
    }
    const maxPage = this.getNumberOfPages() - 1;
    if (this.page > maxPage && maxPage >= 0) {
      this.page = maxPage;
    }
  }

  onPrimePageChange(event: PaginatorState): void {
    this.page = event.page !== undefined ? event.page : 0;
    this.pageSize = event.rows !== undefined ? event.rows : 10;

    this.page$.emit({
      page: this.page,
      pageSize: this.pageSize,
    });
  }

  private getNumberOfPages(): number {
    if (!this.pageSize || this.pageSize === 0) return 0;
    return Math.ceil(this.length / this.pageSize);
  }
}
