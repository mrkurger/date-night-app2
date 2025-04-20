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
   * Gets the SVG path for the icon based on its name.
   * This is a simplified implementation - in a real app, this would use an icon registry.
   * @returns The SVG path data
   */
  get iconPath(): string {
    // This is a simplified implementation with a few common icons
    const icons: Record<string, string> = {
      'arrow-right':
        'M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z',
      'arrow-left':
        'M10.975 1l2.847 2.828-6.176 6.176h16.354v3.992h-16.354l6.176 6.176-2.847 2.828-10.975-11z',
      check: 'M9 16.17l-4.17-4.17-1.42 1.41 5.59 5.59 12-12-1.41-1.41z',
      close:
        'M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z',
      heart:
        'M12 21.35l-1.45-1.32c-5.15-4.67-8.55-7.75-8.55-11.53 0-3.08 2.42-5.5 5.5-5.5 1.74 0 3.41.81 4.5 2.09 1.09-1.28 2.76-2.09 4.5-2.09 3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54l-1.45 1.31z',
      search:
        'M15.5 14h-.79l-.28-.27c.98-1.14 1.57-2.62 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 2.91-6.5 6.5 2.91 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99 1.49-1.49-4.99-5zm-6 0c-2.49 0-4.5-2.01-4.5-4.5s2.01-4.5 4.5-4.5 4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z',
      'chevron-down': 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
      eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
      'eye-off':
        'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
      // Add more icons as needed
    };

    return icons[this.name] || '';
  }

  /**
   * Gets the viewBox for the SVG icon.
   * @returns The SVG viewBox attribute value
   */
  get viewBox(): string {
    return '0 0 24 24';
  }
}
