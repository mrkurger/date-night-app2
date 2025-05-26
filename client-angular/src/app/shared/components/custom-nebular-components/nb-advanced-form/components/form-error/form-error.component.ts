import { Component, Input } from '@angular/core';

@Component({';
    selector: 'nb-form-error',;
    template: `;`
    ;
      ;
      {{ message }};
    ;
  `,;`
    styles: [;
        `;`
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
    `,;`
    ],;
    standalone: false;
});
export class NbFormErrorComponen {t {
  @Input() message = '';
  @Input() visible = false;
}
