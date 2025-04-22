# Responsive Design Guidelines

This document provides guidelines for implementing responsive design in the DateNight.io application.

## Table of Contents

1. [Introduction](#introduction)
2. [Breakpoints](#breakpoints)
3. [Mobile-First Approach](#mobile-first-approach)
4. [Layout Patterns](#layout-patterns)
5. [Typography](#typography)
6. [Images and Media](#images-and-media)
7. [Touch Targets](#touch-targets)
8. [Testing](#testing)

## Introduction

Responsive design ensures that the DateNight.io application provides an optimal viewing and interaction experience across a wide range of devices, from mobile phones to desktop computers. These guidelines provide a framework for implementing responsive design.

## Breakpoints

The DateNight.io application uses the following breakpoints:

| Breakpoint Name | Width         | Description          |
| --------------- | ------------- | -------------------- |
| Mobile Small    | 0-359px       | Small smartphones    |
| Mobile          | 360px-599px   | Smartphones          |
| Tablet          | 600px-959px   | Tablets              |
| Desktop         | 960px-1279px  | Small desktops       |
| Desktop Large   | 1280px-1919px | Large desktops       |
| Desktop XL      | 1920px+       | Extra large displays |

### Using Breakpoints in SCSS

```scss
@use 'src/styles/design-system' as ds;

.my-component {
  // Mobile styles (default)
  padding: ds.$spacing-4;

  // Tablet styles
  @media (min-width: ds.$breakpoint-tablet) {
    padding: ds.$spacing-6;
  }

  // Desktop styles
  @media (min-width: ds.$breakpoint-desktop) {
    padding: ds.$spacing-8;
  }
}
```

## Mobile-First Approach

The DateNight.io application follows a mobile-first approach to responsive design:

- Start with the mobile design and progressively enhance for larger screens
- Use min-width media queries to add styles for larger screens
- Keep the base styles simple and focused on mobile devices
- Add complexity and features as the screen size increases

### Benefits of Mobile-First

- Forces focus on essential content and functionality
- Ensures a good experience on the most constrained devices
- Typically results in cleaner, more efficient CSS
- Aligns with how browsers parse CSS (mobile styles are not overridden on mobile devices)

## Layout Patterns

Use these responsive layout patterns for consistent behavior across the application:

### Stack to Grid

- On mobile, stack elements vertically
- On larger screens, arrange elements in a grid

```scss
.card-container {
  display: flex;
  flex-direction: column;

  @media (min-width: ds.$breakpoint-tablet) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ds.$spacing-4;
  }

  @media (min-width: ds.$breakpoint-desktop) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Column Drop

- Start with a multi-column layout
- Drop columns as the screen size decreases

```scss
.page-layout {
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: ds.$breakpoint-tablet) {
    grid-template-columns: 3fr 1fr;
  }

  @media (min-width: ds.$breakpoint-desktop) {
    grid-template-columns: 1fr 3fr 1fr;
  }
}
```

### Off-Canvas Navigation

- Hide navigation off-screen on mobile
- Show navigation on larger screens

```scss
.navigation {
  position: fixed;
  top: 0;
  left: -80%;
  width: 80%;
  height: 100%;
  transition: transform 0.3s ease;

  &.open {
    transform: translateX(100%);
  }

  @media (min-width: ds.$breakpoint-desktop) {
    position: static;
    width: auto;
    transform: none;
  }
}
```

## Typography

Responsive typography ensures readability across all devices:

- Use relative units (rem, em) for font sizes
- Adjust font sizes at different breakpoints
- Maintain appropriate line heights for readability
- Consider line length (45-75 characters) for optimal readability

```scss
.heading-1 {
  font-size: 2rem;
  line-height: 1.2;

  @media (min-width: ds.$breakpoint-tablet) {
    font-size: 2.5rem;
  }

  @media (min-width: ds.$breakpoint-desktop) {
    font-size: 3rem;
  }
}
```

## Images and Media

Responsive images and media ensure optimal performance and display:

- Use the `srcset` attribute for responsive images
- Use the `picture` element for art direction
- Set appropriate sizes for images to prevent layout shifts
- Use aspect ratio boxes to maintain proportions

```html
<img
  src="image-small.jpg"
  srcset="image-small.jpg 400w, image-medium.jpg 800w, image-large.jpg 1200w"
  sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
  alt="Description of the image"
/>
```

## Touch Targets

Ensure that touch targets are appropriately sized for touch devices:

- Touch targets should be at least 44x44 pixels
- Provide adequate spacing between touch targets
- Increase touch target size on touch devices
- Consider the "thumb zone" for important actions on mobile

```scss
.button {
  padding: ds.$spacing-2 ds.$spacing-4;

  @media (pointer: coarse) {
    padding: ds.$spacing-3 ds.$spacing-5;
  }
}
```

## Testing

Regular testing across devices is essential:

- Test on actual devices, not just browser emulators
- Test on different operating systems (iOS, Android, Windows, macOS)
- Test on different browsers (Chrome, Safari, Firefox, Edge)
- Test with different input methods (touch, mouse, keyboard)
- Test with different screen sizes and orientations

### Testing Checklist

- Content is readable without zooming
- Interactive elements are easily tappable
- No horizontal scrolling is required
- Layout adjusts appropriately at breakpoints
- Images and media display correctly
- Forms and inputs are usable on touch devices
- Performance is acceptable on mobile devices

---

Last Updated: 2025-06-15
