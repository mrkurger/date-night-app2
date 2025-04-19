# Form Components

This document provides an overview of the form components available in the DateNight.io design system.

## Input Component

The Input component is a versatile text input with multiple variants, sizes, and states.

### Usage

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

### Properties

| Property       | Type                                 | Default    | Description                              |
| -------------- | ------------------------------------ | ---------- | ---------------------------------------- |
| `type`         | string                               | 'text'     | Input type (text, password, email, etc.) |
| `placeholder`  | string                               | ''         | Placeholder text                         |
| `label`        | string                               | ''         | Label text                               |
| `helperText`   | string                               | ''         | Helper text displayed below the input    |
| `errorMessage` | string                               | ''         | Error message displayed below the input  |
| `required`     | boolean                              | false      | Whether the input is required            |
| `disabled`     | boolean                              | false      | Whether the input is disabled            |
| `readonly`     | boolean                              | false      | Whether the input is readonly            |
| `size`         | 'small' \| 'medium' \| 'large'       | 'medium'   | Input size                               |
| `variant`      | 'outlined' \| 'filled' \| 'standard' | 'outlined' | Input variant                            |
| `iconLeft`     | string                               | ''         | Icon name to display on the left side    |
| `iconRight`    | string                               | ''         | Icon name to display on the right side   |
| `maxLength`    | number                               | undefined  | Maximum length of the input value        |
| `minLength`    | number                               | undefined  | Minimum length of the input value        |
| `pattern`      | string                               | undefined  | Input pattern for validation             |
| `autocomplete` | string                               | 'off'      | Input autocomplete attribute             |
| `name`         | string                               | undefined  | Input name attribute                     |
| `id`           | string                               | undefined  | Input id attribute                       |

### Events

| Event         | Description                          |
| ------------- | ------------------------------------ |
| `valueChange` | Emitted when the input value changes |
| `focused`     | Emitted when the input is focused    |
| `blurred`     | Emitted when the input is blurred    |
| `clicked`     | Emitted when the input is clicked    |

### Variants

- **Outlined**: Default variant with a border around the input
- **Filled**: Input with a filled background
- **Standard**: Input with only a bottom border

### Sizes

- **Small**: Compact size (32px height)
- **Medium**: Default size (40px height)
- **Large**: Larger size (48px height)

### States

- **Default**: Normal state
- **Focused**: When the input has focus
- **Disabled**: When the input is disabled
- **Readonly**: When the input is readonly
- **Error**: When the input has an error message

## Checkbox Component

The Checkbox component is a customizable checkbox with different sizes and states.

### Usage

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

### Properties

| Property       | Type                           | Default   | Description                                |
| -------------- | ------------------------------ | --------- | ------------------------------------------ |
| `label`        | string                         | ''        | Label text                                 |
| `required`     | boolean                        | false     | Whether the checkbox is required           |
| `disabled`     | boolean                        | false     | Whether the checkbox is disabled           |
| `size`         | 'small' \| 'medium' \| 'large' | 'medium'  | Checkbox size                              |
| `helperText`   | string                         | ''        | Helper text displayed below the checkbox   |
| `errorMessage` | string                         | ''        | Error message displayed below the checkbox |
| `name`         | string                         | undefined | Checkbox name attribute                    |
| `id`           | string                         | undefined | Checkbox id attribute                      |
| `value`        | string                         | undefined | Checkbox value attribute                   |
| `ariaLabel`    | string                         | undefined | Checkbox aria-label attribute              |

### Events

| Event         | Description                             |
| ------------- | --------------------------------------- |
| `valueChange` | Emitted when the checkbox value changes |

### Sizes

- **Small**: Compact size (16px)
- **Medium**: Default size (20px)
- **Large**: Larger size (24px)

### States

- **Default**: Normal state
- **Checked**: When the checkbox is checked
- **Focused**: When the checkbox has focus
- **Disabled**: When the checkbox is disabled
- **Error**: When the checkbox has an error message

## Select Component

The Select component is a dropdown select with multiple variants, sizes, and states.

### Usage

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

### Properties

| Property       | Type                                 | Default            | Description                              |
| -------------- | ------------------------------------ | ------------------ | ---------------------------------------- |
| `options`      | SelectOption[]                       | []                 | Select options                           |
| `placeholder`  | string                               | 'Select an option' | Placeholder text                         |
| `label`        | string                               | ''                 | Label text                               |
| `helperText`   | string                               | ''                 | Helper text displayed below the select   |
| `errorMessage` | string                               | ''                 | Error message displayed below the select |
| `required`     | boolean                              | false              | Whether the select is required           |
| `disabled`     | boolean                              | false              | Whether the select is disabled           |
| `size`         | 'small' \| 'medium' \| 'large'       | 'medium'           | Select size                              |
| `variant`      | 'outlined' \| 'filled' \| 'standard' | 'outlined'         | Select variant                           |
| `name`         | string                               | undefined          | Select name attribute                    |
| `id`           | string                               | undefined          | Select id attribute                      |

### Events

| Event         | Description                           |
| ------------- | ------------------------------------- |
| `valueChange` | Emitted when the select value changes |
| `focused`     | Emitted when the select is focused    |
| `blurred`     | Emitted when the select is blurred    |

### SelectOption Interface

```typescript
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}
```

### Variants

- **Outlined**: Default variant with a border around the select
- **Filled**: Select with a filled background
- **Standard**: Select with only a bottom border

### Sizes

- **Small**: Compact size (32px height)
- **Medium**: Default size (40px height)
- **Large**: Larger size (48px height)

### States

- **Default**: Normal state
- **Focused**: When the select has focus
- **Disabled**: When the select is disabled
- **Error**: When the select has an error message

## Accessibility

All form components are designed with accessibility in mind:

- All inputs have proper labels and ARIA attributes
- Focus states are clearly visible
- Error messages are properly associated with inputs
- Keyboard navigation is fully supported
- Color contrast meets WCAG AA standards

## Dark Mode

All form components support dark mode, which is automatically applied when the user's system preference is set to dark mode and the `dark-mode-enabled` class is added to the body element.
