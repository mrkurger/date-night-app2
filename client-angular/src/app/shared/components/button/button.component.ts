// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (button.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

/**
 * Button Component
 *
 * A customizable button component that follows the DateNight.io design system.
 * Supports different variants, sizes, and states.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
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
  @Input() size: 'small' | 'medium' | 'large' = 'medium'; // Emerald default is 'xs', 'medium' is our own concept

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
    let shape: 'classic' | 'outline' | 'flat' = 'classic';
    let color: 'default' | 'brand' | 'danger' | 'info' | 'success' | 'warning' = 'default';

    // Map our variant to Emerald's shape and color
    if (this.variant === 'primary') {
      shape = 'classic';
      color = 'brand'; // Assuming 'brand' is the primary filled button color
    } else if (this.variant === 'secondary') {
      shape = 'outline';
      color = 'brand'; // Or 'default' if outline should use default text color
    } else if (this.variant === 'tertiary') {
      shape = 'flat';
      color = 'brand'; // Or 'default'
    } else if (this.variant === 'danger') {
      shape = 'classic';
      color = 'danger';
    }

    // Map our size to Emerald's size concepts (approximate)
    // Emerald: 'xs' (default), 'sm', 'lg'. Our: 'small', 'medium', 'large'.
    let sizeClassKey = '';
    if (this.size === 'small') {
      sizeClassKey = 'button--size-sm'; // Corresponds to Emerald 'sm'
    } else if (this.size === 'large') {
      sizeClassKey = 'button--size-lg'; // Corresponds to Emerald 'lg'
    } else {
      sizeClassKey = 'button--size-md'; // Our medium
    }

    const classes: Record<string, boolean> = {
      'emerald-button': true, // Base class we expect from Emerald or will style.
      [`button--shape-${shape}`]: true,
      [`button--color-${color}`]: true,
      'button--loading': this.loading,
      'button--full-width': this.fullWidth,
    };

    if (sizeClassKey) {
      classes[sizeClassKey] = true;
    }

    return classes;
  }
}
