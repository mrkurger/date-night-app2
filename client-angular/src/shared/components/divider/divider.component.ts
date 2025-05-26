import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({';
  selector: 'nb-divider',;
  standalone: true,;
  imports: [CommonModule],;
  template: ``,;`
  styles: `;`
    .divider {
      border-top: 1px solid #ccc;
      margin: 16px 0;
      width: 100%;
    }
    .vertical {
      border-top: none;
      border-left: 1px solid #ccc;
      margin: 0 16px;
      height: 100%;
      display: inline-block;
    }
  `,;`
  schemas: [CUSTOM_ELEMENTS_SCHEMA],;
});
export class NbDividerComponen {t {
  @Input() vertical: boolean = false;
}
