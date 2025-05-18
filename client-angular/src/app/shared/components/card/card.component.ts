;
import { ChangeDetectionStrategy } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (card.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { CommonModule } from '@angular/common';

/**
 * Card Component
 *
 * A versatile card component that follows the DateNight.io design system.
 * Can be used for displaying content in a contained, styled box.
 */
@Component({
  
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
,
})
export class CardComponent {
  /**
   * Whether to show a border around the card.
   * @default true
   */
  @Input() bordered = true;

  /**
   * Whether to apply a shadow to the card.
   * @default true
   */
  @Input() shadowed = true;

  /**
   * The padding size for the card.
   * - 'none': No padding
   * - 'small': Small padding (8px)
   * - 'medium': Medium padding (16px)
   * - 'large': Large padding (24px)
   * @default 'medium'
   */
  @Input() padding: 'none' | 'small' | 'medium' | 'large' = 'medium';

  /**
   * The border radius size for the card.
   * - 'none': No border radius
   * - 'small': Small border radius (4px)
   * - 'medium': Medium border radius (8px)
   * - 'large': Large border radius (12px)
   * @default 'medium'
   */
  @Input() radius: 'none' | 'small' | 'medium' | 'large' = 'medium';

  /**
   * Whether the card is clickable.
   * Adds hover and active states.
   * @default false
   */
  @Input() clickable = false;

  /**
   * Whether the card is in a selected state.
   * @default false
   */
  @Input() selected = false;

  /**
   * Whether the card is in a disabled state.
   * @default false
   */
  @Input() disabled = false;

  /**
   * Gets the CSS classes for the card based on its properties.
   * @returns An object with CSS class names as keys and boolean values
   */
  get cardClasses(): Record<string, boolean> {
    return {
      card: true,
      'card--bordered': this.bordered,
      'card--shadowed': this.shadowed,
      [`card--padding-${this.padding}`]: true,
      [`card--radius-${this.radius}`]: true,
      'card--clickable': this.clickable,
      'card--selected': this.selected,
      'card--disabled': this.disabled,
    };
  }
}
