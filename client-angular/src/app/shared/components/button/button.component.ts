
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
import { _NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';

import { IconComponent } from '../icon/icon.component';

/**
 * Button Component
 *
 * A customizable button component that follows the DateNight.io design system.
 * Uses Nebular's button system with custom styling.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule,
    NbButtonModule,
    NbIconModule,
    IconComponent
  ],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  /**
   * The button status determines its visual style.
   * Maps to Nebular's button status system.
   */
  @Input() status: 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'basic' = 'primary';

  /**
   * The button size.
   * Maps directly to Nebular's size system.
   */
  @Input() size: 'tiny' | 'small' | 'medium' | 'large' | 'giant' = 'medium';

  /**
   * The button appearance.
   * Maps to Nebular's button appearance system.
   */
  @Input() appearance: 'filled' | 'outline' | 'ghost' | 'hero' = 'filled';

  /**
   * Whether the button is disabled.
   */
  @Input() disabled = false;

  /**
   * Whether the button is in a loading state.
   * When true, shows a loading indicator and disables the button.
   */
  @Input() loading = false;

  /**
   * Whether the button should take the full width of its container.
   */
  @Input() fullWidth = false;

  /**
   * The button type attribute.
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Optional icon name to display before the button text.
   */
  @Input() iconLeft?: string;

  /**
   * Optional icon name to display after the button text.
   */
  @Input() iconRight?: string;

  /**
   * Aria label for accessibility.
   */
  @Input() ariaLabel?: string;

  /**
   * Event emitted when the button is clicked.
   */
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  /**
   * Handles the button click event.
   * Prevents the event from propagating if the button is disabled or loading.
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
   */
  get buttonClasses(): Record<string, boolean> {
    return {
      [`size-${this.size}`]: true,
      'full-width': this.fullWidth,
      'is-loading': this.loading,
      [`appearance-${this.appearance}`]: true,
      [`status-${this.status}`]: true,
    };
  }
}
