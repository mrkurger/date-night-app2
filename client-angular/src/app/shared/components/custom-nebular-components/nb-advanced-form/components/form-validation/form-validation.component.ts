import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: 'nb-form-validation',
    template: `
    <div class="validation-messages" *ngIf="shouldShowErrors">
      <nb-alert status="danger" size="tiny">
        <ul class="validation-list">
          <li *ngFor="let error of getErrors()">{{ error }}</li>
        </ul>
      </nb-alert>
    </div>
  `,
    styles: [
        `
      .validation-messages {
        margin-top: 0.5rem;
      }

      .validation-list {
        margin: 0;
        padding-left: 1.25rem;

        li {
          margin-bottom: 0.25rem;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    `,
    ],
    standalone: false
})
export class NbFormValidationComponent {
  @Input() control!: AbstractControl;
  @Input() errorMessages: { [key: string]: string } = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    min: 'Value is too small',
    max: 'Value is too large',
    minlength: 'Value is too short',
    maxlength: 'Value is too long',
    pattern: 'Invalid format',
  };

  get shouldShowErrors(): boolean {
    return this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  getErrors(): string[] {
    if (!this.control || !this.control.errors) return [];

    return Object.keys(this.control.errors).map(
      (key) => this.errorMessages[key] || `Invalid value: ${key}`,
    );
  }
}
