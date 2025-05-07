// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (checkbox.component)
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
  forwardRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

/**
 * Checkbox Component
 *
 * A customizable checkbox component that follows the DateNight.io design system.
 * Supports different sizes and states.
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements ControlValueAccessor {
  /**
   * The checkbox label.
   * @default ''
   */
  @Input() label = '';

  /**
   * Whether the checkbox is required.
   * @default false
   */
  @Input() required = false;

  /**
   * Whether the checkbox is disabled.
   * @default false
   */
  @Input() disabled = false;

  /**
   * The checkbox size.
   * - 'small': Compact size
   * - 'medium': Default size
   * - 'large': Larger size
   * @default 'medium'
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * The checkbox helper text.
   * @default ''
   */
  @Input() helperText = '';

  /**
   * The checkbox error message.
   * @default ''
   */
  @Input() errorMessage = '';

  /**
   * The checkbox name attribute.
   */
  @Input() name?: string;

  /**
   * The checkbox id attribute.
   */
  @Input() id?: string;

  /**
   * The checkbox value attribute.
   */
  @Input() value?: string;

  /**
   * The checkbox aria-label attribute.
   */
  @Input() ariaLabel?: string;

  /**
   * Event emitted when the checkbox value changes.
   */
  @Output() valueChange = new EventEmitter<boolean>();

  /**
   * The @Input() checkbox checked state.
   */
  @Input() @Input() @Input() @Input() checked = false;

  /**
   * Whether the checkbox is focused.
   */
  isFocused = false;

  /**
   * Function to call when the checkbox value changes.
   */
  onChange = (value: unknown): void => {
    // Will be overridden by registerOnChange
  };

  /**
   * Function to call when the checkbox is touched.
   */
  onTouched = (): void => {
    // Will be overridden by registerOnTouched
  };

  /**
   * Gets the CSS classes for the checkbox container based on its properties.
   * @returns An object with CSS class names as keys and boolean values
   */
  get containerClasses(): Record<string, boolean> {
    return {
      checkbox: true,
      [`checkbox--${this.size}`]: true,
      'checkbox--disabled': this.disabled,
      'checkbox--checked': this.checked,
      'checkbox--focused': this.isFocused,
      'checkbox--error': !!this.errorMessage,
      'checkbox--required': this.required,
    };
  }

  /**
   * Handles the checkbox change event.
   * @param event The change event
   */
  onCheckboxChange(event: Event): void {
    if (this.disabled) return;

    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChange(this.checked);
    this.valueChange.emit(this.checked);
  }

  /**
   * Handles the checkbox focus event.
   */
  onFocus(): void {
    this.isFocused = true;
  }

  /**
   * Handles the checkbox blur event.
   */
  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  /**
   * Writes a value to the checkbox.
   * @param value The value to write
   */
  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  /**
   * Registers a function to call when the checkbox value changes.
   * @param fn The function to register
   */
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  /**
   * Registers a function to call when the checkbox is touched.
   * @param fn The function to register
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Sets the disabled state of the checkbox.
   * @param isDisabled Whether the checkbox is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
