# Form Validation Patterns

This document outlines the recommended patterns for form validation in the DateNight.io application.

## Table of Contents

- [Validation Principles](#validation-principles)
- [Validation Timing](#validation-timing)
- [Error Message Guidelines](#error-message-guidelines)
- [Template-Driven Form Validation](#template-driven-form-validation)
- [Reactive Form Validation](#reactive-form-validation)
- [Custom Validators](#custom-validators)
- [Async Validators](#async-validators)
- [Form-Level Validation](#form-level-validation)
- [Accessibility Considerations](#accessibility-considerations)

## Validation Principles

When implementing form validation in the DateNight.io application, follow these principles:

1. **User-Friendly**: Validation should help users, not frustrate them.
2. **Timely**: Validate at the appropriate time (not too early, not too late).
3. **Clear**: Error messages should be clear and actionable.
4. **Accessible**: Validation should be accessible to all users, including those using screen readers.
5. **Consistent**: Use consistent validation patterns throughout the application.
6. **Preventive**: When possible, prevent errors before they happen (e.g., input masks, selection from lists).

## Validation Timing

Different validation timing strategies are appropriate for different scenarios:

### Recommended Validation Timing

1. **On Blur**: Validate when the user leaves a field (best for most cases).
2. **On Submit**: Validate all fields when the form is submitted.
3. **On Change**: Validate as the user types (use sparingly, best for immediate feedback like password strength).

### Implementation Example

```typescript
@Component({...})
export class MyFormComponent {
  myForm: FormGroup;
  formSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Get error message based on validation timing
  getErrorMessage(controlName: string): string {
    const control = this.myForm.get(controlName);

    // Only show errors if the control is invalid AND
    // (the control has been touched OR the form has been submitted)
    if (control?.invalid && (control.touched || this.formSubmitted)) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      // Add more error types as needed
    }
    return '';
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.myForm.valid) {
      console.log(this.myForm.value);
      // Process form submission
    }
  }
}
```

## Error Message Guidelines

Error messages should be:

1. **Specific**: Clearly explain what's wrong.
2. **Actionable**: Tell the user how to fix the issue.
3. **Positive**: Use positive language, not negative.
4. **Concise**: Keep messages short and to the point.
5. **Human**: Use natural language, not technical jargon.

### Examples

| ❌ Bad Error Message                  | ✅ Good Error Message                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| "Invalid input"                       | "Please enter a valid email address (e.g., user@example.com)"                  |
| "Error: Required"                     | "Please enter your name"                                                       |
| "Password does not meet requirements" | "Password must be at least 8 characters with a number and a special character" |
| "Validation failed"                   | "Please fix the highlighted fields before continuing"                          |

### Implementation Example

```typescript
// Centralized error message service
@Injectable({
  providedIn: 'root',
})
export class ValidationMessageService {
  getErrorMessage(errors: any, fieldName: string = 'This field'): string {
    if (!errors) {
      return '';
    }

    // Required error
    if (errors['required']) {
      return `${fieldName} is required`;
    }

    // Email error
    if (errors['email']) {
      return `Please enter a valid email address`;
    }

    // Min length error
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${fieldName} must be at least ${requiredLength} characters`;
    }

    // Max length error
    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `${fieldName} cannot be longer than ${requiredLength} characters`;
    }

    // Pattern error
    if (errors['pattern']) {
      // Customize based on field type
      if (fieldName.toLowerCase().includes('password')) {
        return 'Password must include at least one letter, one number, and one special character';
      }
      return `${fieldName} has an invalid format`;
    }

    // Custom validators
    if (errors['passwordMismatch']) {
      return 'Passwords do not match';
    }

    // Fallback
    return 'Invalid value';
  }
}
```

## Template-Driven Form Validation

For simpler forms, template-driven validation is often sufficient.

### Basic Example

```html
<form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
  <div class="form-grid">
    <app-input
      name="name"
      label="Name"
      placeholder="Enter your name"
      [(ngModel)]="user.name"
      #name="ngModel"
      required
      [errorMessage]="name.invalid && (name.touched || formSubmitted) ? 'Name is required' : ''"
    >
    </app-input>

    <app-input
      name="email"
      label="Email"
      type="email"
      placeholder="Enter your email"
      [(ngModel)]="user.email"
      #email="ngModel"
      required
      email
      [errorMessage]="getEmailErrorMessage(email)"
    >
    </app-input>
  </div>

  <div class="form-actions">
    <app-button type="submit">Submit</app-button>
  </div>
</form>
```

```typescript
@Component({...})
export class MyFormComponent {
  user = {
    name: '',
    email: ''
  };
  formSubmitted = false;

  getEmailErrorMessage(email: any): string {
    if (email.invalid && (email.touched || this.formSubmitted)) {
      if (email.errors?.['required']) {
        return 'Email is required';
      }
      if (email.errors?.['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  onSubmit(form: NgForm): void {
    this.formSubmitted = true;

    if (form.valid) {
      console.log(this.user);
      // Process form submission
    }
  }
}
```

### Advanced Template-Driven Validation

```html
<form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
  <div class="form-grid">
    <!-- Password field with custom validation -->
    <app-input
      name="password"
      label="Password"
      type="password"
      placeholder="Enter password"
      [(ngModel)]="user.password"
      #password="ngModel"
      required
      minlength="8"
      pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
      [errorMessage]="getPasswordErrorMessage(password)"
    >
    </app-input>

    <!-- Confirm password field with custom validation -->
    <app-input
      name="confirmPassword"
      label="Confirm Password"
      type="password"
      placeholder="Confirm password"
      [(ngModel)]="user.confirmPassword"
      #confirmPassword="ngModel"
      required
      [errorMessage]="getConfirmPasswordErrorMessage(password, confirmPassword)"
    >
    </app-input>
  </div>

  <div class="form-actions">
    <app-button type="submit">Submit</app-button>
  </div>
</form>
```

```typescript
@Component({...})
export class MyFormComponent {
  user = {
    password: '',
    confirmPassword: ''
  };
  formSubmitted = false;

  getPasswordErrorMessage(password: any): string {
    if (password.invalid && (password.touched || this.formSubmitted)) {
      if (password.errors?.['required']) {
        return 'Password is required';
      }
      if (password.errors?.['minlength']) {
        return 'Password must be at least 8 characters';
      }
      if (password.errors?.['pattern']) {
        return 'Password must include at least one letter, one number, and one special character';
      }
    }
    return '';
  }

  getConfirmPasswordErrorMessage(password: any, confirmPassword: any): string {
    if (confirmPassword.invalid && (confirmPassword.touched || this.formSubmitted)) {
      if (confirmPassword.errors?.['required']) {
        return 'Please confirm your password';
      }
    }

    if (confirmPassword.touched && password.value !== confirmPassword.value) {
      return 'Passwords do not match';
    }

    return '';
  }

  onSubmit(form: NgForm): void {
    this.formSubmitted = true;

    // Check if passwords match
    if (this.user.password !== this.user.confirmPassword) {
      form.controls['confirmPassword'].setErrors({ 'passwordMismatch': true });
      return;
    }

    if (form.valid) {
      console.log(this.user);
      // Process form submission
    }
  }
}
```

## Reactive Form Validation

For complex forms with interdependent fields, reactive forms provide more control.

### Basic Example

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <div class="form-grid">
    <app-input
      label="Name"
      placeholder="Enter your name"
      formControlName="name"
      [errorMessage]="getErrorMessage('name')"
    >
    </app-input>

    <app-input
      label="Email"
      type="email"
      placeholder="Enter your email"
      formControlName="email"
      [errorMessage]="getErrorMessage('email')"
    >
    </app-input>
  </div>

  <div class="form-actions">
    <app-button type="submit">Submit</app-button>
  </div>
</form>
```

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({...})
export class MyFormComponent {
  myForm: FormGroup;
  formSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.myForm.get(controlName);
    if (control?.invalid && (control.touched || this.formSubmitted)) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      // Add more error types as needed
    }
    return '';
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.myForm.valid) {
      console.log(this.myForm.value);
      // Process form submission
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.myForm.controls).forEach(key => {
        const control = this.myForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
```

### Advanced Reactive Form Validation

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <div class="form-grid">
    <!-- Basic information -->
    <app-input
      label="Name"
      placeholder="Enter your name"
      formControlName="name"
      [errorMessage]="getErrorMessage('name')"
    >
    </app-input>

    <app-input
      label="Email"
      type="email"
      placeholder="Enter your email"
      formControlName="email"
      [errorMessage]="getErrorMessage('email')"
    >
    </app-input>

    <!-- Address group -->
    <div formGroupName="address" class="form-group">
      <h3 class="form-group__title">Address</h3>
      <div class="form-grid">
        <app-input
          label="Street"
          placeholder="Enter street address"
          formControlName="street"
          [errorMessage]="getNestedErrorMessage('address', 'street')"
        >
        </app-input>

        <app-input
          label="City"
          placeholder="Enter city"
          formControlName="city"
          [errorMessage]="getNestedErrorMessage('address', 'city')"
        >
        </app-input>

        <app-input
          label="Zip Code"
          placeholder="Enter zip code"
          formControlName="zip"
          [errorMessage]="getNestedErrorMessage('address', 'zip')"
        >
        </app-input>
      </div>
    </div>

    <!-- Password group -->
    <div formGroupName="passwordGroup" class="form-group">
      <h3 class="form-group__title">Password</h3>
      <div class="form-grid">
        <app-input
          label="Password"
          type="password"
          placeholder="Enter password"
          formControlName="password"
          [errorMessage]="getNestedErrorMessage('passwordGroup', 'password')"
        >
        </app-input>

        <app-input
          label="Confirm Password"
          type="password"
          placeholder="Confirm password"
          formControlName="confirmPassword"
          [errorMessage]="getPasswordGroupError()"
        >
        </app-input>
      </div>
    </div>
  </div>

  <div class="form-actions">
    <app-button type="submit">Submit</app-button>
  </div>
</form>
```

```typescript
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({...})
export class MyFormComponent {
  myForm: FormGroup;
  formSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        zip: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]]
      }),
      passwordGroup: this.fb.group({
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
        ]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator })
    });
  }

  // Custom validator for password matching
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      // Set error on confirmPassword control
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // If confirmPassword has only the passwordMismatch error, clear it
    if (control.get('confirmPassword')?.errors?.['passwordMismatch']) {
      const confirmErrors = { ...control.get('confirmPassword')?.errors };
      delete confirmErrors['passwordMismatch'];

      const hasOtherErrors = Object.keys(confirmErrors).length > 0;
      control.get('confirmPassword')?.setErrors(hasOtherErrors ? confirmErrors : null);
    }

    return null;
  }

  getErrorMessage(controlName: string): string {
    const control = this.myForm.get(controlName);
    if (control?.invalid && (control.touched || this.formSubmitted)) {
      return this.getErrorMessageFromControl(control);
    }
    return '';
  }

  getNestedErrorMessage(groupName: string, controlName: string): string {
    const control = this.myForm.get(`${groupName}.${controlName}`);
    if (control?.invalid && (control.touched || this.formSubmitted)) {
      return this.getErrorMessageFromControl(control);
    }
    return '';
  }

  getPasswordGroupError(): string {
    const confirmControl = this.myForm.get('passwordGroup.confirmPassword');

    if (confirmControl?.invalid && (confirmControl.touched || this.formSubmitted)) {
      if (confirmControl.errors?.['required']) {
        return 'Please confirm your password';
      }
      if (confirmControl.errors?.['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }

    // Check group-level validation
    const passwordGroup = this.myForm.get('passwordGroup');
    if (passwordGroup?.invalid && passwordGroup.errors?.['passwordMismatch'] &&
        confirmControl?.touched && !confirmControl.errors?.['required']) {
      return 'Passwords do not match';
    }

    return '';
  }

  private getErrorMessageFromControl(control: AbstractControl): string {
    if (control.errors?.['required']) {
      return 'This field is required';
    }
    if (control.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors?.['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `Must be at least ${requiredLength} characters`;
    }
    if (control.errors?.['pattern']) {
      // Customize based on control name
      if (control.parent?.get('password') === control) {
        return 'Password must include at least one letter, one number, and one special character';
      }
      if (control.parent?.get('zip') === control) {
        return 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
      }
      return 'Invalid format';
    }
    if (control.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }

    // Fallback
    return 'Invalid value';
  }

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.myForm.valid) {
      console.log(this.myForm.value);
      // Process form submission
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.myForm);
    }
  }

  // Recursively mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
}
```

## Custom Validators

Custom validators allow for complex validation logic beyond the built-in validators.

### Creating Custom Validators

```typescript
// Custom validators
export class CustomValidators {
  // Password strength validator
  static passwordStrength(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;

    return !passwordValid
      ? {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecial,
          },
        }
      : null;
  }

  // Age validator (must be at least 18)
  static minimumAge(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const today = new Date();
      const birthDate = new Date(control.value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age < minAge ? { minimumAge: { required: minAge, actual: age } } : null;
    };
  }

  // Username validator (alphanumeric with underscores only)
  static username(control: AbstractControl): ValidationErrors | null {
    const valid = /^[a-zA-Z0-9_]+$/.test(control.value);
    return !valid ? { invalidUsername: true } : null;
  }

  // URL validator
  static url(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    try {
      const url = new URL(control.value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? null : { invalidUrl: true };
    } catch {
      return { invalidUrl: true };
    }
  }
}
```

### Using Custom Validators

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from './custom-validators';

@Component({...})
export class MyFormComponent {
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        CustomValidators.username
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        CustomValidators.passwordStrength
      ]],
      birthDate: ['', [
        Validators.required,
        CustomValidators.minimumAge(18)
      ]],
      website: ['', [
        Validators.required,
        CustomValidators.url
      ]]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.myForm.get(controlName);
    if (control?.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['minlength']) {
        return `Must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors?.['invalidUsername']) {
        return 'Username can only contain letters, numbers, and underscores';
      }
      if (control.errors?.['passwordStrength']) {
        const errors = control.errors['passwordStrength'];
        const missing = [];
        if (!errors.hasUpperCase) missing.push('uppercase letter');
        if (!errors.hasLowerCase) missing.push('lowercase letter');
        if (!errors.hasNumeric) missing.push('number');
        if (!errors.hasSpecial) missing.push('special character');

        return `Password must include at least one ${missing.join(', ')}`;
      }
      if (control.errors?.['minimumAge']) {
        return `You must be at least ${control.errors['minimumAge'].required} years old`;
      }
      if (control.errors?.['invalidUrl']) {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
    }
    return '';
  }
}
```

## Async Validators

Async validators are useful for validations that require server-side checks, such as username availability.

### Creating Async Validators

```typescript
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UsernameValidator implements AsyncValidator {
  constructor(private http: HttpClient) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      debounceTime(500),
      switchMap(username =>
        this.http.get<boolean>(`/api/check-username?username=${username}`).pipe(
          map(isAvailable => (isAvailable ? null : { usernameExists: true })),
          catchError(() => of({ serverError: true }))
        )
      ),
      first()
    );
  }
}
```

### Using Async Validators

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsernameValidator } from './username.validator';

@Component({...})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usernameValidator: UsernameValidator
  ) {
    this.registerForm = this.fb.group({
      username: ['',
        {
          validators: [Validators.required, Validators.minLength(3)],
          asyncValidators: [this.usernameValidator.validate.bind(this.usernameValidator)],
          updateOn: 'blur'
        }
      ],
      // Other form controls...
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['minlength']) {
        return `Must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors?.['usernameExists']) {
        return 'This username is already taken';
      }
      if (control.errors?.['serverError']) {
        return 'Unable to check username availability. Please try again.';
      }
    }
    return '';
  }

  // Show loading indicator for async validation
  isCheckingUsername(): boolean {
    const control = this.registerForm.get('username');
    return control?.pending || false;
  }
}
```

```html
<app-input
  label="Username"
  placeholder="Choose a username"
  formControlName="username"
  [errorMessage]="getErrorMessage('username')"
>
  @if (isCheckingUsername()) {
  <div class="input-loading-indicator">
    <app-spinner size="small"></app-spinner>
    <span>Checking availability...</span>
  </div>
  }
</app-input>
```

## Form-Level Validation

Some validations need to check multiple fields together.

### Cross-Field Validation

```typescript
import { FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

// Cross-field validators
export class CrossFieldValidators {
  // Date range validator
  static dateRange(startDateControlName: string, endDateControlName: string): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const startDate = formGroup.get(startDateControlName)?.value;
      const endDate = formGroup.get(endDateControlName)?.value;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
          // Set error on end date control
          const endDateControl = formGroup.get(endDateControlName);
          endDateControl?.setErrors({ dateRange: true });

          return { dateRange: true };
        }
      }

      // Clear the error if it was previously set
      const endDateControl = formGroup.get(endDateControlName);
      if (endDateControl?.errors?.['dateRange']) {
        const errors = { ...endDateControl.errors };
        delete errors['dateRange'];

        const hasOtherErrors = Object.keys(errors).length > 0;
        endDateControl.setErrors(hasOtherErrors ? errors : null);
      }

      return null;
    };
  }

  // Credit card validation
  static creditCardValidator(): ValidatorFn {
    return (formGroup: FormGroup): ValidationErrors | null => {
      const cardType = formGroup.get('cardType')?.value;
      const cardNumber = formGroup.get('cardNumber')?.value;

      if (cardType && cardNumber) {
        let valid = false;

        // Validate card number based on card type
        switch (cardType) {
          case 'visa':
            valid = /^4[0-9]{12}(?:[0-9]{3})?$/.test(cardNumber);
            break;
          case 'mastercard':
            valid = /^5[1-5][0-9]{14}$/.test(cardNumber);
            break;
          case 'amex':
            valid = /^3[47][0-9]{13}$/.test(cardNumber);
            break;
          // Add more card types as needed
        }

        if (!valid) {
          // Set error on card number control
          const cardNumberControl = formGroup.get('cardNumber');
          cardNumberControl?.setErrors({ invalidCardNumber: true });

          return { invalidCardNumber: true };
        }
      }

      // Clear the error if it was previously set
      const cardNumberControl = formGroup.get('cardNumber');
      if (cardNumberControl?.errors?.['invalidCardNumber']) {
        const errors = { ...cardNumberControl.errors };
        delete errors['invalidCardNumber'];

        const hasOtherErrors = Object.keys(errors).length > 0;
        cardNumberControl.setErrors(hasOtherErrors ? errors : null);
      }

      return null;
    };
  }
}
```

### Using Form-Level Validation

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrossFieldValidators } from './cross-field-validators';

@Component({...})
export class BookingFormComponent {
  bookingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.bookingForm = this.fb.group({
      // Date range group
      dateRange: this.fb.group({
        startDate: ['', Validators.required],
        endDate: ['', Validators.required]
      }, { validators: CrossFieldValidators.dateRange('startDate', 'endDate') }),

      // Payment group
      payment: this.fb.group({
        cardType: ['', Validators.required],
        cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{12,19}$/)]],
        expiryDate: ['', Validators.required],
        cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
      }, { validators: CrossFieldValidators.creditCardValidator() })
    });
  }

  getDateRangeErrorMessage(): string {
    const endDateControl = this.bookingForm.get('dateRange.endDate');

    if (endDateControl?.errors?.['dateRange']) {
      return 'End date must be after start date';
    }

    return '';
  }

  getCardNumberErrorMessage(): string {
    const cardNumberControl = this.bookingForm.get('payment.cardNumber');

    if (cardNumberControl?.invalid && cardNumberControl.touched) {
      if (cardNumberControl.errors?.['required']) {
        return 'Card number is required';
      }
      if (cardNumberControl.errors?.['pattern']) {
        return 'Please enter a valid card number';
      }
      if (cardNumberControl.errors?.['invalidCardNumber']) {
        return 'Invalid card number for selected card type';
      }
    }

    return '';
  }
}
```

## Accessibility Considerations

When implementing form validation, ensure it's accessible to all users:

1. **Associate Error Messages**: Use `aria-describedby` to associate error messages with form controls.
2. **Announce Errors**: Use `aria-live` regions to announce validation errors to screen readers.
3. **Focus Management**: Move focus to the first invalid field after form submission.
4. **Keyboard Navigation**: Ensure all form controls and error messages are keyboard accessible.
5. **Color Contrast**: Don't rely solely on color to indicate errors; use icons and text.
6. **Clear Instructions**: Provide clear instructions on how to fix validation errors.

### Accessible Validation Example

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()" novalidate>
  <!-- Form fields -->

  <!-- Aria-live region for form-level errors -->
  <div class="form-errors" aria-live="assertive" role="alert">
    @if (formSubmitted && myForm.invalid) {
    <p class="error-message">
      <app-icon name="error" aria-hidden="true"></app-icon>
      Please fix the errors in the form before submitting.
    </p>
    }
  </div>

  <div class="form-actions">
    <app-button type="submit">Submit</app-button>
  </div>
</form>
```

```typescript
@Component({...})
export class AccessibleFormComponent {
  myForm: FormGroup;
  formSubmitted = false;

  // Form initialization...

  onSubmit(): void {
    this.formSubmitted = true;

    if (this.myForm.valid) {
      // Process form submission
    } else {
      // Mark all fields as touched
      this.markFormGroupTouched(this.myForm);

      // Focus the first invalid field
      this.focusFirstInvalidField();
    }
  }

  private focusFirstInvalidField(): void {
    // Find all invalid controls
    const invalidControls = this.findInvalidControls(this.myForm);

    if (invalidControls.length > 0) {
      // Get the name of the first invalid control
      const firstControlName = invalidControls[0];

      // Find the corresponding element and focus it
      setTimeout(() => {
        const element = document.getElementById(firstControlName) ||
                        document.querySelector(`[name="${firstControlName}"]`);
        element?.focus();
      }, 0);
    }
  }

  private findInvalidControls(formGroup: FormGroup): string[] {
    const invalidControls: string[] = [];

    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);

      if (control instanceof FormGroup) {
        // Recursively check nested form groups
        const nestedInvalidControls = this.findInvalidControls(control);
        invalidControls.push(...nestedInvalidControls.map(name => `${controlName}.${name}`));
      } else if (control?.invalid) {
        invalidControls.push(controlName);
      }
    });

    return invalidControls;
  }

  // Mark all controls as touched...
}
```

---

This document is part of the DateNight.io design system documentation. For more information, see the [Design System Overview](./README.md).

Last Updated: 2025-05-15
