# UI Implementation Guide

This guide provides step-by-step instructions for implementing the remaining UI fixes to make the web app styling follow the UI documentation guidelines 100%.

## Table of Contents

1. [Fixing Unused Components](#1-fixing-unused-components)
2. [Optimizing Font Budget](#2-optimizing-font-budget)
3. [Enabling Emerald UI Integration](#3-enabling-emerald-ui-integration)
4. [Using CSS Variables](#4-using-css-variables)
5. [Following BEM Naming Convention](#5-following-bem-naming-convention)
6. [Implementing Responsive Design](#6-implementing-responsive-design)
7. [Ensuring Accessibility Compliance](#7-ensuring-accessibility-compliance)
8. [Implementing Dark Mode](#8-implementing-dark-mode)
9. [Adding Animations and Micro-interactions](#9-adding-animations-and-micro-interactions)
10. [Performance Optimization](#10-performance-optimization)

## 1. Fixing Unused Components

### 1.1 ChatRoomComponent

Remove unused TimeAgoPipe and FileSizePipe imports:

```typescript
// client-angular/src/app/features/chat/chat.module.ts

// Remove these imports
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';

// Remove from declarations array
declarations: [
  // ...
  // TimeAgoPipe, <- Remove this
  // FileSizePipe, <- Remove this
  // ...
];
```

### 1.2 ListViewComponent

Remove unused AdCardComponent import:

```typescript
// client-angular/src/app/features/list-view/list-view.component.ts

// Remove this import
import { AdCardComponent } from '../../shared/components/ad-card/ad-card.component';

// Remove from imports array
imports: [
  // ...
  // AdCardComponent, <- Remove this
  // ...
];
```

### 1.3 WalletComponent

Remove unused CardGridComponent and AppCardComponent imports:

```typescript
// client-angular/src/app/features/wallet/wallet.component.ts

// Remove these imports
import { CardGridComponent } from '../../shared/emerald/components/card-grid/card-grid.component';
import { AppCardComponent } from '../../shared/emerald/components/app-card/app-card.component';

// Remove from imports array
imports: [
  // ...
  // CardGridComponent, <- Remove this
  // AppCardComponent, <- Remove this
  // ...
];
```

### 1.4 MainLayoutComponent

Remove unused ToggleComponent import:

```typescript
// client-angular/src/app/shared/components/main-layout/main-layout.component.ts

// Remove this import
import { ToggleComponent } from '../../emerald/components/toggle/toggle.component';

// Remove from imports array
imports: [
  CommonModule,
  RouterModule,
  // ToggleComponent, <- Remove this
  ThemeToggleComponent,
];
```

## 2. Optimizing Font Budget

Optimize the Google Fonts import to reduce the bundle size:

```scss
// client-angular/src/app/core/design/main.scss

// Replace this
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto+Mono&display=swap');

// With this
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600&family=Roboto+Mono&display=swap');
```

## 3. Enabling Emerald UI Integration

Uncomment and fix the Emerald UI CSS import:

```scss
// client-angular/src/app/core/design/emerald-ui-integration.scss

// Replace this
// @import 'node_modules/emerald-ui/lib/styles/emerald-ui.min.css';
// Commented out to fix build issues - we'll need to properly configure this import

// With this
@use '../../../../node_modules/emerald-ui/lib/styles/emerald-ui.min.css' as *;
```

## 4. Using CSS Variables

### 4.1 Use the CSS Variable Checker

The CSS Variable Checker utility helps identify hardcoded values in components that should be using design tokens.

```scss
// In your component's SCSS file
@use 'path/to/css-variable-checker' as checker;

// Check for hardcoded values
@include checker.check-colors();
@include checker.check-spacing();
@include checker.check-typography();
```

### 4.2 Replace Hardcoded Values

Replace hardcoded values with design tokens:

```scss
// Bad
.element {
  color: #ff6b93;
  font-size: 16px;
  padding: 1rem;
}

// Good
.element {
  color: var(--color-primary);
  font-size: var(--font-size-base);
  padding: var(--spacing-4);
}
```

## 5. Following BEM Naming Convention

### 5.1 Use the BEM Utilities

The BEM Utilities provide mixins and functions to help implement BEM naming conventions:

```scss
// In your component's SCSS file
@use 'path/to/bem-utilities' as bem;

.card {
  // Block styles

  @include bem.element('title') {
    // Element styles
  }

  @include bem.modifier('active') {
    // Modifier styles
  }
}
```

### 5.2 Follow BEM Naming Convention

```scss
// Bad
.card {
  // ...

  .title {
    // ...
  }

  .active {
    // ...
  }
}

// Good
.card {
  // ...

  &__title {
    // ...
  }

  &--active {
    // ...
  }
}
```

## 6. Implementing Responsive Design

### 6.1 Use the Responsive Utilities

The Responsive Utilities provide mixins and functions to help implement responsive design:

```scss
// In your component's SCSS file
@use 'path/to/responsive-utilities' as responsive;

.element {
  // Base styles

  @include responsive.up('tablet') {
    // Tablet and up styles
  }

  @include responsive.down('desktop') {
    // Desktop and down styles
  }

  @include responsive.between('tablet', 'desktop') {
    // Styles between tablet and desktop
  }

  @include responsive.only('tablet') {
    // Styles only for tablet
  }
}
```

### 6.2 Use Responsive Breakpoints

```scss
// Bad
@media (min-width: 768px) {
  .element {
    // ...
  }
}

// Good
@include responsive.up('tablet') {
  .element {
    // ...
  }
}
```

## 7. Ensuring Accessibility Compliance

### 7.1 Use the Accessibility Utilities

The Accessibility Utilities provide mixins and functions to help implement accessible design:

```scss
// In your component's SCSS file
@use 'path/to/accessibility-utilities' as a11y;

.element {
  // ...

  @include a11y.focus-visible;
}

.sr-only {
  @include a11y.visually-hidden;
}
```

### 7.2 Add Skip Links

```html
<a href="#main-content" class="skip-link">Skip to main content</a>

<main id="main-content">
  <!-- Main content -->
</main>
```

```scss
.skip-link {
  @include a11y.skip-link;
}
```

### 7.3 Ensure Proper Focus Styles

```scss
.interactive-element {
  @include a11y.focus-visible;
}
```

### 7.4 Add ARIA Attributes

```html
<button aria-label="Close" aria-expanded="false">
  <span class="sr-only">Close</span>
  <svg>...</svg>
</button>
```

## 8. Implementing Dark Mode

### 8.1 Use the Dark Mode Utilities

The Dark Mode Utilities provide mixins and functions to help implement dark mode:

```scss
// In your component's SCSS file
@use 'path/to/dark-mode' as dark;

.element {
  color: tokens.$color-dark-gray-3;
  background-color: tokens.$color-white;

  @include dark.mode {
    color: tokens.$color-light-gray-1;
    background-color: tokens.$color-dark-gray-3;
  }
}
```

### 8.2 Use Dark Mode Color Mixins

```scss
.element {
  @include dark.text(tokens.$color-dark-gray-3);
  @include dark.background(tokens.$color-white);
  @include dark.border(tokens.$color-light-gray-2);
  @include dark.shadow(tokens.$shadow-sm);
}
```

## 9. Adding Animations and Micro-interactions

### 9.1 Use the Animation Utilities

The Animation Utilities provide mixins and functions to help implement animations:

```scss
// In your component's SCSS file
@use 'path/to/animation-utilities' as animation;

.element {
  @include animation.fade-in;
}

.button {
  @include animation.transition(all);

  &:hover {
    transform: scale(1.05);
  }
}
```

### 9.2 Use the Micro-interactions Utilities

The Micro-interactions Utilities provide mixins and functions to help implement micro-interactions:

```scss
// In your component's SCSS file
@use 'path/to/micro-interactions' as micro;

.button {
  @include micro.hover-scale;
}

.card {
  @include micro.hover-lift;
}

.link {
  @include micro.hover-color-shift(color, tokens.$color-dark-gray-3, tokens.$color-primary);
}
```

### 9.3 Add Loading States

```scss
.button {
  position: relative;

  &.is-loading {
    @include micro.loading-spinner;
  }
}
```

### 9.4 Add Success and Error States

```scss
.form-field {
  &.is-success {
    @include micro.success-checkmark;
  }

  &.is-error {
    @include micro.error-shake;
  }
}
```

## 10. Performance Optimization

### 10.1 Optimize CSS

- Use CSS variables for frequently used values
- Minimize nesting in SCSS files
- Use shorthand properties where possible
- Remove unused CSS

### 10.2 Optimize Images

- Use appropriate image formats (WebP, AVIF)
- Implement responsive images with srcset
- Lazy load images

### 10.3 Optimize Fonts

- Use font-display: swap
- Preload critical fonts
- Use variable fonts where possible

### 10.4 Optimize JavaScript

- Lazy load non-critical components
- Use Angular's OnPush change detection
- Implement virtual scrolling for long lists

### 10.5 Implement Code Splitting

- Use Angular's lazy loading for routes
- Use dynamic imports for non-critical code

## Conclusion

By following this guide, you will be able to implement all the necessary fixes to make the web app styling follow the UI documentation guidelines 100%. Remember to test your changes thoroughly and ensure that they work across all supported browsers and devices.

For any questions or issues, please refer to the UI documentation or contact the design team.
