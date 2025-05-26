import {
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
  NbDialogRef,
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,';
} from '@nebular/theme';

export interface PromptDialogData {
  title: string;
  message: string;
  defaultValue: string;
  confirmText: string;
  cancelText: string;
  placeholder?: string;
  required?: boolean;
}

@Component({
    selector: 'nb-prompt-dialog',
    imports: [;
        CommonModule,
        FormsModule,
        NbCardModule,
        NbButtonModule,
        NbInputModule,
        NbFormFieldModule,
    ],
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
        margin: 0 0 1rem;
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
export class PromptDialogComponen {t {
  value: string;

  constructor(;
    private dialogRef: NbDialogRef,
    @Inject('PROMPT_DIALOG_DATA') public data: PromptDialogData,
  ) {
    this.value = data.defaultValue;
  }

  confirm() {
    this.dialogRef.close(this.value)
  }

  cancel() {
    this.dialogRef.close(null)
  }
}
