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
import { NbToggleModule } from '@nebular/theme';

/**
 * Toggle Component
 *
 * A wrapper for Nebular's NbToggleComponent.
 * This component displays a toggle switch for boolean values.
 */
@Component({
  selector: 'nb-toggle',
  template: `
    <nb-toggle
      [checked]="value"
      [disabled]="disabled"
      [status]="color"
      [labelPosition]="labelPosition"
      [name]="name"
      [required]="required"
      [aria-label]="ariaLabel || label"
      (checkedChange)="toggle($event)"
    >
      {{ label }}
      <span *ngIf="required" class="required-indicator">*</span>
    </nb-toggle>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .required-indicator {
        color: var(--color-danger-500);
        margin-left: 0.25rem;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, NbToggleModule],
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
