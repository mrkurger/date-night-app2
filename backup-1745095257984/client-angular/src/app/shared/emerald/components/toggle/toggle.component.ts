// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for component configuration (toggle.component)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Emerald Toggle Component
 *
 * A wrapper for the Emerald.js Toggle component.
 * This component displays a toggle switch for boolean values.
 *
 * Documentation: https://docs-emerald.condorlabs.io/Toggle
 */
@Component({
  selector: 'emerald-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() labelPosition: 'left' | 'right' = 'right';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() disabled = false;
  @Input() name?: string;
  @Input() id?: string;
  @Input() required = false;
  @Input() ariaLabel?: string;

  @Output() change = new EventEmitter<boolean>();

  value = false;

  // ControlValueAccessor methods
  private onChange: any = () => {};
  private onTouched: any = () => {};

  /**
   * Toggle the value
   */
  toggle(): void {
    if (this.disabled) return;

    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
    this.change.emit(this.value);
  }

  /**
   * Write value to the component
   */
  writeValue(value: boolean): void {
    this.value = value;
  }

  /**
   * Register change handler
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Register touched handler
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Set disabled state
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
