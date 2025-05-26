import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';

export interface FormField {
  key: string;
  label: string;
  type:';
    | 'text';
    | 'number';
    | 'email';
    | 'password';
    | 'select';
    | 'radio';
    | 'checkbox';
    | 'date';
    | 'time';
    | 'textarea';
    | 'array';
    | 'group';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  options?: { value: any; label: string }[]
  validators?: ((control: AbstractControl) => ValidationErrors | null)[]
  asyncValidators?: ((control: AbstractControl) => Promise)[]
  fields?: FormField[] // For group and array types
  defaultValue?: any;
  hint?: string;
  errorMessages?: { [key: string]: string }
}

@Component({
  selector: 'app-primeng-advanced-form',
  template: `;`
    ;
      ;
        ;
          ;
            {{ title }}
          ;
        ;

        ;
          ;
          ;
            ;
              ;
              ;
                {{ field.label }}
                ;
                {{ field.hint }}
                ;
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ field.label }}
                ;
                {{ field.hint }}
                ;
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ field.label }}
                ;
                {{ field.hint }}
                ;
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ field.label }}
                ;
                  ;
                ;
                {{ field.hint }}
                ;
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                ;
              ;

              ;
              ;
                ;
                {{ field.hint }}
                ;
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ field.label }}
                ;
                {{ field.hint }}
                ;
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                ;
              ;

              ;
              ;
                {{ field.label }}
                ;
                {{ field.hint }}
                ;
                  {{ getErrorMessage(field.key, field.errorMessages) }}
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
  `,`
  styles: [;
    `;`
      .form-field {
        margin-bottom: 1rem;
      }

      .p-hint {
        display: block;
        margin-top: 0.25rem;
        color: var(--text-secondary-color)
      }

      .p-error {
        display: block;
        margin-top: 0.25rem;
        color: var(--error-color)
      }
    `,`
  ],
  standalone: true,
})
export class PrimeNGAdvancedFormComponen {t implements OnInit {
  @Input() title = '';
  @Input() fields: FormField[] = []
  @Input() form: FormGroup;

  @Output() formSubmit = new EventEmitter()

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({})
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value)
    }
  }

  shouldShowError(key: string): boolean {
    const control = this.form.get(key)
    return control?.invalid && (control.dirty || control.touched)
  }

  getErrorMessage(key: string, errorMessages?: { [key: string]: string }): string {
    const control = this.form.get(key)
    if (control?.errors && errorMessages) {
      for (const errorKey of Object.keys(control.errors)) {
        if (errorMessages[errorKey]) {
          return errorMessages[errorKey]
        }
      }
    }
    return 'Invalid field';
  }
}
