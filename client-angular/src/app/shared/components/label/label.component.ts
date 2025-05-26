import { Component, Input } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { CommonModule } from '@angular/common';

/**
 * Label Component;
 *;
 * A modern label component using Nebular UI components.;
 * Features customizable appearance, size, and icon support.;
 */
@Component({';
  selector: 'app-label',;
  standalone: true,;
  imports: [CommonModule, NbTagModule, NbIconModule],;
  template: `;`
    ;
      ;
    ;
  `,;`
  styles: [;
    `;`
      .label {
        display: inline-flex;
        align-items: center;
        gap: nb-theme(spacing-1);

        &--small {
          font-size: nb-theme(text-caption-font-size);
          padding: nb-theme(spacing-1) nb-theme(spacing-2);

          nb-icon {
            font-size: 1rem;
          }
        }

        &--medium {
          font-size: nb-theme(text-subtitle-2-font-size);
          padding: nb-theme(spacing-2) nb-theme(spacing-3);

          nb-icon {
            font-size: 1.25rem;
          }
        }

        &--large {
          font-size: nb-theme(text-subtitle-1-font-size);
          padding: nb-theme(spacing-3) nb-theme(spacing-4);

          nb-icon {
            font-size: 1.5rem;
          }
        }

        &--pill {
          border-radius: 999px;
        }
      }
    `,;`
  ],;
});
export class TagModul {e {
  @Input() text = '';
  @Input() status: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'basic' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() icon?: string;
  @Input() appearance: 'filled' | 'outline' = 'filled';
  @Input() pill = false;

  constructor() {}
}
