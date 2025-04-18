# DateNight.io Design Tokens Documentation

This document provides a comprehensive reference for all design tokens used in the DateNight.io application. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes such as colors, typography, spacing, etc.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Transitions](#transitions)
7. [Breakpoints](#breakpoints)
8. [Z-Index](#z-index)
9. [Usage Guidelines](#usage-guidelines)

## Color Palette

### Primary Colors

| Token                  | Value   | Description                                                 |
| ---------------------- | ------- | ----------------------------------------------------------- |
| `$color-primary`       | #ff3366 | Primary brand color (Pink/Red)                              |
| `$color-primary-light` | #ff6b99 | Lighter version for hover states, backgrounds               |
| `$color-primary-dark`  | #cc295a | Darker version for active states, text on light backgrounds |

### Secondary Colors

| Token                    | Value   | Description                                                 |
| ------------------------ | ------- | ----------------------------------------------------------- |
| `$color-secondary`       | #6c63ff | Secondary brand color (Purple)                              |
| `$color-secondary-light` | #9e97ff | Lighter version for hover states, backgrounds               |
| `$color-secondary-dark`  | #4a43cc | Darker version for active states, text on light backgrounds |

### Neutral Colors

| Token                  | Value   | Description       |
| ---------------------- | ------- | ----------------- |
| `$color-white`         | #ffffff | White             |
| `$color-light-gray-1`  | #f8f9fc | Background, cards |
| `$color-light-gray-2`  | #eef1f8 | Borders, dividers |
| `$color-medium-gray-1` | #d1d5e0 | Disabled states   |
| `$color-medium-gray-2` | #a0a8c0 | Placeholder text  |
| `$color-dark-gray-1`   | #6e7a94 | Secondary text    |
| `$color-dark-gray-2`   | #4a5568 | Primary text      |
| `$color-dark-gray-3`   | #2d3748 | Headings          |
| `$color-black`         | #1a202c | Emphasis text     |

### Semantic Colors

| Token            | Value   | Description               |
| ---------------- | ------- | ------------------------- |
| `$color-success` | #38d9a9 | Success states (Green)    |
| `$color-warning` | #ffab2e | Warning states (Orange)   |
| `$color-error`   | #ff4757 | Error states (Red)        |
| `$color-info`    | #54a0ff | Information states (Blue) |

## Typography

### Font Families

| Token                  | Value                 | Usage                  |
| ---------------------- | --------------------- | ---------------------- |
| `$font-family-base`    | 'Inter', sans-serif   | Body text, UI elements |
| `$font-family-heading` | 'Poppins', sans-serif | Headings, titles       |

### Font Weights

| Token                   | Value | Usage                             |
| ----------------------- | ----- | --------------------------------- |
| `$font-weight-light`    | 300   | Large headings only               |
| `$font-weight-regular`  | 400   | Default for body text             |
| `$font-weight-medium`   | 500   | Emphasis and subheadings          |
| `$font-weight-semibold` | 600   | Buttons and important UI elements |
| `$font-weight-bold`     | 700   | Main headings and strong emphasis |

### Font Sizes

| Token             | Value           | Usage                    |
| ----------------- | --------------- | ------------------------ |
| `$font-size-xs`   | 0.75rem (12px)  | Small labels, footnotes  |
| `$font-size-sm`   | 0.875rem (14px) | Secondary text, captions |
| `$font-size-base` | 1rem (16px)     | Body text, default size  |
| `$font-size-lg`   | 1.125rem (18px) | Large body text          |
| `$font-size-xl`   | 1.25rem (20px)  | Subheadings              |
| `$font-size-2xl`  | 1.5rem (24px)   | H3, section headings     |
| `$font-size-3xl`  | 1.875rem (30px) | H2, page subheadings     |
| `$font-size-4xl`  | 2.25rem (36px)  | H1, page titles          |
| `$font-size-5xl`  | 3rem (48px)     | Hero headings            |

### Line Heights

| Token                  | Value | Usage                     |
| ---------------------- | ----- | ------------------------- |
| `$line-height-tight`   | 1.25  | For headings              |
| `$line-height-snug`    | 1.375 | For subheadings           |
| `$line-height-normal`  | 1.5   | For body text             |
| `$line-height-relaxed` | 1.625 | For large body text       |
| `$line-height-loose`   | 2     | For emphasized paragraphs |

## Spacing

The spacing system is based on 4px increments to ensure consistent spacing throughout the application.

| Token         | Value          | Description                           |
| ------------- | -------------- | ------------------------------------- |
| `$spacing-0`  | 0              | No spacing                            |
| `$spacing-1`  | 0.25rem (4px)  | Extra small - tight spacing           |
| `$spacing-2`  | 0.5rem (8px)   | Small - between related items         |
| `$spacing-3`  | 0.75rem (12px) | Medium small - internal padding       |
| `$spacing-4`  | 1rem (16px)    | Medium - standard spacing             |
| `$spacing-5`  | 1.25rem (20px) | Medium large - between groups         |
| `$spacing-6`  | 1.5rem (24px)  | Large - section spacing               |
| `$spacing-8`  | 2rem (32px)    | Extra large - between major sections  |
| `$spacing-10` | 2.5rem (40px)  | 2x Large - top/bottom section padding |
| `$spacing-12` | 3rem (48px)    | 3x Large - major section breaks       |
| `$spacing-16` | 4rem (64px)    | 4x Large - page sections              |
| `$spacing-20` | 5rem (80px)    | 5x Large - major page breaks          |
| `$spacing-24` | 6rem (96px)    | 6x Large - hero sections              |

## Border Radius

| Token                 | Value          | Usage                            |
| --------------------- | -------------- | -------------------------------- |
| `$border-radius-none` | 0              | No border radius                 |
| `$border-radius-sm`   | 0.25rem (4px)  | Small elements                   |
| `$border-radius-md`   | 0.5rem (8px)   | Buttons, inputs                  |
| `$border-radius-lg`   | 0.75rem (12px) | Cards, modals                    |
| `$border-radius-xl`   | 1rem (16px)    | Large cards                      |
| `$border-radius-2xl`  | 1.5rem (24px)  | Extra large elements             |
| `$border-radius-full` | 9999px         | Pills, badges, circular elements |

## Shadows

| Token           | Value                                                                     | Usage                                |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| `$shadow-none`  | none                                                                      | No shadow                            |
| `$shadow-xs`    | 0 1px 2px rgba(0, 0, 0, 0.05)                                             | Subtle shadow                        |
| `$shadow-sm`    | 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)               | Small elements                       |
| `$shadow-md`    | 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)     | Cards, buttons                       |
| `$shadow-lg`    | 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)   | Elevated cards, dropdowns            |
| `$shadow-xl`    | 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) | Modals, popovers                     |
| `$shadow-2xl`   | 0 25px 50px -12px rgba(0, 0, 0, 0.25)                                     | Large modals, hero elements          |
| `$shadow-inner` | inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)                                     | Inset shadow for pressed states      |
| `$shadow-focus` | 0 0 0 3px rgba($color-primary, 0.2)                                       | Focus state for interactive elements |

