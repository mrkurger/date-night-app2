import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 *
 */
@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [],
  template: `
    <button (click)="toggleFavorite()" [class.favorited]="isFavorite">
      {{ isFavorite ? '❤️' : '🤍' }}
    </button>
  `,
  styles: [
    `
      button {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
      }
      .favorited {
        color: red;
      }
    `,
  ],
})
export class FavoriteButtonComponent {
  @Input() isFavorite = false;
  @Output() favoriteToggled = new EventEmitter<boolean>();

  /**
   *
   */
  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    this.favoriteToggled.emit(this.isFavorite);
  }
}
