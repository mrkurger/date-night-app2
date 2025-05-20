import { Component, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { FormField } from '../../nb-advanced-form.component';

@Component({
    selector: 'nb-form-array',
    template: `
    <div class="form-array">
      <div class="form-array-header">
        <label>{{ field.label }}</label>
        <button
          nbButton
          ghost
          size="small"
          (click)="addItem()"
          [disabled]="isMaxItems()"
          [nbTooltip]="isMaxItems() ? 'Maximum items reached' : 'Add item'"
        >
          <nb-icon icon="plus-outline"></nb-icon>
        </button>
      </div>

      <div class="form-array-items">
        <nb-card *ngFor="let item of items.controls; let i = index" size="tiny">
          <nb-card-header>
            <div class="item-header">
              <span class="item-title">{{ field.label }} #{{ i + 1 }}</span>
              <button
                nbButton
                ghost
                size="tiny"
                status="danger"
                (click)="removeItem(i)"
                [disabled]="isMinItems()"
                [nbTooltip]="isMinItems() ? 'Minimum items reached' : 'Remove item'"
              >
                <nb-icon icon="trash-2-outline"></nb-icon>
              </button>
            </div>
          </nb-card-header>

          <nb-card-body>
            <ng-container *ngFor="let subField of field.fields">
              <ng-container [ngSwitch]="subField.type">
                <!-- Text, Number, Email, Password Inputs -->
                <nb-form-field
                  *ngSwitchCase="
                    subField.type === 'text' ||
                    subField.type === 'number' ||
                    subField.type === 'email' ||
                    subField.type === 'password'
                  "
                >
                  <label>{{ subField.label }}</label>
                  <input
                    nbInput
                    fullWidth
                    [type]="subField.type"
                    [placeholder]="subField.placeholder || ''"
                    [formControlName]="subField.key"
                    [required]="subField.required"
                  />
                  <nb-hint *ngIf="subField.hint">{{ subField.hint }}</nb-hint>
                  <nb-error *ngIf="shouldShowError(i, subField.key)">
                    {{ getErrorMessage(i, subField.key, subField.errorMessages) }}
                  </nb-error>
                </nb-form-field>

                <!-- Select -->
                <nb-form-field *ngSwitchCase="'select'">
                  <label>{{ subField.label }}</label>
                  <nb-select
                    fullWidth
                    [placeholder]="subField.placeholder || ''"
                    [formControlName]="subField.key"
                    [required]="subField.required"
                  >
                    <nb-option *ngFor="let option of subField.options" [value]="option.value">
                      {{ option.label }}
                    </nb-option>
                  </nb-select>
                  <nb-hint *ngIf="subField.hint">{{ subField.hint }}</nb-hint>
                  <nb-error *ngIf="shouldShowError(i, subField.key)">
                    {{ getErrorMessage(i, subField.key, subField.errorMessages) }}
                  </nb-error>
                </nb-form-field>

                <!-- Checkbox -->
                <div *ngSwitchCase="'checkbox'" class="form-field">
                  <nb-checkbox [formControlName]="subField.key" [required]="subField.required">
                    {{ subField.label }}
                  </nb-checkbox>
                  <nb-hint *ngIf="subField.hint">{{ subField.hint }}</nb-hint>
                  <nb-error *ngIf="shouldShowError(i, subField.key)">
                    {{ getErrorMessage(i, subField.key, subField.errorMessages) }}
                  </nb-error>
                </div>

                <!-- Date -->
                <nb-form-field *ngSwitchCase="'date'">
                  <label>{{ subField.label }}</label>
                  <input
                    nbInput
                    fullWidth
                    [nbDatepicker]="datepicker"
                    [placeholder]="subField.placeholder || ''"
                    [formControlName]="subField.key"
                    [required]="subField.required"
                  />
                  <nb-datepicker #datepicker></nb-datepicker>
                  <nb-hint *ngIf="subField.hint">{{ subField.hint }}</nb-hint>
                  <nb-error *ngIf="shouldShowError(i, subField.key)">
                    {{ getErrorMessage(i, subField.key, subField.errorMessages) }}
                  </nb-error>
                </nb-form-field>
              </ng-container>
            </ng-container>
          </nb-card-body>
        </nb-card>
      </div>

      <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
    </div>
  `,
    styles: [
        `
      .form-array {
        margin-bottom: 1.5rem;
      }

      .form-array-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .form-array-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .item-title {
        font-weight: nb-theme(text-subtitle-font-weight);
        color: nb-theme(text-basic-color);
      }

      nb-card {
        margin-bottom: 0;
      }

      nb-form-field {
        margin-bottom: 1rem;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .form-field {
        margin-bottom: 1rem;

        &:last-child {
          margin-bottom: 0;
        }
      }
    `,
    ],
    standalone: false
})
export class NbFormArrayComponent {
  @Input() field!: FormField;
  @Input() form!: FormGroup;

  private readonly minItems = 0;
  private readonly maxItems = 10;

  constructor(private fb: FormBuilder) {}

  get items(): FormArray {
    return this.form.get(this.field.key) as FormArray;
  }

  addItem() {
    if (!this.isMaxItems()) {
      const group = this.createFormGroup();
      this.items.push(group);
    }
  }

  removeItem(index: number) {
    if (!this.isMinItems()) {
      this.items.removeAt(index);
    }
  }

  private createFormGroup(): FormGroup {
    const group: { [key: string]: any } = {};

    (this.field.fields || []).forEach((field) => {
      const validators = field.validators || [];
      const asyncValidators = field.asyncValidators || [];

      group[field.key] = [
        { value: field.defaultValue, disabled: field.disabled },
        validators,
        asyncValidators,
      ];
    });

    return this.fb.group(group);
  }

  isMinItems(): boolean {
    return this.items.length <= this.minItems;
  }

  isMaxItems(): boolean {
    return this.items.length >= this.maxItems;
  }

  shouldShowError(index: number, fieldKey: string): boolean {
    const control = this.items.at(index).get(fieldKey);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(
    index: number,
    fieldKey: string,
    errorMessages?: { [key: string]: string },
  ): string {
    const control = this.items.at(index).get(fieldKey);
    if (!control || !control.errors) return '';

    const defaultMessages: { [key: string]: string } = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      min: 'Value is too small',
      max: 'Value is too large',
      minlength: 'Value is too short',
      maxlength: 'Value is too long',
      pattern: 'Invalid format',
    };

    const messages = { ...defaultMessages, ...errorMessages };
    const errorKey = Object.keys(control.errors)[0];
    return messages[errorKey] || 'Invalid value';
  }
}
