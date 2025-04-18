# DateNight.io Design System Usage Guide

This guide provides practical instructions for using the DateNight.io design system in your Angular components. Following these guidelines will ensure consistency across the application and make your components more maintainable.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Importing Design Tokens](#importing-design-tokens)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Colors](#colors)
6. [Components](#components)
7. [Responsive Design](#responsive-design)
8. [Dark Mode](#dark-mode)
9. [Accessibility](#accessibility)
10. [Best Practices](#best-practices)

## Getting Started

The DateNight.io design system is built on a set of design tokens and mixins that provide consistent styling throughout the application. The system is implemented in SCSS and is available to all components.

### Key Files

- `src/app/core/design/emerald-tokens.scss` - Core design tokens
- `src/app/core/design/typography-mixins.scss` - Typography mixins
- `src/app/core/design/spacing-utilities.scss` - Spacing utilities
- `src/app/core/design/main.scss` - Main entry point that imports all design system files

## Importing Design Tokens

Always import the design system in your component SCSS files using the `@use` directive:

```scss
// Correct way to import the design system
@use 'src/app/core/design/main' as ds;

.my-component {
  color: ds.$color-primary;
  padding: ds.$spacing-4;
}
```

**Don't** import individual files directly:

```scss
// Incorrect - don't import individual files
@import 'src/app/core/design/emerald-tokens';
```

## Typography

Use typography mixins to ensure consistent text styling across the application.

### Heading Mixins

```scss
.page-title {
  @include ds.heading-1;
}

.section-title {
  @include ds.heading-2;
}

.card-title {
  @include ds.heading-3;
}

.widget-title {
  @include ds.heading-4;
}

.subsection-title {
  @include ds.heading-5;
}

.minor-title {
  @include ds.heading-6;
}
```

### Body Text Mixins

```scss
.main-content {
  @include ds.body-default;
}

.featured-content {
  @include ds.body-large;
}

.secondary-content {
  @include ds.body-small;
}

.fine-print {
  @include ds.body-xs;
}
```

### Special Text Mixins

```scss
.image-caption {
  @include ds.caption;
}

.form-label {
  @include ds.label;
}

.button {
  @include ds.button-text;
}

.small-button {
  @include ds.button-text-small;
}

.large-button {
  @include ds.button-text-large;
}
```

### Link Styling

```scss
.custom-link {
  @include ds.link;
}
```

### Text Truncation

```scss
.single-line-truncate {
  @include ds.truncate-text;
}

.multi-line-truncate {
  @include ds.truncate-multiline(3); // Truncate to 3 lines
}
```

### Responsive Typography

```scss
.responsive-heading {
  @include ds.responsive-font-size(1rem, 2rem);
}
```

## Spacing

Use spacing tokens for consistent spacing throughout the application.

### Direct Usage in SCSS

```scss
.my-component {
  margin-bottom: ds.$spacing-4;
  padding: ds.$spacing-3;
}

.component-header {
  margin-bottom: ds.$spacing-6;
}

.component-content {
  padding: ds.$spacing-4 ds.$spacing-6;
}
```

### Utility Classes in HTML

```html
<div class="mt-4 mb-6">Top and bottom margins</div>
<div class="p-4">Padding on all sides</div>
<div class="px-4 py-2">Horizontal and vertical padding</div>
<div class="mx-auto">Horizontally centered with auto margins</div>
```

### Responsive Spacing

```html
<div class="mt-2 mt-md-4 mt-lg-6">
  <!-- Margin top increases at different breakpoints -->
</div>
```

## Colors

Use color tokens to ensure consistent colors throughout the application.

### Text Colors

```scss
.primary-text {
  color: ds.$color-primary;
}

.secondary-text {
  color: ds.$color-secondary;
}

.body-text {
  color: ds.$color-dark-gray-2;
}

.muted-text {
  color: ds.$color-dark-gray-1;
}
```

### Background Colors

```scss
.primary-background {
  background-color: ds.$color-primary;
}

.light-background {
  background-color: ds.$color-light-gray-1;
}

.card-background {
  background-color: ds.$color-white;
}
```

### Status Colors

```scss
.success-message {
  color: ds.$color-success;
}

.warning-message {
  color: ds.$color-warning;
}

.error-message {
  color: ds.$color-error;
}

.info-message {
  color: ds.$color-info;
}
```

### Color Utility Classes

```html
<div class="text-primary">Primary colored text</div>
<div class="bg-light">Light background</div>
<div class="text-success">Success message</div>
```

## Components

When building components, follow these guidelines:

### BEM Naming Convention

Follow the BEM (Block, Element, Modifier) naming convention for CSS classes:

```scss
.card {
  // Block styles

  &__header {
    // Element styles
  }

  &__title {
    // Element styles
  }

  &--featured {
    // Modifier styles
  }
}
```

See the [BEM Naming Convention Guide](./bem-naming-convention.md) for more details.

### Component Structure

Organize your component files consistently:

```
component-name/
  ├── component-name.component.ts
  ├── component-name.component.html
  ├── component-name.component.scss
  └── component-name.component.spec.ts
```

Use the [Component Template](../client-angular/src/app/shared/templates/component.template.ts) as a starting point for new components.

### Component Documentation

Document your components using the [Component Documentation Template](./component-documentation-template.md).

## Responsive Design

The design system includes breakpoints for responsive design:

```scss
.my-component {
  // Mobile styles (default)

  @media (min-width: ds.$breakpoint-mobile) {
    // Small devices (360px+)
  }

  @media (min-width: ds.$breakpoint-tablet) {
    // Medium devices (600px+)
  }

  @media (min-width: ds.$breakpoint-desktop) {
    // Large devices (960px+)
  }

  @media (min-width: ds.$breakpoint-desktop-large) {
    // Extra large devices (1280px+)
  }

  @media (min-width: ds.$breakpoint-desktop-xl) {
    // Extra extra large devices (1920px+)
  }
}
```

### Responsive Utility Classes

```html
<div class="d-none d-md-block">
  <!-- Hidden on mobile, visible on tablet and up -->
</div>

<div class="d-block d-lg-none">
  <!-- Visible on mobile and tablet, hidden on desktop -->
</div>
```

## Dark Mode

The design system includes support for dark mode:

```scss
.my-component {
  background-color: ds.$color-white;
  color: ds.$color-dark-gray-2;

  @media (prefers-color-scheme: dark) {
    body.dark-mode-enabled & {
      background-color: ds.$color-dark-gray-2;
      color: ds.$color-light-gray-1;
    }
  }
}
```

## Accessibility

Ensure your components are accessible:

### Color Contrast

All color combinations should meet WCAG 2.1 AA standards:

- Text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components and graphical objects: 3:1 contrast ratio

### Focus States

Use the design system's focus styles:

```scss
.interactive-element {
  &:focus-visible {
    outline: 2px solid ds.$color-primary;
    outline-offset: 2px;
  }
}
```

### Screen Reader Support

Use appropriate ARIA attributes and ensure content is accessible to screen readers:

```html
<button aria-label="Close dialog" class="close-button">
  <span class="visually-hidden">Close</span>
  <svg>...</svg>
</button>
```

## Best Practices

### Do's

- ✅ Use design tokens for all visual properties
- ✅ Use typography mixins for text styling
- ✅ Follow the BEM naming convention
- ✅ Make components responsive
- ✅ Support dark mode
- ✅ Ensure accessibility
- ✅ Document your components

### Don'ts

- ❌ Use hard-coded values for colors, spacing, etc.
- ❌ Import individual design system files directly
- ❌ Create custom styles that duplicate design system functionality
- ❌ Use overly specific selectors
- ❌ Nest selectors more than 3 levels deep
- ❌ Use `!important` (except in utility classes)

---

This guide is part of the DateNight.io UI/UX implementation plan. It serves as a reference for designers and developers to ensure consistent application of the design system throughout the application.

Last Updated: 2025-05-15
