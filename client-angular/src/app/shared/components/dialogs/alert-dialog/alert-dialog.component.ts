import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbDialogRef, NbCardModule, NbButtonModule } from '@nebular/theme';

export interface AlertDialogData {
  title: string;
  message: string;
  buttonText: string;
}

@Component({
  selector: 'nb-alert-dialog',
  standalone: true,
  imports: [CommonModule, NbCardModule, NbButtonModule],
  template: `
    <nb-card>
      <nb-card-header>
        <h4 class="dialog-title">{{ data.title }}</h4>
      </nb-card-header>
      <nb-card-body>
        <p class="dialog-message">{{ data.message }}</p>
      </nb-card-body>
      <nb-card-footer class="dialog-actions">
        <button nbButton status="primary" (click)="close()">
          {{ data.buttonText }}
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
      }
    `,
  ],
})
export class AlertDialogComponent {
  constructor(
    private dialogRef: NbDialogRef<AlertDialogComponent>,
    @Inject('ALERT_DIALOG_DATA') public data: AlertDialogData,
  ) {}

  close() {
    this.dialogRef.close();
  }
}
