import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton Loader Component
 *
 * A modern skeleton loader component for content placeholders.
 * Features customizable appearance, animation, and various shapes.
 */
@Component({
    selector: 'app-skeleton',
    imports: [CommonModule],
    template: `
    <div
      class="skeleton"
      [class]="'skeleton--' + variant"
      [style.width]="width"
      [style.height]="height"
      [class.skeleton--animated]="animated"
    >
      <div
        *ngFor="let i of getArray(); trackBy: trackByFn"
        class="skeleton__item"
        [class]="'skeleton__item--' + type"
        [style.width]="itemWidth"
        [style.height]="itemHeight"
      ></div>
    </div>
  `,
    styles: [
        `
      .skeleton {
        display: flex;
        flex-direction: column;
        gap: nb-theme(spacing-2);
      }

      /* Variants */
      .skeleton--text .skeleton__item {
        border-radius: nb-theme(border-radius);
      }

      .skeleton--card .skeleton__item {
        border-radius: nb-theme(card-border-radius);
      }

      .skeleton--circle .skeleton__item {
        border-radius: 50%;
      }

      /* Animation */
      .skeleton--animated .skeleton__item {
        background: linear-gradient(
          90deg,
          nb-theme(background-basic-color-2) 25%,
          nb-theme(background-basic-color-3) 37%,
          nb-theme(background-basic-color-2) 63%
        );
        background-size: 400% 100%;
        animation: skeleton-loading 1.4s ease infinite;
      }

      .skeleton__item {
        background-color: nb-theme(background-basic-color-2);
      }

      /* Types */
      .skeleton__item--text {
        height: 1em;
      }

      .skeleton__item--text:last-child {
        width: 80%;
      }

      .skeleton__item--title {
        height: 1.5em;
        margin-bottom: nb-theme(spacing-2);
      }

      .skeleton__item--avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .skeleton__item--thumbnail {
        width: 100px;
        height: 100px;
      }

      .skeleton__item--button {
        height: 2.25rem;
        width: 100px;
        border-radius: nb-theme(button-rectangle-border-radius);
      }

      @keyframes skeleton-loading {
        0% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0 50%;
        }
      }

      /* Dark theme adjustments */
      :host-context([data-theme='dark']) .skeleton--animated .skeleton__item {
        background: linear-gradient(
          90deg,
          nb-theme(background-basic-color-3) 25%,
          nb-theme(background-basic-color-4) 37%,
          nb-theme(background-basic-color-3) 63%
        );
      }

      :host-context([data-theme='dark']) .skeleton__item {
        background-color: nb-theme(background-basic-color-3);
      }
    `,
    ]
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'title' | 'avatar' | 'thumbnail' | 'button' = 'text';
  @Input() variant: 'text' | 'card' | 'circle' = 'text';
  @Input() width?: string;
  @Input() height?: string;
  @Input() itemWidth?: string;
  @Input() itemHeight?: string;
  @Input() count = 1;
  @Input() animated = true;

  /**
   * Get array of items based on count
   */
  getArray(): number[] {
    return Array(this.count)
      .fill(0)
      .map((_, i) => i);
  }

  /**
   * Track items by index for better performance
   */
  trackByFn(index: number): number {
    return index;
  }
}
