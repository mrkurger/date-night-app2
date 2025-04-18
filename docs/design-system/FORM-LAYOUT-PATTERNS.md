# Form Layout Patterns

This document outlines the recommended patterns for form layouts in the DateNight.io application.

## Table of Contents

- [Form Layout Principles](#form-layout-principles)
- [Form Grid System](#form-grid-system)
- [Form Groups](#form-groups)
- [Form Actions](#form-actions)
- [Responsive Form Layouts](#responsive-form-layouts)
- [Multi-Step Forms](#multi-step-forms)
- [Form Layout Examples](#form-layout-examples)
- [Accessibility Considerations](#accessibility-considerations)

## Form Layout Principles

When designing form layouts in the DateNight.io application, follow these principles:

1. **Logical Flow**: Arrange form fields in a logical order, typically from most to least important.
2. **Grouping**: Group related fields together to create a clear visual hierarchy.
3. **Alignment**: Maintain consistent alignment of labels, inputs, and helper text.
4. **Spacing**: Use consistent spacing between form elements.
5. **Responsive Design**: Ensure forms adapt gracefully to different screen sizes.
6. **Progressive Disclosure**: Show only the fields that are relevant to the current context.
7. **Clear Actions**: Make form actions (submit, cancel, etc.) clearly visible and accessible.

## Form Grid System

The DateNight.io design system includes a form grid system that provides a consistent layout for form elements.

### Basic Form Grid

The `.form-grid` class creates a responsive grid layout for form elements:

```html
<div class="form-grid">
  <app-input label="First Name" placeholder="Enter first name"></app-input>
  <app-input label="Last Name" placeholder="Enter last name"></app-input>
  <app-input label="Email" placeholder="Enter email" type="email"></app-input>
  <app-input label="Phone" placeholder="Enter phone number" type="tel"></app-input>
</div>
```

### Form Grid with Column Spans

Use the `.form-grid__span-2` class to make a form element span two columns:

```html
<div class="form-grid">
  <app-input label="First Name" placeholder="Enter first name"></app-input>
  <app-input label="Last Name" placeholder="Enter last name"></app-input>
  <app-input class="form-grid__span-2" label="Address" placeholder="Enter address"> </app-input>
  <app-input label="City" placeholder="Enter city"></app-input>
  <app-input label="Zip Code" placeholder="Enter zip code"></app-input>
</div>
```

### Form Grid with Different Column Counts

Use the `.form-grid--3-cols` or `.form-grid--4-cols` classes to create grids with different column counts:

```html
<!-- 3-column grid -->
<div class="form-grid form-grid--3-cols">
  <app-input label="First Name" placeholder="Enter first name"></app-input>
  <app-input label="Middle Name" placeholder="Enter middle name"></app-input>
  <app-input label="Last Name" placeholder="Enter last name"></app-input>
</div>

<!-- 4-column grid -->
<div class="form-grid form-grid--4-cols">
  <app-input label="Card Number" placeholder="Enter card number"></app-input>
  <app-input label="Name on Card" placeholder="Enter name on card"></app-input>
  <app-input label="Expiry Date" placeholder="MM/YY"></app-input>
  <app-input label="CVV" placeholder="CVV"></app-input>
</div>
```

### SCSS Implementation

```scss
// Form grid
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: ds.$spacing-4;
  width: 100%;

  @media (min-width: ds.$breakpoint-tablet) {
    grid-template-columns: repeat(2, 1fr);
  }

  &--3-cols {
    @media (min-width: ds.$breakpoint-desktop) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &--4-cols {
    @media (min-width: ds.$breakpoint-desktop) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__span-2 {
    @media (min-width: ds.$breakpoint-tablet) {
      grid-column: span 2;
    }
  }

  &__span-3 {
    @media (min-width: ds.$breakpoint-desktop) {
      grid-column: span 3;
    }
  }

  &__span-4 {
    @media (min-width: ds.$breakpoint-desktop) {
      grid-column: span 4;
    }
  }
}
```

## Form Groups

Use form groups to organize related form elements and create a clear visual hierarchy.

### Basic Form Group

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

### Form Group with Description

```html
<div class="form-group">
  <h3 class="form-group__title">Payment Information</h3>
  <p class="form-group__description">Your payment information is securely processed and stored.</p>
  <div class="form-grid">
    <app-input label="Card Number" placeholder="Enter card number"></app-input>
    <app-input label="Name on Card" placeholder="Enter name on card"></app-input>
    <app-input label="Expiry Date" placeholder="MM/YY"></app-input>
    <app-input label="CVV" placeholder="CVV"></app-input>
  </div>
</div>
```

### Collapsible Form Group

```html
<div class="form-group form-group--collapsible" [class.form-group--expanded]="isExpanded">
  <div class="form-group__header" (click)="toggleExpanded()">
    <h3 class="form-group__title">Advanced Settings</h3>
    <app-icon [name]="isExpanded ? 'chevron-up' : 'chevron-down'"></app-icon>
  </div>

  <div class="form-group__content">
    <div class="form-grid">
      <app-checkbox label="Enable notifications"></app-checkbox>
      <app-checkbox label="Subscribe to newsletter"></app-checkbox>
    </div>
  </div>
</div>
```

### SCSS Implementation

```scss
// Form group
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: ds.$spacing-6;

  &__title {
    @include ds.heading-4;
    margin-bottom: ds.$spacing-2;
  }

  &__description {
    @include ds.body-small;
    color: ds.$color-dark-gray-1;
    margin-bottom: ds.$spacing-4;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: ds.$spacing-2 0;

    &:hover {
      color: ds.$color-primary;
    }
  }

  &__content {
    overflow: hidden;
    max-height: 0;
    transition: max-height ds.$transition-medium ds.$transition-timing-default;
  }

  &--expanded {
    .form-group__content {
      max-height: 1000px; // Arbitrary large value
    }
  }
}
```

## Form Actions

Use the `.form-actions` class for form buttons and actions.

### Basic Form Actions

```html
<div class="form-actions">
  <app-button variant="tertiary" (buttonClick)="onCancel()">Cancel</app-button>
  <app-button variant="primary" (buttonClick)="onSubmit()">Submit</app-button>
</div>
```

### Form Actions with Multiple Buttons

```html
<div class="form-actions">
  <app-button variant="tertiary" (buttonClick)="onCancel()">Cancel</app-button>
  <div class="form-actions__right">
    <app-button variant="secondary" (buttonClick)="onSaveDraft()">Save Draft</app-button>
    <app-button variant="primary" (buttonClick)="onSubmit()">Submit</app-button>
  </div>
</div>
```

### Form Actions with Loading State

```html
<div class="form-actions">
  <app-button variant="tertiary" [disabled]="isSubmitting" (buttonClick)="onCancel()">
    Cancel
  </app-button>
  <app-button
    variant="primary"
    [loading]="isSubmitting"
    [disabled]="isSubmitting || form.invalid"
    (buttonClick)="onSubmit()"
  >
    Submit
  </app-button>
</div>
```

### SCSS Implementation

```scss
// Form actions
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ds.$spacing-6;

  @media (max-width: ds.$breakpoint-mobile) {
    flex-direction: column-reverse;
    gap: ds.$spacing-4;

    app-button {
      width: 100%;
    }
  }

  &__right {
    display: flex;
    gap: ds.$spacing-4;

    @media (max-width: ds.$breakpoint-mobile) {
      width: 100%;
      flex-direction: column-reverse;
    }
  }
}
```

## Responsive Form Layouts

Forms should adapt gracefully to different screen sizes.

### Mobile-First Approach

1. **Single Column on Mobile**: Use a single column layout on mobile devices.
2. **Multi-Column on Larger Screens**: Use multiple columns on larger screens.
3. **Stacked Actions on Mobile**: Stack action buttons on mobile devices.
4. **Adjust Spacing**: Use smaller spacing on mobile devices.

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <!-- Form fields adapt automatically with form-grid -->
  <div class="form-grid">
    <app-input label="First Name" formControlName="firstName"></app-input>
    <app-input label="Last Name" formControlName="lastName"></app-input>
    <app-input class="form-grid__span-2" label="Email" type="email" formControlName="email">
    </app-input>
  </div>

  <!-- Form actions adapt automatically -->
  <div class="form-actions">
    <app-button variant="tertiary" type="button" (buttonClick)="onCancel()"> Cancel </app-button>
    <app-button variant="primary" type="submit">Submit</app-button>
  </div>
</form>
```

### Responsive Form Groups

```html
<div class="form-group form-group--responsive">
  <h3 class="form-group__title">Address Information</h3>

  <!-- On mobile, this will be a single column -->
  <!-- On tablet and desktop, this will be two columns -->
  <div class="form-grid">
    <app-input label="Street" formControlName="street"></app-input>
    <app-input label="City" formControlName="city"></app-input>
    <app-input label="State" formControlName="state"></app-input>
    <app-input label="Zip Code" formControlName="zip"></app-input>
  </div>
</div>
```

### SCSS Implementation

```scss
// Responsive form group
.form-group--responsive {
  @media (max-width: ds.$breakpoint-mobile) {
    .form-grid {
      gap: ds.$spacing-3;
    }

    .form-group__title {
      @include ds.heading-5;
      margin-bottom: ds.$spacing-2;
    }
  }
}
```

## Multi-Step Forms

For complex forms, use a multi-step approach to break the form into manageable sections.

### Step Indicator

```html
<div class="form-steps">
  <div
    class="form-steps__step"
    [class.form-steps__step--active]="currentStep === 1"
    [class.form-steps__step--completed]="currentStep > 1"
  >
    <div class="form-steps__indicator">
      @if (currentStep > 1) {
      <app-icon name="check"></app-icon>
      } @else { 1 }
    </div>
    <div class="form-steps__label">Personal Info</div>
  </div>

  <div class="form-steps__connector"></div>

  <div
    class="form-steps__step"
    [class.form-steps__step--active]="currentStep === 2"
    [class.form-steps__step--completed]="currentStep > 2"
  >
    <div class="form-steps__indicator">
      @if (currentStep > 2) {
      <app-icon name="check"></app-icon>
      } @else { 2 }
    </div>
    <div class="form-steps__label">Contact Info</div>
  </div>

  <div class="form-steps__connector"></div>

  <div class="form-steps__step" [class.form-steps__step--active]="currentStep === 3">
    <div class="form-steps__indicator">3</div>
    <div class="form-steps__label">Review</div>
  </div>
</div>
```

### Step Content

```html
<div class="form-step-content">
  <!-- Step 1: Personal Info -->
  @if (currentStep === 1) {
  <div class="form-step">
    <h2 class="form-step__title">Personal Information</h2>

    <div class="form-grid">
      <app-input label="First Name" formControlName="firstName"></app-input>
      <app-input label="Last Name" formControlName="lastName"></app-input>
      <app-input label="Date of Birth" type="date" formControlName="dob"></app-input>
    </div>

    <div class="form-actions">
      <div></div>
      <!-- Empty div for spacing -->
      <app-button variant="primary" (buttonClick)="nextStep()">Next</app-button>
    </div>
  </div>
  }

  <!-- Step 2: Contact Info -->
  @if (currentStep === 2) {
  <div class="form-step">
    <h2 class="form-step__title">Contact Information</h2>

    <div class="form-grid">
      <app-input label="Email" type="email" formControlName="email"></app-input>
      <app-input label="Phone" type="tel" formControlName="phone"></app-input>
    </div>

    <div class="form-actions">
      <app-button variant="tertiary" (buttonClick)="previousStep()">Back</app-button>
      <app-button variant="primary" (buttonClick)="nextStep()">Next</app-button>
    </div>
  </div>
  }

  <!-- Step 3: Review -->
  @if (currentStep === 3) {
  <div class="form-step">
    <h2 class="form-step__title">Review Your Information</h2>

    <div class="review-section">
      <h3 class="review-section__title">Personal Information</h3>
      <div class="review-grid">
        <div class="review-item">
          <div class="review-item__label">First Name</div>
          <div class="review-item__value">{{ myForm.get('firstName').value }}</div>
        </div>
        <!-- More review items... -->
      </div>
    </div>

    <div class="form-actions">
      <app-button variant="tertiary" (buttonClick)="previousStep()">Back</app-button>
      <app-button variant="primary" (buttonClick)="onSubmit()">Submit</app-button>
    </div>
  </div>
  }
</div>
```

### SCSS Implementation

```scss
// Form steps
.form-steps {
  display: flex;
  align-items: center;
  margin-bottom: ds.$spacing-8;

  @media (max-width: ds.$breakpoint-mobile) {
    flex-direction: column;
    align-items: flex-start;
    gap: ds.$spacing-2;
  }

  &__step {
    display: flex;
    align-items: center;

    &--active {
      .form-steps__indicator {
        background-color: ds.$color-primary;
        color: ds.$color-white;
      }

      .form-steps__label {
        color: ds.$color-primary;
        font-weight: 600;
      }
    }

    &--completed {
      .form-steps__indicator {
        background-color: ds.$color-success;
        color: ds.$color-white;
      }
    }
  }

  &__indicator {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ds.$color-light-gray-2;
    color: ds.$color-dark-gray-1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ds.$spacing-2;
    transition: all ds.$transition-fast ds.$transition-timing-default;
  }

  &__label {
    @include ds.body-default;
    color: ds.$color-dark-gray-1;
    transition: all ds.$transition-fast ds.$transition-timing-default;
  }

  &__connector {
    flex: 1;
    height: 2px;
    background-color: ds.$color-light-gray-2;
    margin: 0 ds.$spacing-4;

    @media (max-width: ds.$breakpoint-mobile) {
      width: 2px;
      height: 24px;
      margin: 0 0 0 16px; // Center with the indicator
    }
  }
}

// Form step content
.form-step {
  &__title {
    @include ds.heading-2;
    margin-bottom: ds.$spacing-6;
  }
}

// Review section
.review-section {
  margin-bottom: ds.$spacing-6;

  &__title {
    @include ds.heading-4;
    margin-bottom: ds.$spacing-4;
  }
}

.review-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ds.$spacing-4;

  @media (max-width: ds.$breakpoint-mobile) {
    grid-template-columns: 1fr;
  }
}

.review-item {
  &__label {
    @include ds.body-small;
    color: ds.$color-dark-gray-1;
    margin-bottom: ds.$spacing-1;
  }

  &__value {
    @include ds.body-default;
    color: ds.$color-dark-gray-2;
  }
}
```

## Form Layout Examples

### Registration Form

```html
<form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <h3 class="form-group__title">Account Information</h3>
    <div class="form-grid">
      <app-input
        label="Email"
        type="email"
        placeholder="Enter your email"
        formControlName="email"
        [errorMessage]="getErrorMessage('email')"
      >
      </app-input>

      <app-input
        label="Username"
        placeholder="Choose a username"
        formControlName="username"
        [errorMessage]="getErrorMessage('username')"
      >
      </app-input>

      <app-input
        label="Password"
        type="password"
        placeholder="Create a password"
        formControlName="password"
        [errorMessage]="getErrorMessage('password')"
      >
      </app-input>

      <app-input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        formControlName="confirmPassword"
        [errorMessage]="getErrorMessage('confirmPassword')"
      >
      </app-input>
    </div>
  </div>

  <div class="form-group">
    <h3 class="form-group__title">Personal Information</h3>
    <div class="form-grid">
      <app-input
        label="First Name"
        placeholder="Enter your first name"
        formControlName="firstName"
        [errorMessage]="getErrorMessage('firstName')"
      >
      </app-input>

      <app-input
        label="Last Name"
        placeholder="Enter your last name"
        formControlName="lastName"
        [errorMessage]="getErrorMessage('lastName')"
      >
      </app-input>

      <app-input
        label="Date of Birth"
        type="date"
        formControlName="dob"
        [errorMessage]="getErrorMessage('dob')"
      >
      </app-input>
    </div>
  </div>

  <div class="form-group">
    <h3 class="form-group__title">Preferences</h3>
    <div class="form-grid">
      <app-checkbox label="Subscribe to newsletter" formControlName="newsletter"> </app-checkbox>

      <app-checkbox
        label="I agree to the terms and conditions"
        formControlName="terms"
        [errorMessage]="getErrorMessage('terms')"
      >
      </app-checkbox>
    </div>
  </div>

  <div class="form-actions">
    <app-button variant="tertiary" type="button" (buttonClick)="onCancel()"> Cancel </app-button>
    <app-button variant="primary" type="submit" [disabled]="registerForm.invalid">
      Register
    </app-button>
  </div>
</form>
```

### Payment Form

```html
<form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <h3 class="form-group__title">Billing Information</h3>
    <div class="form-grid">
      <app-input
        class="form-grid__span-2"
        label="Full Name"
        placeholder="Enter your full name"
        formControlName="fullName"
        [errorMessage]="getErrorMessage('fullName')"
      >
      </app-input>

      <app-input
        class="form-grid__span-2"
        label="Billing Address"
        placeholder="Enter your billing address"
        formControlName="address"
        [errorMessage]="getErrorMessage('address')"
      >
      </app-input>

      <app-input
        label="City"
        placeholder="Enter your city"
        formControlName="city"
        [errorMessage]="getErrorMessage('city')"
      >
      </app-input>

      <app-input
        label="Zip Code"
        placeholder="Enter your zip code"
        formControlName="zipCode"
        [errorMessage]="getErrorMessage('zipCode')"
      >
      </app-input>
    </div>
  </div>

  <div class="form-group">
    <h3 class="form-group__title">Payment Details</h3>
    <div class="form-grid">
      <app-select
        label="Card Type"
        placeholder="Select card type"
        [options]="cardTypeOptions"
        formControlName="cardType"
        [errorMessage]="getErrorMessage('cardType')"
      >
      </app-select>

      <app-input
        label="Card Number"
        placeholder="Enter your card number"
        formControlName="cardNumber"
        [errorMessage]="getErrorMessage('cardNumber')"
      >
      </app-input>

      <app-input
        label="Expiry Date"
        placeholder="MM/YY"
        formControlName="expiryDate"
        [errorMessage]="getErrorMessage('expiryDate')"
      >
      </app-input>

      <app-input
        label="CVV"
        placeholder="CVV"
        formControlName="cvv"
        [errorMessage]="getErrorMessage('cvv')"
      >
      </app-input>
    </div>
  </div>

  <div class="form-actions">
    <app-button variant="tertiary" type="button" (buttonClick)="onCancel()"> Cancel </app-button>
    <app-button
      variant="primary"
      type="submit"
      [disabled]="paymentForm.invalid || isProcessing"
      [loading]="isProcessing"
    >
      Pay Now
    </app-button>
  </div>
</form>
```

## Accessibility Considerations

When designing form layouts, ensure they are accessible to all users:

1. **Logical Tab Order**: Ensure the tab order follows a logical flow through the form.
2. **Keyboard Navigation**: Make sure all form elements are keyboard accessible.
3. **Focus Indicators**: Provide clear focus indicators for all interactive elements.
4. **Error Handling**: Ensure error messages are associated with the appropriate form controls.
5. **Fieldset and Legend**: Use fieldset and legend for groups of related form controls.
6. **Label Association**: Ensure all form controls have properly associated labels.
7. **Responsive Design**: Ensure forms are usable on all devices and screen sizes.

### Accessible Form Group Example

```html
<fieldset class="form-group">
  <legend class="form-group__title">Contact Information</legend>
  <div class="form-grid">
    <app-input
      id="email"
      label="Email"
      type="email"
      placeholder="Enter your email"
      formControlName="email"
      [errorMessage]="getErrorMessage('email')"
    >
    </app-input>

    <app-input
      id="phone"
      label="Phone"
      type="tel"
      placeholder="Enter your phone number"
      formControlName="phone"
      [errorMessage]="getErrorMessage('phone')"
    >
    </app-input>
  </div>
</fieldset>
```

### SCSS Implementation

```scss
// Accessible form group
fieldset.form-group {
  border: none;
  padding: 0;
  margin: 0 0 ds.$spacing-6 0;

  legend.form-group__title {
    @include ds.heading-4;
    margin-bottom: ds.$spacing-2;
    padding: 0;
    width: 100%;
  }
}
```

---

This document is part of the DateNight.io design system documentation. For more information, see the [Design System Overview](./README.md).

Last Updated: 2025-05-15
