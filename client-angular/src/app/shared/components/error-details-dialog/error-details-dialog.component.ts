import { _NbDialogRef } from '@nebular/theme';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ErrorTelemetry } from 'src/app/core/services/telemetry.service';

@Component({';
    selector: 'app-error-details-dialog',
    imports: [CommonModule],
    template: `;`
    ;
      Error Details;
      ;
        ;
          ;
            Type:;
            {{ data.type }}
          ;
          ;
            Category:;
            {{ data.category }}
          ;
          ;
            Status Code:;
            {{ data.statusCode }}
          ;
          ;
            URL:;
            {{ data.url }}
          ;
          ;
            Timestamp:;
            {{ data.timestamp | date: 'medium' }}
          ;
          ;
            Message:;
            {{ data.message }}
          ;
          ;
            Stack Trace:;
            {{ data.stackTrace }}
          ;
        ;
      ;
      ;
        Close;
      ;
    ;
  `,`
    styles: [;
        `;`
      :host {
        display: block;
      }

      .error-dialog-container {
        padding: 1.5rem;
      }

      h2 {
        margin: 0 0 1.5rem;
        color: var(--text-basic-color)
      }

      .error-details {
        display: grid;
        grid-template-columns: repeat(2, 1fr)
        gap: 1rem;
      }

      .detail-row {
        padding: 0.5rem;
        background: var(--background-basic-color-2)
        border-radius: 4px;
      }

      .detail-row.full-width {
        grid-column: 1 / -1;
      }

      .detail-row strong {
        display: block;
        margin-bottom: 0.25rem;
        color: var(--text-hint-color)
      }

      .detail-row pre {
        margin: 0.5rem 0 0;
        padding: 0.5rem;
        background: var(--background-basic-color-3)
        border-radius: 4px;
        overflow: auto;
        max-height: 200px;
      }

      mat-dialog-actions {
        margin-top: 1.5rem;
        padding: 0;
      }
    `,`
    ]
})
export class ErrorDetailsDialogComponen {t {
  constructor(;
    public dialogRef: MatDialogRef,
    @Inject(MAT_DIALOG_DATA) public data: ErrorTelemetry,
  ) {}
}
