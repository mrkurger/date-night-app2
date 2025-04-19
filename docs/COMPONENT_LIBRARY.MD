# Component Library Documentation

## Overview

The Date Night App uses a comprehensive component library built with Angular. This documentation provides detailed information about all components, services, modules, and other elements in the application.

## Accessing the Component Library

The component library documentation is generated using [Compodoc](https://compodoc.app/), a documentation tool for Angular applications. The documentation is available in two ways:

### 1. Static Documentation

The static documentation is available in the `/docs/component-library/` directory. You can browse it by opening the `index.html` file in your browser.

### 2. Interactive Documentation Server

You can also run the documentation server locally for an interactive experience:

```bash
cd client-angular
npm run compodoc
```

This will start a server at http://localhost:8080 where you can browse the documentation.

## Documentation Contents

The component library documentation includes:

- **Components**: Detailed documentation of all UI components, including inputs, outputs, methods, and usage examples
- **Services**: Documentation of all services, including methods, properties, and dependencies
- **Modules**: Overview of module structure and dependencies
- **Interfaces & Classes**: Documentation of data models and type definitions
- **Routes**: Application routing structure
- **Coverage**: Documentation coverage statistics

## Key Component Categories

### Core Components

These components form the foundation of the application's UI:

- **Layout Components**: Main layout, headers, footers, navigation
- **Form Components**: Input fields, buttons, selectors, toggles
- **Feedback Components**: Notifications, toasts, dialogs, loaders

### Feature Components

These components implement specific application features:

- **Authentication**: Login, registration, password reset
- **Profile**: User profiles, settings, preferences
- **Ads**: Ad creation, editing, display
- **Chat**: Messaging interface, conversation list
- **Reviews**: Review creation, display, ratings
- **Wallet**: Transaction history, balance display, transfers

### Emerald UI Components

The Emerald UI is our custom design system that provides consistent styling and behavior across the application:

- **EmeraldButton**: Styled button component with various states
- **EmeraldCard**: Card container with consistent styling
- **EmeraldInput**: Form input with validation and styling
- **EmeraldDialog**: Modal dialog component
- **EmeraldToast**: Toast notification component

## Generating Documentation

The documentation is generated from the source code using Compodoc. To regenerate the documentation after code changes:

```bash
cd client-angular
npm run compodoc:build
```

This will update the static documentation in the `/docs/component-library/` directory.

## Contributing to the Component Library

When adding new components or modifying existing ones, please follow these guidelines:

1. Add proper JSDoc comments to document inputs, outputs, methods, and usage
2. Include example usage in the component's documentation
3. Ensure the component follows the application's design system
4. Regenerate the documentation after changes

For more information on contributing to the codebase, see [CONTRIBUTING.MD](/Users/oivindlund/date-night-app/CONTRIBUTING.MD).
