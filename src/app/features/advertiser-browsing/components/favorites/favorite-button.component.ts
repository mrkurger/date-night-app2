import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="toggleFavorite($event)"
      class="rounded-full p-2 bg-black/50 hover:bg-black/70 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
      [class.text-pink-500]="isFavorite"
      [class.text-gray-400]="!isFavorite"
      [attr.aria-label]="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      [attr.aria-pressed]="isFavorite"
      tabindex="0"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        [class.fill-current]="isFavorite"
        [class.stroke-current]="!isFavorite"
        class="w-5 h-5"
        [class.fill-none]="!isFavorite"
        stroke-width="2"
        role="img"
        [attr.aria-label]="isFavorite ? 'Filled heart icon' : 'Heart outline icon'"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </button>
  `,
  styles: [
    `
      @media (prefers-reduced-motion: reduce) {
        .transition-colors {
          transition: none;
        }
      }
    `,
  ],
})
export class FavoriteButtonComponent {
  @Input() advertiserId!: number;
  isFavorite = false;

  toggleFavorite(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isFavorite = !this.isFavorite;
    // Here you would typically call a service to update the favorite status
  }
}
