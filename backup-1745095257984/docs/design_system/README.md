# DateNight.io Design System

This is the main documentation for the DateNight.io design system, which provides a consistent visual language and component library for the application.

## Overview

The DateNight.io design system is built on a set of design tokens, mixins, and utilities that ensure consistency across the application. It includes a comprehensive set of components, typography styles, spacing utilities, and color system.

## Documentation Structure

- [Design System Implementation Summary](../DESIGN-SYSTEM-IMPLEMENTATION-SUMMARY.MD) - Overview of the design system implementation
- [Design System Usage Guide](../DESIGN-SYSTEM-USAGE-GUIDE.MD) - Practical instructions for using the design system
- [BEM Naming Convention Guide](../BEM-NAMING-CONVENTION.MD) - Guide for implementing the BEM naming convention

## Design Tokens

Design tokens are the foundation of the design system. They define the visual properties of the UI, such as colors, typography, spacing, and more.

- [Colors](./COLORS.MD) - Color palette and usage guidelines
- [Typography](./TYPOGRAPHY.MD) - Typography scale and usage guidelines
- [Spacing](./SPACING.MD) - Spacing scale and usage guidelines
- [Borders & Shadows](./BORDERS-SHADOWS.MD) - Border radius, shadows, and usage guidelines

## Components

The design system includes a comprehensive set of components that can be used to build the application UI.

### Core Components

- [Button](./components/BUTTON.MD) - Button component with variants, sizes, and states
- [Card](./components/CARD.MD) - Card component with various styling options
- [Icon](./components/ICON.MD) - Icon component with customizable size and color

### Form Components

- [Input](./FORM-COMPONENTS.MD#input-component) - Input component with variants, sizes, and states
- [Checkbox](./FORM-COMPONENTS.MD#checkbox-component) - Checkbox component with sizes and states
- [Select](./FORM-COMPONENTS.MD#select-component) - Select component with variants, sizes, and states
- [Form Components Usage Guide](./FORM-COMPONENTS-USAGE.MD) - Detailed usage guide for form components
- [Form Validation Patterns](./FORM-VALIDATION-PATTERNS.MD) - Recommended patterns for form validation
- [Form Layout Patterns](./FORM-LAYOUT-PATTERNS.MD) - Recommended patterns for form layouts

## Utilities

The design system includes a set of utility classes that can be used to apply common styles to elements.

- [Spacing Utilities](./utilities/SPACING.MD) - Margin and padding utilities
- [Typography Utilities](./utilities/TYPOGRAPHY.MD) - Text styling utilities
- [Color Utilities](./utilities/COLORS.MD) - Text and background color utilities
- [Layout Utilities](./utilities/LAYOUT.MD) - Flexbox and grid utilities

## Guidelines

- [Accessibility](./guidelines/ACCESSIBILITY.MD) - Accessibility guidelines and best practices
- [Responsive Design](./guidelines/RESPONSIVE-DESIGN.MD) - Responsive design guidelines and breakpoints
- [Dark Mode](./guidelines/DARK-MODE.MD) - Dark mode implementation guidelines

## Demo

The design system includes a comprehensive demo page that showcases all design system elements. The demo is available at `/design-system` in the application.

## Contributing

When contributing to the design system, please follow these guidelines:

1. Use design tokens for all visual properties
2. Follow the BEM naming convention for CSS classes
3. Make components responsive and accessible
4. Support dark mode
5. Document your components using the [Component Documentation Template](../COMPONENT-DOCUMENTATION-TEMPLATE.MD)

## Resources

- [Figma Design System](https://figma.com/file/design-system) - Figma file containing the design system components
- [Component Templates](../../client-angular/src/app/shared/templates) - Templates for creating new components
- [Design System Demo](../../client-angular/src/app/features/design-system-demo) - Demo page showcasing the design system

---

Last Updated: 2025-05-15
