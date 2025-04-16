# Theme System Documentation

This document outlines the theme system implementation in the Date Night App.

## Overview

The theme system provides a flexible way to switch between light and dark themes, with support for:

- User preference selection (light/dark/system)
- System preference detection
- Smooth transitions between themes
- Accessibility considerations
- Multiple theme toggle UI variants

## Core Components

### ThemeService

Located at `src/app/core/services/theme.service.ts`, this service is responsible for:

- Managing theme state
- Persisting theme preferences
- Detecting system preferences
- Providing observables for theme changes

```typescript
// Key methods
setTheme(theme: 'light' | 'dark' | 'system'): void
toggleTheme(): void
getCurrentTheme(): 'light' | 'dark' | 'system'
isDarkMode(): boolean

// Observables
theme$: Observable<'light' | 'dark' | 'system'>
isDarkMode$: Observable<boolean>
```

### ThemeToggleComponent

Located at `src/app/shared/components/theme-toggle/theme-toggle.component.ts`, this component provides:

- Multiple display modes (icon-only, with-label, toggle)
- Customizable labels and positions
- Accessibility support
- Smooth animations

```typescript
// Input properties
@Input() mode: 'icon-only' | 'with-label' | 'toggle' = 'icon-only';
@Input() label = 'Dark Mode';
@Input() labelPosition: 'left' | 'right' = 'left';
@Input() ariaLabel = 'Toggle dark mode';
```

## CSS Variables

The theme system uses CSS variables defined in `src/styles/theme.css` to manage theme colors and properties:

```css
/* Light theme variables */
:root,
.light-theme {
  --body-bg: var(--neutral-100);
  --body-color: var(--neutral-800);
  /* ... other variables ... */
}

/* Dark theme variables */
.dark-theme {
  --body-bg: var(--neutral-900);
  --body-color: var(--neutral-200);
  /* ... other variables ... */
}
```

## System Preference Detection

The theme system can automatically detect and apply the user's system preference:

```css
@media (prefers-color-scheme: dark) {
  :root:not(.light-theme):not(.dark-theme) {
    /* Dark theme variables */
  }
}
```

## Accessibility Features

- High contrast mode support
- Focus indicators
- ARIA attributes
- Keyboard navigation
- Reduced motion support

## Usage Examples

### Basic Usage

```html
<!-- Icon-only toggle -->
<app-theme-toggle></app-theme-toggle>

<!-- With label -->
<app-theme-toggle mode="with-label" label="Dark Mode" labelPosition="right"> </app-theme-toggle>

<!-- Toggle switch -->
<app-theme-toggle mode="toggle" label="Enable Dark Mode"> </app-theme-toggle>
```

### Programmatic Usage

```typescript
import { ThemeService } from '../core/services/theme.service';

constructor(private themeService: ThemeService) {}

// Set theme explicitly
setLightTheme() {
  this.themeService.setTheme('light');
}

setDarkTheme() {
  this.themeService.setTheme('dark');
}

useSystemPreference() {
  this.themeService.setTheme('system');
}

// Toggle between themes
toggleTheme() {
  this.themeService.toggleTheme();
}

// React to theme changes
ngOnInit() {
  this.themeService.isDarkMode$.subscribe(isDarkMode => {
    // Update UI based on theme
  });
}
```

## Best Practices

1. **Use CSS variables** for all color and theme-related properties
2. **Add the theme-transition class** to elements that should animate during theme changes
3. **Test with system preferences** to ensure proper detection and application
4. **Consider accessibility** by ensuring sufficient contrast in both themes
5. **Use the ThemeToggleComponent** for consistent UI across the application

## Troubleshooting

- If theme changes aren't applying, check that CSS variables are being used correctly
- For transition issues, verify the theme-transition class is applied
- System preference detection requires proper CSS structure with :root:not(.light-theme):not(.dark-theme)
