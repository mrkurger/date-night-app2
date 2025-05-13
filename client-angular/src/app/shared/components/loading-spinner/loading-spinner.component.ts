import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbSpinnerModule } from '@nebular/theme';

/**
 * Loading Spinner Component
 *
 * A modern loading spinner component using Nebular UI components.
 * Features customizable size, message, and appearance.
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, NbSpinnerModule],
  template: `
    <div class="loading-spinner" [class]="'loading-spinner--' + size">
      <nb-spinner [size]="spinnerSize" [status]="status"></nb-spinner>
      <p *ngIf="message" class="loading-spinner__message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: nb-theme(spacing-2);
        padding: nb-theme(spacing-4);
      }

      .loading-spinner--small nb-spinner {
        font-size: 1.5rem;
      }

      .loading-spinner--medium nb-spinner {
        font-size: 2rem;
      }

      .loading-spinner--large nb-spinner {
        font-size: 3rem;
      }

      .loading-spinner__message {
        margin: 0;
        color: nb-theme(text-hint-color);
        font-size: nb-theme(text-subtitle-2-font-size);
        line-height: nb-theme(text-subtitle-2-line-height);
        text-align: center;
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message = '';
  @Input() status: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'basic' = 'primary';

  /**
   * Get the spinner size based on the component size
   */
  get spinnerSize(): 'tiny' | 'small' | 'medium' | 'large' | 'giant' {
    switch (this.size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  }
}
