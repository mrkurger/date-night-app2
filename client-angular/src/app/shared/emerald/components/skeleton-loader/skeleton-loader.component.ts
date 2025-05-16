import { Input } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';

import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (skeleton-loader.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';

/**
 * Skeleton Loader Component
 *
 * A wrapper for Nebular's loading spinner component.
 * This component displays a loading indicator for content.
 */
@Component({
  selector: 'nb-skeleton',
  template: `
    <div class="skeleton-container" [style.width]="width" [style.height]="height">
      <nb-spinner
        *ngFor="let i of getArray()"
        [size]="type === 'small' ? 'tiny' : type === 'large' ? 'giant' : 'large'"
        [status]="'basic'"
      ></nb-spinner>
    </div>
  `,
  styles: [
    `
      .skeleton-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    NbSpinnerModule
  ],
})
export class SkeletonLoaderComponent {
  @Input() type: 'small' | 'medium' | 'large' = 'medium';
  @Input() width?: string;
  @Input() height?: string;
  @Input() count = 1;
  @Input() animated = true;

  getArray(): number[] {
    return Array(this.count)
      .fill(0)
      .map((_, i) => i);
  }
}
