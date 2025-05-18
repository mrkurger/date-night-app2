import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { _NebularModule } from '../../nebular.module';

import { CommonModule } from '@angular/common';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule, NbToggleModule],
  template: `
    <nb-toggle
      [checked]="value"
      [disabled]="disabled"
      [status]="status"
      [labelPosition]="labelPosition"
      (checkedChange)="onToggleChange($event)"
    >
      <ng-content></ng-content>
    </nb-toggle>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
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
  @Input() status: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';
  @Input() labelPosition: 'start' | 'end' = 'end';
  @Input() disabled = false;
  @Output() change = new EventEmitter<boolean>();

  value = false;
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onToggleChange(checked: boolean): void {
    this.value = checked;
    this.onChange(checked);
    this.onTouched();
    this.change.emit(checked);
  }
}
