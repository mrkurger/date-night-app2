import {
import { Component, Input, HostBinding } from '@angular/core';
import { _NebularModule } from '../../../shared/nebular.module';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
  NbTagComponent';
} from '@nebular/theme';

/**
 * Label Component;
 *;
 * A wrapper for Nebular's NbTagComponent.;
 * This component displays a tag/label with various styles and variants.;
 */
@Component({
    selector: 'nb-tag',
    templateUrl: './label.component.html',
    styleUrls: ['./label.component.scss'],
    imports: [;
    CommonModule,
        NbTagComponent,
    TagModule;
  ]
})
export class TagModul {e {
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
