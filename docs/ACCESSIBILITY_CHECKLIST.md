# Accessibility Checklist for DateNight.io

This checklist helps ensure that all components and features in the DateNight.io application meet accessibility standards. Use this checklist when developing new components or reviewing existing ones.

## Keyboard Accessibility

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order follows a logical sequence
- [ ] Focus indicators are clearly visible
- [ ] No keyboard traps (except for modals with proper focus management)
- [ ] Custom components implement appropriate keyboard interactions:
  - [ ] Buttons and links are activated with Enter or Space
  - [ ] Dropdowns can be navigated with arrow keys
  - [ ] Escape key closes modals and dropdowns
  - [ ] Tab key navigates between focusable elements
- [ ] Skip links are provided for navigation
- [ ] Focus is properly managed in modals and dialogs:
  - [ ] Focus is trapped within the modal when open
  - [ ] Focus returns to the trigger element when closed

## Semantic HTML

- [ ] Appropriate HTML elements are used for their intended purpose
- [ ] Headings are used in the correct hierarchical order (h1, h2, h3, etc.)
- [ ] Lists are marked up as `<ul>`, `<ol>`, or `<dl>` as appropriate
- [ ] Tables are used for tabular data, not for layout
- [ ] Form elements are properly labeled
- [ ] Landmarks are used appropriately (`<header>`, `<nav>`, `<main>`, `<footer>`, etc.)

## ARIA Attributes

- [ ] ARIA attributes are used only when necessary
- [ ] ARIA roles match the visual and functional purpose of elements
- [ ] Interactive elements have accessible names (via labels, aria-label, or aria-labelledby)
- [ ] Elements that expand/collapse use aria-expanded
- [ ] Custom controls use aria-controls to associate them with their target
- [ ] Live regions use aria-live for dynamic content updates
- [ ] Error messages are associated with form fields using aria-describedby
- [ ] Required fields use aria-required="true"
- [ ] Invalid fields use aria-invalid="true"

## Images and Media

- [ ] All images have appropriate alt text
- [ ] Decorative images have empty alt text (alt="")
- [ ] Complex images have extended descriptions
- [ ] SVG elements have appropriate accessibility attributes
- [ ] Videos have captions and audio descriptions
- [ ] Audio content has transcripts
- [ ] Autoplay is avoided or can be easily disabled

## Color and Contrast

- [ ] Text has sufficient contrast against its background (4.5:1 for normal text, 3:1 for large text)
- [ ] Information is not conveyed by color alone
- [ ] Focus indicators have sufficient contrast (3:1)
- [ ] UI components have sufficient contrast against adjacent colors (3:1)
- [ ] Text remains legible when zoomed to 200%
- [ ] Dark mode implementation maintains sufficient contrast

## Forms

- [ ] All form controls have associated labels
- [ ] Required fields are clearly indicated
- [ ] Error messages are clear and descriptive
- [ ] Error messages are programmatically associated with form fields
- [ ] Form validation provides clear feedback
- [ ] Form submission is possible using keyboard only
- [ ] Autocomplete attributes are used where appropriate

## Dynamic Content

- [ ] Status messages are announced to screen readers
- [ ] Loading states are properly indicated
- [ ] Timeouts can be paused, stopped, or extended
- [ ] Animations can be disabled via prefers-reduced-motion
- [ ] Modals and dialogs are properly implemented:
  - [ ] Modal has role="dialog" or role="alertdialog"
  - [ ] Modal has aria-modal="true"
  - [ ] Modal has an accessible name via aria-labelledby
  - [ ] Focus is trapped within the modal
  - [ ] Focus returns to the trigger element when closed

## Navigation

- [ ] Current page/location is clearly indicated
- [ ] Navigation is consistent across pages
- [ ] Links have descriptive text
- [ ] Skip links are provided to bypass navigation
- [ ] Breadcrumbs are provided for complex navigation structures

## Responsive Design

- [ ] Content is accessible at all viewport sizes
- [ ] Text remains readable at smaller viewport sizes
- [ ] Touch targets are at least 44x44 pixels
- [ ] Hover/focus states are usable on touch devices
- [ ] Pinch-to-zoom is not disabled

## Testing

- [ ] Component has been tested with keyboard navigation
- [ ] Component has been tested with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Component has been tested with high contrast mode
- [ ] Component has been tested with zoom (up to 200%)
- [ ] Component has been tested with automated tools (axe, Lighthouse)
- [ ] Component has been tested with prefers-reduced-motion enabled

## Documentation

- [ ] Accessibility features are documented
- [ ] Known accessibility issues are documented
- [ ] Keyboard shortcuts are documented
- [ ] Alternative ways to access functionality are documented

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe Accessibility Testing Tools](https://www.deque.com/axe/)
- [Accessibility Demo Page](/accessibility)

## Component-Specific Checklists

### Buttons

- [ ] Has a clear, descriptive label
- [ ] Can be activated with Enter or Space key
- [ ] Has visible focus state
- [ ] Has sufficient color contrast
- [ ] Icon-only buttons have aria-label or tooltip
- [ ] Disabled state is visually distinct and has aria-disabled="true"

### Form Inputs

- [ ] Has associated label
- [ ] Required state is indicated visually and with aria-required="true"
- [ ] Error state is indicated visually and with aria-invalid="true"
- [ ] Error messages are associated with the input using aria-describedby
- [ ] Has visible focus state
- [ ] Has sufficient color contrast
- [ ] Placeholder text is not used as a replacement for labels

### Modals

- [ ] Has role="dialog" or role="alertdialog"
- [ ] Has aria-modal="true"
- [ ] Has an accessible name via aria-labelledby
- [ ] Focus is trapped within the modal
- [ ] Can be closed with Escape key
- [ ] Focus returns to the trigger element when closed
- [ ] Has a visible close button with an accessible name

### Tabs

- [ ] Tab list has role="tablist"
- [ ] Tab buttons have role="tab" and are in a single tabindex
- [ ] Tab panels have role="tabpanel"
- [ ] Active tab has aria-selected="true"
- [ ] Tab panels are associated with their tabs using aria-controls and aria-labelledby
- [ ] Arrow keys navigate between tabs
- [ ] Has visible focus state
- [ ] Has sufficient color contrast

### Dropdowns

- [ ] Trigger button has aria-expanded and aria-controls
- [ ] Menu has role="menu" or appropriate role
- [ ] Menu items have role="menuitem" or appropriate role
- [ ] Arrow keys navigate between menu items
- [ ] Enter or Space activates menu items
- [ ] Escape closes the menu
- [ ] Focus is properly managed when opening and closing
- [ ] Has visible focus state
- [ ] Has sufficient color contrast
