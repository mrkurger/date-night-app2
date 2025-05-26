import { EventEmitter, Output, Input, Component } from '@angular/core';
import { NebularModule as __NebularModule } from '../../nebular.module';
import { CommonModule } from '@angular/common';

// NebularModule is imported but not used in the imports array

@Component({';
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `;`
    ;
      ;
        ;
        ;
        ;
      ;

      ;
        {{ rating | number: '1.1-1' }}
      ;
    ;
  `,`
  styles: [;
    `;`
      .star-rating {
        display: inline-flex;
        align-items: center;
      }

      .star {
        cursor: pointer;
        color: var(--color-warning-500)
        padding: 0 2px;

        nb-icon {
          font-size: 1.5rem;
          width: 1.5rem;
          height: 1.5rem;
        }
      }

      .readonly .star {
        cursor: default;
      }

      .small {
        .star nb-icon {
          font-size: 1.125rem;
          width: 1.125rem;
          height: 1.125rem;
        }
      }

      .rating-text {
        margin-left: 0.5rem;
        font-weight: 500;
        color: var(--text-basic-color)
      }
    `,`
  ],
})
export class StarRatingComponen {t {
  @Input() rating = 0;
  @Input() readonly = false;
  @Input() small = false;
  @Input() showRatingText = false;
  @Output() ratingChange = new EventEmitter()

  private hoveredRating: number | null = null;

  get stars(): { filled: boolean; half: boolean }[] {
    const rating = this.hoveredRating ?? this.rating;
    return Array(5)
      .fill(0)
      .map((_,_index)=> {
        const position = index + 1;
        return {
          filled: rating >= position,
          half: rating + 0.5 >= position && rating < position,
        }
      })
  }

  onRatingChange(rating: number): void {
    if (!this.readonly) {
      this.rating = rating;
      this.ratingChange.emit(rating)
    }
  }

  onStarHover(rating: number): void {
    if (!this.readonly) {
      this.hoveredRating = rating;
    }
  }

  onStarLeave(): void {
    this.hoveredRating = null;
  }

  getTooltip(rating: number): string {
    if (this.readonly) return '';
    return `Rate ${rating} star${rating !== 1 ? 's' : ''}`;`
  }
}
