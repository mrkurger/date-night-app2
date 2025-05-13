import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbIconModule } from '@nebular/theme';
import { NbSortEvent } from './nb-sort.module';

@Component({
  selector: 'nb-sort',
  standalone: true,
  template: `<ng-content></ng-content>`,
})
export class NbSortComponent {
  @Input() active: string = '';
  @Input() direction: 'asc' | 'desc' | '' = '';
  @Output() sortChange = new EventEmitter<NbSortEvent>();

  sort(sortEvent: NbSortEvent): void {
    this.active = sortEvent.active;
    this.direction = sortEvent.direction;
    this.sortChange.emit(sortEvent);
  }
}

@Component({
  selector: 'nb-sort-header',
  standalone: true,
  imports: [CommonModule, NbIconModule],
  template: `
    <div class="nb-sort-header" (click)="toggleSort()" [class.nb-sort-header-sorted]="active">
      <ng-content></ng-content>
      <nb-icon
        *ngIf="active"
        [icon]="direction === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline'"
        class="nb-sort-header-icon"
      ></nb-icon>
    </div>
  `,
  styles: [
    `
      .nb-sort-header {
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      .nb-sort-header-icon {
        margin-left: 0.5rem;
        font-size: 0.875rem;
      }

      .nb-sort-header-sorted {
        font-weight: bold;
      }
    `,
  ],
})
export class NbSortHeaderComponent {
  @Input() nbSortHeaderId!: string;

  get active(): boolean {
    return this.sort.active === this.nbSortHeaderId;
  }

  get direction(): 'asc' | 'desc' | '' {
    return this.active ? this.sort.direction : '';
  }

  constructor(private sort: NbSortComponent) {}

  toggleSort(): void {
    const newDirection = this.getNextSortDirection();
    this.sort.sort({
      active: this.nbSortHeaderId,
      direction: newDirection,
    });
  }

  private getNextSortDirection(): 'asc' | 'desc' | '' {
    if (!this.active) {
      return 'asc';
    }

    switch (this.direction) {
      case 'asc':
        return 'desc';
      case 'desc':
        return '';
      default:
        return 'asc';
    }
  }
}
