# Theme Toggle Implementation

This document outlines the implementation of the theme toggle feature in the DateNight.io application, which allows users to switch between light and dark themes.

## Overview

The theme toggle feature has been implemented using:

1. CSS variables for theming
2. Emerald UI Toggle component
3. LocalStorage for persisting user preferences
4. System preference detection as a fallback

## Implementation Details

### CSS Theme Variables

The application uses CSS variables defined in `client-angular/src/styles/theme.css` to manage theme colors and properties. Two main themes are defined:

- **Light Theme (default)**: Applied to the `:root` element
- **Dark Theme**: Applied when the `.dark-theme` class is added to the `body` element

The application also supports system preference-based theming using the `prefers-color-scheme` media query.

### Theme Toggle Component

The theme toggle is implemented in the main layout component:

- **Location**: `client-angular/src/app/shared/components/main-layout/main-layout.component.ts`
- **Template**: `client-angular/src/app/shared/components/main-layout/main-layout.component.html`
- **Styles**: `client-angular/src/app/shared/components/main-layout/main-layout.component.scss`

The toggle appears in two forms:

1. **Expanded sidebar**: Uses the Emerald UI Toggle component with a "Dark Mode" label
2. **Collapsed sidebar**: Uses a simple button with sun/moon icons

### Theme Persistence

User theme preferences are stored in the browser's localStorage:

```typescript
// Save theme preference
localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

// Load theme preference
const savedTheme = localStorage.getItem('theme');
```

If no preference is saved, the application checks the user's system preference using:

```typescript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## Usage

### In Templates

To use the theme toggle in other components, import the `EmeraldToggleComponent` and implement the theme change handler:

```typescript
import { EmeraldToggleComponent } from '../../emerald/components/toggle/toggle.component';

@Component({
  // ...
  imports: [EmeraldToggleComponent],
})
export class YourComponent {
  isDarkMode = false;

  onThemeChange(value: boolean): void {
    this.isDarkMode = value;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }
}
```

```html
<emerald-toggle
  label="Dark Mode"
  labelPosition="right"
  color="primary"
  [value]="isDarkMode"
  (change)="onThemeChange($event)"
  ariaLabel="Toggle dark mode"
></emerald-toggle>
```

### Theming Components

When creating new components, use CSS variables for colors and other theme-related properties:

```scss
.your-component {
  background-color: var(--body-bg);
  color: var(--body-color);
  border-color: var(--border-color);
}
```

## Accessibility Considerations

The theme toggle implementation includes several accessibility features:

1. **ARIA labels**: Both toggle variants include appropriate aria-labels
2. **Keyboard navigation**: The toggle is fully keyboard accessible
3. **High contrast support**: The theme includes high contrast mode support
4. **Focus indicators**: Visible focus states are provided for keyboard users

## Future Enhancements

Potential improvements to the theme system:

1. **Additional themes**: Add more theme options beyond light and dark
2. **Theme customization**: Allow users to customize specific theme colors
3. **Component-specific theming**: Enable theming at the component level
4. **Animation transitions**: Add smooth transitions between theme changes
5. **Theme API**: Create a dedicated theme service for centralized management

## Related Files

- `client-angular/src/styles/theme.css`: Main theme definitions
- `client-angular/src/app/shared/components/main-layout/main-layout.component.ts`: Theme toggle implementation
- `client-angular/src/app/shared/components/main-layout/main-layout.component.html`: Theme toggle template
- `client-angular/src/app/shared/components/main-layout/main-layout.component.scss`: Theme toggle styles
- `client-angular/src/app/shared/emerald/components/toggle/toggle.component.ts`: Emerald UI Toggle component

---

Last Updated: 2025-05-15
