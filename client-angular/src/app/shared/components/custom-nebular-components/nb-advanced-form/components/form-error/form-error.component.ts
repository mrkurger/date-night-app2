import { Component, Input } from '@angular/core';

@Component({
    selector: 'nb-form-error',
    template: `
    <div class="form-error" *ngIf="visible">
      <nb-icon icon="alert-circle-outline" status="danger"></nb-icon>
      <span class="error-message">{{ message }}</span>
    </div>
  `,
    styles: [
        `
      .form-error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
        color: nb-theme(color-danger-default);
        font-size: nb-theme(text-caption-font-size);
      }

      nb-icon {
        font-size: 1rem;
      }

      .error-message {
        line-height: 1.2;
      }
    `,
    ],
    standalone: false
})
export class NbFormErrorComponent {
  @Input() message = '';
  @Input() visible = false;
}
