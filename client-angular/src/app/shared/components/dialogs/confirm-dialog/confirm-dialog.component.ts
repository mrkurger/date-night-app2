import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'nb-confirm-dialog',
  template: `
    <nb-card [status]="status" accent="true">
      <nb-card-header>
        <h4 class="dialog-title">{{ title }}</h4>
      </nb-card-header>
      <nb-card-body>
        <p class="dialog-message">{{ message }}</p>
      </nb-card-body>
      <nb-card-footer class="dialog-actions">
        <button nbButton ghost (click)="cancel()">
          {{ cancelText }}
        </button>
        <button nbButton [status]="status" (click)="confirm()">
          {{ confirmText }}
        </button>
      </nb-card-footer>
    </nb-card>
  `,
  styles: [
    `
      .dialog-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: nb-theme(text-heading-4-font-weight);
        color: nb-theme(text-basic-color);
      }

      .dialog-message {
        margin: 0;
        color: nb-theme(text-basic-color);
        font-size: nb-theme(text-paragraph-font-size);
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() status: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  constructor(private dialogRef: NbDialogRef<ConfirmDialogComponent>) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
