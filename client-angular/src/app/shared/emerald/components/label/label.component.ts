import { Component, Input, HostBinding } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';

import { CommonModule } from '@angular/common';
import {
  NbTagComponent
} from '@nebular/theme';

/**
 * Label Component
 *
 * A wrapper for Nebular's NbTagComponent.
 * This component displays a tag/label with various styles and variants.
 */
@Component({
  selector: 'nb-tag',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NbTagComponent,
    NbTagModule,
    NbIconModule
  ],
})
export class LabelComponent {
  @Input() text = '';
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() icon?: string;

  @Input()
  @HostBinding('class.rounded')
  rounded = false;

  @Input() outlined = false;

  @Input()
  @HostBinding('class.pill')
  pill = false;
}
