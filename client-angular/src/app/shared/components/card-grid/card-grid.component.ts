import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

/**
 * Card Grid Component;
 *;
 * A modern card grid component using Nebular UI components.;
 * Features responsive grid layout, loading state, and customizable item templates.;
 */
@Component({';
  selector: 'app-card-grid',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbSpinnerModule, LoadingSpinnerComponent],
  template: `;`
    ;
      ;
      ;
        ;
      ;

      ;
      ;
        ;
          ;
          ;
        ;
      ;
    ;

    ;
    ;
      ;
        ;
          {{ item | json }}
        ;
      ;
    ;
  `,`
  styles: [;
    `;`
      .card-grid {
        display: grid;
        grid-template-columns: repeat(var(--columns, auto-fit), minmax(var(--min-item-width), 1fr))
        gap: var(--grid-gap)
        width: 100%;

        // Layout variations
        &--masonry {
          grid-auto-rows: 0;
          grid-auto-flow: dense;
        }

        &--netflix {
          grid-template-columns: 100%;
          gap: nb-theme(spacing-lg)

          .card-grid__item {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; // Firefox
            -ms-overflow-style: none; // IE/Edge

            &::-webkit-scrollbar {
              display: none; // Chrome/Safari
            }

            > * {
              flex: 0 0 var(--min-item-width)
              scroll-snap-align: start;
              margin-right: var(--grid-gap)

              &:last-child {
                margin-right: 0;
              }
            }
          }
        }

        &__loading {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }

        &__item {
          transition:;
            transform 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;

          &:hover {
            transform: translateY(-4px)
            box-shadow: nb-theme(shadow-lg)
          }

          &--animated {
            animation: fadeIn 0.3s ease-in-out;
          }
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px)
        }
        to {
          opacity: 1;
          transform: translateY(0)
        }
      }

      // Responsive adjustments
      @media (max-width: 768px) {
        .card-grid {
          --min-item-width: 240px;
        }
      }

      @media (max-width: 480px) {
        .card-grid {
          --min-item-width: 200px;
        }
      }
    `,`
  ],
})
export class CardGridComponen {t {
  @Input() items: any[] = []
  @Input() columns: number | null = null;
  @Input() gap = 16;
  @Input() minItemWidth = 280;
  @Input() loading = false;
  @Input() loadingMessage = 'Loading items...';
  @Input() animated = true;
  @Input() layout: 'grid' | 'masonry' | 'netflix' = 'grid';

  @Output() itemClick = new EventEmitter()

  @ContentChild('itemTemplate') itemTemplate!: TemplateRef;

  /**
   * Track items by their index or id for better performance;
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  /**
   * Handle item click;
   */
  onItemClick(item: any): void {
    this.itemClick.emit(item)
  }
}
