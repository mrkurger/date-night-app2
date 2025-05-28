import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppSortEvent } from './nb-sort.module';
import { NebularModule } from '../../../nebular.module';

// Refactored: Custom sort component (was /*DEPRECATED:NbSortComponent*/)
/**
 *
 */
@Component({
  selector: 'app-sort',
  standalone: true,
  template: ``
})
export class AppSortComponent {
  @Input() active: string = '';
  @Input() direction: 'asc' | 'desc' | '' = '';
  @Output() sortChange = new EventEmitter<AppSortEvent>();

  /**
   *
   */
  sort(sortEvent: AppSortEvent): void {
    this.active = sortEvent.active;
    this.direction = sortEvent.direction;
    this.sortChange.emit(sortEvent);
  }
}

// Refactored: Custom sort header component (was /*DEPRECATED:NbSortHeaderComponent*/)
/**
 *
 */
@Component({
  selector: 'app-sort-header',
  imports: [CommonModule],
  template: `
    <div class="app-sort-header" (click)="toggleSort()">
      <ng-content></ng-content>
      <span class="app-sort-header-icon" *ngIf="active">
        {{ direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '' }}
      </span>
    </div>
  `,
  styles: [
    `
      .app-sort-header {
        cursor: pointer;
        display: flex;
        align-items: center;
      }

      .app-sort-header-icon {
        margin-left: 0.5rem;
        font-size: 0.875rem;
      }

      .app-sort-header-sorted {
        font-weight: bold;
      }
    `,
  ]
})
export class AppSortHeaderComponent {
  @Input() appSortHeaderId!: string;

  /**
   *
   */
  get active(): boolean {
    return this.sort.active === this.appSortHeaderId;
  }

  /**
   *
   */
  get direction(): 'asc' | 'desc' | '' {
    return this.active ? this.sort.direction : '';
  }

  /**
   *
   */
  constructor(private readonly sort: AppSortComponent) {}

  /**
   *
   */
  toggleSort(): void {
    const newDirection = this.getNextSortDirection();
    this.sort.sort({
      active: this.appSortHeaderId,
      direction: newDirection
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
