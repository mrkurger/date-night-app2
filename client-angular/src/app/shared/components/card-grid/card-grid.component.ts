import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule, NbSpinnerModule } from '@nebular/theme';

@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbSpinnerModule],
  template: `
    <div class="card-grid" [class.card-grid--loading]="loading">
      <div class="card-grid__container" [style.grid-template-columns]="gridColumns">
        <ng-content></ng-content>
      </div>

      <div class="card-grid__loading" *ngIf="loading">
        <nb-spinner size="large"></nb-spinner>
      </div>

      <div class="card-grid__empty" *ngIf="!loading && isEmpty">
        <ng-content select="[empty]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .card-grid {
        position: relative;
        min-height: 200px;
      }

      .card-grid__container {
        display: grid;
        gap: var(--card-margin);
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }

      .card-grid--loading .card-grid__container {
        opacity: 0.5;
        pointer-events: none;
      }

      .card-grid__loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      }

      .card-grid__empty {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        padding: var(--card-padding);
        text-align: center;
        color: var(--text-hint-color);
      }

      @media (max-width: 768px) {
        .card-grid__container {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CardGridComponent {
  @Input() loading = false;
  @Input() isEmpty = false;
  @Input() columns = 'auto-fill';
  @Input() minColumnWidth = '300px';

  get gridColumns(): string {
    if (this.columns === 'auto-fill') {
      return `repeat(auto-fill, minmax(${this.minColumnWidth}, 1fr))`;
    }
    return `repeat(${this.columns}, 1fr)`;
  }
}
