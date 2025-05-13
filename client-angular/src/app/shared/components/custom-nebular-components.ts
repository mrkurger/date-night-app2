import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NbButtonModule,
  NbSortDirection,
  NbSortRequest,
  NbTreeGridDataSource,
  NbSortDirective,
  NbTreeGridComponent,
} from '@nebular/theme';
import { FormsModule } from '@angular/forms';

// Interfaces
export interface NbSortEvent {
  column: string;
  direction: NbSortDirection;
}

// Components
@Component({
  selector: 'nb-paginator',
  standalone: true,
  imports: [CommonModule, NbButtonModule, FormsModule],
  template: `
    <div class="nb-paginator-container">
      <div class="nb-paginator-size" *ngIf="showPageSize">
        <select [value]="pageSize" (change)="onPageSizeChange($event)">
          <option *ngFor="let size of pageSizeOptions" [value]="size">
            {{ size }} items per page
          </option>
        </select>
      </div>
      <div class="nb-paginator-range">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(page * pageSize, total) }} of {{ total }}
      </div>
      <div class="nb-paginator-navigation">
        <button nbButton status="basic" [disabled]="page === 1" (click)="onPrevious()">
          Previous
        </button>
        <button nbButton status="basic" [disabled]="page >= totalPages()" (click)="onNext()">
          Next
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./custom-nebular-components.scss'],
})
export class NbPaginatorComponent {
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() showPageSize: boolean = true;
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  protected Math = Math;

  totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  onPrevious(): void {
    if (this.page > 1) {
      this.page--;
      this.pageChange.emit(this.page);
    }
  }

  onNext(): void {
    if (this.page < this.totalPages()) {
      this.page++;
      this.pageChange.emit(this.page);
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.pageSizeChange.emit(this.pageSize);
    // Reset to first page when changing page size
    this.page = 1;
    this.pageChange.emit(this.page);
  }
}

@Component({
  selector: 'nb-sort',
  standalone: true,
  imports: [CommonModule],
  template: '<ng-content></ng-content>',
  styleUrls: ['./custom-nebular-components.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NbSortComponent {
  @Output() sortChange = new EventEmitter<NbSortRequest>();
  sortColumn: string = '';
  sortDirection: NbSortDirection = NbSortDirection.NONE;

  sort(request: NbSortRequest): void {
    this.sortColumn = request.column;
    this.sortDirection = request.direction;
    this.sortChange.emit(request);
  }
}

@Component({
  selector: '[nb-sort-header]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nb-sort-header-container" (click)="sortData()">
      <ng-content></ng-content>
      <div class="nb-sort-header-arrow" *ngIf="isCurrentSortColumn()">
        <span
          class="nb-sort-header-pointer-left"
          [class.asc]="currentDirection === NbSortDirection.ASCENDING"
          [class.desc]="currentDirection === NbSortDirection.DESCENDING"
        ></span>
        <span
          class="nb-sort-header-pointer-right"
          [class.asc]="currentDirection === NbSortDirection.ASCENDING"
          [class.desc]="currentDirection === NbSortDirection.DESCENDING"
        ></span>
      </div>
    </div>
  `,
  styleUrls: ['./custom-nebular-components.scss'],
})
export class NbSortHeaderComponent {
  @Input('nb-sort-header') column!: string;
  protected NbSortDirection = NbSortDirection;

  constructor(private sortComponent: NbSortComponent) {}

  sortData(): void {
    const direction = this.getNextDirection();
    this.sortComponent.sort({ column: this.column, direction });
  }

  isCurrentSortColumn(): boolean {
    return this.sortComponent.sortColumn === this.column;
  }

  get currentDirection(): NbSortDirection {
    return this.isCurrentSortColumn() ? this.sortComponent.sortDirection : NbSortDirection.NONE;
  }

  private getNextDirection(): NbSortDirection {
    if (!this.isCurrentSortColumn() || this.currentDirection === NbSortDirection.NONE) {
      return NbSortDirection.ASCENDING;
    }
    return this.currentDirection === NbSortDirection.ASCENDING
      ? NbSortDirection.DESCENDING
      : NbSortDirection.NONE;
  }
}

@Component({
  selector: 'nb-divider',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="nb-divider" [class.vertical]="vertical"></div>`,
  styleUrls: ['./custom-nebular-components.scss'],
})
export class NbDividerComponent {
  @Input() vertical: boolean = false;
}
