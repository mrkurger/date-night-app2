import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NbDatepickerModule } from '@nebular/theme';
import { FormField } from '../../nb-advanced-form.component';

@Component({
  selector: 'nb-form-group',
  template: `
    <div class="form-group">
      <div class="form-group-header">
        <label>{{ field.label }}</label>
      </div>

      <nb-card>
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
                <nb-error *ngIf="shouldShowError(subField.key)">
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Textarea -->
              <nb-form-field *ngSwitchCase="'textarea'">
                <label>{{ subField.label }}</label>
                <textarea
                  nbInput
                  fullWidth
                  [placeholder]="subField.placeholder || ''"
                  [formControlName]="subField.key"
                  [required]="subField.required"
                ></textarea>
                <nb-hint *ngIf="subField.hint">{{ subField.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(subField.key)">
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
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
                <nb-error *ngIf="shouldShowError(subField.key)">
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Radio -->
              <div *ngSwitchCase="'radio'" class="form-field">
                <label>{{ subField.label }}</label>
                <nb-radio-group [formControlName]="subField.key">
                  <nb-radio *ngFor="let option of subField.options" [value]="option.value">
                    {{ option.label }}
                  </nb-radio>
                </nb-radio-group>
                <nb-hint *ngIf="subField.hint">{{ subField.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(subField.key)">
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                </nb-error>
              </div>

              <!-- Checkbox -->
              <div *ngSwitchCase="'checkbox'" class="form-field">
                <nb-checkbox [formControlName]="subField.key" [required]="subField.required">
                  {{ subField.label }}
                </nb-checkbox>
                <nb-hint *ngIf="subField.hint">{{ subField.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(subField.key)">
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
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
                <nb-error *ngIf="shouldShowError(subField.key)">
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Time -->
              <nb-form-field *ngSwitchCase="'time'">
                <label>{{ subField.label }}</label>
                <input
                  nbInput
                  fullWidth
                  [nbTimepicker]="timepicker"
                  [placeholder]="subField.placeholder || ''"
                  [formControlName]="subField.key"
                  [required]="subField.required"
                />
                <nb-timepicker #timepicker></nb-timepicker>
                <nb-hint *ngIf="subField.hint">{{ subField.hint }}</nb-hint>
                <nb-error *ngIf="shouldShowError(subField.key)">
                  {{ getErrorMessage(subField.key, subField.errorMessages) }}
                </nb-error>
              </nb-form-field>

              <!-- Nested Form Group -->
              <nb-form-group
                *ngSwitchCase="'group'"
                [formGroupName]="subField.key"
                [field]="subField"
                [form]="getNestedGroup(subField.key)"
              ></nb-form-group>
            </ng-container>
          </ng-container>
        </nb-card-body>
      </nb-card>

      <nb-hint *ngIf="field.hint">{{ field.hint }}</nb-hint>
    </div>
  `,
  styles: [
    `
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
        color: nb-theme(text-basic-color);
        font-weight: nb-theme(text-subtitle-font-weight);
      }
    `,
  ],
  standalone: false,
})
export class NbFormGroupComponent {
  @Input() field!: FormField;
  @Input() form!: FormGroup;

  getNestedGroup(key: string): FormGroup {
    return this.form.get(key) as FormGroup;
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
}
