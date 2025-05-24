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
  selector: 'app-primeng-advanced-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="advanced-form">
      <p-card>
        <ng-container *ngIf="title">
          <ng-template pTemplate="header">
            <h5 class="form-title">{{ title }}</h5>
          </ng-template>
        </ng-container>

        <ng-template pTemplate="content">
          <!-- Form Fields -->
          <ng-container *ngFor="let field of fields">
            <ng-container [ngSwitch]="field.type">
              <!-- Text, Number, Email, Password Inputs -->
              <div *ngSwitchCase="'text' || 'number' || 'email' || 'password'" class="form-field">
                <label>{{ field.label }}</label>
                <input
                  pInputText
                  [type]="field.type"
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                />
                <small *ngIf="field.hint" class="p-hint">{{ field.hint }}</small>
                <small *ngIf="shouldShowError(field.key)" class="p-error">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </small>
              </div>

              <!-- Textarea -->
              <div *ngSwitchCase="'textarea'" class="form-field">
                <label>{{ field.label }}</label>
                <textarea
                  pInputTextarea
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                ></textarea>
                <small *ngIf="field.hint" class="p-hint">{{ field.hint }}</small>
                <small *ngIf="shouldShowError(field.key)" class="p-error">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </small>
              </div>

              <!-- Select -->
              <div *ngSwitchCase="'select'" class="form-field">
                <label>{{ field.label }}</label>
                <p-dropdown
                  [options]="field.options"
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                ></p-dropdown>
                <small *ngIf="field.hint" class="p-hint">{{ field.hint }}</small>
                <small *ngIf="shouldShowError(field.key)" class="p-error">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </small>
              </div>

              <!-- Radio -->
              <div *ngSwitchCase="'radio'" class="form-field">
                <label>{{ field.label }}</label>
                <div *ngFor="let option of field.options">
                  <p-radioButton
                    [value]="option.value"
                    [formControlName]="field.key"
                    [label]="option.label"
                  ></p-radioButton>
                </div>
                <small *ngIf="field.hint" class="p-hint">{{ field.hint }}</small>
                <small *ngIf="shouldShowError(field.key)" class="p-error">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </small>
              </div>

              <!-- Checkbox -->
              <div *ngSwitchCase="'checkbox'" class="form-field">
                <p-checkbox
                  [formControlName]="field.key"
                  [label]="field.label"
                  [binary]="true"
                ></p-checkbox>
                <small *ngIf="field.hint" class="p-hint">{{ field.hint }}</small>
                <small *ngIf="shouldShowError(field.key)" class="p-error">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </small>
              </div>

              <!-- Date -->
              <div *ngSwitchCase="'date'" class="form-field">
                <label>{{ field.label }}</label>
                <p-calendar
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                ></p-calendar>
                <small *ngIf="field.hint" class="p-hint">{{ field.hint }}</small>
                <small *ngIf="shouldShowError(field.key)" class="p-error">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </small>
              </div>

              <!-- Time -->
              <div *ngSwitchCase="'time'" class="form-field">
                <label>{{ field.label }}</label>
                <p-calendar
                  [timeOnly]="true"
                  [placeholder]="field.placeholder || ''"
                  [formControlName]="field.key"
                  [required]="field.required"
                ></p-calendar>
                <small *ngIf="field.hint" class="p-hint">{{ field.hint }}</small>
                <small *ngIf="shouldShowError(field.key)" class="p-error">
                  {{ getErrorMessage(field.key, field.errorMessages) }}
                </small>
              </div>
            </ng-container>
          </ng-container>
        </ng-template>

        <ng-template pTemplate="footer">
          <button pButton type="submit" label="Submit" class="p-button-primary"></button>
        </ng-template>
      </p-card>
    </form>
  `,
  styles: [
    `
      .form-field {
        margin-bottom: 1rem;
      }

      .p-hint {
        display: block;
        margin-top: 0.25rem;
        color: var(--text-secondary-color);
      }

      .p-error {
        display: block;
        margin-top: 0.25rem;
        color: var(--error-color);
      }
    `,
  ],
  standalone: true,
})
export class PrimeNGAdvancedFormComponent implements OnInit {
  @Input() title = '';
  @Input() fields: FormField[] = [];
  @Input() form: FormGroup;

  @Output() formSubmit = new EventEmitter<any>();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({});
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    }
  }

  shouldShowError(key: string): boolean {
    const control = this.form.get(key);
    return control?.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(key: string, errorMessages?: { [key: string]: string }): string {
    const control = this.form.get(key);
    if (control?.errors && errorMessages) {
      for (const errorKey of Object.keys(control.errors)) {
        if (errorMessages[errorKey]) {
          return errorMessages[errorKey];
        }
      }
    }
    return 'Invalid field';
  }
}
