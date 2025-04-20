# Emerald UI Integration Guide

This guide explains how to integrate and use the emerald-ui library with the DateNight.io design system.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Styling Integration](#styling-integration)
4. [Using Emerald UI Components](#using-emerald-ui-components)
5. [Component Examples](#component-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Introduction

Emerald UI is a React-based UI component library that has been adapted for use with Angular in the DateNight.io application. The library provides a set of reusable UI components that follow modern design principles and are highly customizable.

The DateNight.io design system has been integrated with emerald-ui to ensure consistent styling and behavior across the application.

## Installation

The emerald-ui library is already installed in the DateNight.io application. If you need to install it in a new project, you can do so using npm:

```bash
npm install emerald-ui
```

## Styling Integration

The DateNight.io design system integrates with emerald-ui through a custom stylesheet that overrides the default emerald-ui styles to match our design tokens.

### Integration Files

- `src/app/core/design/emerald-ui-integration.scss` - Contains the emerald-ui style overrides
- `src/app/core/design/main.scss` - Imports the emerald-ui integration

### Using the Integrated Styles

To use the integrated styles in your Angular components, import the design system as usual:

```scss
// Component SCSS file
@use 'src/app/core/design/main' as ds;

.my-component {
  // Your component styles
}
```

The emerald-ui styles will be automatically included through the design system.

## Using Emerald UI Components

### In Angular Templates

You can use emerald-ui components directly in your Angular templates:

```html
<!-- Button example -->
<button class="eui-btn eui-btn-primary">Primary Button</button>

<!-- Card example -->
<div class="eui-card">
  <div class="eui-card-header">Card Title</div>
  <div class="eui-card-body">Card content goes here.</div>
  <div class="eui-card-footer">
    <button class="eui-btn eui-btn-primary">Action</button>
  </div>
</div>
```

### With Angular Components

For more complex components that require JavaScript functionality, you'll need to include the emerald-ui JavaScript file in your Angular component:

```typescript
// In your component
import 'emerald-ui/lib/js/emerald-ui.min.js';
```

## Component Examples

### Buttons

```html
<!-- Primary button -->
<button class="eui-btn eui-btn-primary">Primary</button>

<!-- Secondary button -->
<button class="eui-btn eui-btn-secondary">Secondary</button>

<!-- Outline button -->
<button class="eui-btn eui-btn-outline-primary">Outline</button>

<!-- Button sizes -->
<button class="eui-btn eui-btn-primary eui-btn-sm">Small</button>
<button class="eui-btn eui-btn-primary">Medium</button>
<button class="eui-btn eui-btn-primary eui-btn-lg">Large</button>

<!-- Button with icon -->
<button class="eui-btn eui-btn-primary"><i class="fas fa-plus"></i> Add Item</button>
```

### Cards

```html
<!-- Basic card -->
<div class="eui-card">
  <div class="eui-card-body">
    <h5 class="eui-card-title">Card Title</h5>
    <p class="eui-card-text">Card content goes here.</p>
  </div>
</div>

<!-- Card with header and footer -->
<div class="eui-card">
  <div class="eui-card-header">Card Header</div>
  <div class="eui-card-body">
    <h5 class="eui-card-title">Card Title</h5>
    <p class="eui-card-text">Card content goes here.</p>
  </div>
  <div class="eui-card-footer">Card Footer</div>
</div>

<!-- Card with image -->
<div class="eui-card">
  <img src="image.jpg" class="eui-card-img-top" alt="Card image" />
  <div class="eui-card-body">
    <h5 class="eui-card-title">Card Title</h5>
    <p class="eui-card-text">Card content goes here.</p>
  </div>
</div>
```

### Forms

```html
<!-- Input -->
<div class="eui-form-group">
  <label for="exampleInput">Email address</label>
  <input type="email" class="eui-form-control" id="exampleInput" placeholder="Enter email" />
  <small class="eui-form-text eui-text-muted">We'll never share your email with anyone else.</small>
</div>

<!-- Input group -->
<div class="eui-input-group">
  <div class="eui-input-group-prepend">
    <span class="eui-input-group-text">@</span>
  </div>
  <input type="text" class="eui-form-control" placeholder="Username" />
</div>

<!-- Select -->
<div class="eui-form-group">
  <label for="exampleSelect">Example select</label>
  <select class="eui-form-control" id="exampleSelect">
    <option>1</option>
    <option>2</option>
    <option>3</option>
  </select>
</div>

<!-- Checkbox -->
<div class="eui-form-check">
  <input class="eui-form-check-input" type="checkbox" id="exampleCheck" />
  <label class="eui-form-check-label" for="exampleCheck">Check me out</label>
</div>
```

### Alerts

```html
<!-- Basic alert -->
<div class="eui-alert eui-alert-primary">This is a primary alert.</div>

<!-- Alert with icon -->
<div class="eui-alert eui-alert-success">
  <i class="fas fa-check-circle"></i> This is a success alert with an icon.
</div>

<!-- Alert with dismiss button -->
<div class="eui-alert eui-alert-warning eui-alert-dismissible">
  <button type="button" class="eui-close" data-dismiss="alert">&times;</button>
  This is a dismissible warning alert.
</div>
```

### Badges

```html
<!-- Basic badge -->
<span class="eui-badge eui-badge-primary">Primary</span>

<!-- Badge in heading -->
<h5>Example heading <span class="eui-badge eui-badge-secondary">New</span></h5>

<!-- Pill badge -->
<span class="eui-badge eui-badge-pill eui-badge-success">Success</span>
```

### Tables

```html
<!-- Basic table -->
<table class="eui-table">
  <thead>
    <tr>
      <th>#</th>
      <th>First Name</th>
      <th>Last Name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>John</td>
      <td>Doe</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Jane</td>
      <td>Smith</td>
    </tr>
  </tbody>
</table>

<!-- Striped table -->
<table class="eui-table eui-table-striped">
  <!-- Table content -->
</table>

<!-- Hover table -->
<table class="eui-table eui-table-hover">
  <!-- Table content -->
</table>

<!-- Bordered table -->
<table class="eui-table eui-table-bordered">
  <!-- Table content -->
</table>
```

### Pagination

```html
<!-- Basic pagination -->
<ul class="eui-pagination">
  <li class="eui-page-item disabled">
    <a class="eui-page-link" href="#" tabindex="-1">Previous</a>
  </li>
  <li class="eui-page-item"><a class="eui-page-link" href="#">1</a></li>
  <li class="eui-page-item active">
    <a class="eui-page-link" href="#">2 <span class="eui-sr-only">(current)</span></a>
  </li>
  <li class="eui-page-item"><a class="eui-page-link" href="#">3</a></li>
  <li class="eui-page-item">
    <a class="eui-page-link" href="#">Next</a>
  </li>
</ul>
```

## Best Practices

### Do's

- ✅ Use the design system tokens for custom styling
- ✅ Follow the BEM naming convention for custom CSS classes
- ✅ Use the emerald-ui components for consistent UI
- ✅ Override emerald-ui styles using the provided integration file
- ✅ Test components across different screen sizes

### Don'ts

- ❌ Don't modify the emerald-ui source files directly
- ❌ Don't use inline styles for components (use SCSS files instead)
- ❌ Don't create custom components that duplicate emerald-ui functionality
- ❌ Don't mix different UI libraries in the same component

## Troubleshooting

### Common Issues

#### Styles Not Applied

If emerald-ui styles are not being applied:

1. Make sure the emerald-ui CSS is imported in your application
2. Check that the emerald-ui integration file is imported in the design system
3. Verify that you're using the correct class names for emerald-ui components

#### JavaScript Functionality Not Working

If emerald-ui JavaScript functionality is not working:

1. Make sure the emerald-ui JavaScript file is imported in your application
2. Check the browser console for errors
3. Verify that you're using the correct data attributes for emerald-ui components

#### Conflicts with Angular Material

If you're experiencing conflicts with Angular Material:

1. Use namespaced classes to avoid conflicts
2. Consider using only one UI library per component
3. Use the emerald-ui integration file to override conflicting styles

---

For more information on using emerald-ui components, refer to the [Emerald UI documentation](https://emeraldui.com/docs) or the [Emerald Components Documentation](/docs/EMERALD_COMPONENTS.MD).

Last Updated: 2025-05-20
