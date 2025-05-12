import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  AfterContentInit,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import {
  NbSortComponent,
  NbSortHeaderComponent,
  NbSortEvent,
} from '../../../app/shared/components/custom-nebular-components';

import { CommonModule } from '@angular/common';
import { NbButtonModule } from '@nebular/theme';

export interface NbSortEvent {
  active: string;
  direction: 'asc' | 'desc' | '';
}

@Component({
  selector: '[nbSort]',
  standalone: true,
  imports: [CommonModule, NbButtonModule, NbSortComponent, NbSortHeaderComponent, NbSortEvent],
  template: `<ng-content></ng-content>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NbSortComponent {
  @Input() active: string = '';
  @Input() direction: 'asc' | 'desc' | '' = '';
  @Output() sortChange = new EventEmitter<NbSortEvent>();

  sort(column: string): void {
    if (this.active === column) {
      this.direction = this.direction === 'asc' ? 'desc' : this.direction === 'desc' ? '' : 'asc';
    } else {
      this.active = column;
      this.direction = 'asc';
    }

    this.sortChange.emit({ active: this.active, direction: this.direction });
  }
}

@Component({
  selector: '[nbSortHeader]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nb-sort-header-container" (click)="sort()">
      <ng-content></ng-content>
      <div class="nb-sort-header-arrow" *ngIf="sorted">
        <span class="nb-sort-header-indicator" [class.asc]="ascending" [class.desc]="descending">
          {{ ascending ? '↑' : '↓' }}
        </span>
      </div>
    </div>
  `,
  styles: `
    .nb-sort-header-container {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .nb-sort-header-arrow {
      margin-left: 6px;
    }
  `,
})
export class NbSortHeaderComponent {
  @Input() nbSortHeader: string = '';

  constructor(private sort: NbSortComponent) {}

  get sorted(): boolean {
    return this.sort.active === this.nbSortHeader && this.sort.direction !== '';
  }

  get ascending(): boolean {
    return this.sort.active === this.nbSortHeader && this.sort.direction === 'asc';
  }

  get descending(): boolean {
    return this.sort.active === this.nbSortHeader && this.sort.direction === 'desc';
  }

  sort(): void {
    this.sort.sort(this.nbSortHeader);
  }
}

export const NbSortModule = {
  declarations: [NbSortComponent, NbSortHeaderComponent],
  exports: [NbSortComponent, NbSortHeaderComponent],
};
