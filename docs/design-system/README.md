# DateNight.io Design System

This is the main documentation for the DateNight.io design system, which provides a consistent visual language and component library for the application.

## Overview

The DateNight.io design system is built on a set of design tokens, mixins, and utilities that ensure consistency across the application. It includes a comprehensive set of components, typography styles, spacing utilities, and color system.

## Documentation Structure

- [Design System Implementation Summary](../design-system-implementation-summary.md) - Overview of the design system implementation
- [Design System Usage Guide](../design-system-usage-guide.md) - Practical instructions for using the design system
- [BEM Naming Convention Guide](../bem-naming-convention.md) - Guide for implementing the BEM naming convention

## Design Tokens

Design tokens are the foundation of the design system. They define the visual properties of the UI, such as colors, typography, spacing, and more.

- [Colors](./colors.md) - Color palette and usage guidelines
- [Typography](./typography.md) - Typography scale and usage guidelines
- [Spacing](./spacing.md) - Spacing scale and usage guidelines
- [Borders & Shadows](./borders-shadows.md) - Border radius, shadows, and usage guidelines

## Components

The design system includes a comprehensive set of components that can be used to build the application UI.

### Core Components

- [Button](./components/button.md) - Button component with variants, sizes, and states
- [Card](./components/card.md) - Card component with various styling options
- [Icon](./components/icon.md) - Icon component with customizable size and color

### Form Components

- [Input](./form-components.md#input-component) - Input component with variants, sizes, and states
- [Checkbox](./form-components.md#checkbox-component) - Checkbox component with sizes and states
- [Select](./form-components.md#select-component) - Select component with variants, sizes, and states
- [Form Components Usage Guide](./form-components-usage.md) - Detailed usage guide for form components
- [Form Validation Patterns](./form-validation-patterns.md) - Recommended patterns for form validation
- [Form Layout Patterns](./form-layout-patterns.md) - Recommended patterns for form layouts

## Utilities

The design system includes a set of utility classes that can be used to apply common styles to elements.

- [Spacing Utilities](./utilities/spacing.md) - Margin and padding utilities
- [Typography Utilities](./utilities/typography.md) - Text styling utilities
- [Color Utilities](./utilities/colors.md) - Text and background color utilities
- [Layout Utilities](./utilities/layout.md) - Flexbox and grid utilities

## Guidelines

- [Accessibility](./guidelines/accessibility.md) - Accessibility guidelines and best practices
- [Responsive Design](./guidelines/responsive-design.md) - Responsive design guidelines and breakpoints
- [Dark Mode](./guidelines/dark-mode.md) - Dark mode implementation guidelines

## Demo

The design system includes a comprehensive demo page that showcases all design system elements. The demo is available at `/design-system` in the application.

## Contributing

When contributing to the design system, please follow these guidelines:

1. Use design tokens for all visual properties
2. Follow the BEM naming convention for CSS classes
3. Make components responsive and accessible
4. Support dark mode
5. Document your components using the [Component Documentation Template](../component-documentation-template.md)

## Resources

- [Figma Design System](https://figma.com/file/design-system) - Figma file containing the design system components
- [Component Templates](../../client-angular/src/app/shared/templates) - Templates for creating new components
- [Design System Demo](../../client-angular/src/app/features/design-system-demo) - Demo page showcasing the design system

---

Last Updated: 2025-05-15
