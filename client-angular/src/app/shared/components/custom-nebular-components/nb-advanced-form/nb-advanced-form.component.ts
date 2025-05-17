import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';

export interface FormField {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'time'
    | 'textarea'
    | 'array'
    | 'group';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  options?: { value: any; label: string }[];
  validators?: ((control: AbstractControl) => ValidationErrors | null)[];
  asyncValidators?: ((control: AbstractControl) => Promise<ValidationErrors | null>)[];
  fields?: FormField[]; // For group and array types
  defaultValue?: any;
  hint?: string;
  errorMessages?: { [key: string]: string };
}

@Component({
  selector: 'nb-advanced-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="advanced-form">
      <nb-card>
        <nb-card-header *ngIf="title">
          <h5 class="form-title">{{ title }}</h5>
        </nb-card-header>

        <nb-card-body>
          <!-- Form Fields -->
          <ng-container *ngFor="let field of fields">
            <ng-container [ngSwitch]="field.type">
              <!-- Text, Number, Email, Password Inputs -->
              <nb-form-field
                *ngSwitchCase="
                  field.type === 'text' ||
                  field.type === 'number' ||
                  field.type === 'email' ||
                  field.type === 'password'
                "
              >
                <label>{{ field.label }}</label>
                <input
                  nbInput
                  fullWidth
                  [type]="field.type"
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                />
                <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(field.key)">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Textarea -->
              <nb-form-field *ngSwitchCase="'textarea'">
                <label>{{ field.label }}</label>
                <textarea
                  nbInput
                  fullWidth
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                ></textarea>
                <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(field.key)">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Select -->
              <nb-form-field *ngSwitchCase="'select'">
                <label>{{ field.label }}</label>
                <nb-select
                  fullWidth
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                >
                  <nb-option *ngFor="let option of field.options" [value]="option.value">
                    {{ option.label }}
                  </nb-option>
                </nb-select>
                <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(field.key)">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Radio -->
              <div *ngSwitchCase="'radio'" class="form-field">
                <label>{{ field.label }}</label>
                <nb-radio-group [formControlName]="field.key">
                  <nb-radio *ngFor="let option of field.options" [value]="option.value">
                    {{ option.label }}
                  </nb-radio>
                </nb-radio-group>
                <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(field.key)">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </nb-error>
              </div>

              <!-- Checkbox -->
              <div *ngSwitchCase="'checkbox'" class="form-field">
                <nb-checkbox [formControlName]="field.key" [required]="field.required">
                  {{ field.label }}
                </nb-checkbox>
                <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(field.key)">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </nb-error>
              </div>

              <!-- Date -->
              <nb-form-field *ngSwitchCase="'date'">
                <label>{{ field.label }}</label>
                <input
                  nbInput
                  fullWidth
                  [nbDatepicker]="datepicker"
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                />
                <nb-datepicker #datepicker></nb-datepicker>
                <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(field.key)">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Time -->
              <nb-form-field *ngSwitchCase="'time'">
                <label>{{ field.label }}</label>
                <input
                  nbInput
                  fullWidth
                  [nbTimepicker]="timepicker"
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                />
                <nb-timepicker #timepicker></nb-timepicker>
                <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(field.key)">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Form Array -->
              <nb-form-array
                *ngSwitchCase="'array'"
                [formArrayName]="field.key"
                [field]="field"
                [form]="form"
              ></nb-form-array>

              <!-- Form Group -->
              <nb-form-group
                *ngSwitchCase="'group'"
                [formGroupName]="field.key"
                [field]="field"
                [form]="form"
              ></nb-form-group>
            </ng-container>
          </ng-container>

          <!-- Form-wide Error -->
          <nb-alert *ngIf="formError" status="danger" class="form-error">
            {{ formError }}
          </nb-alert>
        </nb-card-body>

        <nb-card-footer *ngIf="showFooter">
          <div class="form-actions">
            <button
              nbButton
              type="button"
              status="basic"
              [disabled]="submitting"
              (click)="onCancel()"
            >
              {{ cancelText }}
            </button>
            <button
              nbButton
              type="submit"
              status="primary"
              [disabled]="!form.valid || submitting"
              [nbSpinner]="submitting"
            >
              {{ submitText }}
            </button>
          </div>
        </nb-card-footer>
      </nb-card>
    </form>
  `,
  styles: [
    `
      .advanced-form {
        width: 100%;
      }

      .form-title {
        margin: 0;
        color: nb-theme(text-basic-color);
        font-weight: nb-theme(text-heading-5-font-weight);
      }

      .form-field {
        margin-bottom: 1.5rem;
      }

      nb-form-field {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: nb-theme(text-basic-color);
        font-weight: nb-theme(text-subtitle-font-weight);
      }

      .form-error {
        margin: 1rem 0;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      nb-radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      nb-checkbox {
        display: block;
      }

      nb-hint {
        margin-top: 0.25rem;
        font-size: nb-theme(text-caption-font-size);
      }
    `,
  ],
})
export class NbAdvancedFormComponent implements OnInit {
  @Input() fields: FormField[] = [];
  @Input() title = '';
  @Input() submitText = 'Submit';
  @Input() cancelText = 'Cancel';
  @Input() showFooter = true;
  @Input() initialValues?: { [key: string]: any };

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;
  submitting = false;
  formError: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    const group: { [key: string]: any } = {};

    this.fields.forEach((field) => {
      const validators = field.validators || [];
      const asyncValidators = field.asyncValidators || [];
      const initialValue = this.getInitialValue(field);

      if (field.type === 'group') {
        group[field.key] = this.createFormGroup(field.fields || []);
      } else if (field.type === 'array') {
        group[field.key] = this.fb.array([]);
      } else {
        group[field.key] = [
          { value: initialValue, disabled: field.disabled },
          validators,
          asyncValidators,
        ];
      }
    });

    this.form = this.fb.group(group);
  }

  private createFormGroup(fields: FormField[]): FormGroup {
    const group: { [key: string]: any } = {};

    fields.forEach((field) => {
      const validators = field.validators || [];
      const asyncValidators = field.asyncValidators || [];
      const initialValue = this.getInitialValue(field);

      if (field.type === 'group') {
        group[field.key] = this.createFormGroup(field.fields || []);
      } else if (field.type === 'array') {
        group[field.key] = this.fb.array([]);
      } else {
        group[field.key] = [
          { value: initialValue, disabled: field.disabled },
          validators,
          asyncValidators,
        ];
      }
    });

    return this.fb.group(group);
  }

  private getInitialValue(field: FormField): any {
    if (this.initialValues && this.initialValues[field.key] !== undefined) {
      return this.initialValues[field.key];
    }
    return field.defaultValue !== undefined ? field.defaultValue : null;
  }

  shouldShowError(fieldKey: string): boolean {
    const control = this.form.get(fieldKey);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getErrorMessage(fieldKey: string, errorMessages?: { [key: string]: string }): string {
    const control = this.form.get(fieldKey);
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

  async onSubmit() {
    if (this.form.valid && !this.submitting) {
      this.submitting = true;
      this.formError = null;

      try {
        this.formSubmit.emit(this.form.value);
      } catch (error) {
        this.formError = error instanceof Error ? error.message : 'An error occurred';
      } finally {
        this.submitting = false;
      }
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
