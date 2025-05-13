import { Component, Input } from '@angular/core';
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
      [class.skeleton-loader--circle]="shape === 'circle'"
      [class.skeleton-loader--rect]="shape === 'rect'"
      [style.width]="width"
      [style.height]="height"
      [style.margin]="margin"
    >
      <div class="skeleton-loader__animation"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .skeleton-loader {
        background: var(--background-basic-color-2);
        border-radius: var(--border-radius);
        overflow: hidden;
        position: relative;
      }

      .skeleton-loader--circle {
        border-radius: 50%;
      }

      .skeleton-loader--rect {
        border-radius: var(--border-radius);
      }

      .skeleton-loader__animation {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          var(--background-basic-color-3),
          transparent
        );
        animation: skeleton-loading 1.5s infinite;
      }

      @keyframes skeleton-loading {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `,
  ],
})
export class SkeletonLoaderComponent {
  @Input() shape: 'circle' | 'rect' = 'rect';
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() margin = '0';
}
