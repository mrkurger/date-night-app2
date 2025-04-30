# UI Implementation Checklist

Use this checklist to ensure your components follow the DateNight.io UI guidelines.

## Design Tokens

- [ ] Using color tokens instead of hardcoded colors
- [ ] Using spacing tokens instead of hardcoded spacing values
- [ ] Using typography tokens instead of hardcoded font properties
- [ ] Using shadow tokens instead of hardcoded shadows
- [ ] Using border-radius tokens instead of hardcoded border-radius values
- [ ] Using transition tokens instead of hardcoded transition values

## BEM Naming Convention

- [ ] Block names are meaningful and describe the component's purpose
- [ ] Element names are prefixed with the block name and double underscore (`block__element`)
- [ ] Modifier names are prefixed with the block or element name and double hyphen (`block--modifier` or `block__element--modifier`)
- [ ] State classes use the `is-` prefix (e.g., `is-active`, `is-disabled`)
- [ ] Utility classes use the `u-` prefix (e.g., `u-hidden`, `u-flex`)
- [ ] No more than 2 levels of nesting in BEM structure

## Responsive Design

- [ ] Component works on all breakpoints (mobile, tablet, desktop)
- [ ] Using responsive utilities instead of hardcoded media queries
- [ ] Mobile-first approach (base styles for mobile, then enhance for larger screens)
- [ ] No horizontal scrolling on any screen size
- [ ] Touch targets are at least 44x44px on mobile
- [ ] Text is readable on all screen sizes (minimum 16px for body text)
- [ ] Images are responsive and use appropriate srcset
- [ ] Tables are responsive and don't break the layout on small screens

## Accessibility

- [ ] Sufficient color contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
- [ ] Not using color alone to convey information
- [ ] Keyboard navigation works (all interactive elements are focusable)
- [ ] Focus styles are visible and follow the design system
- [ ] Proper heading structure (h1-h6)
- [ ] Proper use of semantic HTML elements
- [ ] ARIA attributes are used correctly
- [ ] Alternative text for images
- [ ] Form elements have associated labels
- [ ] Error messages are clear and accessible
- [ ] Reduced motion option is respected

## Dark Mode

- [ ] Component works in both light and dark mode
- [ ] Using dark mode utilities instead of hardcoded dark mode styles
- [ ] Colors have appropriate contrast in both modes
- [ ] No hardcoded colors that don't adapt to dark mode
- [ ] Shadows and borders are visible in dark mode

## Animations and Micro-interactions

- [ ] Animations are subtle and purposeful
- [ ] Using animation utilities instead of hardcoded animations
- [ ] Animations respect reduced motion preferences
- [ ] Micro-interactions provide feedback for user actions
- [ ] Animations don't interfere with usability
- [ ] Loading states are clear and use the design system's loading indicators
- [ ] Success and error states are clear and use the design system's indicators

## Performance

- [ ] CSS is optimized (minimal nesting, shorthand properties)
- [ ] Images are optimized (appropriate format, size, and compression)
- [ ] Fonts are optimized (font-display: swap, preloaded critical fonts)
- [ ] Animations are performant (using transform and opacity)
- [ ] No layout shifts during loading or interaction
- [ ] Lazy loading is used for non-critical content
- [ ] Component renders efficiently (no unnecessary re-renders)

## Code Quality

- [ ] Component follows the Angular style guide
- [ ] Code is well-documented with JSDoc comments
- [ ] Component has appropriate unit tests
- [ ] No unused imports or dependencies
- [ ] No console.log statements or commented-out code
- [ ] No hardcoded strings (use i18n)
- [ ] No magic numbers or values

## Emerald UI Integration

- [ ] Using Emerald UI components where appropriate
- [ ] Emerald UI components are properly styled to match the design system
- [ ] No custom implementations of components that already exist in Emerald UI
- [ ] Emerald UI components are properly imported and used

## Final Checks

- [ ] Component matches the design in Figma
- [ ] Component works in all supported browsers
- [ ] Component works with keyboard navigation
- [ ] Component works with screen readers
- [ ] Component works in both light and dark mode
- [ ] Component is responsive on all screen sizes
- [ ] Component follows the BEM naming convention
- [ ] Component uses design tokens instead of hardcoded values
- [ ] Component has appropriate animations and micro-interactions
- [ ] Component is performant and efficient
