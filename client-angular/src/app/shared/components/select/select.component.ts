// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (select.component)
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
 * Select Option Interface
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * Select Component
 *
 * A customizable select component that follows the DateNight.io design system.
 * Supports different variants, sizes, and states.
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  /**
   * The select options.
   */
  @Input() options: SelectOption[] = [];

  /**
   * The select placeholder.
   * @default 'Select an option'
   */
  @Input() placeholder = 'Select an option';

  /**
   * The select label.
   * @default ''
   */
  @Input() label = '';

  /**
   * The select helper text.
   * @default ''
   */
  @Input() helperText = '';

  /**
   * The select error message.
   * @default ''
   */
  @Input() errorMessage = '';

  /**
   * Whether the select is required.
   * @default false
   */
  @Input() required = false;

  /**
   * Whether the select is disabled.
   * @default false
   */
  @Input() disabled = false;

  /**
   * The select size.
   * - 'small': Compact size
   * - 'medium': Default size
   * - 'large': Larger size
   * @default 'medium'
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * The select variant.
   * - 'outlined': Outlined select with border
   * - 'filled': Filled select with background
   * - 'standard': Standard select with bottom border only
   * @default 'outlined'
   */
  @Input() variant: 'outlined' | 'filled' | 'standard' = 'outlined';

  /**
   * The select name attribute.
   */
  @Input() name?: string;

  /**
   * The select id attribute.
   */
  @Input() id?: string;

  /**
   * Event emitted when the select value changes.
   */
  @Output() valueChange = new EventEmitter<string | number>();

  /**
   * Event emitted when the select is focused.
   */
  @Output() focused = new EventEmitter<FocusEvent>();

  /**
   * Event emitted when the select is blurred.
   */
  @Output() blurred = new EventEmitter<FocusEvent>();

  /**
   * The select value.
   */
  value: string | number = '';

  /**
   * Whether the select is focused.
   */
  isFocused = false;

  /**
   * Function to call when the select value changes.
   */
  private onChange: (value: string | number) => void = () => {};

  /**
   * Function to call when the select is touched.
   */
  private onTouched: () => void = () => {};

  /**
   * Gets the CSS classes for the select container based on its properties.
   * @returns An object with CSS class names as keys and boolean values
   */
  get containerClasses(): Record<string, boolean> {
    return {
      select: true,
      [`select--${this.variant}`]: true,
      [`select--${this.size}`]: true,
      'select--disabled': this.disabled,
      'select--focused': this.isFocused,
      'select--error': !!this.errorMessage,
      'select--with-label': !!this.label,
      'select--required': this.required,
      'select--has-value': !!this.value,
    };
  }

  /**
   * Handles the select change event.
   * @param event The change event
   */
  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  /**
   * Handles the select focus event.
   * @param event The focus event
   */
  onFocus(event: FocusEvent): void {
    this.isFocused = true;
    this.focused.emit(event);
  }

  /**
   * Handles the select blur event.
   * @param event The blur event
   */
  onBlur(event: FocusEvent): void {
    this.isFocused = false;
    this.onTouched();
    this.blurred.emit(event);
  }

  /**
   * Writes a value to the select.
   * @param value The value to write
   */
  writeValue(value: string | number): void {
    this.value = value ?? '';
  }

  /**
   * Registers a function to call when the select value changes.
   * @param fn The function to register
   */
  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  /**
   * Registers a function to call when the select is touched.
   * @param fn The function to register
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Sets the disabled state of the select.
   * @param isDisabled Whether the select is disabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
