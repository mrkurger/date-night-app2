// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (star-rating.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { NbIconModule, NbTooltipModule } from '@nebular/theme';

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
        <nb-icon *ngIf="star.filled">star</nb-icon>
        <nb-icon *ngIf="star.half">star_half</nb-icon>
        <nb-icon *ngIf="!star.filled && !star.half">star_border</nb-icon>
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
        color: #ffd740;
      }

      .star mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .readonly .star {
        cursor: default;
      }

      .small .star mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .rating-text {
        margin-left: 8px;
        font-weight: 500;
        color: #333;
      }
    `,
  ],
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() readonly = false;
  @Input() small = false;
  @Input() showRatingText = false;
  @Input() allowHalfStars = true;

  @Output() ratingChange = new EventEmitter<number>();

  stars: { filled: boolean; half: boolean }[] = [];
  hoverRating: number | null = null;

  private readonly ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  ngOnInit(): void {
    this.updateStars();
  }

  ngOnChanges(): void {
    this.updateStars();
  }

  onRatingChange(rating: number): void {
    if (this.readonly) return;

    this.rating = rating;
    this.ratingChange.emit(rating);
    this.updateStars();
  }

  onStarHover(rating: number): void {
    if (this.readonly) return;

    this.hoverRating = rating;
    this.updateStarsForHover();
  }

  onStarLeave(): void {
    if (this.readonly) return;

    this.hoverRating = null;
    this.updateStars();
  }

  getTooltip(index: number): string {
    return this.ratingLabels[index - 1] || '';
  }

  private updateStars(): void {
    this.stars = [];

    for (let i = 1; i <= 5; i++) {
      const filled = i <= Math.floor(this.rating);
      const half = this.allowHalfStars && i === Math.ceil(this.rating) && this.rating % 1 !== 0;

      this.stars.push({ filled, half });
    }
  }

  private updateStarsForHover(): void {
    if (this.hoverRating === null) {
      this.updateStars();
      return;
    }

    this.stars = [];

    for (let i = 1; i <= 5; i++) {
      const filled = i <= this.hoverRating;
      const half = false; // No half stars on hover

      this.stars.push({ filled, half });
    }
  }
}
