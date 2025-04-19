# THEMING GUIDE (Manual Merge Required)

<!-- TODO: Manually merge content from the following source files into this document, then remove this comment. -->
<!-- Source: docs/styling-guide.md -->


## Content from docs/styling-guide.md

# DateNight.io UI/UX Style Guide

This comprehensive style guide defines the visual language, interaction patterns, and design principles for the DateNight.io Progressive Web App. Following these guidelines will ensure a sleek, modern, minimalistic yet luxurious feel with carefully restrained effects.

## Table of Contents

1. [Visual Identity](#1-visual-identity-refinements)
2. [Layout & Spacing](#2-layout--spacing-refinements)
3. [Component Styling](#3-component-styling-refinements)
4. [Effects & Animations](#4-effects--animations-refinements)
5. [Interaction Patterns](#5-interaction-patterns)
6. [Responsive Design Principles](#6-responsive-design-principles)
7. [Accessibility Enhancements](#7-accessibility-enhancements)
8. [Performance Considerations](#8-performance-considerations)
9. [Implementation Guidelines for Emerald UI](#9-implementation-guidelines-for-emerald-ui)
10. [Documentation and Governance](#10-documentation-and-governance)

## 1. Visual Identity Refinements

### Color Palette

**Primary Colors:**

- Primary: #ff3366 (Pink/Red)
  - Light: #ff6b99 (For hover states, backgrounds)
  - Dark: #cc295a (For active states, text on light backgrounds)

**Secondary Colors:**

- Secondary: #6c63ff (Purple)
  - Light: #9e97ff (For hover states, backgrounds)
  - Dark: #4a43cc (For active states, text on light backgrounds)

**Neutral Colors:**

- White: #ffffff
- Light Gray 1: #f8f9fc (Background, cards)
- Light Gray 2: #eef1f8 (Borders, dividers)
- Medium Gray 1: #d1d5e0 (Disabled states)
- Medium Gray 2: #a0a8c0 (Placeholder text)
- Dark Gray 1: #6e7a94 (Secondary text)
- Dark Gray 2: #4a5568 (Primary text)
- Dark Gray 3: #2d3748 (Headings)
- Black: #1a202c (Emphasis text)

**Semantic Colors:**

- Success: #38d9a9 (Green)
- Warning: #ffab2e (Orange)
- Error: #ff4757 (Red)
- Info: #54a0ff (Blue)

**Color Usage Guidelines:**

- Limit the use of primary and secondary colors to key interactive elements and important highlights
- Use neutral colors for most UI elements to maintain the luxurious, minimalist feel
- Apply semantic colors only for their specific purposes (success, warning, error, info)
- Maintain a 4.5:1 minimum contrast ratio for all text to ensure accessibility
- Use color gradients sparingly and only for decorative elements

### Typography

**Font Families:**

- Primary (Body): 'Inter', sans-serif
- Headings: 'Poppins', sans-serif

**Font Weights:**

- Light: 300 (Use for large headings only)
- Regular: 400 (Default for body text)
- Medium: 500 (For emphasis and subheadings)
- Semibold: 600 (For buttons and important UI elements)
- Bold: 700 (For main headings and strong emphasis)

**Type Scale:**

- xs: 0.75rem (12px) - Small labels, footnotes
- sm: 0.875rem (14px) - Secondary text, captions
- base: 1rem (16px) - Body text, default size
- lg: 1.125rem (18px) - Large body text
- xl: 1.25rem (20px) - Subheadings
- 2xl: 1.5rem (24px) - H3, section headings
- 3xl: 1.875rem (30px) - H2, page subheadings
- 4xl: 2.25rem (36px) - H1, page titles
- 5xl: 3rem (48px) - Hero headings

**Line Heights:**

- Tight: 1.25 (For headings)
- Snug: 1.375 (For subheadings)
- Normal: 1.5 (For body text)
- Relaxed: 1.625 (For large body text)
- Loose: 2 (For emphasized paragraphs)

**Typography Guidelines:**

- Maintain consistent heading hierarchy (H1 > H2 > H3) on all pages
- Limit use of font weights to maintain elegant appearance
- Use proper text truncation for overflowing content
- Implement proper line length (60-80 characters) for optimal readability
- Apply appropriate letter-spacing for different text sizes
- Ensure all text is responsive and scales appropriately on different devices

## 2. Layout & Spacing Refinements

### Grid System

**Base Grid:**

- 12-column grid for desktop layouts
- 8-column grid for tablet layouts
- 4-column grid for mobile layouts

**Containers:**

- Max width: 1280px (centered with auto margins)
- Content width: 1024px for text-heavy pages

**Gutters:**

- Desktop: 24px
- Tablet: 16px
- Mobile: 12px

**Margins:**

- Desktop: 64px outer margin
- Tablet: 32px outer margin
- Mobile: 16px outer margin

### Spacing Scale

A comprehensive spacing scale based on 4px increments:

- 0: 0px
- 1: 4px (Extra small - tight spacing)
- 2: 8px (Small - between related items)
- 3: 12px (Medium small - internal padding)
- 4: 16px (Medium - standard spacing)
- 5: 20px (Medium large - between groups)
- 6: 24px (Large - section spacing)
- 8: 32px (Extra large - between major sections)
- 10: 40px (2x Large - top/bottom section padding)
- 12: 48px (3x Large - major section breaks)
- 16: 64px (4x Large - page sections)
- 20: 80px (5x Large - major page breaks)
- 24: 96px (6x Large - hero sections)

**Spacing Guidelines:**

- Use consistent spacing values from the scale
- Apply spacing consistently between similar elements
- Increase spacing between unrelated elements
- Maintain proper hierarchy with spacing
- Adjust spacing proportionally across breakpoints

### Breakpoints

**Device Breakpoints:**

- Mobile Small: 0-359px
- Mobile: 360px-599px
- Tablet: 600px-959px
- Desktop: 960px-1279px
- Large Desktop: 1280px-1919px
- Extra Large Desktop: 1920px+

**Breakpoint Usage:**

- Design mobile-first, then scale up
- Avoid creating layouts that only work at specific breakpoints
- Test designs at the edges of breakpoint ranges
- Use fluid values between breakpoints where appropriate
- Consider device orientation changes in responsive designs

## 3. Component Styling Refinements

### Cards

**Card Variants:**

- Standard Card: For general content
- Profile Card: For user profiles
- Feature Card: For highlighting features
- Ad Card: For advertisements
- Info Card: For information display

**Card Properties:**

- Border Radius: 12px (consistent across all cards)
- Box Shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- Hover Shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- Padding: 24px (consistent internal padding)
- Background: White (#ffffff)
- Border: None or 1px solid #eef1f8 for subtle cards

**Card Interactions:**

- Hover: Slight elevation increase (shadow change) + subtle scale (1.02)
- Active: Return to original state
- Focus: Focus ring using primary color with 3px offset

### Buttons

**Button Variants:**

- Primary: Solid background with primary color
- Secondary: Solid background with secondary color
- Outline Primary: Border with primary color, transparent background
- Outline Secondary: Border with secondary color, transparent background
- Ghost: No background or border, text only
- Icon: Icon only, circular or square

**Button Sizes:**

- Small: 32px height, 12px horizontal padding, 14px font
- Medium: 40px height, 16px horizontal padding, 16px font
- Large: 48px height, 24px horizontal padding, 18px font

**Button Properties:**

- Border Radius: 8px (4px for small)
- Font Weight: 600 (Semibold)
- Text Transform: None (maintain natural case)
- Line Height: 1.5
- Transition: 150ms for all properties

**Button States:**

- Hover: Darken background by 10%, add subtle shadow
- Active: Darken background by 15%, remove shadow
- Focus: 3px outline with primary color at 25% opacity
- Disabled: 50% opacity, no hover effects

### Form Elements

**Input Fields:**

- Height: 40px (small), 48px (medium), 56px (large)
- Border: 1px solid #d1d5e0
- Border Radius: 8px
- Background: White (#ffffff)
- Padding: 12px 16px
- Font Size: 16px (ensure no zoom on mobile)

**Input States:**

- Focus: Border color changes to primary, subtle shadow
- Error: Border color changes to error, error message below
- Disabled: Background changes to light gray, 50% opacity
- Read-only: Background changes to light gray, normal opacity

**Select Menus:**

- Same styling as input fields
- Custom dropdown icon
- Hover state for options
- Multi-select with chips for selected items

**Checkboxes & Radio Buttons:**

- Custom styling with animations
- Clear focus states
- Proper spacing between options
- Accessible through keyboard

### Navigation Elements

**Primary Navigation:**

- Clear active state indication
- Consistent hover effects
- Proper spacing between items
- Mobile-friendly collapsible version

**Secondary Navigation:**

- Subtle styling to differentiate from primary
- Clear hierarchy and grouping
- Proper indentation for nested items

**Breadcrumbs:**

- Clear separator icons
- Truncation for long paths
- Responsive behavior on small screens

## 4. Effects & Animations Refinements

### Shadows

**Shadow Scale:**

- None: No shadow
- XS: 0 1px 2px rgba(0, 0, 0, 0.05)
- SM: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
- MD: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- LG: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- XL: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
- 2XL: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

**Shadow Usage:**

- Use shadows to create subtle depth hierarchy
- Increase shadow on hover for interactive elements
- Ensure shadows have sufficient contrast against backgrounds
- Use consistent shadow direction (top-left light source)

### Blur Effects

**Blur Scale:**

- Subtle: 4px blur (for hover states)
- Medium: 8px blur (for overlays)
- Strong: 16px blur (for modal backgrounds)

**Blur Usage:**

- Apply to backgrounds behind modals and dialogs
- Use for frosted glass effects on cards
- Implement for image hover states
- Ensure blur effects don't impact readability

### Animations

**Animation Principles:**

- Purpose: All animations should serve a purpose (feedback, guidance, etc.)
- Subtlety: Animations should be subtle and not distracting
- Consistency: Use consistent timing and easing across similar animations
- Performance: Optimize animations for performance (use transform and opacity)

**Animation Durations:**

- Extra Fast: 100ms (micro-interactions)
- Fast: 150ms (hover states, button clicks)
- Normal: 300ms (page transitions, modals)
- Slow: 500ms (complex animations, emphasis)

**Animation Timing Functions:**

- Default: cubic-bezier(0.4, 0, 0.2, 1) - smooth acceleration and deceleration
- Ease In: cubic-bezier(0.4, 0, 1, 1) - gradual acceleration
- Ease Out: cubic-bezier(0, 0, 0.2, 1) - gradual deceleration
- Linear: linear - constant speed (use for continuous animations)

**Animation Types:**

- Fade: Opacity changes for appearing/disappearing elements
- Slide: Position changes for entering/exiting elements
- Scale: Size changes for emphasis
- Transform: Rotation or skew for attention
- Color: Background or text color changes for state changes

**Animation Guidelines:**

- Respect user preferences for reduced motion
- Avoid animations that flash or have high contrast changes
- Ensure animations don't block user interaction
- Use appropriate animation types for different contexts
- Implement consistent enter/exit animations for similar elements

## 5. Interaction Patterns

### Hover States

**Hover Guidelines:**

- All interactive elements must have visible hover states
- Hover effects should be subtle but noticeable
- Use consistent hover effects for similar elements
- Ensure hover states have sufficient contrast
- Consider touch devices where hover isn't available

**Common Hover Effects:**

- Subtle background color change
- Slight elevation increase (shadow change)
- Gentle scale transform (1.02-1.05 maximum)
- Border color change
- Text color change for links

### Focus States

**Focus Guidelines:**

- All interactive elements must have visible focus states
- Focus states should be distinct from hover states
- Use consistent focus indicators across the application
- Ensure focus states meet accessibility standards
- Never remove focus outlines without providing alternatives

**Focus Indicators:**

- Outline: 2-3px with primary color at 50% opacity
- Border: 2px solid primary color
- Background: Subtle background color change
- Combined: Multiple indicators for complex components

### Active/Pressed States

**Active Guidelines:**

- Provide visual feedback for pressed/active states
- Active states should be distinct from hover and focus
- Use consistent active state indicators
- Ensure active states are visible on touch devices

**Active Indicators:**

- Scale: Slight reduction in size (0.98)
- Background: Darker than hover state
- Shadow: Reduced or removed shadow
- Border: Darker border color

### Disabled States

**Disabled Guidelines:**

- Clearly indicate when elements are disabled
- Maintain sufficient contrast for disabled elements
- Use consistent disabled state styling
- Provide tooltip explanations for disabled elements when appropriate

**Disabled Styling:**

- Opacity: Reduce to 50-60%
- Cursor: Not-allowed cursor
- Remove hover/focus effects
- Add subtle visual indicators (diagonal lines, etc.)

## 6. Responsive Design Principles

### Mobile-First Approach

**Mobile-First Guidelines:**

- Design for mobile screens first, then enhance for larger screens
- Focus on core content and functionality for small screens
- Progressive enhancement for larger screens
- Test designs on actual mobile devices

**Content Prioritization:**

- Identify and prioritize essential content for mobile
- Use progressive disclosure for secondary content
- Maintain proper content hierarchy across all screen sizes
- Adjust content density based on screen size

### Touch Optimization

**Touch Guidelines:**

- Minimum touch target size: 44px × 44px
- Adequate spacing between touch targets (minimum 8px)
- Place important actions within thumb reach on mobile
- Provide alternative interactions for hover-dependent features

**Touch Feedback:**

- Immediate visual feedback for touch interactions
- Appropriate haptic feedback when available
- Clear active/pressed states for touch elements
- Avoid relying on "long press" for critical functions

### Adaptive Layouts

**Layout Adaptation:**

- Single column layouts for mobile
- Two-column layouts for tablets
- Multi-column layouts for desktop
- Maintain consistent content hierarchy across layouts

**Component Adaptation:**

- Cards: Full width on mobile, grid on larger screens
- Navigation: Hamburger menu on mobile, horizontal on desktop
- Tables: Responsive tables with horizontal scroll or card view on mobile
- Forms: Stacked fields on mobile, side-by-side on desktop

## 7. Accessibility Enhancements

### Color and Contrast

**Contrast Requirements:**

- Text: Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text
- UI Components: Minimum 3:1 contrast ratio for boundaries of active UI components
- Graphics: Ensure informational graphics maintain sufficient contrast
- Focus Indicators: Minimum 3:1 contrast ratio for focus indicators

**Color Independence:**

- Never use color alone to convey information
- Add icons, patterns, or text labels to supplement color coding
- Test designs in grayscale to ensure they remain usable
- Provide high contrast mode option

### Keyboard Navigation

**Keyboard Guidelines:**

- All interactive elements must be keyboard accessible
- Logical tab order following visual layout
- Visible focus indicators at all times
- Keyboard shortcuts for common actions (with proper documentation)

**Focus Management:**

- Trap focus in modals and dialogs
- Return focus to trigger elements when dialogs close
- Skip links for bypassing repetitive navigation
- Focus visible elements when content changes

### Screen Reader Support

**Screen Reader Guidelines:**

- Proper semantic HTML structure
- ARIA roles, states, and properties where needed
- Meaningful alt text for images
- Descriptive labels for form controls
- Announcements for dynamic content changes

**Content Structure:**

- Proper heading hierarchy (H1-H6)
- Landmark regions (header, main, footer, etc.)
- Lists for related items
- Tables for tabular data with proper headers
- Descriptive link text (avoid "click here")

## 8. Performance Considerations

### Asset Optimization

**Image Guidelines:**

- Use appropriate formats (WebP with fallbacks)
- Responsive images with srcset and sizes
- Proper image compression
- Lazy loading for off-screen images
- Low-quality image placeholders (LQIP)

**Font Loading:**

- Subset fonts to include only needed characters
- Use font-display: swap to prevent invisible text
- Preload critical fonts
- Limit font weights and styles
- Consider system fonts for performance-critical applications

### Animation Performance

**Performance Guidelines:**

- Animate only transform and opacity properties when possible
- Use will-change property sparingly and appropriately
- Debounce and throttle event handlers
- Avoid animations that cause layout thrashing
- Test animations on low-end devices

**Rendering Optimization:**

- Implement virtual scrolling for long lists
- Use CSS containment where appropriate
- Avoid expensive CSS properties (box-shadow, filter, etc.) on animated elements
- Reduce DOM depth and complexity
- Minimize style recalculations and layout shifts

## 9. Implementation Guidelines for Emerald UI

### Component Integration

**Integration Approach:**

- Use Emerald components as the foundation for all new UI development
- Gradually replace existing components with Emerald equivalents
- Maintain consistent props and events across components
- Document any customizations or extensions to Emerald components

**Customization Strategy:**

- Use Emerald's theming system to apply DateNight.io's design tokens
- Create custom variants only when necessary
- Document all customizations in a central location
- Maintain compatibility with Emerald's API

### BEM Naming Convention

**BEM Structure:**

- Block: The component or module (e.g., `card`)
- Element: A part of the block (e.g., `card__title`)
- Modifier: A variant or state (e.g., `card--featured`)

**BEM Guidelines:**

- Use lowercase letters and hyphens for words within each part
- Use double underscores to separate block from element
- Use double hyphens to separate block or element from modifier
- Avoid excessive nesting of elements

**Examples:**

- `.card` (Block)
- `.card__image` (Element)
- `.card__title` (Element)
- `.card--featured` (Modifier)
- `.card__button--primary` (Element with modifier)

### CSS Architecture

**File Organization:**

- Organize CSS files by component
- Use a consistent file naming convention
- Separate global styles from component styles
- Use index files for importing and exporting

**CSS Methodology:**

- Follow BEM naming convention
- Use SCSS for variables, mixins, and functions
- Avoid deep nesting (maximum 3 levels)
- Use utility classes for common patterns
- Implement responsive styles using mixins

**Example Structure:**

```
styles/
├── design-system/
│   ├── _variables.scss
│   ├── _typography.scss
│   ├── _colors.scss
│   ├── _spacing.scss
│   ├── _animations.scss
│   ├── _mixins.scss
│   └── index.scss
├── components/
│   ├── _button.scss
│   ├── _card.scss
│   ├── _form.scss
│   └── index.scss
├── utilities/
│   ├── _spacing.scss
│   ├── _typography.scss
│   ├── _visibility.scss
│   └── index.scss
└── main.scss
```

## 10. Documentation and Governance

### Style Guide Documentation

**Documentation Components:**

- Interactive component examples
- Code snippets for implementation
- Usage guidelines and best practices
- Accessibility considerations
- Responsive behavior examples

**Documentation Format:**

- Searchable online documentation
- Visual examples for all components
- Interactive playground for testing
- Version history and changelog
- Integration guides for developers

### Design System Governance

**Governance Model:**

- Dedicated design system team or champion
- Clear process for proposing changes
- Regular reviews and updates
- Versioning strategy for the design system
- Feedback mechanism for users of the system

**Quality Assurance:**

- Visual regression testing
- Accessibility compliance testing
- Performance benchmarking
- Cross-browser compatibility testing
- Mobile device testing

---

Last Updated: 2025-05-15


<!-- TODO: Manually review/update content against current code. (as per DOCS_IMPROVEMENT_PLAN.md) -->
