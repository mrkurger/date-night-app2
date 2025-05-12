import { Component, EventEmitter, Input, Output, ViewEncapsulation, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbButtonModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';

// Interfaces
export interface NbSortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
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
  template: '<ng-content></ng-content>',
  styleUrls: ['./custom-nebular-components.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NbSortComponent {
  @Output() sortChange = new EventEmitter<NbSortEvent>();
  active: string = '';
  direction: 'asc' | 'desc' | '' = '';

  sort(id: string) {
    if (this.active === id) {
      this.direction = this.direction === 'asc' ? 'desc' : this.direction === 'desc' ? '' : 'asc';
    } else {
      this.active = id;
      this.direction = 'asc';
    }
    this.sortChange.emit({ active: this.active, direction: this.direction });
  }
}

@Component({
  selector: '[nb-sort-header]',
  template: `
    <div class="nb-sort-header-container" (click)="sort()">
      <ng-content></ng-content>
      <div class="nb-sort-header-arrow" *ngIf="sortComponent.active === id">
        <span
          class="nb-sort-header-pointer-left"
          [class.asc]="sortComponent.direction === 'asc'"
          [class.desc]="sortComponent.direction === 'desc'"
        ></span>
        <span
          class="nb-sort-header-pointer-right"
          [class.asc]="sortComponent.direction === 'asc'"
          [class.desc]="sortComponent.direction === 'desc'"
        ></span>
      </div>
    </div>
  `,
  styleUrls: ['./custom-nebular-components.scss'],
  host: {
    '[class.nb-sort-header-sorted]': 'sortComponent.active === id',
  },
})
export class NbSortHeaderComponent {
  @Input('nb-sort-header') id!: string;

  constructor(public sortComponent: NbSortComponent) {}

  sort() {
    this.sortComponent.sort(this.id);
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

// Modules
@NgModule({
  imports: [CommonModule, NbButtonModule, FormsModule],
  declarations: [NbSortComponent, NbSortHeaderComponent],
  exports: [NbSortComponent, NbSortHeaderComponent],
})
export class NbSortModule {}

@NgModule({
  imports: [CommonModule, NbButtonModule, FormsModule],
  declarations: [],
  exports: [NbPaginatorComponent],
})
export class NbPaginatorModule {}

@NgModule({
  imports: [CommonModule],
  declarations: [],
  exports: [NbDividerComponent],
})
export class NbDividerModule {}

// Main module that exports all components
@NgModule({
  imports: [
    CommonModule,
    NbButtonModule,
    FormsModule,
    NbSortModule,
    NbPaginatorModule,
    NbDividerModule,
  ],
  exports: [NbSortModule, NbPaginatorModule, NbDividerModule],
})
export class NbCustomComponentsModule {}
