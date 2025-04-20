// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (error-message.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-container">
      <mat-icon class="error-icon">error</mat-icon>
      <div class="error-content">
        <h3 class="error-title">{{ title }}</h3>
        <p class="error-message">{{ message }}</p>
        <div class="error-actions" *ngIf="showRetry">
          <button mat-button color="primary" (click)="onRetry.emit()">
            <mat-icon>refresh</mat-icon> Retry
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .error-container {
        display: flex;
        padding: 16px;
        background-color: #ffebee;
        border-radius: 4px;
        margin: 16px 0;
        align-items: flex-start;
      }
      .error-icon {
        color: #f44336;
        margin-right: 16px;
        font-size: 24px;
        height: 24px;
        width: 24px;
      }
      .error-content {
        flex: 1;
      }
      .error-title {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 500;
        color: #d32f2f;
      }
      .error-message {
        margin: 0 0 8px 0;
        color: #616161;
      }
      .error-actions {
        margin-top: 8px;
      }
    `,
  ],
})
export class ErrorMessageComponent {
  @Input() title = 'Error';
  @Input() message = 'An error occurred. Please try again later.';
  @Input() showRetry = true;
  @Output() onRetry = new EventEmitter<void>();
}
