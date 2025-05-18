import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'nb-prompt-dialog',
  template: `
    <nb-card>
      <nb-card-header>
        <h4 class="dialog-title">{{ title }}</h4>
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="form" (ngSubmit)="confirm()">
          <p class="dialog-message">{{ message }}</p>
          <nb-form-field>
            <input
              nbInput
              fullWidth
              formControlName="value"
              [placeholder]="placeholder"
              [autofocus]="true"
            />
            <nb-error *ngIf="form.get('value')?.errors?.required">
              This field is required
            </nb-error>
          </nb-form-field>
        </form>
      </nb-card-body>
      <nb-card-footer class="dialog-actions">
        <button nbButton ghost (click)="cancel()">
          {{ cancelText }}
        </button>
        <button nbButton status="primary" (click)="confirm()" [disabled]="!form.valid">
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
        margin: 0 0 1rem;
        color: nb-theme(text-basic-color);
        font-size: nb-theme(text-paragraph-font-size);
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      nb-form-field {
        width: 100%;
      }
    `,
  ],
})
export class PromptDialogComponent implements OnInit {
  @Input() title = '';
  @Input() message = '';
  @Input() defaultValue = '';
  @Input() placeholder = '';
  @Input() confirmText = 'OK';
  @Input() cancelText = 'Cancel';
  @Input() required = true;

  form: FormGroup;

  constructor(
    private dialogRef: NbDialogRef<PromptDialogComponent>,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      value: ['', this.required ? Validators.required : []],
    });
  }

  ngOnInit() {
    if (this.defaultValue) {
      this.form.patchValue({ value: this.defaultValue });
    }
  }

  confirm() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.value);
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
