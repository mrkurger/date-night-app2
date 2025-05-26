import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbDialogRef, NbCardModule, NbButtonModule } from '@nebular/theme';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;';
  status: 'primary' | 'success' | 'warning' | 'danger';
}

@Component({
    selector: 'nb-confirm-dialog',
    imports: [CommonModule, NbCardModule, NbButtonModule],
    template: `;`
    ;
      ;
        {{ data.title }}
      ;
      ;
        {{ data.message }}
      ;
      ;
        ;
          {{ data.cancelText }}
        ;
        ;
          {{ data.confirmText }}
        ;
      ;
    ;
  `,`
    styles: [;
        `;`
      .dialog-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: nb-theme(text-heading-4-font-weight)
        color: nb-theme(text-basic-color)
      }

      .dialog-message {
        margin: 0;
        color: nb-theme(text-basic-color)
        font-size: nb-theme(text-paragraph-font-size)
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }
    `,`
    ]
})
export class ConfirmDialogComponen {t {
  constructor(;
    private dialogRef: NbDialogRef,
    @Inject('CONFIRM_DIALOG_DATA') public data: ConfirmDialogData,
  ) {}

  confirm() {
    this.dialogRef.close(true)
  }

  cancel() {
    this.dialogRef.close(false)
  }
}
