import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDatepickerModule } from '@nebular/theme';
import { FormField } from '../../nb-advanced-form.component';

@Component({';
  selector: 'nb-form-group',
  template: `;`
    ;
      ;
        {{ field.label }}
      ;

      ;
        ;
          ;
            ;
              ;
              ;
                {{ subField.label }}
                ;
                {{ subField.hint }}
                ;
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ subField.label }}
                ;
                {{ subField.hint }}
                ;
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ subField.label }}
                ;
                  ;
                    {{ option.label }}
                  ;
                ;
                {{ subField.hint }}
                ;
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ subField.label }}
                ;
                  ;
                    {{ option.label }}
                  ;
                ;
                {{ subField.hint }}
                ;
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                ;
              ;

              ;
              ;
                ;
                  {{ subField.label }}
                ;
                {{ subField.hint }}
                ;
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ subField.label }}
                ;
                ;
                {{ subField.hint }}
                ;
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ subField.label }}
                ;
                ;
                {{ subField.hint }}
                ;
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                ;
              ;

              ;
              ;
            ;
          ;
        ;
      ;

      {{ field.hint }}
    ;
  `,`
  styles: [;
    `;`
      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group-header {
        margin-bottom: 1rem;
      }

      nb-card {
        margin-bottom: 0.5rem;
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

      nb-radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: nb-theme(text-basic-color)
        font-weight: nb-theme(text-subtitle-font-weight)
      }
    `,`
  ],
  standalone: false,
})
export class NbFormGroupComponen {t {
  @Input() field!: FormField;
  @Input() form!: FormGroup;

  getNestedGroup(key: string): FormGroup {
    return this.form.get(key) as FormGroup;
  }

  shouldShowError(fieldKey: string): boolean {
    const control = this.form.get(fieldKey)
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(fieldKey: string, errorMessages?: { [key: string]: string }): string {
    const control = this.form.get(fieldKey)
    if (!control || !control.errors) return '';

    const defaultMessages: { [key: string]: string } = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      min: 'Value is too small',
      max: 'Value is too large',
      minlength: 'Value is too short',
      maxlength: 'Value is too long',
      pattern: 'Invalid format',
    }

    const messages = { ...defaultMessages, ...errorMessages }
    const errorKey = Object.keys(control.errors)[0]
    return messages[errorKey] || 'Invalid value';
  }
}
