import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NbDividerComponent } from '../../../app/shared/components/custom-nebular-components';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'nb-divider',
  standalone: true,
  imports: [CommonModule, NbDividerComponent],
  template: `<div class="divider" [class.vertical]="vertical"></div>`,
  styles: `
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
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NbDividerComponent {
  @Input() vertical: boolean = false;
}

export const NbDividerModule = {
  declarations: [NbDividerComponent],
  exports: [NbDividerComponent],
};
