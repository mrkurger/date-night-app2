import { NbIconModule } from '@nebular/theme';
import { NbTagModule } from '@nebular/theme';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (label.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';
import { NbTagComponent } from '@nebular/theme';

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
  imports: [CommonModule, NbTagComponent
    NbTagModule,
    NbIconModule,],
})
export class LabelComponent {
  @Input() text = '';
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() icon?: string;
  @Input() rounded = false;
  @Input() outlined = false;
  @Input() pill = false;
}
