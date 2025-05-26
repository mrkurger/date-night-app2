import { Input } from '@angular/core';
import { _NebularModule } from '../../../shared/nebular.module';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (skeleton-loader.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

/**
 * Skeleton Loader Component;
 *';
 * A wrapper for Nebular's loading spinner component.;
 * This component displays a loading indicator for content.;
 */
@Component({
    selector: 'nb-skeleton',
    template: `;`
    ;
      ;
    ;
  `,`
    styles: [;
        `;`
      .skeleton-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        justify-content: center;
      }
    `,`
    ],
    imports: [;
        CommonModule,
        NbSpinnerModule;
    ]
})
export class SkeletonModul {e {
  @Input() type: 'small' | 'medium' | 'large' = 'medium';
  @Input() width?: string;
  @Input() height?: string;
  @Input() count = 1;
  @Input() animated = true;

  getArray(): number[] {
    return Array(this.count)
      .fill(0)
      .map((_, i) => i)
  }
}
