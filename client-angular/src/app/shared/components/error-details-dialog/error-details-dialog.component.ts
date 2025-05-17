import { NbDialogRef, NB_DIALOG_CONFIG } from '@nebular/theme';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import type { ErrorTelemetry } from 'src/app/core/services/telemetry.service';

@Component({
  selector: 'app-error-details-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-dialog-container">
      <h2>Error Details</h2>
      <mat-dialog-content>
        <div class="error-details">
          <div class="detail-row">
            <strong>Type:</strong>
            <span>{{ data.type }}</span>
          </div>
          <div class="detail-row">
            <strong>Category:</strong>
            <span>{{ data.category }}</span>
          </div>
          <div class="detail-row">
            <strong>Status Code:</strong>
            <span>{{ data.statusCode }}</span>
          </div>
          <div class="detail-row">
            <strong>URL:</strong>
            <span>{{ data.url }}</span>
          </div>
          <div class="detail-row">
            <strong>Timestamp:</strong>
            <span>{{ data.timestamp | date: 'medium' }}</span>
          </div>
          <div class="detail-row full-width">
            <strong>Message:</strong>
            <p>{{ data.message }}</p>
          </div>
          <div class="detail-row full-width" *ngIf="data.stackTrace">
            <strong>Stack Trace:</strong>
            <pre>{{ data.stackTrace }}</pre>
          </div>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]>Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .error-dialog-container {
        padding: 1.5rem;
      }

      h2 {
        margin: 0 0 1.5rem;
        color: var(--text-basic-color);
      }

      .error-details {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .detail-row {
        padding: 0.5rem;
        background: var(--background-basic-color-2);
        border-radius: 4px;
      }

      .detail-row.full-width {
        grid-column: 1 / -1;
      }

      .detail-row strong {
        display: block;
        margin-bottom: 0.25rem;
        color: var(--text-hint-color);
      }

      .detail-row pre {
        margin: 0.5rem 0 0;
        padding: 0.5rem;
        background: var(--background-basic-color-3);
        border-radius: 4px;
        overflow: auto;
        max-height: 200px;
      }

      mat-dialog-actions {
        margin-top: 1.5rem;
        padding: 0;
      }
    `,
  ],
})
export class ErrorDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrorDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorTelemetry,
  ) {}
}
