import { Component, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'nb-alert-dialog',
  template: `
    <nb-card>
      <nb-card-header>
        <h4 class="dialog-title">{{ title }}</h4>
      </nb-card-header>
      <nb-card-body>
        <p class="dialog-message">{{ message }}</p>
      </nb-card-body>
      <nb-card-footer class="dialog-actions">
        <button nbButton status="primary" (click)="close()">
          {{ buttonText }}
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
  @Input() title = '';
  @Input() message = '';
  @Input() buttonText = 'OK';

  constructor(private dialogRef: NbDialogRef<AlertDialogComponent>) {}

  close() {
    this.dialogRef.close();
  }
}
