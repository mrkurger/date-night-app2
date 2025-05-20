import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'nb-error',
    imports: [CommonModule],
    template: `
    <div class="nb-error">
      <ng-content></ng-content>
    </div>
  `,
    styles: [
        `
      .nb-error {
        color: var(--text-danger-color);
        font-size: 0.75rem;
        margin-top: 0.375rem;
      }
    `,
    ]
})
export class NbErrorComponent {}
