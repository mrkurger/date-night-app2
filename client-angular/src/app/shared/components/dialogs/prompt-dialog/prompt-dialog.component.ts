import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  NbDialogRef,
  NbCardModule,
  NbButtonModule,
  NbInputModule,
  NbFormFieldModule,
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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
  ],
  template: `
    <nb-card>
      <nb-card-header>
        <h4 class="dialog-title">{{ data.title }}</h4>
      </nb-card-header>
      <nb-card-body>
        <p class="dialog-message">{{ data.message }}</p>
        <nb-form-field>
          <input
            nbInput
            fullWidth
            [(ngModel)]="value"
            [placeholder]="data.placeholder || ''"
            [required]="data.required"
          />
        </nb-form-field>
      </nb-card-body>
      <nb-card-footer class="dialog-actions">
        <button nbButton ghost (click)="cancel()">
          {{ data.cancelText }}
        </button>
        <button nbButton status="primary" (click)="confirm()" [disabled]="data.required && !value">
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
        margin: 0 0 1rem;
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
export class PromptDialogComponent {
  value: string;

  constructor(
    private dialogRef: NbDialogRef<PromptDialogComponent>,
    @Inject('PROMPT_DIALOG_DATA') public data: PromptDialogData,
  ) {
    this.value = data.defaultValue;
  }

  confirm() {
    this.dialogRef.close(this.value);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
