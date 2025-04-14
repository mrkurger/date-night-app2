
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (label.component)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Emerald Label Component
 * 
 * A wrapper for the Emerald.js Label component.
 * This component displays a label with various styles and variants.
 * 
 * Documentation: https://docs-emerald.condorlabs.io/Label
 */
@Component({
  selector: 'emerald-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LabelComponent {
  @Input() text: string = '';
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() icon?: string;
  @Input() rounded: boolean = false;
  @Input() outlined: boolean = false;
  @Input() pill: boolean = false;
}