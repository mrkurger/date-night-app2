# DateNight.io Styling Guide

This document outlines the standardized approach to styling in the DateNight.io application. Following these guidelines will ensure consistency, maintainability, and scalability of the application's UI.

## Table of Contents

1. [Design System](#design-system)
2. [File Structure](#file-structure)
3. [Component Styling](#component-styling)
4. [Layout System](#layout-system)
5. [Theming](#theming)
6. [Best Practices](#best-practices)

## Design System

The application uses a comprehensive design system that defines all visual elements and their properties. The design system is implemented as a collection of SCSS files in the `/src/styles/design-system` directory.

### Key Components

- **Variables**: Design tokens for colors, typography, spacing, etc.
- **Typography**: Text styles and mixins
- **Components**: Base component styles and mixins
- **Utilities**: Helper classes for common styling needs
- **Animations**: Animation definitions and utilities
- **Reset**: Normalized baseline styles

### Usage

To use the design system in a component:

```scss
@use 'src/styles/design-system/index.scss' as ds;

.my-component {
  color: ds.$color-primary;
  padding: ds.$spacing-4;
  
  &__element {
    font-size: ds.$font-size-lg;
  }
}
```

## File Structure

```
/src/styles/
  ├── design-system/
  │   ├── _variables.scss    # All design tokens
  │   ├── _typography.scss   # Typography styles
  │   ├── _components.scss   # Base component styles
  │   ├── _utilities.scss    # Utility classes
  │   ├── _animations.scss   # Animation definitions
  │   ├── _reset.scss        # Normalized baseline styles
  │   └── index.scss         # Main entry point
  ├── themes/
  │   ├── _light.scss        # Light theme variables
  │   └── _dark.scss         # Dark theme variables
  └── main.scss              # Main stylesheet
```

## Component Styling

All components should use SCSS with BEM (Block, Element, Modifier) methodology:

### BEM Naming Convention

- **Block**: The component itself (e.g., `.card`)
- **Element**: A part of the component (e.g., `.card__title`)
- **Modifier**: A variant of a block or element (e.g., `.card--featured`)

### Example

```scss
.card {
  background-color: var(--neutral-100);
  border-radius: var(--border-radius-lg);
  
  &__header {
    padding: var(--space-4);
    border-bottom: 1px solid var(--neutral-300);
  }
  
  &__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
  }
  
  &--featured {
    box-shadow: var(--shadow-lg);
    
    .card__title {
      color: var(--primary);
    }
  }
}
```

## Layout System

The application uses a standardized layout system with the `MainLayoutComponent` that provides:

1. A left sidebar for navigation
2. A main content area
3. A right sidebar for premium ads

### Usage

Wrap your component content with the `MainLayoutComponent`:

```html
<app-main-layout activeView="netflix">
  <!-- Your component content here -->
</app-main-layout>
```

## Theming

The application supports light and dark themes using CSS custom properties (variables). Theme variables are defined in:

- `/src/styles/themes/_light.scss`
- `/src/styles/themes/_dark.scss`

### Usage

Always use theme variables for colors, backgrounds, etc.:

```scss
.my-component {
  background-color: var(--body-bg);
  color: var(--body-color);
  border: 1px solid var(--border-color);
}
```

## Best Practices

1. **Always use the design system**:
   - Import the design system in every component SCSS file
   - Use design tokens for all visual properties

2. **Follow BEM methodology**:
   - Use clear, descriptive names
   - Nest selectors using SCSS to maintain BEM structure

3. **Responsive design**:
   - Use the built-in breakpoints
   - Design mobile-first, then add media queries for larger screens

4. **Performance**:
   - Avoid deep nesting of selectors
   - Use utility classes for common patterns
   - Minimize the use of !important

5. **Accessibility**:
   - Ensure sufficient color contrast
   - Use semantic HTML elements
   - Test with keyboard navigation

6. **Component encapsulation**:
   - Styles should not leak outside the component
   - Use Angular's ViewEncapsulation.Emulated (default)

By following these guidelines, we ensure a consistent, maintainable, and scalable styling approach throughout the application.