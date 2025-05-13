import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Skeleton Loader Component
 *
 * This component provides a loading placeholder for content that takes time to load.
 * It can be customized to match the shape and size of the content it's replacing.
 *
 * Usage:
 * ```html
 * <!-- Basic usage -->
 * <app-skeleton-loader></app-skeleton-loader>
 *
 * <!-- Custom dimensions -->
 * <app-skeleton-loader [width]="100" [height]="20"></app-skeleton-loader>
 *
 * <!-- Custom shape -->
 * <app-skeleton-loader [shape]="'circle'" [width]="40"></app-skeleton-loader>
 *
 * <!-- Text placeholder with multiple lines -->
 * <app-skeleton-loader [type]="'text'" [lines]="3"></app-skeleton-loader>
 *
 * <!-- Card placeholder -->
 * <app-skeleton-loader [type]="'card'" [imageHeight]="200"></app-skeleton-loader>
 * ```
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="skeleton-loader"
      [ngClass]="[
        'skeleton-loader--' + type,
        'skeleton-loader--' + shape,
        animated ? 'skeleton-loader--animated' : '',
      ]"
      [ngStyle]="getStyles()"
    >
      <ng-container [ngSwitch]="type">
        <!-- Basic skeleton -->
        <ng-container *ngSwitchCase="'basic'">
          <div class="skeleton-loader__item"></div>
        </ng-container>

        <!-- Text skeleton with multiple lines -->
        <ng-container *ngSwitchCase="'text'">
          <div
            class="skeleton-loader__line"
            *ngFor="let line of getLinesArray(); let i = index"
            [ngStyle]="getLineStyles(i)"
          ></div>
        </ng-container>

        <!-- Card skeleton with image and text -->
        <ng-container *ngSwitchCase="'card'">
          <div class="skeleton-loader__image" [ngStyle]="{ 'height.px': imageHeight }"></div>
          <div class="skeleton-loader__card-content">
            <div class="skeleton-loader__title"></div>
            <div class="skeleton-loader__text"></div>
            <div class="skeleton-loader__text" [ngStyle]="{ 'width.%': 70 }"></div>
          </div>
        </ng-container>

        <!-- Avatar skeleton -->
        <ng-container *ngSwitchCase="'avatar'">
          <div class="skeleton-loader__avatar"></div>
        </ng-container>

        <!-- Button skeleton -->
        <ng-container *ngSwitchCase="'button'">
          <div class="skeleton-loader__button"></div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .skeleton-loader {
        display: block;
        position: relative;
        overflow: hidden;
        background-color: var(--skeleton-bg, rgba(0, 0, 0, 0.08));
        border-radius: var(--border-radius-md);
      }

      .skeleton-loader--circle {
        border-radius: 50%;
      }

      .skeleton-loader--rounded {
        border-radius: var(--border-radius-full);
      }

      .skeleton-loader--animated {
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: skeleton-loading 1.5s infinite;
        }
      }

      .skeleton-loader__line {
        height: 12px;
        margin-bottom: 8px;
        border-radius: var(--border-radius-sm);
        background-color: var(--skeleton-bg, rgba(0, 0, 0, 0.08));

        &:last-child {
          margin-bottom: 0;
        }
      }

      .skeleton-loader__image {
        width: 100%;
        height: 200px;
        background-color: var(--skeleton-bg, rgba(0, 0, 0, 0.08));
        border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
      }

      .skeleton-loader__card-content {
        padding: 16px;
      }

      .skeleton-loader__title {
        height: 24px;
        margin-bottom: 16px;
        border-radius: var(--border-radius-sm);
        background-color: var(--skeleton-bg, rgba(0, 0, 0, 0.08));
      }

      .skeleton-loader__text {
        height: 12px;
        margin-bottom: 8px;
        border-radius: var(--border-radius-sm);
        background-color: var(--skeleton-bg, rgba(0, 0, 0, 0.08));

        &:last-child {
          margin-bottom: 0;
        }
      }

      .skeleton-loader__avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: var(--skeleton-bg, rgba(0, 0, 0, 0.08));
      }

      .skeleton-loader__button {
        width: 100%;
        height: 100%;
        border-radius: var(--border-radius-md);
        background-color: var(--skeleton-bg, rgba(0, 0, 0, 0.08));
      }

      @keyframes skeleton-loading {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      /* Dark mode support */
      :host-context(.dark-theme) .skeleton-loader {
        background-color: var(--skeleton-bg-dark, rgba(255, 255, 255, 0.08));
      }
    `,
  ],
})
export class SkeletonLoaderComponent {
  /**
   * Width of the skeleton loader
   */
  @Input() width?: number | string;

  /**
   * Height of the skeleton loader
   */
  @Input() height?: number | string;

  /**
   * Type of skeleton loader
   */
  @Input() type: 'basic' | 'text' | 'card' | 'avatar' | 'button' = 'basic';

  /**
   * Shape of the skeleton loader
   */
  @Input() shape: 'rectangle' | 'circle' | 'rounded' = 'rectangle';

  /**
   * Number of lines for text type
   */
  @Input() lines = 3;

  /**
   * Whether to animate the skeleton loader
   */
  @Input() animated = true;

  /**
   * Height of the image for card type
   */
  @Input() imageHeight = 200;

  /**
   * Gets the styles for the skeleton loader
   * @returns The styles object
   */
  getStyles(): { [key: string]: any } {
    const styles: { [key: string]: any } = {};

    if (this.width) {
      styles['width'] = typeof this.width === 'number' ? `${this.width}px` : this.width;
    }

    if (this.height) {
      styles['height'] = typeof this.height === 'number' ? `${this.height}px` : this.height;
    }

    return styles;
  }

  /**
   * Gets an array of the specified number of lines
   * @returns An array with the specified number of elements
   */
  getLinesArray(): number[] {
    return Array(this.lines).fill(0);
  }

  /**
   * Gets the styles for a specific line in text type
   * @param index The index of the line
   * @returns The styles object
   */
  getLineStyles(index: number): { [key: string]: any } {
    // Make lines have varying widths for a more natural look
    if (index === this.lines - 1) {
      return { width: `${70 + Math.random() * 30}%` };
    }

    return { width: '100%' };
  }
}
