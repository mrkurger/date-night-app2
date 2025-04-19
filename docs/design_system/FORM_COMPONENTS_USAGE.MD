# Form Components Usage Guide

This guide provides detailed instructions and best practices for using the form components in the DateNight.io design system.

## Table of Contents

- [General Form Guidelines](#general-form-guidelines)
- [Input Component](#input-component)
- [Checkbox Component](#checkbox-component)
- [Select Component](#select-component)
- [Form Layout](#form-layout)
- [Validation](#validation)
- [Accessibility](#accessibility)
- [Dark Mode](#dark-mode)

## General Form Guidelines

When building forms in the DateNight.io application, follow these guidelines:

1. **Consistent Layout**: Use consistent spacing and alignment for form elements.
2. **Clear Labels**: Provide clear, concise labels for all form fields.
3. **Helper Text**: Use helper text to provide additional context or instructions.
4. **Error Messages**: Display clear error messages that explain how to fix the issue.
5. **Required Fields**: Clearly indicate which fields are required.
6. **Logical Grouping**: Group related form fields together.
7. **Responsive Design**: Ensure forms work well on all screen sizes.
8. **Accessibility**: Make forms accessible to all users, including those using screen readers.

## Input Component

The Input component is a versatile text input with multiple variants, sizes, and states.

### Basic Usage

```html
<app-input
  label="Email Address"
  placeholder="Enter your email"
  type="email"
  [required]="true"
  helperText="We'll never share your email with anyone else."
  [(ngModel)]="emailValue"
  (valueChange)="onEmailChange($event)"
>
</app-input>
```

### Template-Driven Forms

```html
<form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
  <app-input
    name="email"
    label="Email Address"
    type="email"
    [required]="true"
    [(ngModel)]="user.email"
    #email="ngModel"
    [errorMessage]="email.invalid && email.touched ? 'Please enter a valid email' : ''"
  >
  </app-input>

  <app-button type="submit" [disabled]="myForm.invalid">Submit</app-button>
</form>
```

### Reactive Forms

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <app-input
    label="Email Address"
    type="email"
    formControlName="email"
    [errorMessage]="getErrorMessage('email')"
  >
  </app-input>

  <app-button type="submit" [disabled]="myForm.invalid">Submit</app-button>
</form>
```

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({...})
export class MyFormComponent {
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.myForm.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
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
    if (this.myForm.valid) {
      console.log(this.myForm.value);
    }
  }
}
```

### Input with Icons

```html
<!-- Input with left icon -->
<app-input label="Search" placeholder="Search..." iconLeft="search" [(ngModel)]="searchValue">
</app-input>

<!-- Input with right icon -->
<app-input
  label="Website"
  placeholder="Enter website URL"
  iconRight="link"
  [(ngModel)]="websiteValue"
>
</app-input>

<!-- Password input with toggle icon -->
<app-input
  label="Password"
  type="password"
  placeholder="Enter password"
  [(ngModel)]="passwordValue"
>
</app-input>
```

### Input Variants

```html
<!-- Outlined variant (default) -->
<app-input
  label="Outlined Input"
  placeholder="Enter text"
  variant="outlined"
  [(ngModel)]="outlinedValue"
>
</app-input>

<!-- Filled variant -->
<app-input label="Filled Input" placeholder="Enter text" variant="filled" [(ngModel)]="filledValue">
</app-input>

<!-- Standard variant -->
<app-input
  label="Standard Input"
  placeholder="Enter text"
  variant="standard"
  [(ngModel)]="standardValue"
>
</app-input>
```

### Input Sizes

```html
<!-- Small size -->
<app-input label="Small Input" placeholder="Enter text" size="small" [(ngModel)]="smallValue">
</app-input>

<!-- Medium size (default) -->
<app-input label="Medium Input" placeholder="Enter text" size="medium" [(ngModel)]="mediumValue">
</app-input>

<!-- Large size -->
<app-input label="Large Input" placeholder="Enter text" size="large" [(ngModel)]="largeValue">
</app-input>
```

### Input States

```html
<!-- Disabled state -->
<app-input label="Disabled Input" placeholder="This input is disabled" [disabled]="true">
</app-input>

<!-- Readonly state -->
<app-input
  label="Readonly Input"
  placeholder="This input is readonly"
  [readonly]="true"
  [(ngModel)]="readonlyValue"
>
</app-input>

<!-- Error state -->
<app-input
  label="Input with Error"
  placeholder="Enter text"
  errorMessage="This field is required"
  [(ngModel)]="errorValue"
>
</app-input>
```

## Checkbox Component

The Checkbox component is a customizable checkbox with different sizes and states.

### Basic Usage

```html
<app-checkbox
  label="I agree to the terms and conditions"
  [required]="true"
  helperText="You must agree to continue"
  [(ngModel)]="agreeValue"
  (valueChange)="onAgreeChange($event)"
>
</app-checkbox>
```

### Template-Driven Forms

```html
<form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
  <app-checkbox
    name="agree"
    label="I agree to the terms and conditions"
    [required]="true"
    [(ngModel)]="user.agree"
    #agree="ngModel"
    [errorMessage]="agree.invalid && agree.touched ? 'You must agree to continue' : ''"
  >
  </app-checkbox>

  <app-button type="submit" [disabled]="myForm.invalid">Submit</app-button>
</form>
```

### Reactive Forms

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <app-checkbox
    label="I agree to the terms and conditions"
    formControlName="agree"
    [errorMessage]="getErrorMessage('agree')"
  >
  </app-checkbox>

  <app-button type="submit" [disabled]="myForm.invalid">Submit</app-button>
</form>
```

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({...})
export class MyFormComponent {
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      agree: [false, Validators.requiredTrue]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.myForm.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required'] || control.errors?.['requiredTrue']) {
        return 'You must agree to continue';
      }
      // Add more error types as needed
    }
    return '';
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      console.log(this.myForm.value);
    }
  }
}
```

### Checkbox Sizes

```html
<!-- Small size -->
<app-checkbox label="Small Checkbox" size="small" [(ngModel)]="smallValue"> </app-checkbox>

<!-- Medium size (default) -->
<app-checkbox label="Medium Checkbox" size="medium" [(ngModel)]="mediumValue"> </app-checkbox>

<!-- Large size -->
<app-checkbox label="Large Checkbox" size="large" [(ngModel)]="largeValue"> </app-checkbox>
```

### Checkbox States

```html
<!-- Checked state -->
<app-checkbox label="Checked Checkbox" [checked]="true" [(ngModel)]="checkedValue"> </app-checkbox>

<!-- Disabled state -->
<app-checkbox label="Disabled Checkbox" [disabled]="true"> </app-checkbox>

<!-- Disabled checked state -->
<app-checkbox label="Disabled Checked Checkbox" [checked]="true" [disabled]="true"> </app-checkbox>

<!-- Error state -->
<app-checkbox
  label="Checkbox with Error"
  errorMessage="This field is required"
  [(ngModel)]="errorValue"
>
</app-checkbox>
```

## Select Component

The Select component is a dropdown select with multiple variants, sizes, and states.

### Basic Usage

```html
<app-select
  label="Country"
  placeholder="Select your country"
  [options]="countryOptions"
  [required]="true"
  helperText="Please select your country of residence"
  [(ngModel)]="countryValue"
  (valueChange)="onCountryChange($event)"
>
</app-select>
```

```typescript
// In your component
countryOptions: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'fr', label: 'France', disabled: true },
];
```

### Template-Driven Forms

```html
<form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
  <app-select
    name="country"
    label="Country"
    placeholder="Select your country"
    [options]="countryOptions"
    [required]="true"
    [(ngModel)]="user.country"
    #country="ngModel"
    [errorMessage]="country.invalid && country.touched ? 'Please select a country' : ''"
  >
  </app-select>

  <app-button type="submit" [disabled]="myForm.invalid">Submit</app-button>
</form>
```

### Reactive Forms

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <app-select
    label="Country"
    placeholder="Select your country"
    [options]="countryOptions"
    formControlName="country"
    [errorMessage]="getErrorMessage('country')"
  >
  </app-select>

  <app-button type="submit" [disabled]="myForm.invalid">Submit</app-button>
</form>
```

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({...})
export class MyFormComponent {
  myForm: FormGroup;

  countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'fr', label: 'France', disabled: true },
  ];

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      country: ['', Validators.required]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.myForm.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return 'Please select a country';
      }
      // Add more error types as needed
    }
    return '';
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      console.log(this.myForm.value);
    }
  }
}
```

### Select Variants

```html
<!-- Outlined variant (default) -->
<app-select
  label="Outlined Select"
  placeholder="Select an option"
  [options]="selectOptions"
  variant="outlined"
  [(ngModel)]="outlinedValue"
>
</app-select>

<!-- Filled variant -->
<app-select
  label="Filled Select"
  placeholder="Select an option"
  [options]="selectOptions"
  variant="filled"
  [(ngModel)]="filledValue"
>
</app-select>

<!-- Standard variant -->
<app-select
  label="Standard Select"
  placeholder="Select an option"
  [options]="selectOptions"
  variant="standard"
  [(ngModel)]="standardValue"
>
</app-select>
```

### Select Sizes

```html
<!-- Small size -->
<app-select
  label="Small Select"
  placeholder="Select an option"
  [options]="selectOptions"
  size="small"
  [(ngModel)]="smallValue"
>
</app-select>

<!-- Medium size (default) -->
<app-select
  label="Medium Select"
  placeholder="Select an option"
  [options]="selectOptions"
  size="medium"
  [(ngModel)]="mediumValue"
>
</app-select>

<!-- Large size -->
<app-select
  label="Large Select"
  placeholder="Select an option"
  [options]="selectOptions"
  size="large"
  [(ngModel)]="largeValue"
>
</app-select>
```

### Select States

```html
<!-- Disabled state -->
<app-select
  label="Disabled Select"
  placeholder="This select is disabled"
  [options]="selectOptions"
  [disabled]="true"
>
</app-select>

<!-- Error state -->
<app-select
  label="Select with Error"
  placeholder="Select an option"
  [options]="selectOptions"
  errorMessage="This field is required"
  [(ngModel)]="errorValue"
>
</app-select>
```

## Form Layout

The design system provides utility classes for creating consistent form layouts.

### Form Grid

The `.form-grid` class creates a responsive grid layout for form elements:

```html
<div class="form-grid">
  <app-input label="First Name" placeholder="Enter first name"></app-input>
  <app-input label="Last Name" placeholder="Enter last name"></app-input>
  <app-input label="Email" placeholder="Enter email" type="email"></app-input>
  <app-input label="Phone" placeholder="Enter phone number" type="tel"></app-input>
</div>
```

### Form Groups

Use the `.form-group` class to group related form elements:

```html
<div class="form-group">
  <h3 class="form-group__title">Personal Information</h3>
  <div class="form-grid">
    <app-input label="First Name" placeholder="Enter first name"></app-input>
    <app-input label="Last Name" placeholder="Enter last name"></app-input>
  </div>
</div>

<div class="form-group">
  <h3 class="form-group__title">Contact Information</h3>
  <div class="form-grid">
    <app-input label="Email" placeholder="Enter email" type="email"></app-input>
    <app-input label="Phone" placeholder="Enter phone number" type="tel"></app-input>
  </div>
</div>
```

### Form Actions

Use the `.form-actions` class for form buttons and actions:

```html
<div class="form-actions">
  <app-button variant="tertiary" (buttonClick)="onCancel()">Cancel</app-button>
  <app-button variant="primary" (buttonClick)="onSubmit()">Submit</app-button>
</div>
```

## Validation

The form components support both template-driven and reactive form validation.

### Template-Driven Form Validation

```html
<form #myForm="ngForm" (ngSubmit)="onSubmit(myForm)">
  <div class="form-grid">
    <app-input
      name="name"
      label="Name"
      placeholder="Enter your name"
      [(ngModel)]="user.name"
      #name="ngModel"
      [required]="true"
      [errorMessage]="name.invalid && name.touched ? 'Name is required' : ''"
    >
    </app-input>

    <app-input
      name="email"
      label="Email"
      type="email"
      placeholder="Enter your email"
      [(ngModel)]="user.email"
      #email="ngModel"
      [required]="true"
      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
      [errorMessage]="getEmailErrorMessage(email)"
    >
    </app-input>

    <app-checkbox
      name="agree"
      label="I agree to the terms and conditions"
      [(ngModel)]="user.agree"
      #agree="ngModel"
      [required]="true"
      [errorMessage]="agree.invalid && agree.touched ? 'You must agree to continue' : ''"
    >
    </app-checkbox>
  </div>

  <div class="form-actions">
    <app-button type="submit" [disabled]="myForm.invalid">Submit</app-button>
  </div>
</form>
```

```typescript
getEmailErrorMessage(email: any): string {
  if (email.invalid && email.touched) {
    if (email.errors?.['required']) {
      return 'Email is required';
    }
    if (email.errors?.['pattern']) {
      return 'Please enter a valid email address';
    }
  }
  return '';
}
```

### Reactive Form Validation

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

    <app-checkbox
      label="I agree to the terms and conditions"
      formControlName="agree"
      [errorMessage]="getErrorMessage('agree')"
    >
    </app-checkbox>
  </div>

  <div class="form-actions">
    <app-button type="submit" [disabled]="myForm.invalid">Submit</app-button>
  </div>
</form>
```

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({...})
export class MyFormComponent {
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      agree: [false, Validators.requiredTrue]
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.myForm.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return 'This field is required';
      }
      if (control.errors?.['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors?.['requiredTrue']) {
        return 'You must agree to continue';
      }
      // Add more error types as needed
    }
    return '';
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      console.log(this.myForm.value);
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

## Accessibility

The form components are designed with accessibility in mind. Here are some best practices:

1. **Always Use Labels**: Every form field should have a label.
2. **Associate Error Messages**: Error messages are automatically associated with inputs using `aria-describedby`.
3. **Required Fields**: Required fields are marked with both a visual indicator and `aria-required="true"`.
4. **Focus Management**: Ensure proper focus management in forms, especially after submission or validation.
5. **Keyboard Navigation**: All form components are fully keyboard accessible.
6. **Screen Reader Support**: Use `aria-live` regions for dynamic content like validation messages.

```html
<!-- Example of accessible form with aria-live region for errors -->
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <div class="form-grid">
    <app-input
      label="Name"
      placeholder="Enter your name"
      formControlName="name"
      [errorMessage]="getErrorMessage('name')"
    >
    </app-input>
  </div>

  <div class="form-actions">
    <app-button type="submit">Submit</app-button>
  </div>

  <!-- Aria-live region for form-level errors -->
  <div class="form-errors" aria-live="polite">
    @if (formSubmitted && myForm.invalid) {
    <p class="error-message">Please fix the errors in the form before submitting.</p>
    }
  </div>
</form>
```

## Dark Mode

All form components automatically support dark mode when the user's system preference is set to dark mode and the `dark-mode-enabled` class is added to the body element.

To manually toggle dark mode:

```typescript
@Component({...})
export class AppComponent {
  toggleDarkMode(): void {
    const body = document.body;
    body.classList.toggle('dark-mode-enabled');
  }
}
```

```html
<button (click)="toggleDarkMode()">Toggle Dark Mode</button>
```

---

This guide is part of the DateNight.io design system documentation. For more information, see the [Design System Overview](./README.md).

Last Updated: 2025-05-15
