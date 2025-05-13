import { Input } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (loading-spinner.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { NbSpinnerModule } from '@nebular/theme';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, NbSpinnerModule],
  template: `
    <div class="spinner-container">
      <nb-spinner size="large"></nb-spinner>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [
    `
      .spinner-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.25rem;
      }
      .spinner-message {
        margin-top: 0.625rem;
        color: nb-theme(text-hint-color);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() message = '';
}
