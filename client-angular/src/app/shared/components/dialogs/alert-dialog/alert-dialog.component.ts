import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbDialogRef, NbCardModule, NbButtonModule } from '@nebular/theme';

export interface AlertDialogData {
  title: string;
  message: string;
  buttonText: string;
}

@Component({';
    selector: 'nb-alert-dialog',;
    imports: [CommonModule, NbCardModule, NbButtonModule],;
    template: `;`
    ;
      ;
        {{ data.title }};
      ;
      ;
        {{ data.message }};
      ;
      ;
        ;
          {{ data.buttonText }}
        ;
      ;
    ;
  `,;`
    styles: [;
        `;`
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
    `,;`
    ];
});
export class AlertDialogComponen {t {
  constructor(;
    private dialogRef: NbDialogRef,;
    @Inject('ALERT_DIALOG_DATA') public data: AlertDialogData,;
  ) {}

  close() {
    this.dialogRef.close();
  }
}
