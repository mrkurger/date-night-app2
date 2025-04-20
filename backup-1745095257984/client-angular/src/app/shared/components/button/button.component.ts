// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (button.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Button Component
 *
 * A customizable button component that follows the DateNight.io design system.
 * Supports different variants, sizes, and states.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  /**
   * The button variant determines its visual style.
   * - 'primary': Filled button with primary color
   * - 'secondary': Outlined button with primary color
   * - 'tertiary': Text-only button with primary color
   * - 'danger': Filled button with error color
   * @default 'primary'
   */
  @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'danger' = 'primary';

  /**
   * The button size.
   * - 'small': Compact size
   * - 'medium': Default size
   * - 'large': Larger size
   * @default 'medium'
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * Whether the button is disabled.
   * @default false
   */
  @Input() disabled = false;

  /**
   * Whether the button is in a loading state.
   * When true, shows a loading indicator and disables the button.
   * @default false
   */
  @Input() loading = false;

  /**
   * Whether the button should take the full width of its container.
   * @default false
   */
  @Input() fullWidth = false;

  /**
   * The button type attribute.
   * @default 'button'
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Optional icon name to display before the button text.
   * Uses the app-icon component.
   */
  @Input() iconLeft?: string;

  /**
   * Optional icon name to display after the button text.
   * Uses the app-icon component.
   */
  @Input() iconRight?: string;

  /**
   * Aria label for accessibility.
   * If not provided, the button text will be used.
   */
  @Input() ariaLabel?: string;

  /**
   * Event emitted when the button is clicked.
   */
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  /**
   * Handles the button click event.
   * Prevents the event from propagating if the button is disabled or loading.
   * @param event The mouse event
   */
  onClick(event: MouseEvent): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.buttonClick.emit(event);
  }

  /**
   * Gets the CSS classes for the button based on its properties.
   * @returns An object with CSS class names as keys and boolean values
   */
  get buttonClasses(): Record<string, boolean> {
    return {
      button: true,
      [`button--${this.variant}`]: true,
      [`button--${this.size}`]: true,
      'button--disabled': this.disabled,
      'button--loading': this.loading,
      'button--full-width': this.fullWidth,
      'button--with-icon-left': !!this.iconLeft,
      'button--with-icon-right': !!this.iconRight,
    };
  }
}
