import { NbIconModule } from '@nebular/theme';
import { EventEmitter, Output, Input, Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, NbIconModule, NbTooltipModule],
  template: `
    <div class="star-rating" [class.small]="small" [class.readonly]="readonly">
      <span
        *ngFor="let star of stars; let i = index"
        class="star"
        [class.filled]="star.filled"
        [class.half]="star.half"
        (click)="onRatingChange(i + 1)"
        (mouseenter)="onStarHover(i + 1)"
        (mouseleave)="onStarLeave()"
        [nbTooltip]="getTooltip(i + 1)"
      >
        <nb-icon *ngIf="star.filled" icon="star"></nb-icon>
        <nb-icon *ngIf="star.half" icon="star-half-2"></nb-icon>
        <nb-icon *ngIf="!star.filled && !star.half" icon="star-outline"></nb-icon>
      </span>

      <span class="rating-text" *ngIf="showRatingText">
        {{ rating | number: '1.1-1' }}
      </span>
    </div>
  `,
  styles: [
    `
      .star-rating {
        display: inline-flex;
        align-items: center;
      }

      .star {
        cursor: pointer;
        color: var(--color-warning-500);
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
        color: var(--text-basic-color);
      }
    `,
  ],
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() readonly = false;
  @Input() small = false;
  @Input() showRatingText = false;
  @Output() ratingChange = new EventEmitter<number>();

  private hoveredRating: number | null = null;

  get stars(): { filled: boolean; half: boolean }[] {
    const rating = this.hoveredRating ?? this.rating;
    return Array(5)
      .fill(0)
      .map((_, index) => {
        const position = index + 1;
        return {
          filled: rating >= position,
          half: rating + 0.5 >= position && rating < position,
        };
      });
  }

  onRatingChange(rating: number): void {
    if (!this.readonly) {
      this.rating = rating;
      this.ratingChange.emit(rating);
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
    return `Rate ${rating} star${rating !== 1 ? 's' : ''}`;
  }
}