## Transitions

| Token                        | Value                        | Usage                                                   |
| ---------------------------- | ---------------------------- | ------------------------------------------------------- |
| `$transition-fast`           | 150ms                        | Extra fast - micro-interactions                         |
| `$transition-normal`         | 300ms                        | Normal - hover states, button clicks                    |
| `$transition-slow`           | 500ms                        | Slow - complex animations, emphasis                     |
| `$transition-timing-default` | cubic-bezier(0.4, 0, 0.2, 1) | Default - smooth acceleration and deceleration          |
| `$transition-timing-in`      | cubic-bezier(0.4, 0, 1, 1)   | Ease In - gradual acceleration                          |
| `$transition-timing-out`     | cubic-bezier(0, 0, 0.2, 1)   | Ease Out - gradual deceleration                         |
| `$transition-timing-linear`  | linear                       | Linear - constant speed (use for continuous animations) |

## Breakpoints

| Token                       | Value  | Description   |
| --------------------------- | ------ | ------------- |
| `$breakpoint-mobile-small`  | 0      | 0-359px       |
| `$breakpoint-mobile`        | 360px  | 360px-599px   |
| `$breakpoint-tablet`        | 600px  | 600px-959px   |
| `$breakpoint-desktop`       | 960px  | 960px-1279px  |
| `$breakpoint-desktop-large` | 1280px | 1280px-1919px |
| `$breakpoint-desktop-xl`    | 1920px | 1920px+       |

## Z-Index

| Token                     | Value | Usage           |
| ------------------------- | ----- | --------------- |
| `$z-index-dropdown`       | 1000  | Dropdown menus  |
| `$z-index-sticky`         | 1020  | Sticky elements |
| `$z-index-fixed`          | 1030  | Fixed elements  |
| `$z-index-modal-backdrop` | 1040  | Modal backdrop  |
| `$z-index-modal`          | 1050  | Modal dialog    |
| `$z-index-popover`        | 1060  | Popovers        |
| `$z-index-tooltip`        | 1070  | Tooltips        |

## Usage Guidelines

### Using Design Tokens in SCSS

```scss
// Import the design system
@use 'src/styles/design-system' as ds;

.my-component {
  // Using color tokens
  color: ds.$color-primary;
  background-color: ds.$color-light-gray-1;

  // Using spacing tokens
  padding: ds.$spacing-4;
  margin-bottom: ds.$spacing-6;

  // Using typography tokens
  font-family: ds.$font-family-base;
  font-size: ds.$font-size-base;
  font-weight: ds.$font-weight-medium;
  line-height: ds.$line-height-normal;

  // Using shadow tokens
  box-shadow: ds.$shadow-md;

  // Using border radius tokens
  border-radius: ds.$border-radius-md;

  // Using transitions
  transition: all ds.$transition-normal ds.$transition-timing-default;

  // Using breakpoints
  @media (min-width: ds.$breakpoint-tablet) {
    font-size: ds.$font-size-lg;
  }
}
```

### Using Typography Mixins

```scss
// Import the design system
@use 'src/styles/design-system' as ds;

.page-title {
  @include ds.heading-1;
}

.section-title {
  @include ds.heading-2;
}

.card-title {
  @include ds.heading-3;
}

.body-text {
  @include ds.body-default;
}

.caption {
  @include ds.caption;
}

.button {
  @include ds.button-text;
}
```

### Using Spacing Utilities

The design system provides utility classes for margin and padding:

- Margin: `.m-{size}`, `.mt-{size}`, `.mr-{size}`, `.mb-{size}`, `.ml-{size}`, `.mx-{size}`, `.my-{size}`
- Padding: `.p-{size}`, `.pt-{size}`, `.pr-{size}`, `.pb-{size}`, `.pl-{size}`, `.px-{size}`, `.py-{size}`

Where `{size}` is one of: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24

Example:

```html
<div class="mt-4 mb-6 px-4">
  This element has margin-top: 1rem, margin-bottom: 1.5rem, and padding-left/right: 1rem
</div>
```

---

This documentation is part of the DateNight.io UI/UX implementation plan. It serves as a reference for designers and developers to ensure consistent application of design tokens throughout the application.

Last Updated: 2025-05-15
