# DateNight.io UI/UX Style Guide

This comprehensive style guide defines the visual language, interaction patterns, and design principles for the DateNight.io Progressive Web App. Following these guidelines will ensure a sleek, modern, minimalistic yet luxurious feel with carefully restrained effects.

## Table of Contents

1. [Visual Identity](#1-visual-identity)
2. [Layout & Spacing](#2-layout--spacing)
3. [Component Styling](#3-component-styling)
4. [Effects & Animations](#4-effects--animations)
5. [Interaction Patterns](#5-interaction-patterns)
6. [Responsive Design Principles](#6-responsive-design-principles)
7. [Accessibility Guidelines](#7-accessibility-guidelines)
8. [Implementation Resources](#8-implementation-resources)

## 1. Visual Identity

### Color Palette

The DateNight.io color palette is designed to convey sophistication, luxury, and sensuality while maintaining a clean, modern aesthetic.

#### Primary Colors

| Color Name    | Hex Code  | Usage                           |
| ------------- | --------- | ------------------------------- |
| Primary       | `#FF6B93` | Primary actions, key highlights |
| Primary Dark  | `#E6365F` | Hover states, active states     |
| Primary Light | `#FFA4BE` | Backgrounds, subtle highlights  |

#### Secondary Colors

| Color Name      | Hex Code  | Usage                                    |
| --------------- | --------- | ---------------------------------------- |
| Secondary       | `#6979F8` | Secondary actions, complementary accents |
| Secondary Dark  | `#4756CB` | Hover states, active states              |
| Secondary Light | `#A5AFFB` | Backgrounds, subtle highlights           |

#### Neutral Colors

| Color Name | Hex Code  | Usage                                 |
| ---------- | --------- | ------------------------------------- |
| Dark       | `#1A1A2E` | Text, icons                           |
| Medium     | `#4A4A68` | Secondary text, borders               |
| Light      | `#E0E0E0` | Backgrounds, dividers                 |
| White      | `#FFFFFF` | Backgrounds, text on dark backgrounds |

#### Semantic Colors

| Color Name | Hex Code  | Usage                                |
| ---------- | --------- | ------------------------------------ |
| Success    | `#00C48C` | Success messages, positive actions   |
| Warning    | `#FFB800` | Warning messages, cautionary actions |
| Error      | `#FF647C` | Error messages, destructive actions  |
| Info       | `#0084F4` | Informational messages               |

### Typography

DateNight.io uses a carefully selected typography system that balances readability with style.

#### Font Families

- **Primary Font**: 'Montserrat', sans-serif
  - Used for headings, buttons, and UI elements
- **Secondary Font**: 'Lato', sans-serif
  - Used for body text and longer content

#### Type Scale

| Name           | Size (px/rem) | Weight | Line Height | Usage                         |
| -------------- | ------------- | ------ | ----------- | ----------------------------- |
| Display Large  | 48px/3rem     | 700    | 1.2         | Hero sections, major headings |
| Display Medium | 36px/2.25rem  | 700    | 1.2         | Section headings              |
| Display Small  | 30px/1.875rem | 700    | 1.3         | Card headings, minor sections |
| Heading 1      | 24px/1.5rem   | 600    | 1.3         | Page headings                 |
| Heading 2      | 20px/1.25rem  | 600    | 1.4         | Section headings              |
| Heading 3      | 18px/1.125rem | 600    | 1.4         | Subsection headings           |
| Body Large     | 16px/1rem     | 400    | 1.5         | Primary body text             |
| Body Medium    | 14px/0.875rem | 400    | 1.5         | Secondary body text           |
| Body Small     | 12px/0.75rem  | 400    | 1.5         | Captions, annotations         |
| Button         | 16px/1rem     | 600    | 1.5         | Buttons                       |
| Caption        | 12px/0.75rem  | 400    | 1.5         | Captions, metadata            |

#### Typography Rules

- Use sentence case for headings and titles
- Limit line length to 60-80 characters for optimal readability
- Maintain sufficient contrast between text and background (minimum 4.5:1 ratio)
- Use font weights to create hierarchy rather than multiple font families

## 2. Layout & Spacing

### Grid System

DateNight.io uses a 12-column grid system with responsive breakpoints.

#### Breakpoints

| Name | Width (px) | Description                                 |
| ---- | ---------- | ------------------------------------------- |
| xs   | < 576      | Extra small devices (portrait phones)       |
| sm   | ≥ 576      | Small devices (landscape phones)            |
| md   | ≥ 768      | Medium devices (tablets)                    |
| lg   | ≥ 992      | Large devices (desktops)                    |
| xl   | ≥ 1200     | Extra large devices (large desktops)        |
| xxl  | ≥ 1400     | Extra extra large devices (larger desktops) |

#### Container Widths

| Breakpoint | Container Width |
| ---------- | --------------- |
| xs         | 100%            |
| sm         | 540px           |
| md         | 720px           |
| lg         | 960px           |
| xl         | 1140px          |
| xxl        | 1320px          |

### Spacing System

DateNight.io uses a consistent spacing system based on a 4px base unit.

| Name | Size (px) | Usage                                     |
| ---- | --------- | ----------------------------------------- |
| 0    | 0         | No spacing                                |
| 1    | 4px       | Minimal spacing, tight elements           |
| 2    | 8px       | Default spacing between related elements  |
| 3    | 12px      | Spacing between loosely related elements  |
| 4    | 16px      | Standard spacing between components       |
| 5    | 24px      | Spacing between distinct sections         |
| 6    | 32px      | Large spacing between major sections      |
| 7    | 48px      | Extra large spacing for visual separation |
| 8    | 64px      | Maximum spacing for major page sections   |

### Layout Principles

- Use white space strategically to create visual hierarchy
- Maintain consistent spacing within component types
- Ensure content is properly aligned (left-aligned for LTR languages)
- Use grid system for responsive layouts
- Implement proper content hierarchy with clear visual distinction between sections

## 3. Component Styling

DateNight.io uses a component-based design system with consistent styling across all UI elements.

### Buttons

#### Button Variants

| Variant   | Usage                         | Styling                                             |
| --------- | ----------------------------- | --------------------------------------------------- |
| Primary   | Main actions, calls to action | Solid fill with primary color, white text           |
| Secondary | Alternative actions           | Outlined with secondary color, secondary color text |
| Tertiary  | Less important actions        | Text only with primary color, no background         |
| Danger    | Destructive actions           | Solid fill with error color, white text             |

#### Button Sizes

| Size   | Height | Padding   | Font Size | Usage                               |
| ------ | ------ | --------- | --------- | ----------------------------------- |
| Small  | 32px   | 8px 16px  | 14px      | Compact UIs, secondary actions      |
| Medium | 40px   | 12px 24px | 16px      | Standard buttons throughout the app |
| Large  | 48px   | 16px 32px | 18px      | Primary calls to action, hero areas |

#### Button States

- **Default**: Normal state
- **Hover**: Slightly darker background/border color
- **Active/Pressed**: Darker background/border color, slight scale transform
- **Focus**: Focus ring using secondary color
- **Disabled**: Reduced opacity, no hover effects

### Form Elements

#### Text Inputs

- Height: 40px
- Padding: 12px
- Border: 1px solid light neutral color
- Border Radius: 4px
- Focus State: Primary color border, subtle box shadow

#### Checkboxes and Radio Buttons

- Size: 20px × 20px
- Border: 1px solid medium neutral color
- Border Radius: 4px for checkboxes, 50% for radio buttons
- Selected State: Primary color fill, white checkmark/dot

#### Select Dropdowns

- Height: 40px
- Padding: 12px
- Border: 1px solid light neutral color
- Border Radius: 4px
- Dropdown Icon: Chevron using medium neutral color

### Cards

- Background: White
- Border Radius: 8px
- Box Shadow: Subtle shadow (0 2px 8px rgba(0, 0, 0, 0.1))
- Padding: 24px
- Spacing Between Cards: 16px-24px

### Navigation

#### Top Navigation Bar

- Height: 64px
- Background: White or dark color (based on theme)
- Box Shadow: Subtle shadow when scrolled
- Active Item: Indicator using primary color

#### Bottom Navigation (Mobile)

- Height: 56px
- Background: White or dark color (based on theme)
- Active Item: Primary color icon and text
- Inactive Item: Medium neutral color

### Modals and Dialogs

- Background: White
- Border Radius: 12px
- Box Shadow: Medium shadow (0 4px 16px rgba(0, 0, 0, 0.2))
- Header: 24px padding, bottom border
- Body: 24px padding
- Footer: 24px padding, top border

## 4. Effects & Animations

DateNight.io uses subtle, purposeful animations to enhance the user experience without being distracting.

### Transition Speeds

| Type     | Duration | Usage                                         |
| -------- | -------- | --------------------------------------------- |
| Instant  | 100ms    | Micro-interactions, immediate feedback        |
| Quick    | 200ms    | Button states, form controls                  |
| Standard | 300ms    | Page transitions, modals                      |
| Complex  | 500ms    | Complex animations, choreographed transitions |

### Animation Principles

- Use easing functions for natural movement (ease-out for entering, ease-in for exiting)
- Animate properties that are performant (opacity, transform)
- Ensure animations are subtle and purposeful
- Provide reduced motion options for accessibility

### Common Animations

- **Button Hover**: Subtle background color change (200ms)
- **Button Press**: Slight scale down (100ms)
- **Page Transitions**: Fade in/out (300ms)
- **Modal Open/Close**: Fade and scale (300ms)
- **Form Validation**: Subtle shake for errors (300ms)
- **Loading States**: Pulsing or spinning indicators (continuous)

## 5. Interaction Patterns

### Touch Targets

- Minimum size: 44px × 44px for all interactive elements
- Spacing between touch targets: Minimum 8px

### Feedback States

- **Hover**: Subtle background/color change
- **Active/Pressed**: Darker color, slight scale transform
- **Focus**: Visible focus ring (keyboard navigation)
- **Loading**: Loading indicators for actions taking >300ms
- **Success/Error**: Clear visual feedback after actions

### Gestures (Mobile)

- **Tap**: Primary action
- **Double Tap**: Zoom or secondary action
- **Long Press**: Context menu or additional options
- **Swipe**: Navigate between items or reveal actions
- **Pinch**: Zoom in/out

## 6. Responsive Design Principles

### Mobile-First Approach

- Design for mobile screens first, then enhance for larger screens
- Use flexible layouts that adapt to different screen sizes
- Ensure touch targets are appropriately sized for mobile devices

### Content Adaptation

- **Stack**: Convert horizontal layouts to vertical on small screens
- **Prioritize**: Show only essential content on small screens
- **Resize**: Adjust typography and spacing for different screen sizes
- **Reposition**: Move elements to more accessible locations on different devices

### Navigation Patterns

- Desktop: Horizontal navigation in header
- Tablet: Collapsible navigation or tabs
- Mobile: Bottom navigation bar or hamburger menu

## 7. Accessibility Guidelines

### Color Contrast

- Text: Minimum 4.5:1 contrast ratio against background
- Large Text (18pt+): Minimum 3:1 contrast ratio
- UI Components and Graphics: Minimum 3:1 contrast ratio

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Visible focus states for keyboard navigation
- Logical tab order following visual layout

### Screen Readers

- Proper semantic HTML elements
- ARIA labels for custom components
- Alternative text for images
- Descriptive link text

### Reduced Motion

- Respect user preferences for reduced motion
- Provide alternatives to motion-based interactions

## 8. Implementation Resources

### Design Tokens

Design tokens are available as SCSS variables and CSS custom properties:

```scss
// Import design tokens
@import 'src/styles/tokens';

// Usage example
.my-component {
  color: $color-primary;
  padding: $spacing-4;
  font-size: $font-size-body-large;
}
```

### Component Library

Refer to the [Emerald Components Documentation](/docs/EMERALD_COMPONENTS.MD) for detailed information on using the DateNight.io component library.

### Design System Usage

For practical implementation guidelines, see the [Design System Usage Guide](/docs/DESIGN_SYSTEM_USAGE_GUIDE.MD).

### Theming

For information on theming and customization, see the [Theming Guide](/docs/THEMING_GUIDE.MD).

## Document History

- **2025-05-20**: Updated to align with new documentation naming convention
- **2025-04-15**: Added accessibility guidelines section
- **2025-03-10**: Initial version of the style guide
