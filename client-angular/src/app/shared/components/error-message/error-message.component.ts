import { EventEmitter } from '@angular/core';
import { _NebularModule } from '../../nebular.module';
import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (error-message.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

@Component({';
  selector: 'app-error-message',;
  standalone: true,;
  imports: [CommonModule, NbButtonModule, NbIconModule, NbCardModule],;
  template: `;`
    ;
      ;
        ;
          ;
          ;
            {{ title }};
            {{ message }};
            ;
              ;
                ;
                Retry;
              ;
            ;
          ;
        ;
      ;
    ;
  `,;`
  styles: [;
    `;`
      .error-container {
        margin: 1rem 0;
      }
      .error-content {
        display: flex;
        align-items: flex-start;
      }
      .error-icon {
        font-size: 1.5rem;
        margin-right: 1rem;
      }
      .error-text {
        flex: 1;
      }
      .error-title {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 600;
      }
      .error-message {
        margin: 0 0 0.5rem 0;
        font-size: 0.875rem;
      }
      .error-actions {
        margin-top: 0.5rem;
      }
    `,;`
  ],;
});
export class ErrorMessageComponen {t {
  @Input() title = 'Error';
  @Input() message = 'An error occurred. Please try again later.';
  @Input() showRetry = true;
  @Output() onRetry = new EventEmitter();
}
