import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NbSortDirection, NbSortRequest } from '@nebular/theme';

@Component({
    selector: 'nb-data-table-sort',
    template: `
    <div class="sort-header" [class.active]="isActive" (click)="toggleSort()">
      <span class="sort-title">{{ title }}</span>
      <nb-icon [icon]="getSortIcon()" [class.visible]="isActive" class="sort-icon"></nb-icon>
    </div>
  `,
    styles: [
        `
      .sort-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        user-select: none;
        transition: color 0.2s;

        &:hover {
          color: nb-theme(text-primary-color);
        }

        &.active {
          color: nb-theme(text-primary-color);
        }
      }

      .sort-title {
        flex: 1;
      }

      .sort-icon {
        font-size: 1rem;
        opacity: 0;
        transition: opacity 0.2s;

        &.visible {
          opacity: 1;
        }
      }
    `,
    ],
    standalone: false
})
export class NbDataTableSortComponent {
  @Input() title = '';
  @Input() column = '';
  @Input() direction: NbSortDirection = NbSortDirection.NONE;
  @Input() isActive = false;

  @Output() sort = new EventEmitter<NbSortRequest>();

  toggleSort() {
    const directions: NbSortDirection[] = [
      NbSortDirection.NONE,
      'asc' as NbSortDirection,
      'desc' as NbSortDirection,
    ];
    const currentIndex = directions.indexOf(this.direction);
    const nextIndex = (currentIndex + 1) % directions.length;
    this.direction = directions[nextIndex];

    this.sort.emit({
      column: this.column,
      direction: this.direction,
    });
  }

  getSortIcon(): string {
    switch (this.direction) {
      case 'asc':
        return 'arrow-upward-outline';
      case 'desc':
        return 'arrow-downward-outline';
      default:
        return 'arrow-ios-upward-outline';
    }
  }
}
