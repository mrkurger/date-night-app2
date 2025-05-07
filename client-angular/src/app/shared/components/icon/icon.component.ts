// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (icon.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icon Component
 *
 * A component for displaying SVG icons from the DateNight.io icon library.
 * Supports different sizes and colors.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  /**
   * The name of the icon to display.
   * This should match an icon name in the icon registry.
   */
  @Input() name = '';

  /**
   * The size of the icon.
   * - 'small': 16px
   * - 'medium': 24px
   * - 'large': 32px
   * @default 'medium'
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * The color of the icon.
   * - 'inherit': Inherits color from parent
   * - 'primary': Primary color
   * - 'secondary': Secondary color
   * - 'success': Success color
   * - 'warning': Warning color
   * - 'error': Error color
   * - 'info': Info color
   * @default 'inherit'
   */
  @Input() color: 'inherit' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' =
    'inherit';

  /**
   * Gets the CSS classes for the icon based on its properties.
   * @returns An object with CSS class names as keys and boolean values
   */
  get iconClasses(): Record<string, boolean> {
    return {
      icon: true,
      [`icon--${this.size}`]: true,
      [`icon--${this.color}`]: this.color !== 'inherit',
    };
  }

  /**
   * Gets the href for the SVG sprite symbol based on its name.
   * @returns The href for the SVG symbol
   */
  get iconHref(): string {
    return `assets/icons.svg#${this.name}`;
  }

  /**
   * Gets the viewBox for the SVG icon.
   * @returns The SVG viewBox attribute value
   */
  get viewBox(): string {
    return '0 0 24 24';
  }
}
