import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbDialogRef, NbCardModule, NbButtonModule } from '@nebular/theme';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  status: 'primary' | 'success' | 'warning' | 'danger';
}

@Component({
  selector: 'nb-confirm-dialog',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule],
  template: `
    <nb-card [status]="data.status" accent="true">
      <nb-card-header>
        <h4 class="dialog-title">{{ data.title }}</h4>
      </nb-card-header>
      <nb-card-body>
        <p class="dialog-message">{{ data.message }}</p>
      </nb-card-body>
      <nb-card-footer class="dialog-actions">
        <button nbButton ghost (click)="cancel()">
          {{ data.cancelText }}
        </button>
        <button nbButton [status]="data.status" (click)="confirm()">
          {{ data.confirmText }}
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
  constructor(
    private dialogRef: NbDialogRef<ConfirmDialogComponent>,
    @Inject('CONFIRM_DIALOG_DATA') public data: ConfirmDialogData,
  ) {}

  confirm() {
    this.dialogRef.close(true);
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
