import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { NebularModule } from '../../../shared/nebular.module';

import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Toggle Component
 *
 * A wrapper for Nebular's NbToggleComponent.
 * This component displays a toggle switch for boolean values.
 */
@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NbToggleModule
  ],
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
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() disabled = false;
  @Input() name?: string;
  @Input() required = false;
  @Input() ariaLabel?: string;

  @Output() change = new EventEmitter<boolean>();

  value = false;

  // ControlValueAccessor methods
  onChange = (value: any): void => {};
  onTouched = (value: any): void => {};

  /**
   * Toggle the value
   */
  toggle(checked: boolean): void {
    if (this.disabled) return;

    this.value = checked;
    this.onChange(this.value);
    this.onTouched(this.value);
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
