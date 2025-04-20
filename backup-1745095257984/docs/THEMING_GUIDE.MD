# DateNight.io Theming Guide

This guide provides detailed instructions for theming and customizing the visual appearance of the DateNight.io application. It covers theme configuration, customization options, and implementation details.

## Table of Contents

1. [Introduction](#introduction)
2. [Theme Configuration](#theme-configuration)
3. [Color System](#color-system)
4. [Typography System](#typography-system)
5. [Custom Themes](#custom-themes)
6. [Dark Mode](#dark-mode)
7. [Theme Switching](#theme-switching)
8. [Implementation Examples](#implementation-examples)
9. [Related Resources](#related-resources)

## Introduction

The DateNight.io application uses a flexible theming system that allows for customization of colors, typography, and other visual elements. This guide explains how to use and customize the theming system.

For comprehensive information about the visual design language, see the [Styling Guide](/docs/STYLING_GUIDE.MD).

## Theme Configuration

Themes are defined in the `src/styles/themes` directory. The default theme is configured in `src/styles/themes/_default.scss`.

```scss
// Example theme configuration
$theme-default: (
  'colors': (
    'primary': #ff6b93,
    'primary-dark': #e6365f,
    'primary-light': #ffa4be,
    'secondary': #6979f8,
    'secondary-dark': #4756cb,
    'secondary-light': #a5affb,
    'dark': #1a1a2e,
    'medium': #4a4a68,
    'light': #e0e0e0,
    'white': #ffffff,
    'success': #00c48c,
    'warning': #ffb800,
    'error': #ff647c,
    'info': #0084f4,
  ),
  'typography': (
    'font-family-primary': (
      'Montserrat',
      sans-serif,
    ),
    'font-family-secondary': (
      'Lato',
      sans-serif,
    ),
    'font-size-base': 16px,
    'line-height-base': 1.5,
  ),
  'spacing': (
    'base': 4px,
    'scale': (
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
    ),
  ),
  'borders': (
    'radius-small': 4px,
    'radius-medium': 8px,
    'radius-large': 12px,
  ),
  'shadows': (
    'small': '0 2px 4px rgba(0, 0, 0, 0.1)',
    'medium': '0 4px 8px rgba(0, 0, 0, 0.1)',
    'large': '0 8px 16px rgba(0, 0, 0, 0.1)',
  ),
);
```

## Color System

The color system is based on a set of primary, secondary, and neutral colors, along with semantic colors for feedback states.

### Using Theme Colors

```scss
// Import theme functions
@import 'src/styles/themes/functions';

// Usage in component styles
.my-component {
  color: theme-color('primary');
  background-color: theme-color('light');
  border: 1px solid theme-color('medium');
}

// Using color variants
.my-component:hover {
  background-color: theme-color('primary-dark');
}
```

### Color Variables

Colors are available as both SCSS variables and CSS custom properties:

```scss
// SCSS variables
$color-primary: #ff6b93;
$color-secondary: #6979f8;

// CSS custom properties
:root {
  --color-primary: #ff6b93;
  --color-secondary: #6979f8;
}
```

## Typography System

The typography system defines font families, sizes, weights, and line heights.

### Using Theme Typography

```scss
// Import theme functions
@import 'src/styles/themes/functions';

// Usage in component styles
.my-component {
  font-family: theme-typography('font-family-primary');
  font-size: theme-typography('font-size-base');
  line-height: theme-typography('line-height-base');
}
```

### Typography Mixins

```scss
// Import typography mixins
@import 'src/styles/mixins/typography';

// Usage in component styles
.page-title {
  @include typography-display-large;
}

.section-title {
  @include typography-heading-1;
}

.body-text {
  @include typography-body-medium;
}
```

## Custom Themes

You can create custom themes by extending the default theme or creating a new theme from scratch.

### Extending the Default Theme

```scss
// Import default theme
@import 'src/styles/themes/default';

// Create a custom theme by extending the default theme
$theme-custom: map-merge(
  $theme-default,
  (
    'colors': map-merge(
        map-get($theme-default, 'colors'),
        (
          'primary': #ff4081,
          'secondary': #536dfe,
        )
      ),
  )
);
```

### Creating a New Theme

```scss
// Create a new theme from scratch
$theme-dark: (
  'colors': (
    'primary': #ff4081,
    'primary-dark': #c60055,
    'primary-light': #ff79b0,
    'secondary': #536dfe,
    'secondary-dark': #0043ca,
    'secondary-light': #8f9bff,
    'dark': #121212,
    'medium': #333333,
    'light': #484848,
    'white': #ffffff,
    'success': #00c853,
    'warning': #ffd600,
    'error': #ff1744,
    'info': #2979ff,
  ), // Other theme properties...
);
```

## Dark Mode

DateNight.io supports dark mode through a separate dark theme.

### Dark Theme Configuration

The dark theme is defined in `src/styles/themes/_dark.scss`:

```scss
$theme-dark: (
  'colors': (
    'primary': #ff79b0,
    'primary-dark': #ff4081,
    'primary-light': #ffa4be,
    'secondary': #8f9bff,
    'secondary-dark': #536dfe,
    'secondary-light': #a5affb,
    'dark': #ffffff,
    'medium': #e0e0e0,
    'light': #333333,
    'white': #121212,
    // Other colors...
  ), // Other theme properties...
);
```

### Implementing Dark Mode

```scss
// In component styles
.my-component {
  color: theme-color('dark');
  background-color: theme-color('white');

  [data-theme='dark'] & {
    // Dark mode styles will be applied automatically
    // when the theme function is used
  }
}
```

## Theme Switching

Theme switching is implemented using the `ThemeService` in Angular.

### Using the Theme Service

```typescript
import { ThemeService } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <button (click)="toggleTheme()">
      {{ currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode' }}
    </button>
  `,
})
export class ThemeSwitcherComponent {
  currentTheme: string;

  constructor(private themeService: ThemeService) {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

## Implementation Examples

### Button Component

```scss
// Button component styles
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: theme-spacing(2) theme-spacing(4);
  border-radius: theme-border('radius-medium');
  font-family: theme-typography('font-family-primary');
  font-weight: 600;
  font-size: theme-typography('font-size-button');
  line-height: 1.5;
  transition: all 0.2s ease-in-out;

  &--primary {
    background-color: theme-color('primary');
    color: theme-color('white');

    &:hover {
      background-color: theme-color('primary-dark');
    }
  }

  &--secondary {
    background-color: transparent;
    border: 1px solid theme-color('secondary');
    color: theme-color('secondary');

    &:hover {
      background-color: rgba(theme-color('secondary'), 0.1);
    }
  }
}
```

### Card Component

```scss
// Card component styles
.card {
  background-color: theme-color('white');
  border-radius: theme-border('radius-medium');
  box-shadow: theme-shadow('medium');
  padding: theme-spacing(4);

  &__title {
    @include typography-heading-2;
    margin-bottom: theme-spacing(2);
