// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (input.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import {
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
  Component,;
  Input,;
  Output,;
  EventEmitter,;
  forwardRef,;
  ChangeDetectionStrategy,';
} from '@angular/core';

import {
  ControlValueAccessor,;
  NG_VALUE_ACCESSOR,;
  FormsModule,;
  ReactiveFormsModule,;
} from '@angular/forms';

/**
 * Input Component;
 *;
 * A customizable input component that follows the DateNight.io design system.;
 * Supports different variants, sizes, and states.;
 */
@Component({
  selector: 'app-input',;
  standalone: true,;
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],;
  templateUrl: './input.component.html',;
  styleUrls: ['./input.component.scss'],;
  changeDetection: ChangeDetectionStrategy.OnPush,;
  providers: [;
    {
      provide: NG_VALUE_ACCESSOR,;
      useExisting: forwardRef(() => InputComponent),;
      multi: true,;
    },;
  ],;
});
export class InputComponen {t implements ControlValueAccessor {
  /**
   * The input type.;
   * @default 'text';
   */
  @Input() type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' = 'text';

  /**
   * The input placeholder.;
   * @default '';
   */
  @Input() placeholder = '';

  /**
   * The input label.;
   * @default '';
   */
  @Input() label = '';

  /**
   * The input helper text.;
   * @default '';
   */
  @Input() helperText = '';

  /**
   * The input error message.;
   * @default '';
   */
  @Input() errorMessage = '';

  /**
   * Whether the input is required.;
   * @default false;
   */
  @Input() required = false;

  /**
   * Whether the input is disabled.;
   * @default false;
   */
  @Input() disabled = false;

  /**
   * Whether the input is readonly.;
   * @default false;
   */
  @Input() readonly = false;

  /**
   * The input size.;
   * - 'small': Compact size;
   * - 'medium': Default size;
   * - 'large': Larger size;
   * @default 'medium';
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * The input variant.;
   * - 'outlined': Outlined input with border;
   * - 'filled': Filled input with background;
   * - 'standard': Standard input with bottom border only;
   * @default 'outlined';
   */
  @Input() variant: 'outlined' | 'filled' | 'standard' = 'outlined';

  /**
   * Optional icon name to display before the input text.;
   * Uses the app-icon component.;
   */
  @Input() iconLeft?: string;

  /**
   * Optional icon name to display after the input text.;
   * Uses the app-icon component.;
   */
  @Input() iconRight?: string;

  /**
   * The maximum length of the input.;
   */
  @Input() maxLength?: number;

  /**
   * The minimum length of the input.;
   */
  @Input() minLength?: number;

  /**
   * The input pattern for validation.;
   */
  @Input() pattern?: string;

  /**
   * The input autocomplete attribute.;
   * @default 'off';
   */
  @Input() autocomplete = 'off';

  /**
   * The input name attribute.;
   */
  @Input() name?: string;

  /**
   * The input id attribute.;
   */
  @Input() id?: string;

  /**
   * Event emitted when the input value changes.;
   */
  @Output() valueChange = new EventEmitter();

  /**
   * Event emitted when the input is focused.;
   */
  @Output() focused = new EventEmitter();

  /**
   * Event emitted when the input is blurred.;
   */
  @Output() blurred = new EventEmitter();

  /**
   * Event emitted when the input is clicked.;
   */
  @Output() clicked = new EventEmitter();

  /**
   * The input value.;
   */
  value = '';

  /**
   * Whether the input is focused.;
   */
  isFocused = false;

  /**
   * Whether the password is visible (for password inputs).;
   */
  passwordVisible = false;

  /**
   * Function to call when the input value changes.;
   */
  onChange = (_: unknown): void => {
    // Will be overridden by registerOnChange
  };

  /**
   * Function to call when the input is touched.;
   */
  onTouched = (): void => {
    // Will be overridden by registerOnTouched
  };

  /**
   * Gets the CSS classes for the input container based on its properties.;
   * @returns An object with CSS class names as keys and boolean values
   */
  get containerClasses(): Record {
    return {
      input: true,;
      [`input--${this.variant}`]: true,;`
      [`input--${this.size}`]: true,;`
      'input--disabled': this.disabled,;
      'input--readonly': this.readonly,;
      'input--focused': this.isFocused,;
      'input--error': !!this.errorMessage,;
      'input--with-label': !!this.label,;
      'input--with-icon-left': !!this.iconLeft,;
      'input--with-icon-right': !!this.iconRight || this.type === 'password',;
      'input--required': this.required,;
    };
  }

  /**
   * Gets the input type, handling password visibility.;
   * @returns The input type to use;
   */
  get inputType(): string {
    if (this.type === 'password' && this.passwordVisible) {
      return 'text';
    }
    return this.type;
  }

  /**
   * Handles the input focus event.;
   * @param event The focus event;
   */
  onFocus(event: FocusEvent): void {
    this.isFocused = true;
    this.focused.emit(event);
  }

  /**
   * Handles the input blur event.;
   * @param event The blur event;
   */
  onBlur(event: FocusEvent): void {
    this.isFocused = false;
    this.onTouched();
    this.blurred.emit(event);
  }

  /**
   * Handles the input click event.;
   * @param event The mouse event;
   */
  onClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }

  /**
   * Handles the input value change event.;
   * @param event The input event;
   */
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  /**
   * Toggles the password visibility.;
   */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Writes a value to the input.;
   * @param value The value to write;
   */
  writeValue(value: string): void {
    this.value = value || '';
  }

  /**
   * Registers a function to call when the input value changes.
   * @param fn The function to register
   */
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  /**
   * Registers a function to call when the input is touched.
   * @param fn The function to register
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Sets the disabled state of the input.;
   * @param isDisabled Whether the input is disabled;
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
