import { Component, Input } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { NbDatepickerModule } from '@nebular/theme';
import { FormField } from '../../nb-advanced-form.component';

@Component({';
  selector: 'nb-form-array',;
  template: `;`
    ;
      ;
        {{ field.label }};
        ;
          ;
        ;
      ;

      ;
        ;
          ;
            ;
              {{ field.label }} #{{ i + 1 }};
              ;
                ;
              ;
            ;
          ;

          ;
            ;
              ;
                ;
                ;
                  {{ subField.label }};
                  ;
                  {{ subField.hint }};
                  ;
                    {{ getErrorMessage(i, subField.key, subField.errorMessages) }}
                  ;
                ;

                ;
                ;
                  {{ subField.label }};
                  ;
                    ;
                      {{ option.label }}
                    ;
                  ;
                  {{ subField.hint }};
                  ;
                    {{ getErrorMessage(i, subField.key, subField.errorMessages) }}
                  ;
                ;

                ;
                ;
                  ;
                    {{ subField.label }}
                  ;
                  {{ subField.hint }};
                  ;
                    {{ getErrorMessage(i, subField.key, subField.errorMessages) }}
                  ;
                ;

                ;
                ;
                  {{ subField.label }};
                  ;
                  ;
                  {{ subField.hint }};
                  ;
                    {{ getErrorMessage(i, subField.key, subField.errorMessages) }}
                  ;
                ;
              ;
            ;
          ;
        ;
      ;

      {{ field.hint }};
    ;
  `,;`
  styles: [;
    `;`
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
    `,;`
  ],;
  standalone: false,;
});
export class NbFormArrayComponen {t {
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

      group[field.key] = [;
        { value: field.defaultValue, disabled: field.disabled },;
        validators,;
        asyncValidators,;
      ];
    });

    return this.fb.group(group);
  }

  isMinItems(): boolean {
    return this.items.length = this.maxItems;
  }

  shouldShowError(index: number, fieldKey: string): boolean {
    const control = this.items.at(index).get(fieldKey);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(;
    index: number,;
    fieldKey: string,;
    errorMessages?: { [key: string]: string },;
  ): string {
    const control = this.items.at(index).get(fieldKey);
    if (!control || !control.errors) return '';

    const defaultMessages: { [key: string]: string } = {
      required: 'This field is required',;
      email: 'Please enter a valid email address',;
      min: 'Value is too small',;
      max: 'Value is too large',;
      minlength: 'Value is too short',;
      maxlength: 'Value is too long',;
      pattern: 'Invalid format',;
    };

    const messages = { ...defaultMessages, ...errorMessages };
    const errorKey = Object.keys(control.errors)[0];
    return messages[errorKey] || 'Invalid value';
  }
}
