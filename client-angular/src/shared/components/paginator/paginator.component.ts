import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NbPaginatorComponent } from '../../../app/shared/components/custom-nebular-components';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'nb-paginator',
  standalone: true,
  imports: [CommonModule, NbPaginatorComponent],
  template: `
    <div class="paginator-container">
      <button nbButton status="basic" [disabled]="page === 1" (click)="onPrevious()">
        Previous
      </button>
      <span class="page-info"> Page {{ page }} of {{ totalPages() }} </span>
      <button nbButton status="basic" [disabled]="page >= totalPages()" (click)="onNext()">
        Next
      </button>
    </div>
  `,
  styles: `
    .paginator-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 1rem 0;
    }
    .page-info {
      margin: 0 1rem;
    }
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NbPaginatorComponent {
  @Input() pageSize: number = 10;
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Output() pageChange = new EventEmitter<number>();

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
}
