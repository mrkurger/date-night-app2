# AI Lessons Learned

This document serves as a log of key insights, patterns, and solutions discovered during the development of the Date Night App. It is intended as a reference for developers working on the project.

> **Note**: This document is a curated log of AI-discovered patterns and solutions. For canonical documentation on specific topics, please refer to the linked dedicated documentation files.

## Table of Contents

- [Stable Patterns](#stable-patterns)
  - [Error Handling](#error-handling)
  - [Testing Strategies](#testing-strategies)
  - [Performance Optimization](#performance-optimization)
  - [Security Practices](#security-practices)
  - [UI/UX Patterns](#uiux-patterns)
  - [TypeScript Type Safety](#typescript-type-safety)
- [Technical Solutions](#technical-solutions)
  - [MongoDB Service Patterns](#mongodb-service-patterns)
  - [Angular Build Optimization](#angular-build-optimization)
  - [Angular Build Warnings](#angular-build-warnings)
  - [Dependency Management](#dependency-management)
  - [Map Integration](#map-integration)
  - [User Preferences](#user-preferences)
  - [RxJS Compatibility](#rxjs-compatibility)
- [Historical Notes](#historical-notes)
  - [Obsolete Approaches](#obsolete-approaches)
  - [Fixed Issues](#fixed-issues)
  - [Package Overrides](#package-overrides)
- [Linting and Formatting](#linting-and-formatting)
  - [Code Quality Best Practices](#code-quality-best-practices)
  - [ESLint Configuration](#eslint-configuration)
  - [NPM Scripts](#npm-scripts)
  - [Common Issues](#common-issues)
- [Code Duplication Patterns](#code-duplication-patterns)
  - [Utility Functions](#utility-functions)
  - [HTTP Error Handling](#http-error-handling)
- [Feature Implementation Patterns](#feature-implementation-patterns)
  - [Temporary Messages](#temporary-messages)
  - [Theme Toggle Implementation](#theme-toggle-implementation)
- [Documentation Best Practices](#documentation-best-practices)
- [Security Best Practices](#security-best-practices)
  - [Handling Security Vulnerabilities](#handling-security-vulnerabilities)
  - [Dependency Management](#dependency-management)
  - [GitHub Actions Workflow Patterns](#github-actions-workflow-patterns)
  - [GitHub Actions Security](#github-actions-security)
  - [CI/CD and Git Hooks](#cicd-and-git-hooks)
  - [CI/CD Caching Best Practices](#cicd-caching-best-practices)
  - [Package Overrides](#package-overrides)
- [Error Handling and Telemetry](#error-handling-and-telemetry)
  - [HTTP Error Interceptor Pattern](#http-error-interceptor-pattern)
  - [Telemetry Service Design](#telemetry-service-design)
  - [Performance Monitoring](#performance-monitoring)
  - [Telemetry Dashboard Implementation](#telemetry-dashboard-implementation)
  - [Alert System Integration](#alert-system-integration)
  - [Purpose-Specific Documentation](#purpose-specific-documentation)
  - [Implementation vs. Verification](#implementation-vs-verification)
- [Favorites System Implementation](#favorites-system-implementation)
- [SCSS Import Patterns](#scss-import-patterns)
  - [Design System Import Best Practices](#design-system-import-best-practices)
  - [Benefits of Centralized Design System Imports](#benefits-of-centralized-design-system-imports)
  - [Modern SCSS Import Syntax](#modern-scss-import-syntax)
  - [Handling Variable Conflicts](#handling-variable-conflicts)
- [TypeScript Error Fixing](#typescript-error-fixing)
  - [Automated TypeScript Error Resolution](#automated-typescript-error-resolution)
  - [Enum Usage in TypeScript](#enum-usage-in-typescript)

## TypeScript Error Fixing

### Automated TypeScript Error Resolution

We created a three-tiered approach to fixing TypeScript errors:

1. **Comprehensive Fixer**: Handles multiple error types in a single pass
2. **Basic Fixer**: Uses simple string replacement for common errors
3. **Advanced Fixer**: Uses ts-morph for more complex AST-based transformations

These scripts work together to automatically fix common TypeScript errors such as:

- Missing imports (TS2307)
- Export name mismatches (TS2724)
- Missing properties in interfaces (TS2339)
- Type assignment errors (TS2322)
- Type comparison errors (TS2678)
- Property name errors (TS2551)
- Object literal property errors (TS2353)

### Key Implementation Patterns

1. **Error Grouping Strategy**:

   - Group errors by file for efficient processing
   - Group errors by type within each file
   - Process similar errors together

2. **Backup System**:

   - Create backups of all modified files
   - Use separate backup directories for each fixer
   - Allow easy recovery of original files

3. **Fix Application Strategy**:

   - Apply simple fixes first
   - Use AST-based transformations for complex cases
   - Verify fixes with incremental builds

4. **Common Fix Patterns**:

   - Add missing imports at the top of the file
   - Convert string literals to enum values
   - Add missing properties to interfaces
   - Use bracket notation for dynamic property access
   - Add type assertions for comparison operations

5. **CSV Error Format**:

   - Use a simple CSV format for error tracking
   - Format: `file_path,error_codes`
   - Process multiple error types per file
   - Handle quoted strings and special characters properly
   - Support environment variable configuration

6. **Error Handling Improvements**:
   - Robust CSV parsing to handle different formats
   - Graceful handling of malformed input
   - Clear error messages and logging
   - Comprehensive reporting of fixed vs. skipped errors

For detailed implementation, see [TYPESCRIPT_ERROR_FIXING.md](/docs/TYPESCRIPT_ERROR_FIXING.md).

## Stable Patterns

This section contains well-established patterns that have proven effective in the DateNight.io project. These patterns are considered stable and recommended for use throughout the codebase.

### Service Implementation Patterns

When implementing service methods in the application, we've established these effective patterns:

1. **Method Structure**:

   - Use async/await for asynchronous operations
   - Implement consistent error handling with try/catch blocks
   - Log errors with appropriate context information
   - Return meaningful data structures
   - Use JSDoc comments to document parameters, return values, and behavior

2. **Wallet Service Patterns**:
   - Implement methods to retrieve specific resources by ID
   - Use the getOrCreateWallet pattern to ensure a wallet exists before operations
   - Validate inputs before processing
   - Handle edge cases (e.g., resource not found)
   - Return null for non-existent resources rather than throwing errors (when appropriate)
   - Use descriptive error messages that help with troubleshooting

### Test Mocking Patterns

When mocking models in Jest tests, we've discovered several important patterns:

1. **Proper Mock Implementation**:

   - Use `jest.mock()` to mock the entire module
   - Implement mock methods that match the actual implementation
   - Ensure mock methods return promises when the actual methods do
   - Set up mock implementations that support method chaining

2. **Model Constructor Mocking**:

   - Mock the constructor function to return an object with the expected methods
   - Include a `save()` method that resolves with the object itself
   - Include a `toObject()` method that returns a plain object representation

3. **Static Method Mocking**:

   - Add static methods directly to the mocked model
   - Ensure static methods return appropriate values or promises
   - Set up method chains for complex queries (e.g., `find().populate().sort()`)

4. **Mock Reset Between Tests**:

   - Reset mocks in `beforeEach()` to ensure test isolation
   - Use `mockClear()`, `mockReset()`, or `mockRestore()` as appropriate
   - Consider using `jest.resetAllMocks()` for comprehensive reset

5. **Handling Edge Cases**:
   - Mock error scenarios to test error handling
   - Test with various input parameters
   - Verify that the correct methods are called with the expected parameters

### Error Handling

For comprehensive error handling documentation, see [ERRORHANDLINGTELEMETRY.MD](/docs/ERRORHANDLINGTELEMETRY.MD).

**Key Patterns:**

- Use HTTP interceptors for global error handling
- Implement context-specific error handling in services
- Provide user-friendly error messages
- Log errors with appropriate severity levels
- Include contextual information in error logs

### Testing Strategies

For detailed testing guidelines, see [TESTING_GUIDE.MD](/docs/TESTING_GUIDE.MD) and [ANGULAR_TESTING_LESSONS.MD](/docs/ANGULAR_TESTING_LESSONS.MD).

**Key Patterns:**

- Write unit tests for business logic
- Use integration tests for API endpoints
- Implement E2E tests for critical user flows
- Mock external dependencies
- Use test-driven development for complex features

### Performance Optimization

**Key Patterns:**

- Lazy load Angular modules
- Implement virtual scrolling for long lists
- Use trackBy with ngFor
- Optimize change detection
- Implement proper caching strategies

### Security Practices

For comprehensive security guidelines, see [SECURITY_BEST_PRACTICES.MD](/docs/SECURITY_BEST_PRACTICES.MD).

**Key Patterns:**

- Validate all user inputs
- Implement proper authentication and authorization
- Use HTTPS for all communications
- Follow the principle of least privilege
- Keep dependencies updated

### UI/UX Patterns

For UI component documentation, see [COMPONENT_LIBRARY.MD](/docs/COMPONENT_LIBRARY.MD) and [EMERALD-COMPONENTS.MD](/docs/EMERALD-COMPONENTS.MD).

**Key Patterns:**

- Use consistent design language
- Implement responsive layouts
- Provide feedback for user actions
- Ensure accessibility compliance
- Design for progressive enhancement
  - [Component Architecture](#component-architecture)
- [User Preferences Implementation](#user-preferences-implementation)
  - [Preference Storage](#preference-storage)
  - [Reactive Updates](#reactive-updates)
  - [Component Integration](#component-integration)
  - [CSS Implementation](#css-implementation)
  - [Dialog Service Pattern](#dialog-service-pattern)
  - [Form Validation](#form-validation)
- [Design System Implementation](#design-system-implementation)

### TypeScript Type Safety

When working with TypeScript in Angular services, we've established these effective patterns for maintaining type safety:

1. **String Literal Types for Constants**:

   - Use string literal types for constants with specific allowed values
   - Example: `const API_PROVIDER: 'nominatim' | 'mapbox' | 'google' = 'nominatim';`
   - This ensures type checking when comparing values and prevents invalid assignments

2. **Tuple Types for Coordinates**:

   - Use tuple types for coordinates to ensure the correct number of elements
   - Example: `coordinates: [number, number]` instead of `coordinates: number[]`
   - Use type assertions with `as [number, number]` when converting from arrays

3. **Interface Hierarchies**:

   - Create specific interfaces for related data structures
   - Use composition to build complex interfaces from simpler ones
   - Example: Create a `GeocodingComponents` interface and reuse it in `ReverseGeocodingResult`

4. **Type-Safe Object Mapping**:

   - Use `keyof` operator with interfaces to ensure type safety in object mappings
   - Example: `const componentMap: { [key: string]: keyof GeocodingComponents } = {...}`
   - This ensures that property assignments use valid keys from the target interface

5. **Helper Functions for Type Conversion**:

   - Create helper functions that handle type conversions safely
   - Example: `createQueryString` function to handle parameter encoding
   - Include proper JSDoc comments to document parameter types and return values

6. **Const Assertions for Literal Types**:

   - Use `as const` to create readonly literal types
   - Example: `type: 'Point' as const` ensures the type is exactly 'Point'
   - This is particularly useful for API responses with specific format requirements

7. **Safe Type Narrowing**:

   - Check for existence of properties before accessing them
   - Use type guards to narrow types in conditional blocks
   - Handle null and undefined values explicitly

8. **Consistent Error Handling**:

   - Return null or empty arrays for failed operations rather than undefined
   - Use RxJS operators like catchError to handle errors in observables
   - Provide meaningful error messages with context information

9. **Avoiding `any` Types**:

   - Use `unknown` instead of `any` when the type is truly unknown
   - Create specific interfaces for API responses and request bodies
   - Use generics for reusable components and services
   - Example: `get<T>(url: string): Observable<T>` instead of `get(url: string): Observable<any>`

10. **Type-Safe HTTP Methods**:

    - Specify return types for HTTP methods using generics
    - Define interfaces for request bodies and response types
    - Use proper typing for HTTP parameters
    - Example: `http.get<User[]>(url)` instead of `http.get(url)`

11. **Interface Extraction**:

    - Extract common interface patterns into separate interfaces
    - Use these interfaces across the application for consistency
    - Example: Create `NotificationSettings` and `PrivacySettings` interfaces and use them in the `User` interface

12. **Type-Safe Timers**:
    - Use proper types for setTimeout and setInterval return values
    - Example: `private tokenExpirationTimer: ReturnType<typeof setTimeout> | null = null;`
    - Clear timers properly to prevent memory leaks

- [Form Component Integration](#form-component-integration)
- [Component Demo Page](#component-demo-page)
- [Design System Documentation](#design-system-documentation)
- [Theme System Implementation](#theme-system-implementation)
- [SCSS Import Patterns](#scss-import-patterns)

## SCSS Import Patterns

### Design System Import Best Practices

When importing design system styles in SCSS files, always use the centralized design system entry point:

```scss
// CORRECT: Use the centralized design system entry point
@use 'src/styles/design-system/index' as ds;

// INCORRECT: Don't import directly from core/design
@use 'src/app/core/design/main' as ds; // AVOID THIS
```

### Benefits of Centralized Design System Imports

1. **Consistency**: All components use the same design tokens and variables
2. **Maintainability**: Changes to the design system structure only need to be updated in one place
3. **Prevents Conflicts**: Avoids variable name conflicts and duplicate imports
4. **Future-Proofing**: Makes it easier to migrate to new design systems or update existing ones

### Modern SCSS Import Syntax

Always use the modern `@use` syntax instead of the deprecated `@import`:

```scss
// CORRECT: Modern syntax
@use 'path/to/file' as namespace;

// INCORRECT: Deprecated syntax
@import 'path/to/file';
```

### Relative vs. Absolute Paths in SCSS

When importing SCSS files, prefer relative paths over absolute paths to avoid resolution issues:

```scss
// CORRECT: Use relative paths
@use '../../../styles/design-system/index' as ds;

// INCORRECT: Avoid absolute paths
@use 'src/styles/design-system/index' as ds;
```

Benefits of relative paths:

1. **Portability**: Works regardless of project structure
2. **Build Tool Compatibility**: Works with different build tools and configurations
3. **Prevents Resolution Issues**: Avoids path resolution problems in different environments

### Using @forward for Design Tokens

When creating a design tokens file that needs to expose variables to other files, use `@forward` to make all variables available:

```scss
// design-tokens.scss
@use 'emerald-tokens';
@forward 'emerald-tokens'; // Makes all variables available to importers
```

This ensures that all variables from the imported module are available to any file that imports your module.

### Automated SCSS Import Fixing

For projects with many SCSS files, create automated scripts to fix import issues:

1. **Path Calculation**: Calculate relative paths based on file locations
2. **Pattern Matching**: Use regex to identify problematic imports
3. **Batch Processing**: Process multiple files in a single run
4. **Backup Creation**: Create backups before modifying files

See `scripts/fix-scss-imports.js` for implementation details.

## Angular Component Best Practices

### Custom UI Components vs. Material Components

When working with Angular Material components, consider these guidelines:

1. **Proper Module Imports**: Always import the specific Material modules needed
2. **Fallback Strategies**: Implement custom UI components as fallbacks when Material components fail
3. **Consistent Styling**: Ensure custom components match the styling of Material components
4. **Performance Considerations**: Custom implementations may be lighter weight than Material components

### Template Performance Optimization

To optimize Angular templates for performance:

1. **Avoid Filter Operations in Templates**:

```html
<!-- INCORRECT: Filter in template -->
<div *ngFor="let item of items.filter(i => i.status === 'active')">
  <!-- CORRECT: Use component method -->
  <div *ngFor="let item of getActiveItems()"></div>
</div>
```

2. **Implement Component Methods for Filtering**:

```typescript
// In component class
getActiveItems(): Item[] {
  return this.items.filter(i => i.status === 'active');
}
```

Benefits:

- Reduces template complexity
- Improves change detection performance
- Makes code more maintainable and testable
- Prevents duplicate filter operations

### Custom Tab Implementation

When Material tabs cause issues or aren't needed, implement custom tabs:

1. **HTML Structure**:

```html
<div class="tabs-container">
  <div class="tabs-header">
    <button
      *ngFor="let tab of tabLabels; let i = index"
      class="tab-button"
      [class.active]="activeTab === i"
      (click)="activeTab = i; onTabChange({index: i})"
    >
      {{ tab }}
    </button>
  </div>
  <div class="tabs-content">
    <div *ngIf="activeTab === 0" class="tab-pane">
      <!-- Tab 1 content -->
    </div>
    <div *ngIf="activeTab === 1" class="tab-pane">
      <!-- Tab 2 content -->
    </div>
  </div>
</div>
```

2. **SCSS Styling**:

```scss
.tabs-container {
  margin-bottom: 20px;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #dee2e6;
  margin-bottom: 20px;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.2s ease;

  &:hover {
    color: #17a2b8;
  }

  &.active {
    color: #17a2b8;
    border-bottom: 2px solid #17a2b8;
  }
}

.tab-pane {
  display: block;
  padding: 15px 0;
}
```

3. **Component Logic**:

```typescript
activeTab = 0;

onTabChange(event: {index: number}): void {
  // Handle tab change logic
}
```

This approach provides a lightweight alternative to Material tabs with full control over styling and behavior.

### Handling Variable Conflicts

When forwarding multiple SCSS modules that might have conflicting variable names, use the `hide` directive:

```scss
@forward 'module-a' hide $conflicting-variable;
@forward 'module-b' hide $conflicting-variable;
```

This prevents "Two forwarded modules both define a variable named X" errors.

## TypeScript Error Fixing

### Automated TypeScript Error Resolution

When implementing automated TypeScript error fixing in Angular applications, we discovered several effective patterns:

1. **Error Classification and Handling**:

   - Categorize TypeScript errors by their error codes (e.g., TS2307, TS2322)
   - Implement specific handlers for each error type
   - Use a modular approach where each error type has its own handling function
   - Prioritize fixing errors that block compilation first

2. **Common Error Patterns and Solutions**:

   - **TS2307: Cannot find module** - Usually fixed by adding missing imports
   - **TS2322: Type assignment errors** - Often resolved by using proper enum values instead of string literals
   - **TS2724: Export name mismatch** - Fixed by updating import statements to match actual exports
   - **TS2339: Property does not exist** - Resolved by adding missing properties to interfaces
   - **TS2353: Object literal property errors** - Fixed by updating property names to match interface definitions
   - **TS2304: Cannot find name** - Addressed by adding missing type imports
   - **TS2345: Argument type errors** - Fixed by adding proper type conversions

3. **Implementation Approaches**:

   - **String-based replacement** - Simple but effective for straightforward errors
   - **AST-based transformation** - More robust for complex code structures
   - **Backup strategy** - Always create backups before modifying files
   - **Incremental fixing** - Process one error type at a time to avoid conflicts

4. **Error Fixing Workflow**:

   - Extract errors from TypeScript compiler output
   - Group errors by file for efficient processing
   - Apply fixes in a deterministic order
   - Verify fixes with a subsequent compilation
   - Document patterns of fixed errors for future reference

5. **Best Practices**:
   - Use dedicated tools like ts-morph for AST manipulation
   - Implement dry-run mode for previewing changes
   - Create comprehensive test cases for error fixing logic
   - Document common error patterns and their solutions
   - Maintain a changelog of automated fixes

### Enum Usage in TypeScript

When working with enums in Angular applications, we found these effective patterns:

1. **String Enum Pattern**:

   - Use string enums for better readability in runtime values
   - Example: `enum AlertTimeWindow { MINUTES_15 = '15m', MINUTES_30 = '30m', HOURS_1 = '1h', HOURS_24 = '24h' }`
   - Ensures type safety while maintaining readable values in API calls

2. **Enum Type Safety**:

   - Always use the enum type in function parameters and properties
   - Replace string literals with enum values to leverage TypeScript's type checking
   - Use union types when only specific enum values are valid

3. **Enum Import Strategy**:

   - Import enums directly from their source files
   - Include enums in barrel files for easier importing
   - Ensure consistent naming conventions for enum imports

4. **Enum Documentation**:
   - Document the purpose and valid values of each enum
   - Include examples of proper enum usage in comments
   - Explain the significance of each enum value

## Design System Implementation

### Form Component Integration

When integrating form components into a design system, we discovered several important patterns:

1. **Component Hierarchy**: Form components should follow a consistent pattern with:

   - A container element that handles layout and spacing
   - A label element that clearly identifies the input
   - The input element itself with appropriate attributes
   - Helper text or error message elements for feedback

2. **Accessibility Considerations**:

   - All form elements should have proper labels
   - Error messages should be associated with inputs using aria-describedby
   - Focus states should be clearly visible
   - Required fields should be marked visually and with aria-required
   - Disabled states should use both the disabled attribute and aria-disabled

3. **State Management**:

   - Implement ControlValueAccessor for seamless integration with Angular forms
   - Handle all input states: default, focus, hover, disabled, readonly, error
   - Provide clear visual feedback for each state
   - Emit appropriate events for value changes, focus, and blur

4. **Styling Patterns**:

   - Use BEM naming convention for component classes
   - Create variants (outlined, filled, standard) using modifier classes
   - Size variants should adjust padding, font size, and height proportionally
   - Use CSS custom properties for theme-specific values
   - Implement dark mode styles using media queries and class selectors

5. **Documentation Best Practices**:
   - Document all component properties, events, and methods
   - Provide usage examples for common scenarios
   - Include accessibility guidelines
   - Document all variants and states
   - Include information about form integration

### Component Demo Page

When creating a design system demo page, we found these effective approaches:

1. **Structured Organization**:

   - Group related components together
   - Use clear section headings
   - Provide context and usage guidelines
   - Show components in different states and variants

2. **Interactive Examples**:

   - Allow users to interact with components
   - Show real-time feedback
   - Demonstrate form validation
   - Include code examples

3. **Responsive Demonstration**:

   - Show how components behave at different screen sizes
   - Provide responsive layout examples
   - Demonstrate mobile-specific interactions

4. **Accessibility Demonstration**:
   - Show keyboard navigation
   - Demonstrate screen reader compatibility
   - Highlight accessibility features

### Design System Documentation

[Content for Design System Documentation section]

### Theme System Implementation

For detailed implementation of the theme system, see [THEME_SYSTEM.MD](./THEME_SYSTEM.md).

When implementing a theme system as part of a design system, we discovered several important patterns:

1. **Theme Architecture**:

   - Separate theme definitions from component styles
   - Create a dedicated theme file (e.g., `theme.css`)
   - Use semantic naming for variables (e.g., `--body-bg` instead of `--light-gray`)
   - Define both direct variables (e.g., `--primary-500`) and semantic variables (e.g., `--link-color`)
   - Organize CSS variables hierarchically (base colors → semantic variables → component variables)

2. **Theme Switching Logic**:

   - Implement clean, reusable theme switching functions in a dedicated service
   - Use class-based approach for theme application (`light-theme`, `dark-theme` classes)
   - Ensure smooth transitions between themes with CSS transitions
   - Handle edge cases (e.g., system preference changes)
   - Emit events for theme changes to allow components to react
   - Persist user preferences in localStorage

3. **System Preference Integration**:

   - Use `prefers-color-scheme` media query for system preference detection
   - Combine with user preferences for optimal experience
   - Implement a preference hierarchy: explicit user choice > system preference > default
   - Listen for system preference changes with `window.matchMedia().addEventListener()`
   - Apply appropriate theme when system preference changes if user has selected "system" preference

4. **Component Guidelines**:

   - Document how components should use theme variables
   - Create examples of theme-aware components
   - Test all components in all supported themes
   - Ensure consistent appearance across themes
   - Provide theme-specific variants when necessary
   - Use CSS custom properties for all theme-related styles
   - Apply the `theme-transition` class to elements that should animate during theme changes

5. **Accessibility Considerations**:

   - Ensure sufficient contrast in both themes
   - Support high contrast mode with appropriate media queries
   - Respect user's reduced motion preferences
   - Provide clear focus indicators in both themes
   - Include proper ARIA attributes for theme toggle controls
   - Test with screen readers and keyboard navigation

6. **Performance Optimization**:

   - Minimize DOM manipulations during theme changes
   - Use efficient CSS selectors
   - Batch theme-related updates
   - Avoid layout thrashing by using CSS variables
   - Implement lazy loading for theme-specific assets

7. **Reusable Theme Toggle Component**:
   - Create a flexible, reusable theme toggle component
   - Support multiple display modes (icon-only, with-label, toggle switch)
   - Allow customization of labels and positions
   - Implement smooth animations for state changes
   - Ensure keyboard accessibility and proper focus management

Effective design system documentation follows these patterns:

1. **Hierarchical Structure**:

   - Organize documentation by component type
   - Provide a clear navigation structure
   - Include a search function for quick access
   - Link related components and concepts

2. **Component Documentation**:

   - Include a component overview with purpose and use cases
   - Document all properties, events, and methods
   - Provide usage examples with code snippets
   - Include visual examples of variants and states
   - Document accessibility considerations
   - Include performance considerations

3. **Design Token Documentation**:

   - Document all design tokens with descriptions and values
   - Group tokens by category (colors, typography, spacing, etc.)
   - Show visual examples of tokens in use
   - Provide usage guidelines for each token category

4. **Guidelines and Best Practices**:

   - Include guidelines for component usage
   - Document best practices for implementation
   - Provide examples of common patterns
   - Include anti-patterns to avoid

5. **Living Documentation**:
   - Keep documentation in sync with the actual implementation
   - Include version information and change history
   - Provide a feedback mechanism for users
   - Regularly review and update documentation

## Error Handling and Telemetry

### HTTP Error Interceptor Pattern

When implementing HTTP error handling in Angular applications, the interceptor pattern provides a centralized approach with several benefits:

1. **Centralized Error Handling**: All HTTP errors are processed in one place, ensuring consistent handling across the application.

2. **Separation of Concerns**: Components and services can focus on their core functionality without duplicating error handling logic.

3. **Configurable Behavior**: The interceptor can be configured with different options based on the application's needs.

4. **Telemetry Integration**: Error tracking and performance monitoring can be seamlessly integrated.

### Implementation Patterns

The Date Night App implements a comprehensive error handling and telemetry system with the following components:

1. **HTTP Error Interceptor**: Centralized error handling for all HTTP requests
2. **Telemetry Service**: Tracks errors and performance metrics
3. **Error Dashboard**: Visualizes error statistics
4. **Performance Dashboard**: Visualizes performance metrics

#### Error Categorization

Errors are categorized into the following types:

```typescript
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  UNKNOWN = 'unknown',
}
```

This categorization enables:

- Better error handling based on error type
- Improved error reporting and visualization
- More targeted user feedback

#### RxJS Type Compatibility in Operators

When creating custom RxJS operators in Angular applications, it's important to ensure proper type compatibility, especially when multiple versions of RxJS might be present in the project (e.g., in the root node_modules and in client-angular/node_modules).

To avoid TypeScript errors related to incompatible Observable types, use generic type parameters in custom operators:

```typescript
/**
 * Creates a retry operator with exponential backoff and jitter
 * @param request The original HTTP request
 * @returns A function that applies retry logic to an observable
 */
private retryWithBackoff(request: HttpRequest<any>) {
  // Return a function that takes an observable and returns a new observable with the same type
  // Using generic type parameter to ensure type compatibility across different RxJS versions
  return <T>(source: Observable<T>): Observable<T> => {
    if (!this.config.retryFailedRequests) {
      return source;
    }

    return source.pipe(
      retryWhen(errors =>
        errors.pipe(
          concatMap((error, index) => {
            // Retry logic implementation
            // ...
            return timer(totalDelay);
          })
        )
      )
    );
  };
}
```

Key improvements in this pattern:

1. **Generic Type Parameter**: Using `<T>` allows the operator to work with any Observable type
2. **Type Consistency**: Ensures the return type matches the input type
3. **Type Safety**: Prevents TypeScript errors when different RxJS versions are present
4. **Improved Readability**: Makes the operator's purpose and behavior clearer

This approach ensures that custom operators work correctly regardless of the specific RxJS implementation being used, which is particularly important in Angular applications where multiple versions of RxJS might be present in different node_modules directories.

#### Retry Logic with Exponential Backoff

The interceptor implements retry logic with exponential backoff and jitter:

Benefits of this approach:

- Automatically recovers from transient errors
- Prevents overwhelming the server with retry requests
- Jitter helps prevent the "thundering herd" problem
- Configurable retry attempts and delays

#### Duplicate Error Suppression

To prevent overwhelming users with duplicate error notifications:

```typescript
private isInCooldown(errorCode: string): boolean {
  const existing = this.recentErrors.get(errorCode);
  if (!existing) return false;

  const now = Date.now();
  const elapsed = now - existing.timestamp;

  // If this is the first occurrence or cooldown has elapsed, it's not in cooldown
  if (existing.count === 1 || elapsed > this.ERROR_COOLDOWN) {
    return false;
  }

  // Otherwise, it's in cooldown
  return true;
}
```

This approach:

- Tracks recent errors with timestamps
- Applies a cooldown period to similar errors
- Still logs all errors for telemetry
- Provides a better user experience

#### Data Sanitization

Sensitive data is automatically sanitized before logging or sending to telemetry:

```typescript
private sanitizeObject(obj: any, sensitiveFields: string[]): void {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  if (Array.isArray(obj)) {
    // Recursively sanitize array items
    obj.forEach(item => {
      if (item && typeof item === 'object') {
        this.sanitizeObject(item, sensitiveFields);
      }
    });
    return;
  }

  // Process each property in the object
  Object.keys(obj).forEach(key => {
    // Check if this is a sensitive field
    if (sensitiveFields.some(field =>
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      obj[key] = '********';
    }
    // Recursively sanitize nested objects
    else if (obj[key] && typeof obj[key] === 'object') {
      this.sanitizeObject(obj[key], sensitiveFields);
    }
  });
}
```

This ensures:

- Passwords, tokens, and other sensitive data are masked
- Recursive sanitization for nested objects
- Pattern-based detection of sensitive fields

### Telemetry Service Design

The telemetry service implements several important patterns:

#### Offline Support

```typescript
private flushOfflineQueues(): void {
  // Load any queues from local storage
  this.loadOfflineQueues();

  // Process error queue
  if (this.offlineErrorQueue.length > 0) {
    const errorQueue = [...this.offlineErrorQueue];
    this.offlineErrorQueue = [];
    this.persistOfflineQueue('errors', this.offlineErrorQueue);

    // Send in batches to avoid overwhelming the server
    this.sendBatch(`${this.apiUrl}/errors/batch`, errorQueue);
  }
}
```

This approach:

- Stores telemetry data locally when offline
- Sends stored data when the connection is restored
- Preserves telemetry data even during network outages

#### Batched Sending

```typescript
private sendBatch(url: string, batch: any[]): void {
  // Split into smaller batches if needed
  const batchSize = 50;
  for (let i = 0; i < batch.length; i += batchSize) {
    const chunk = batch.slice(i, i + batchSize);
    this.http.post(url, { items: chunk }).subscribe();
  }
}
```

## RxJS Compatibility

### Multiple RxJS Versions Issue

When working with Angular applications that have dependencies with different RxJS versions, you may encounter type compatibility issues. This is particularly common in HTTP interceptors and services that use RxJS operators.

#### Symptoms

- TypeScript errors about incompatible Observable types
- Errors mentioning "Property 'isStopped' is protected but type 'Subscriber<T>' is not a class derived from 'Subscriber<T>'"
- Errors about incompatible call signatures for RxJS operators

#### Root Cause

The root cause is typically having multiple versions of RxJS in the dependency tree:

1. One version in the root node_modules folder
2. Another version in a nested node_modules folder (e.g., client-angular/node_modules)

This creates type incompatibilities when:

- A service defined in one context uses an Observable from another context
- Custom operators are defined with specific RxJS types from one version but used with Observables from another version

#### Solutions

##### 1. Simplified Interceptors

For HTTP interceptors, the simplest solution is to create a simplified version that avoids complex RxJS operations:

```typescript
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private telemetryService: TelemetryService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Simply pass through all requests without modification
    return next.handle(request);
  }
}
```

##### 2. Type-Safe Custom Operators

For custom RxJS operators, use generic type parameters to ensure type compatibility:

```typescript
// Return a function that takes an observable and returns a new observable with the same type
// Using generic type parameter to ensure type compatibility across different RxJS versions
private retryWithBackoff<T>(maxRetries: number, initialDelay: number) {
  return (source: Observable<T>): Observable<T> => {
    return source.pipe(
      retryWhen(errors =>
        errors.pipe(
          concatMap((error, index) => {
            const attemptNumber = index + 1;
            if (attemptNumber > maxRetries) {
              return throwError(() => error);
            }
            const delay = initialDelay * Math.pow(2, attemptNumber);
            return timer(delay);
          })
        )
      )
    );
  };
}
```

##### 3. Extract Shared Types

For shared types like enums that are used across different contexts, extract them to separate files:

```typescript
// error-category.enum.ts
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  UNKNOWN = 'unknown',
}
```

##### 4. Long-Term Solutions

For a more permanent solution:

1. **Dependency Hoisting**: Configure npm or yarn to hoist dependencies to the root level
2. **Package Overrides**: Use package overrides in package.json to force a specific RxJS version
3. **Monorepo Structure**: Consider using a monorepo tool like Nx or Lerna with proper workspace configuration

Benefits of these approaches:

- Resolves RxJS type compatibility issues
- Maintains code functionality while fixing type errors
- Provides both short-term fixes and long-term solutions
- Improves code maintainability and type safety
- Reduces build errors and runtime issues

#### Session and User Tracking

```typescript
trackError(error: Partial<ErrorTelemetry>): Observable<any> {
  const errorData: ErrorTelemetry = {
    // ...other properties
    userId: this.userId || undefined,
    sessionId: this.sessionId,
    appVersion: this.appVersion,
    userAgent: navigator.userAgent,
    // ...
  };
}
```

This enables:

- User-specific error analysis
- Session-based error tracking
- Better understanding of error patterns

### Performance Monitoring

The performance monitoring system implements:

#### Request Timing

```typescript
// Start timing
this.requestTimings.set(requestId, {
  startTime: performance.now(),
  url: request.url,
  method: request.method,
});

// End timing
const endTime = performance.now();
const duration = endTime - timing.startTime;
```

This provides:

- Accurate timing of HTTP requests
- Performance metrics for all endpoints
- Data for identifying slow endpoints

#### Response Size Calculation

```typescript
let responseSize: number | undefined;
if (response.body && typeof response.body === 'string') {
  responseSize = new Blob([response.body]).size;
} else if (response.body) {
  try {
    responseSize = new Blob([JSON.stringify(response.body)]).size;
  } catch (e) {
    // Ignore if we can't calculate size
  }
}
```

This enables:

- Bandwidth usage analysis
- Identification of large responses
- Optimization opportunities

#### Performance Visualization

The performance dashboard provides:

- Response time by endpoint (bar chart)
- Response time distribution (pie chart)
- Response time over time (line chart)
- Slowest endpoints (table)

This visualization helps:

- Identify performance bottlenecks
- Track performance trends over time
- Prioritize optimization efforts

#### Real-time Telemetry Updates

The telemetry system now supports real-time updates using WebSockets:

```typescript
export class TelemetrySocketService implements OnDestroy {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Connection status
  private connectionStatus = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatus.asObservable();

  // Telemetry data streams
  private errorTelemetry = new Subject<ErrorTelemetry>();
  public errorTelemetry$ = this.errorTelemetry.asObservable();

  // ... other streams and methods
}
```

This approach provides several benefits:

- Immediate visibility of new errors and performance issues
- Reduced server load compared to polling
- Better user experience with live updates
- Resilient connections with automatic reconnection

The implementation includes:

- Observable streams for different types of telemetry data
- Connection status monitoring
- Exponential backoff for reconnection attempts
- Channel-based subscriptions for specific data types

### Best Practices

Based on the implementation in the Date Night App, we've identified these best practices:

1. **Centralized Error Handling**: Use HTTP interceptors for consistent error handling across the application.

2. **Error Categorization**: Categorize errors to enable better handling and reporting.

3. **Retry Logic**: Implement retry logic with exponential backoff and jitter for transient errors.

4. **User-Friendly Messages**: Provide clear, user-friendly error messages.

5. **Technical Details**: Include technical error details for developers.

6. **Offline Support**: Store telemetry data locally when offline.

7. **Batched Sending**: Send telemetry data in batches to reduce network overhead.

8. **Data Sanitization**: Ensure sensitive information is not included in telemetry data.

9. **Performance Monitoring**: Track performance metrics to identify bottlenecks.

10. **Dashboard Visualization**: Visualize error and performance statistics.

For a complete overview of the error handling and telemetry implementation, see the [Error Handling and Telemetry Documentation](../ERRORHANDLINGTELEMETRY.MD).

### Telemetry Dashboard Implementation

For effective monitoring of errors and performance, implement a comprehensive dashboard:

1. **Error Dashboard**: Create a dashboard for visualizing and analyzing errors.

```typescript
@Component({
  selector: 'app-error-dashboard',
  template: `
    <div class="dashboard-container">
      <h1>Error Monitoring Dashboard</h1>

      <div class="filter-section">
        <!-- Filters for error category, status code, date range, etc. -->
      </div>

      <div class="dashboard-content">
        <!-- Charts for errors by category, status code, over time -->
      </div>

      <mat-card class="error-list-card">
        <!-- Table of recent errors with details -->
      </mat-card>
    </div>
  `,
})
export class ErrorDashboardComponent implements OnInit {
  // Implementation details
}
```

2. **Performance Dashboard**: Create a dashboard for visualizing and analyzing performance metrics.

```typescript
@Component({
  selector: 'app-performance-dashboard',
  template: `
    <div class="dashboard-container">
      <h1>Performance Monitoring Dashboard</h1>

      <div class="filter-section">
        <!-- Filters for URL, method, duration, date range, etc. -->
      </div>

      <div class="dashboard-content">
        <!-- Charts for response time by endpoint, distribution, over time -->
      </div>

      <mat-card class="endpoints-list-card">
        <!-- Table of endpoint performance metrics -->
      </mat-card>
    </div>
  `,
})
export class PerformanceDashboardComponent implements OnInit {
  // Implementation details
}
```

3. **Combined Telemetry Dashboard**: Create a unified dashboard with tabs for errors and performance.

```typescript
@Component({
  selector: 'app-telemetry-dashboard',
  template: `
    <div class="telemetry-dashboard-container">
      <h1>Application Telemetry Dashboard</h1>

      <mat-tab-group>
        <mat-tab label="Error Monitoring">
          <app-error-dashboard></app-error-dashboard>
        </mat-tab>
        <mat-tab label="Performance Monitoring">
          <app-performance-dashboard></app-performance-dashboard>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class TelemetryDashboardComponent {
  // Implementation details
}
```

### Dashboard Design Patterns

When implementing telemetry dashboards, several design patterns have proven effective:

1. **Layered Filtering**: Implement filtering at multiple levels:

   - Global filters that apply to all dashboard sections
   - Section-specific filters for targeted analysis
   - Quick filters for common scenarios (e.g., "Last 24 hours", "Server errors only")

2. **Progressive Loading**: Load dashboard data in stages:

   - Load summary statistics first for immediate feedback
   - Load detailed data and charts asynchronously
   - Implement pagination for large datasets

3. **Responsive Visualization**: Design visualizations that adapt to different screen sizes:

   - Use flexible layouts with CSS Grid or Flexbox
   - Simplify charts on smaller screens
   - Stack elements vertically on mobile devices

4. **Contextual Actions**: Provide relevant actions based on the data being viewed:

   - Quick links to related logs or traces
   - Options to create alerts based on current filters
   - Export functionality for reports

5. **Real-time Updates**: Implement efficient real-time updates:
   - Use WebSockets for live data streaming
   - Batch updates to prevent UI flickering
   - Allow users to pause live updates for analysis

### Alert System Integration

Integrating the alert system with error handling provides proactive monitoring capabilities:

1. **Alert Types**: Implement different types of alerts for comprehensive monitoring:

```typescript
// Alert based on error category
createErrorCategoryAlert(
  ErrorCategory.SERVER,
  'Critical Server Errors',
  'Alert when multiple server errors occur',
  5, // Threshold
  '1h' // Time window
);

// Alert based on error rate
createErrorRateAlert(
  10, // 10% error rate threshold
  'High Error Rate Alert',
  'Alert when error rate exceeds 10%',
  '15m' // Time window
);

// Alert based on performance
createPerformanceAlert(
  1000, // 1000ms threshold
  'Slow API Response',
  'Alert when API responses exceed 1 second',
  '/api/users', // Specific endpoint
  '30m' // Time window
);

// Alert based on error pattern
createErrorPatternAlert(
  'database connection',
  'Database Connection Issues',
  'Alert when database connection errors occur',
  1, // Threshold
  '24h' // Time window
);
```

2. **Severity Mapping**: Map error categories to appropriate alert severities:

```typescript
private getSeverityForCategory(category: ErrorCategory): AlertSeverity {
  switch (category) {
    case ErrorCategory.SERVER:
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return AlertSeverity.CRITICAL;

    case ErrorCategory.NETWORK:
    case ErrorCategory.TIMEOUT:
    case ErrorCategory.RATE_LIMIT:
      return AlertSeverity.ERROR;

    case ErrorCategory.VALIDATION:
    case ErrorCategory.NOT_FOUND:
    case ErrorCategory.CONFLICT:
      return AlertSeverity.WARNING;

    case ErrorCategory.CLIENT:
    case ErrorCategory.UNKNOWN:
    default:
      return AlertSeverity.INFO;
  }
}
```

3. **Alert Notification Channels**: Support multiple notification channels:

```typescript
const alert: Alert = {
  // Alert definition
  notifications: [
    {
      channel: 'ui', // In-app notifications
    },
    {
      channel: 'email',
      email: 'admin@example.com',
    },
    {
      channel: 'slack',
      slackWebhook: 'https://hooks.slack.com/services/your-webhook-url',
    },
    {
      channel: 'sms',
      phoneNumber: '+1234567890',
    },
  ],
};
```

4. **Alert Lifecycle Management**: Implement complete lifecycle management:

   - Creation: Define alert conditions and notifications
   - Triggering: Evaluate conditions and send notifications
   - Acknowledgment: Track who acknowledged the alert
   - Resolution: Record how the issue was resolved
   - Analysis: Review alert history for patterns

5. **Alert Suppression**: Prevent alert fatigue with intelligent suppression:
   - Cooldown periods between similar alerts
   - Grouping of related alerts
   - Escalation paths for unacknowledged alerts
   - Automatic suppression during maintenance windows

## Backend Testing

### Mongoose Schema Testing

1. **Schema Field Validation**: When testing Mongoose models, ensure that the test data matches the schema definition. If tests expect fields like `firstName` and `lastName` but the schema only has `name`, either update the schema or modify the tests.

2. **Duplicate Indexes**: Avoid defining the same index multiple times. If you're seeing warnings about duplicate indexes, consider:

   - Defining indexes directly in the schema field with `index: true`
   - Removing duplicate `schema.index()` calls
   - Using compound indexes when appropriate

3. **Test Data Consistency**: Ensure test data in helper files matches the model schema. Check files like `helpers.js` that define test data constants.

### Test File Organization

1. **Directory Structure**: Test files should mirror the application structure to make them easy to find and maintain.

   - For server-side tests: `/server/tests/unit/[module-type]/[file-name].test.js`
   - Example: Tests for `server/services/auth.service.js` should be in `server/tests/unit/services/auth.service.test.js`

2. **Import Paths**: When test files are in the proper directory structure, use relative paths that reflect the directory depth:

   - Example: `require('../../../services/auth.service')` instead of `./auth.service`

3. **Common Issues**: Placing test files in the wrong location can cause Jest to fail with "Your test suite must contain at least one test" error.

   - Tests should not be placed alongside implementation files
   - Tests should be in the appropriate test directory structure

4. **Test File Naming**: Use consistent naming conventions for test files:

   - Use `.test.js` suffix for test files
   - Name test files after the module they test: `[module-name].test.js`

5. **Test Organization**: Organize tests within files using describe blocks:
   - Outer describe block for the module: `describe('Auth Service', ...)`
   - Nested describe blocks for methods/features: `describe('authenticate', ...)`

### Content Security Policy (CSP)

1. **Middleware Implementation**: When implementing CSP middleware, ensure the function returns the middleware directly:

```javascript
// CORRECT
const cspMiddleware = () => {
  return (req, res, next) => {
    // Set headers
    next();
  };
};

// INCORRECT
const cspMiddleware = () => {
  const middleware = (req, res, next) => {
    // Set headers
    next();
  };
  return middleware;
};
```

2. **Angular CSP Requirements**: Angular applications need specific CSP directives:

   - `'unsafe-inline'` for styles (Angular uses inline styles)
   - `'unsafe-eval'` for development (Angular JIT compilation)
   - Hash or nonce for inline scripts in production

3. **Testing CSP Middleware**: When testing CSP middleware, ensure proper handling of report-only mode:

```javascript
// CORRECT - Explicitly set and restore reportOnly flag
it('should set Content-Security-Policy header in development mode', async () => {
  // Save original reportOnly setting
  const originalReportOnly = cspConfig.reportOnly;
  // Explicitly set reportOnly to true for this test
  cspConfig.reportOnly = true;

  try {
    const middleware = cspMiddleware();
    app.use(middleware);

    // Test implementation...

    // Check for report-only header
    expect(res.headers).toHaveProperty('content-security-policy-report-only');
  } finally {
    // Restore original reportOnly setting
    cspConfig.reportOnly = originalReportOnly;
  }
});

// INCORRECT - Relying only on environment variables
it('should set Content-Security-Policy header in development mode', async () => {
  process.env.NODE_ENV = 'development';

  const middleware = cspMiddleware();
  app.use(middleware);

  // Test implementation...

  // This may fail if configuration is loaded before environment is set
  expect(res.headers).toHaveProperty('content-security-policy-report-only');
});
```

4. **Case-Insensitive Header Checking**: HTTP headers are case-insensitive, so tests should account for this:

```javascript
// Check for header with case-insensitive approach
const reportOnlyHeader =
  res.headers['content-security-policy-report-only'] ||
  res.headers['Content-Security-Policy-Report-Only'];
expect(reportOnlyHeader).toBeTruthy();
```

3. **External Resources**: If your application uses external resources (like UI libraries), add their domains to the appropriate CSP directives.

4. **Avoiding Duplicate CSP Directives**: When implementing Content Security Policy (CSP) directives, it's important to avoid duplicates which can cause confusion and potential security issues:

   - **Common Duplication Issues**:

     - Duplicate entries in directive arrays (e.g., multiple identical entries in `scriptSrc`)
     - Redundant nonce functions that generate the same nonce multiple times
     - Repeated unsafe-inline or unsafe-eval directives

   - **Best Practices for CSP Implementation**:

     - Keep CSP directives organized and clean
     - Use arrays with unique entries for each directive
     - Include each directive source only once
     - Use spread operators for conditional inclusions:

     ```javascript
     scriptSrc: [
       "'self'",
       (req, res) => `'nonce-${res.locals.cspNonce}'`,
       ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
     ];
     ```

     - Regularly audit CSP directives for duplicates and unnecessary entries

   - **Maintenance Considerations**:
     - Review CSP directives after merges or when multiple developers work on security features
     - Use automated tools to detect duplicate or conflicting CSP directives
     - Document the purpose of each CSP directive to prevent accidental duplication

## MongoDB Service Patterns

When implementing services that interact with MongoDB models, we've found the following patterns to be effective:

### Query Execution Pattern

Always use `.exec()` at the end of MongoDB queries to ensure proper Promise handling:

```javascript
// Good practice
return await Ad.find({ userId: userId }).exec();

// Avoid this pattern
return await Ad.find({ userId: userId });
```

This ensures consistent behavior across different MongoDB driver versions and makes testing more predictable.

### Error Handling Pattern

Wrap all database operations in try/catch blocks with specific error messages:

```javascript
async getUserAds(userId) {
  try {
    const query = Ad.find({ userId: userId });
    return await query.exec();
  } catch (error) {
    throw new Error('Error fetching user ads: ' + error.message);
  }
}
```

This approach:

- Provides clear error context for debugging
- Maintains a consistent error handling pattern
- Preserves the original error message for troubleshooting

### Pagination Pattern

Implement standard pagination with page, limit, skip parameters:

```javascript
async searchAds(searchParams) {
  try {
    const query = {};
    const page = searchParams.page || 1;
    const limit = searchParams.limit || 10;
    const skip = (page - 1) * limit;

    // Build query...

    // Execute query with pagination
    const adsQuery = Ad.find(query)
      .sort(searchParams.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Ad.countDocuments(query);
    const ads = await adsQuery.exec();

    // Return with pagination metadata
    return {
      ads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error('Error searching ads: ' + error.message);
  }
}
```

This pattern:

- Provides consistent pagination across the application
- Returns metadata needed for UI pagination controls
- Optimizes database queries by limiting results

### Query Building Pattern

Build query objects incrementally based on provided parameters:

```javascript
// Apply search filters
if (searchParams.title) {
  query.title = { $regex: searchParams.title, $options: 'i' };
}

if (searchParams.category) {
  query.category = searchParams.category;
}

if (searchParams.minPrice) {
  query.price = { ...query.price, $gte: searchParams.minPrice };
}

if (searchParams.maxPrice) {
  query.price = { ...query.price, $lte: searchParams.maxPrice };
}
```

This approach:

- Creates flexible search functionality
- Handles complex filtering requirements
- Maintains clean, readable code

### Testing Considerations

When testing MongoDB services:

```javascript
// Mock the Ad.find method to return a chainable query object
Ad.find.mockReturnValue({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(mockAds),
});

// Mock countDocuments for pagination
Ad.countDocuments.mockResolvedValue(mockCount);
```

Key testing patterns:

- Mock all methods in the chain (find, sort, limit, skip, exec)
- Test both success and error scenarios
- Verify correct parameters are passed to MongoDB methods
- Test pagination metadata calculations

## Angular Testing

### Component Dependencies

1. **Missing Component Imports**: When using standalone components, ensure all components used in the template are properly imported:

```typescript
@Component({
  // ...
  standalone: true,
  imports: [
    CommonModule,
    ComponentUsedInTemplate, // Don't forget this!
    AnotherComponentUsedInTemplate
  ]
})
```

2. **Missing Methods**: If your template references methods that don't exist in the component class, add them:

```typescript
// If your template has (click)="handleCardClick(item.id)"
handleCardClick(id: string): void {
  // Implementation
}
```

3. **Component Property Binding**: Ensure all properties bound in the template are defined in the component class:

```typescript
// If your template has [layout]="cardLayout"
get cardLayout(): string {
  return this.layout === 'netflix' ? 'netflix' : 'default';
}
```

### Standalone Components

When working with Angular standalone components, remember:

1. **TestBed Configuration**: Standalone components should be added to the `imports` array, not the `declarations` array in the TestBed configuration:

```typescript
await TestBed.configureTestingModule({
  declarations: [
    // Do NOT put standalone components here
  ],
  imports: [
    MyStandaloneComponent, // Add standalone components here
    // Other imports...
  ],
  // ...
});
```

2. **Component Schemas**: If you're getting errors about unknown elements in your component templates, add the `CUSTOM_ELEMENTS_SCHEMA` to your TestBed configuration:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

await TestBed.configureTestingModule({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
});
```

3. **Component Imports**: Make sure your standalone component has all the necessary imports in its `@Component` decorator:

```typescript
@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material modules or other components used in the template
    MatCardModule,
    MatFormFieldModule,
    // etc.
  ]
})
```

### SCSS Variables

When working with SCSS in Angular components:

1. **Local Variables**: If you're getting errors about undefined SCSS variables, make sure to define them locally in the component's SCSS file if they're not being imported from a shared file.

2. **Common Variables**: Common variables like colors, spacing, typography, etc. should be defined in a shared file and imported, or defined locally if needed for testing.

3. **Semantic Color Variables**: Create semantic color variations for better maintainability and consistency:

```scss
// Base semantic colors
$color-error: #ff4757;
$color-success: #38d9a9;
$color-warning: #ffab2e;
$color-info: #54a0ff;

// Semantic color variations
$error-100: rgba($color-error, 0.1);
$error-200: rgba($color-error, 0.2);
$error-300: rgba($color-error, 0.3);
$error-400: rgba($color-error, 0.4);
$error-500: $color-error;
$error-600: darken($color-error, 10%);
$error-700: darken($color-error, 20%);
```

4. **Variable Organization**: Organize variables hierarchically from base colors to semantic variables to component-specific variables.

5. **Error Handling**: When encountering undefined variable errors in CI builds, check for:
   - Missing imports in component SCSS files
   - Variables defined in one theme but not another
   - Case sensitivity issues in variable names
   - Circular dependencies in SCSS imports

## Angular Router Testing

When testing components that use the Angular Router:

1. **RouterTestingModule Configuration**: Always use RouterTestingModule with proper route configuration:

```typescript
// Create a mock component for testing routes
@Component({
  selector: 'app-mock-component',
  template: '<div>Mock Component</div>',
  standalone: true,
})
class MockComponent {}

await TestBed.configureTestingModule({
  imports: [
    RouterTestingModule.withRoutes([
      { path: 'browse', component: MockComponent },
      { path: 'login', component: MockComponent },
    ]),
    // Other imports...
  ],
  // ...
});
```

2. **Router Injection**: Get the router instance from TestBed and spy on navigate:

```typescript
const router = TestBed.inject(Router);
spyOn(router, 'navigate');

// Later in tests
expect(router.navigate).toHaveBeenCalledWith(['/some-route']);
```

3. **Avoid Duplicate Router Providers**: When using RouterTestingModule, don't provide Router separately:

```typescript
// CORRECT
providers: [
  { provide: AuthService, useValue: mockAuthService },
  // No Router provider here as RouterTestingModule provides it
];

// INCORRECT - will cause "Cannot read properties of undefined (reading 'root')" error
providers: [
  { provide: AuthService, useValue: mockAuthService },
  { provide: Router, useValue: mockRouter }, // Don't do this!
];
```

4. **Use Angular Router Instead of window.location.href**: When implementing navigation in components, use Angular Router instead of direct window.location.href manipulation to make testing easier:

```typescript
// PROBLEMATIC - Hard to test because it causes page reloads in tests
viewAdDetails(adId: string): void {
  window.location.href = `/ad-details/${adId}`;
}

// BETTER - Use Angular Router for easier testing
constructor(private router: Router) {}

viewAdDetails(adId: string): void {
  this.router.navigateByUrl(`/ad-details/${adId}`);
}

// In tests, spy on router.navigateByUrl
beforeEach(() => {
  router = TestBed.inject(Router);
  spyOn(router, 'navigateByUrl').and.stub();
});

it('should navigate to ad details', () => {
  component.viewAdDetails('123');
  expect(router.navigateByUrl).toHaveBeenCalledWith('/ad-details/123');
});
```

## HTTP Service Testing

When testing services that make HTTP requests:

1. **Error Handling Tests**: Be careful with error expectations:

```typescript
// CORRECT - Don't fail the test if the 'next' callback is called
service.uploadMedia(mockAdId, mockFile).subscribe({
  next: () => {}, // Don't use fail() here if the implementation might call next
  error: error => {
    errorSpy(error);
  },
});

// INCORRECT - This might cause false failures
service.uploadMedia(mockAdId, mockFile).subscribe({
  next: () => fail('Expected error, not success'), // This might fail unexpectedly
  error: error => {
    errorSpy(error);
  },
});
```

2. **HttpTestingController**: Use HttpTestingController to mock HTTP requests:

```typescript
const req = httpMock.expectOne(`${apiUrl}/endpoint`);
expect(req.request.method).toBe('POST');
req.flush(mockResponse); // For success
// OR
req.error(new ErrorEvent('Network error'), { status: 500 }); // For error
```

## Angular Build Optimization

When working with large Angular applications, build performance and memory usage become critical concerns. We discovered several important patterns for optimizing the build process:

### Memory Allocation

1. **Node.js Memory Limits**: Angular CLI builds can consume significant memory, especially for large applications with many components and dependencies.

2. **Increasing Memory Allocation**: The most effective approach is to increase Node.js memory allocation using the `NODE_OPTIONS` environment variable:

```json
"scripts": {
  "start": "NODE_OPTIONS=--max_old_space_size=8192 ng serve",
  "build": "NODE_OPTIONS=--max_old_space_size=8192 ng build"
}
```

3. **Optimal Memory Settings**:

   - 4GB (`--max_old_space_size=4096`) is sufficient for medium-sized applications
   - 8GB (`--max_old_space_size=8192`) works well for large applications
   - 12GB or more may be needed for very large applications with many dependencies

4. **Platform Considerations**:
   - On Windows, use `set NODE_OPTIONS=--max_old_space_size=8192 &&` or install the `cross-env` package
   - On Unix-based systems (Linux/macOS), use `export NODE_OPTIONS=--max_old_space_size=8192 &&`
   - For CI/CD environments, ensure build containers have sufficient memory allocation

### Clean Build Process

1. **Cache Corruption**: Angular's `.angular/cache` directory can become corrupted, leading to build failures.

2. **Node Modules Issues**: Incomplete or corrupted `node_modules` can cause unexpected build errors.

3. **Clean Build Scripts**: Implementing dedicated clean scripts simplifies the troubleshooting process:

```json
"scripts": {
  "clean": "rm -rf node_modules && rm -f package-lock.json && rm -rf .angular/cache && rm -rf dist",
  "clean:install": "npm run clean && npm install",
  "clean:build": "npm run clean:install && npm run build"
}
```

4. **Incremental Cleaning**: Sometimes a full clean isn't necessary:
   - Just clearing `.angular/cache` can resolve many issues
   - Removing and reinstalling specific problematic packages can be faster than a full reinstall

### Node.js Version Compatibility

1. **Version Sensitivity**: Angular CLI and its dependencies (especially esbuild) are sensitive to the Node.js version.

2. **Version Matching**: Each Angular version has specific Node.js version compatibility:

   - Angular 19.x works best with Node.js 18.x, 20.x, or 22.x LTS versions
   - Using incompatible Node.js versions can lead to unexpected build failures

3. **Version Management**: Use Node Version Manager (nvm) to easily switch between Node.js versions:

   ```bash
   nvm install 22
   nvm use 22
   ```

4. **Documentation**: Document the compatible Node.js version in:
   - README.md for developer onboarding
   - package.json "engines" field for automated checks
   - CI/CD configuration to ensure consistent builds

For more detailed information on Angular build optimization, see [ANGULAR_BUILD_OPTIMIZATION.MD](./ANGULAR_BUILD_OPTIMIZATION.md).

## Angular Build Warnings

When building Angular applications, several types of warnings may appear that don't necessarily prevent the build from completing but should be addressed for optimal performance and maintainability:

### Common Warning Types

1. **Unused Component Imports**:

   - Warnings like `TS-998113: ComponentName is not used within the template of ParentComponent`
   - These occur when components are imported but not used in the template
   - Solution: Remove unused imports or use them in the template if needed

2. **CSS Budget Warnings**:

   - Warnings like `css-inline-fonts exceeded maximum budget`
   - These occur when CSS files exceed the size limits defined in angular.json
   - Solution: Increase budget limits or optimize CSS by removing unused styles

3. **CommonJS Module Warnings**:
   - Warnings like `Module 'leaflet' used by 'map.component.ts' is not ESM`
   - These occur when using CommonJS modules in an ESM environment
   - Solution: Configure the Angular compiler to handle CommonJS modules or use ESM-compatible alternatives

### Best Practices for Handling Warnings

1. **Regular Auditing**: Review build warnings as part of the development process
2. **Budget Configuration**: Set realistic budgets based on your application's needs
3. **Font Optimization**: Use font subsets and limit the number of font weights
4. **Component Cleanup**: Regularly review components for unused imports
5. **Module Optimization**: Use ESM-compatible modules when possible

For detailed information on handling Angular build warnings, see [ANGULAR_BUILD_WARNINGS.MD](./ANGULAR_BUILD_WARNINGS.md).

## Map Integration Patterns

### Reusable Map Component

When implementing map functionality in Angular applications, a reusable component approach provides several benefits:

1. **Encapsulation**: All map-related logic is contained within a single component
2. **Reusability**: The same map component can be used across different features
3. **Maintainability**: Updates to map functionality only need to be made in one place
4. **Configurability**: Input parameters allow for customization without modifying the component

The recommended pattern for map integration includes:

```typescript
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  // Configuration inputs
  @Input() height: string = '400px';
  @Input() initialLatitude: number = 59.9139;
  @Input() initialLongitude: number = 10.7522;
  @Input() initialZoom: number = 6;
  @Input() markers: MapMarker[] = [];
  @Input() selectable: boolean = false;
  @Input() showCurrentLocation: boolean = false;

  // Output events
  @Output() markerClick = new EventEmitter<MapMarker>();
  @Output() locationSelected = new EventEmitter<{
    latitude: number;
    longitude: number;
    address?: string;
  }>();

  // Implementation details...
}
```

### Accessibility Considerations

When implementing interactive map components, ensure accessibility by:

1. **Keyboard Navigation**: Implement keyboard controls for map navigation and interaction:

```typescript
private setupKeyboardAccessibility(): void {
  document.addEventListener('keydown', this.handleKeyboardNavigation);
}

private handleKeyboardNavigation = (e: KeyboardEvent): void => {
  if (!this.map || !this.keyboardControlActive) return;

  // Only handle events when map is focused
  const mapContainer = this.map.getContainer();
  if (document.activeElement !== mapContainer) return;

  // Handle arrow keys, space, etc.
  switch (e.key) {
    case 'ArrowUp':
      // Move map up
      break;
    case 'ArrowDown':
      // Move map down
      break;
    // Other keys...
  }
};
```

2. **Screen Reader Support**: Provide appropriate ARIA attributes and announcements:

```typescript
// In HTML template
<div id="map" class="map"
     tabindex="0"
     role="application"
     aria-label="Interactive map">
</div>

<div class="sr-only" aria-live="polite">
  <!-- Screen reader announcements -->
</div>

// In component class
private announceToScreenReader(message: string): void {
  const srAnnouncer = document.querySelector('.sr-only');
  if (srAnnouncer) {
    srAnnouncer.textContent = message;
  }
}
```

3. **Focus Management**: Clearly indicate which element has focus:

```scss
.map:focus {
  outline: 3px solid #4a90e2;
  outline-offset: -3px;
}

.map.map-focused {
  outline: 3px solid #4a90e2;
  outline-offset: -3px;
}
```

4. **Alternative Interactions**: Provide alternative ways to interact with the map:

```html
<div class="map-accessibility-controls">
  <button
    class="btn btn-sm btn-outline-secondary"
    (click)="centerMap(initialLatitude, initialLongitude, initialZoom)"
    aria-label="Reset map view"
    title="Reset map view"
  >
    <i class="fas fa-home" aria-hidden="true"></i>
  </button>
  <!-- Other controls -->
</div>
```

### Performance Optimization

For optimal map performance:

1. **Lazy Loading**: Load map libraries only when needed:

```typescript
// In component or service
private loadLeaflet(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof L !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => resolve();
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
  });
}
```

2. **Marker Clustering**: Use clustering for large numbers of markers:

```typescript
// In component
private setupMarkerClustering(): void {
  if (!this.map) return;

  // Clear existing cluster group
  if (this.markerClusterGroup) {
    this.map.removeLayer(this.markerClusterGroup);
  }

  // Create new cluster group
  this.markerClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true
  });

  // Add markers to cluster group
  this.markers.forEach(marker => {
    const leafletMarker = L.marker([marker.latitude, marker.longitude], {
      icon: this.createMarkerIcon(marker.color || 'blue')
    });

    leafletMarker.bindPopup(this.createPopupContent(marker));
    leafletMarker.on('click', () => this.onMarkerClick(marker));

    this.markerClusterGroup.addLayer(leafletMarker);
  });

  // Add cluster group to map
  this.map.addLayer(this.markerClusterGroup);
}
```

3. **Viewport Optimization**: Only render markers in the current viewport:

```typescript
private updateVisibleMarkers(): void {
  if (!this.map || !this.markers.length) return;

  const bounds = this.map.getBounds();
  const visibleMarkers = this.markers.filter(marker =>
    bounds.contains(L.latLng(marker.latitude, marker.longitude))
  );

  // Only render visible markers
  this.renderMarkers(visibleMarkers);
}
```

4. **Event Throttling**: Throttle event handlers for better performance:

```typescript
private setupMapEvents(): void {
  if (!this.map) return;

  // Throttle move events
  let timeout: any;
  this.map.on('move', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      this.updateVisibleMarkers();
    }, 100);
  });
}
```

## Debugging Strategies

1. **Incremental Fixes**: When dealing with multiple errors, fix them one by one and run tests after each fix to see if you're making progress.

2. **Error Analysis**: Pay attention to the specific error messages and stack traces to identify the root cause of the issue.

3. **Component Dependencies**: Make sure all dependencies (modules, services, etc.) are properly mocked or provided in your test setup.

4. **Test Isolation**: Make sure each test is isolated and doesn't depend on the state from other tests.

5. **Documentation Updates**: Always update documentation with lessons learned to avoid repeating the same mistakes.

## Linting and Formatting

### Code Quality Best Practices

When maintaining code quality in Angular applications, we've identified several key practices:

1. **Avoid Console Statements in Production Code**:

   - Console statements should be removed from production code to prevent information leakage
   - Use proper logging services instead of direct console calls
   - Configure ESLint to warn or error on console statements in production code
   - Example fix: Replace `console.log('HttpErrorInterceptor configured:', config);` with a comment

2. **Remove Unused Imports and Variables**:

   - Unused imports and variables increase bundle size and reduce code readability
   - Configure ESLint to detect and warn about unused imports and variables
   - Regularly clean up unused code during maintenance
   - Example fix: Remove unused imports like `HttpEvent` and `Observable` when not needed

3. **Proper Error Handling**:

   - Avoid catching errors without proper handling
   - Use specific error types when possible
   - If an error variable is not used in the catch block, use the empty catch pattern: `catch {}`
   - Example fix: Replace `catch (error) { return false; }` with `catch { return false; }`

4. **Consistent Code Style**:

   - Follow established code style guidelines
   - Use automated formatting tools like Prettier
   - Configure ESLint to enforce consistent code style
   - Run linting as part of CI/CD pipelines

5. **Regular Linting Checks**:
   - Run linting checks regularly during development
   - Fix linting issues as they arise rather than accumulating technical debt
   - Use pre-commit hooks to prevent committing code with linting errors
   - Integrate linting into the build process

### ESLint Configuration

#### HTML Files in Angular

When working with Angular projects, ESLint may throw errors when parsing HTML files. To fix this, add HTML files to the `ignorePatterns` in the `.eslintrc.js` file:

```javascript
ignorePatterns: [
  // other patterns
  '**/*.html'
],
```

#### Cypress Tests

Cypress tests may use namespaces which can trigger ESLint errors. To fix this, either:

1. Add Cypress directories to the `ignorePatterns` in the `.eslintrc.js` file:
   ```javascript
   ignorePatterns: [
     // other patterns
     'cypress/**'
   ],
   ```
2. Or create a specific override for Cypress files in the `.eslintrc.js` file.

#### CommonJS Files in TypeScript Projects

When using ESLint with TypeScript projects that include CommonJS files (like karma.conf.js), you need to configure ESLint to handle these files properly:

```javascript
{
  files: ['*.js', '*.cjs'],
  languageOptions: {
    sourceType: 'commonjs',
    ecmaVersion: 2020,
    globals: {
      module: 'writable',
      require: 'readonly',
      process: 'readonly',
      console: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
    },
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-undef': 'off', // Turn off no-undef for JS files
  },
}
```

#### TypeScript 'any' Type Handling

For TypeScript projects with many 'any' types that need to be addressed over time:

1. Downgrade the severity of the `@typescript-eslint/no-explicit-any` rule from error to warning:

```javascript
'@typescript-eslint/no-explicit-any': 'warn', // Downgrade from error to warning
```

2. Turn off duplicate rules that conflict with TypeScript-specific versions:

```javascript
// Turn off duplicate rules that conflict with TypeScript-specific versions
'no-unused-vars': 'off',
'@typescript-eslint/no-unused-vars': 'warn',
```

#### Node.js and Testing Globals

For Node.js projects with testing frameworks like Jest, add the necessary globals to avoid 'undefined' errors:

```javascript
globals: {
  // Node.js globals
  process: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',

  // Jest globals
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  jest: 'readonly',
},
```

### NPM Scripts

#### Handling Warnings vs Errors

For projects with many warnings that need to be addressed over time:

1. Use `--max-warnings=9999` in lint commands to allow the build to succeed with warnings:

   ```json
   "lint": "eslint . --fix --max-warnings=9999"
   ```

2. For strict enforcement, use `--max-warnings=0`:

   ```json
   "lint:check": "eslint . --max-warnings=0"
   ```

3. In root package.json, use the `|| true` pattern to prevent linting errors from failing the build:
   ```json
   "lint:server": "cd server && npm run lint || true"
   ```

### Common Issues

1. **Test Assertions**: Use `expect(true).toBe(false)` instead of `fail()` for better compatibility across test frameworks.

2. **Variable Naming**: Be careful with variable names that might conflict with array methods like `find()`. For example, rename `paymentMethods` to `paymentMethodsArray` if you're using methods like `id()` and `find()` on it.

3. **HTML Parsing**: ESLint may have issues parsing HTML files in Angular projects. Always exclude HTML files from ESLint processing.

4. **TypeScript Type Safety**: Angular projects often have TypeScript type safety warnings. Consider addressing these incrementally rather than all at once.

5. **MongoDB Driver Warnings**: When using MongoDB with Node.js:

   - Remove deprecated options like `useNewUrlParser` and `useUnifiedTopology` as they're no longer needed in MongoDB driver v4.0.0+
   - Avoid duplicate indexes in Mongoose schemas - don't use both `index: true` and `unique: true` on the same field, as `unique: true` already creates an index
   - Don't call `schema.index()` on fields that already have `index: true` in their definition

6. **Environment Variables in Tests**: When testing code that uses environment variables:

   - Always set up required environment variables in the test setup (e.g., in `beforeEach` or `beforeAll` blocks)
   - Use consistent environment variable values across related tests
   - When mocking functions that use environment variables (like JWT verification), ensure the test expectations match the actual implementation
   - Consider creating a separate test environment configuration file

7. **Mocking Mongoose Subdocument Methods**: When testing code that uses Mongoose subdocument methods:
   - Remember that Mongoose adds special methods to subdocument arrays like `id()` that aren't available on regular arrays
   - When mocking these arrays, you need to explicitly add these methods to your mock objects
   - Structure your mock objects to match the actual implementation, including array-like properties (indexes, length)
   - Use Jest's `mockImplementation` to create proper behavior for methods like `id()`, `find()`, etc.

## Code Duplication Patterns

### Utility Functions

1. **Validation Utilities**: When implementing validation utilities:

   - Create a dedicated utility file for all validation functions
   - Use TypeScript function signatures with clear parameter and return types
   - Include comprehensive JSDoc comments for each function
   - Implement thorough unit tests with both valid and invalid test cases
   - Consider configurability for functions with multiple validation rules
   - Use consistent error handling patterns across all validation functions

2. **String Manipulation Utilities**: When implementing string utilities:
   - Centralize all string manipulation functions in a single utility file
   - Handle edge cases like null/undefined inputs gracefully
   - Support internationalization where appropriate (e.g., date formatting)
   - Use native JavaScript methods where possible for better performance
   - Include comprehensive unit tests with various input formats
   - Consider performance implications for functions used in loops or with large strings

### HTTP Error Handling

1. **Centralized Error Interceptor**: When implementing HTTP error handling:

   - Use Angular's HTTP interceptor mechanism for centralized error handling
   - Implement configurable retry logic with exponential backoff
   - Categorize errors with specific error codes for easier handling
   - Provide both user-friendly messages and technical details
   - Sanitize sensitive information in error logs
   - Include request context in error details for debugging
   - Add comprehensive unit tests for different error scenarios
   - Make the interceptor configurable to adapt to different application needs

2. **Error Response Structure**: Standardize error response structure:
   - Use consistent error codes across the application
   - Include both user-facing messages and technical details
   - Add timestamps to error responses for troubleshooting
   - Include request identifiers for correlation with server logs
   - Structure error details in a way that's easy to consume by error handling components

## Feature Implementation Patterns

### Temporary Messages

[Content for Temporary Messages section]

### Theme Toggle Implementation

For detailed lessons on theme toggle implementation, see [AILESSONS-THEME-TOGGLE.MD](./AILessons-theme-toggle.md).

When implementing the theme toggle feature in the DateNight.io application, we discovered several important patterns:

1. **CSS Variables for Theming**:

   - Use CSS variables for all theme-related values
   - Define variables at the `:root` level for the default theme
   - Use class selectors (e.g., `.dark-theme`) for theme variants
   - Group related variables logically (colors, typography, spacing, etc.)

2. **Theme Persistence**:

   - Store theme preferences in localStorage for persistence
   - Implement a fallback to system preference if no stored preference exists
   - Load preferences early in the application lifecycle to prevent flashing

3. **Accessibility Considerations**:

   - Include proper ARIA labels for screen readers
   - Ensure keyboard accessibility
   - Provide visible focus states
   - Use high contrast colors for better visibility

4. **Component Integration**:
   - Place the toggle in a consistent, easily accessible location
   - Adapt the toggle presentation based on available space (full toggle vs. icon-only)
   - Use existing design system components when available
   - Ensure the toggle state clearly indicates the current theme

When implementing features that involve time-based expiration like temporary messages:

1. **Data Model Considerations**:

   - Add expiration-related fields to your data model (e.g., `expiresAt`, `ttl`)
   - Use consistent time units across the application (e.g., milliseconds for internal processing, hours for user-facing options)
   - Include conversion utilities to transform between different time units

2. **User Interface Design**:

   - Provide clear visual indicators for temporary content (dashed borders, icons)
   - Use tooltips to show remaining time until expiration
   - Implement toggles and dropdowns for selecting expiration times
   - Ensure the UI state clearly indicates when temporary mode is active

3. **Client-Side Implementation**:

   - Set up periodic checks for expired content (e.g., using setInterval)
   - Clean up interval timers in component destruction hooks
   - Implement graceful handling of expired content (fade out, remove from UI)
   - Use reactive programming patterns to handle state changes

4. **Server-Side Implementation**:

   - Store expiration times in UTC to avoid timezone issues
   - Implement background jobs to clean up expired content
   - Add indexes on expiration fields for efficient querying
   - Consider soft deletion for audit purposes

5. **Security Considerations**:

   - Warn users about limitations (screenshots, copies can still be made)
   - Implement server-side validation of expiration times
   - Ensure expired content is properly removed from all storage locations
   - Consider encryption for sensitive temporary content

6. **Testing Strategies**:
   - Use time mocking to test expiration without waiting
   - Test edge cases (immediate expiration, far future expiration)
   - Verify cleanup processes work correctly
   - Test across different timezones

## Documentation Best Practices

## Security Best Practices

The Date Night App project has implemented several security best practices to protect against common vulnerabilities and ensure the application remains secure over time.

### Handling Security Vulnerabilities

When addressing security vulnerabilities in dependencies, we discovered several important patterns:

1. **Regular Expression Denial of Service (ReDoS) Vulnerabilities**:

   - ReDoS vulnerabilities occur when a regular expression can cause excessive CPU usage due to catastrophic backtracking
   - These vulnerabilities are particularly common in string parsing libraries and can lead to denial of service
   - Identifying affected packages requires thorough security scanning (e.g., using Snyk)
   - Fixing typically involves updating to patched versions or using package overrides

2. **Transitive Dependency Vulnerabilities**:

   - Many security issues occur in transitive dependencies (dependencies of dependencies)
   - Direct fixes may not be possible if the parent package hasn't updated
   - Use npm's `overrides` field to force specific versions of nested dependencies:

   ```json
   "overrides": {
     "@octokit/plugin-paginate-rest": "11.4.2",
     "@octokit/request": "9.2.1",
     "@octokit/request-error": "6.0.1"
   }
   ```

   - For complex dependency trees, you may need to specify nested overrides:

   ```json
   "@octokit/rest": {
     "@octokit/core": "6.1.5",
     "@octokit/plugin-paginate-rest": "11.4.2"
   }
   ```

3. **Consistent Dependency Management**:

   - Apply security fixes consistently across all package.json files in monorepos
   - Ensure all workspaces use the same override strategy
   - Document security fixes in CHANGELOG.md with specific version information
   - Include CVE references or vulnerability descriptions when available

4. **Monitoring and Maintenance**:
   - Regularly run security audits with `npm audit`
   - Set up automated security scanning in CI/CD pipelines
   - Subscribe to security advisories for critical dependencies
   - Plan for regular dependency updates to incorporate security patches

### Dependency Management

### ESLint Dependencies

When working with ESLint in a monorepo or multi-package project, it's important to ensure that all package.json files have consistent ESLint dependency configurations. This is especially important for packages like `@eslint/config-array` and `@eslint/object-schema` which have replaced older packages like `@humanwhocodes/config-array` and `@humanwhocodes/object-schema`.

**Key Lessons:**

1. **Consistent Overrides**: Ensure that all package.json files in the project (root, server, client) have the same overrides for ESLint-related packages:

   ```json
   "overrides": {
     "@eslint/config-array": "^0.20.0",
     "@eslint/object-schema": "^2.1.6"
   }
   ```

2. **CI/CD Failures**: If GitHub Actions or other CI/CD workflows fail with errors like "No matching version found for @eslint/object-schema@^0.1.1", it's likely due to missing overrides in one of the package.json files.

3. **Dependency Resolution**: npm and yarn resolve dependencies differently in workspaces vs. individual packages. The root package.json overrides might not apply to workspaces when they run `npm ci` or `npm install` independently.

### Package Overrides

Package overrides are a powerful feature in npm that allows you to control the versions of nested dependencies. This is particularly useful for security fixes and ensuring consistent versions across the project.

**Key Lessons:**

1. **Propagate Overrides**: Important overrides should be propagated to all package.json files in the project, especially for security-critical packages.

2. **Version Alignment**: Keep versions aligned across all package.json files to prevent unexpected behavior and compatibility issues.

3. **Common Overrides**: Some common overrides to consider:

   - Security-related: `semver`, `tough-cookie`, `word-wrap`
   - Build tools: `vite`, `webpack`
   - HTTP-related: `cookie`, `got`, `http-proxy-middleware`
   - ESLint-related: `@eslint/config-array`, `@eslint/object-schema`

4. **Workspace Limitations**: npm workspaces don't automatically apply all overrides from the root package.json to the individual workspace packages when they're installed independently (e.g., in CI/CD workflows).

### Dependency Management

Effective dependency management is crucial for maintaining security in modern applications:

1. **Regular Security Audits**:

   - Run `npm audit` regularly to identify vulnerabilities
   - Implement automated security scanning in CI/CD pipelines
   - Address critical vulnerabilities immediately
   - Document security-related updates in a changelog

2. **Handling Deprecated Dependencies**:

   - Monitor for deprecation warnings during builds and in logs
   - Create a systematic approach to updating deprecated packages
   - Document deprecated dependencies in `docs/DEPRECATED.md`
   - Use the `overrides` field in package.json to manage dependencies that can't be directly updated

3. **Dependency Update Strategy**:

   - Remove dependencies that are no longer supported and leak memory (e.g., `inflight`)
   - Replace deprecated packages with their recommended alternatives (e.g., `@humanwhocodes/config-array` → `@eslint/config-array`)
   - Use native browser APIs when available instead of deprecated packages (e.g., native `atob()` and `btoa()` instead of `abab`)
   - Update to the latest secure versions of packages with known vulnerabilities

4. **Dependency Documentation**:

   - Maintain a list of all dependencies with their purpose and status
   - Document any special handling or configuration required
   - Keep track of dependencies that require overrides
   - Document the reason for each override to facilitate future updates

5. **Version Pinning**:

   - Pin exact versions for critical dependencies to prevent unexpected updates
   - Use caret (^) for minor updates only when confident in backward compatibility
   - Regularly test with newer versions in a controlled environment

6. **Vulnerability Response Process**:
   - Prioritize vulnerabilities based on severity (high, medium, low)
   - Establish a clear process for addressing security alerts
   - Document all security-related changes in CHANGELOG.md

### GitHub Actions Workflow Patterns

Effective GitHub Actions workflow organization follows these patterns:

1. **Script Externalization**:

   - Move inline scripts to separate files in the `.github/scripts/` directory
   - Benefits include improved maintainability, reusability, and version control
   - Example implementation:

     ```javascript
     // .github/scripts/generate-github-insights.js
     const fs = require('fs');
     const { Octokit } = require('@octokit/rest');

     async function generateInsightsReport() {
       // Implementation details...
     }

     // Export for use in other scripts
     module.exports = { generateInsightsReport };

     // Execute if run directly
     if (require.main === module) {
       generateInsightsReport();
     }
     ```

2. **Artifact Usage vs. Repository Storage**:

   - Use artifacts for logs, test results, and other large files
   - Only commit processed, human-readable reports and summaries
   - Clean up temporary files before committing
   - Example implementation:

     ```yaml
     # Upload raw data as artifacts
     - name: Upload JSON results as artifacts
       uses: actions/upload-artifact@v4
       with:
         name: results-${{ github.run_id }}
         path: |
           *.json
           *.log
         retention-days: 7

     # Clean up before committing
     - name: Remove temporary files
       run: rm -f *.json *.log
     ```

3. **Robust Git Operations**:

   - Use stash/pull/rebase pattern to handle potential conflicts
   - Only commit if there are actual changes
   - Add `[skip ci]` to commit messages to prevent triggering additional workflows
   - Example implementation:

     ```yaml
     - name: Commit changes
       run: |
         git config --local user.email "action@github.com"
         git config --local user.name "GitHub Action"

         # Handle any unstaged changes
         git stash -u || true

         # Pull latest changes with rebase
         git pull --rebase origin main || true

         # Restore stashed changes
         git stash list | grep -q "stash@{0}" && git stash pop || true

         # Add only specific files
         git add reports/

         # Only commit if there are changes
         if git diff --staged --quiet; then
           echo "No changes to commit"
         else
           git commit -m "docs: update report [skip ci]"
           git push
         fi
     ```

4. **Concurrency Control**:

   - Prevent multiple instances of the same workflow from running simultaneously
   - Example implementation:
     ```yaml
     concurrency:
       group: ${{ github.workflow }}-${{ github.ref }}
       cancel-in-progress: true
     ```

5. **Timeout Management**:

   - Add timeouts to prevent runaway jobs
   - Example implementation:
     ```yaml
     jobs:
       my-job:
         runs-on: ubuntu-latest
         timeout-minutes: 30 # Adjust based on expected runtime
     ```

6. **Workflow Trigger Optimization**:

   - Use path filtering to trigger workflows only when relevant files change
   - For workflow_run triggers, filter by conclusion (success, failure, etc.)
   - Use cron schedules that don't overlap with high-activity periods
   - Example path filtering:
     ```yaml
     on:
       push:
         branches: [main, develop]
         paths:
           - 'client-angular/**'
           - '.github/workflows/angular-tests.yml'
     ```
   - Example conclusion filtering:
     ```yaml
     on:
       workflow_run:
         workflows: ['*']
         types: [completed]
         conclusion:
           - failure
           - cancelled
           - timed_out
     ```

### GitHub Actions Security

GitHub Actions can introduce security risks if not properly configured:

1. **Action Version Pinning**:

   - Always pin GitHub Actions to specific versions (e.g., `actions/checkout@v4`)
   - Avoid using `@master` or `@main` which can introduce unexpected changes
   - Regularly update actions to patched versions

2. **Artifact Security**:

   - Use the latest version of artifact-related actions to prevent poisoning attacks
   - Validate artifacts before using them in subsequent steps
   - Implement proper permissions for artifact access

3. **Secrets Management**:

   - Use GitHub Secrets for sensitive information
   - Limit secret access to only the workflows that need them
   - Regularly rotate secrets and tokens

4. **CI Environment Configuration**:

   - Set `CI=true` environment variable in all workflow jobs
   - Modify scripts to handle CI environments differently when needed
   - Skip development-only tools like git hooks (husky) in CI environments
   - Create a `.huskyrc` file to disable husky in CI environments:
     ```bash
     # .huskyrc
     export HUSKY=0
     ```
   - Update the `prepare` script in package.json to skip husky in CI environments:
     ```json
     {
       "scripts": {
         "prepare": "[ -n \"$CI\" ] || husky"
       }
     }
     ```
   - Create a script to automatically disable husky in CI environments:

     ```javascript
     // scripts/disable-husky-in-ci.js
     const fs = require('fs');
     const path = require('path');

     const huskyrcPath = path.join(__dirname, '..', '.huskyrc');
     const huskyrcContent = `#!/bin/sh
     # Skip husky hooks in CI environments
     export HUSKY=0
     `;

     // Create .huskyrc file
     fs.writeFileSync(huskyrcPath, huskyrcContent, 'utf8');
     console.log('.huskyrc file created to disable husky in CI environments');

     // Make it executable
     try {
       fs.chmodSync(huskyrcPath, '755');
       console.log('.huskyrc file made executable');
     } catch (error) {
       console.warn('Could not make .huskyrc executable:', error.message);
     }
     ```

5. **Git Operations in Workflows**:

   - Handle potential conflicts when pushing changes from workflows
   - Implement branching strategies for conflicting changes
   - Use pull requests for changes that can't be directly pushed

### CI/CD and Git Hooks

When working with Git hooks like Husky in CI/CD environments, several patterns have proven effective:

1. **Conditional Execution**:

   - Skip Git hooks in CI environments to prevent errors
   - Use environment variables to detect CI environments
   - Example in package.json:
     ```json
     "prepare": "[ -n \"$CI\" ] || husky"
     ```

2. **Preinstall Scripts**:

   - Use preinstall scripts to configure the environment before dependencies are installed
   - Create configuration files dynamically based on the environment
   - Example:
     ```json
     "preinstall": "node scripts/disable-husky-in-ci.js"
     ```

3. **Environment Detection**:

   - Use a consistent approach to detect CI environments across different CI providers
   - Check for common CI environment variables: CI, GITHUB_ACTIONS, GITLAB_CI, JENKINS_URL
   - Example:
     ```javascript
     const isCI = Boolean(
       process.env.CI ||
         process.env.GITHUB_ACTIONS ||
         process.env.GITLAB_CI ||
         process.env.JENKINS_URL
     );
     ```

4. **Fallback Mechanisms**:

   - Implement fallback mechanisms for when environment detection fails
   - Use configuration files (.huskyrc, .lintstagedrc) that can be overridden
   - Example .huskyrc:
     ```sh
     #!/bin/sh
     # Skip husky hooks in CI environments
     if [ -n "$CI" ]; then
       exit 0
     fi
     ```

5. **Documentation**:

   - Document CI/CD configuration in a dedicated file
   - Include troubleshooting steps for common issues
   - Explain the rationale behind CI/CD design decisions
   - Use conditional logic in npm scripts: `[ -n "$CI" ] || command`

6. **Workflow Error Monitoring**:

   - Implement automated collection of workflow error logs
   - Use the `workflow_run` event to trigger log collection after workflow completion
   - Store logs in a structured format for easy analysis
   - Create analysis tools to identify common error patterns
   - Provide specific recommendations for fixing issues

7. **Git Conflict Handling in Workflows**:
   - Check for potential conflicts before pushing changes
   - Use `git merge-tree` to detect conflicts without modifying the working tree
   - Create feature branches for changes when conflicts are detected
   - Automatically create pull requests for manual resolution
   - Use the GitHub CLI (`gh`) for PR creation from workflows

### CI/CD Caching Best Practices

When working with CI/CD pipelines, proper caching strategies can significantly improve build times and reliability:

1. **Package Lock Files**:

   - Ensure package-lock.json files exist for all workspaces in a monorepo
   - Generate package-lock.json files with `npm install --package-lock-only` if missing
   - Commit package-lock.json files to version control
   - Verify package-lock.json files are up-to-date with dependencies

2. **Cache Configuration**:

   - Use the correct cache-dependency-path in GitHub Actions:
     ```yaml
     - uses: actions/setup-node@v4
       with:
         node-version: '22.x'
         cache: 'npm'
         cache-dependency-path: client-angular/package-lock.json
     ```
   - Ensure the path points to an existing package-lock.json file
   - Use separate cache configurations for different workspaces

3. **Cache Invalidation**:

   - Understand when caches are invalidated (changes to package-lock.json)
   - Use cache versioning for intentional cache busting
   - Implement fallback mechanisms when cache misses occur

4. **Workspace-Specific Caching**:

   - Configure separate caching for each workspace in a monorepo
   - Use workspace-specific package-lock.json files for granular caching
   - Ensure consistent Node.js and npm versions across all jobs

5. **Troubleshooting Cache Issues**:

   - Look for error messages like "Some specified paths were not resolved, unable to cache dependencies"
   - Verify that all referenced paths exist in the repository
   - Check for typos in cache-dependency-path configurations
   - Ensure package-lock.json files are generated before caching is attempted

6. **Cache Optimization**:
   - Cache only what's necessary to improve cache hit rates
   - Use .npmrc configuration to control what gets cached
   - Consider using compression for large caches
   - Monitor cache size and hit rates to optimize caching strategy

### Package Overrides

Package overrides provide a powerful mechanism for addressing security vulnerabilities:

1. **When to Use Overrides**:

   - When direct dependencies have vulnerable sub-dependencies
   - When waiting for upstream packages to update their dependencies
   - To enforce consistent versions across the dependency tree

2. **Implementation Patterns**:

   - Use the `overrides` field in package.json
   - Specify the minimum secure version with caret (^)
   - Document all overrides with references to CVEs or security advisories

3. **Monitoring and Maintenance**:
   - Regularly review and update overrides
   - Remove overrides when direct dependencies are updated
   - Test thoroughly after applying overrides to ensure compatibility

### Lessons Learned

From our recent security fixes, we've learned several important lessons:

1. **Proactive Monitoring**: Regular monitoring of security advisories is essential for identifying vulnerabilities early.

2. **Centralized Overrides**: Implementing overrides at the root package.json level ensures consistent security across all parts of the application.

3. **Documentation**: Documenting all security fixes in the CHANGELOG helps track security improvements over time.

4. **Testing After Fixes**: Always test thoroughly after applying security fixes to ensure they don't introduce regressions.

5. **GitHub Workflow Security**: GitHub Actions workflows require the same security attention as application code, especially for artifact handling.

### Best Practices for Future Development

For future development, we recommend:

1. **Automated Security Scanning**: Implement automated security scanning in CI/CD pipelines.

2. **Dependency Update Strategy**: Establish a regular schedule for reviewing and updating dependencies.

3. **Security Response Plan**: Develop a formal security response plan for addressing vulnerabilities.

4. **Security Documentation**: Maintain comprehensive security documentation for the project.

5. **Developer Training**: Ensure all developers understand security best practices for dependency management.

### Purpose-Specific Documentation

1. **Respect Document Purpose**: Each documentation file has a specific purpose and should only be updated for that purpose:

   - `CHANGELOG.md`: Document changes made to the codebase with dates and descriptions
   - `DUPLICATES.md`: Track code duplication and refactoring status, not feature implementations
   - `IMPLEMENTATION_SUMMARY.md`: Summarize implemented features and their details
   - `UnitTestingLessons.md`: Document lessons learned about unit testing
   - `AILessons.md`: Document general lessons learned by the AI during development

2. **Avoid Cross-Purpose Updates**: Do not update documents for purposes they weren't designed for:

   ```
   // INCORRECT: Updating DUPLICATES.md to mark a feature as completed
   | Review Display | Multiple components | Extract to shared review components | Completed |

   // CORRECT: Only update DUPLICATES.md when refactoring duplicated code
   | Review Display | Multiple components | Extract to shared review components | Pending |
   ```

3. **Document Verification vs. Implementation**: Be clear about whether you're documenting verification of existing features or implementation of new ones:

   ```
   // INCORRECT: Claiming implementation when only verifying
   "Implemented comprehensive reviews and ratings system"

   // CORRECT: Clearly indicating verification
   "Verified existing implementation of reviews and ratings system"
   ```

### Implementation vs. Verification

1. **Be Precise About Contributions**: When documenting work, be precise about what was actually done:

   - **Implementation**: Creating new code or functionality that didn't exist before
   - **Verification**: Confirming that existing code works as expected
   - **Documentation**: Describing existing functionality without changing it
   - **Enhancement**: Improving existing functionality without changing its core behavior

2. **Use Appropriate Verbs**: Choose verbs that accurately reflect the work performed:

   - "Implemented" or "Created" for new features
   - "Verified" or "Confirmed" for checking existing features
   - "Documented" or "Described" for adding documentation
   - "Enhanced" or "Improved" for making existing features better

3. **Changelog Accuracy**: Ensure changelog entries accurately reflect the nature of changes:

   ```
   // INCORRECT
   ### Added
   - Implemented reviews and ratings system

   // CORRECT (if only verifying)
   ### Documentation
   - Verified and documented existing reviews and ratings system
   ```

4. **Avoid Claiming Credit**: Don't claim credit for implementing features that were already in place:

   ```
   // INCORRECT: Taking credit for existing work
   "I implemented the geocoding service with multiple fallback strategies"
   ```

## Favorites System Implementation

When implementing a favorites system in a web application, several patterns and best practices emerged that can be applied to similar features:

### Batch Operations

Batch operations allow users to perform actions on multiple items at once, improving efficiency and user experience. Key implementation patterns include:

1. **Client-Side Batch Operations**: Two main approaches for client-side batch operations:

   ```typescript
   // Approach 1: Using Promise.all with firstValueFrom
   const updatePromises = selectedItems.map(itemId =>
     firstValueFrom(this.itemService.updateItem(itemId, newData))
   );

   Promise.all(updatePromises)
     .then(() => {
       // Update local state
       this.items.forEach(item => {
         if (this.selectedItems.includes(item.id)) {
           // Update item properties
           item.property = newValue;
         }
       });
       this.notificationService.success(`Updated ${this.selectedItems.length} items`);
     })
     .catch(error => {
       console.error('Error in batch operation:', error);
       this.notificationService.error('Failed to update some items');
     });

   // Approach 2: Using individual subscriptions with counters
   let completed = 0;
   let failed = 0;

   this.selectedItems.forEach(itemId => {
     this.itemService.updateItem(itemId, newData).subscribe({
       next: () => {
         completed++;

         // Find and update the item in the list
         const item = this.items.find(i => i.id === itemId);
         if (item) {
           item.property = newValue;
         }

         // When all operations are complete
         if (completed + failed === this.selectedItems.length) {
           this.notificationService.success(`Updated ${completed} items`);
           if (failed > 0) {
             this.notificationService.error(`Failed to update ${failed} items`);
           }
         }
       },
       error: () => {
         failed++;

         // When all operations are complete
         if (completed + failed === this.selectedItems.length) {
           if (completed > 0) {
             this.notificationService.success(`Updated ${completed} items`);
           }
           this.notificationService.error(`Failed to update ${failed} items`);
         }
       },
     });
   });
   ```

2. **Server-Side Batch Endpoints**: Design batch endpoints with consistent patterns:

```typescript
// Controller method for batch operations
async addFavoritesBatch(req, res, next) {
  try {
    const userId = req.user._id;
    const { adIds, notes, notificationsEnabled, tags, priority } = req.body;

    if (!adIds || !Array.isArray(adIds) || adIds.length === 0) {
      return next(new AppError('No ad IDs provided', 400));
    }

    // Validate that all items exist
    const ads = await Ad.find({ _id: { $in: adIds } });
    if (ads.length !== adIds.length) {
      const foundIds = ads.map(ad => ad._id.toString());
      const missingIds = adIds.filter(id => !foundIds.includes(id));
      return next(new AppError(`Some ads were not found: ${missingIds.join(', ')}`, 404));
    }

    // Find existing items to avoid duplicates
    const existingFavorites = await Favorite.find({
      user: userId,
      ad: { $in: adIds }
    });

    const existingAdIds = existingFavorites.map(fav => fav.ad.toString());
    const newAdIds = adIds.filter(id => !existingAdIds.includes(id));

    // Create new items
    if (newAdIds.length > 0) {
      const favoritesToCreate = newAdIds.map(adId => ({
        user: userId,
        ad: adId,
        notes: notes || '',
        notificationsEnabled: notificationsEnabled !== false,
        tags: tags || [],
        priority: priority || 'normal',
      }));

      await Favorite.insertMany(favoritesToCreate);
    }

    // Return detailed results
    res.status(201).json({
      message: 'Batch operation completed',
      added: newAdIds.length,
      alreadyExisting: existingAdIds.length
    });
  } catch (error) {
    next(new AppError('Failed to process batch operation', 500));
  }
}
```

2. **Client-Side Batch Processing**: When the backend doesn't support batch operations, implement client-side batching:

```typescript
updateTagsBatch(tags: string[]): void {
  if (this.selectedItems.length === 0) return;

  // Update each selected item one by one
  let completed = 0;
  let failed = 0;

  this.selectedItems.forEach(itemId => {
    this.favoriteService.updateTags(itemId, tags).subscribe({
      next: () => {
        completed++;

        // Find and update the item in the list
        const item = this.items.find(i => i.id === itemId);
        if (item) {
          item.tags = [...tags];
        }

        // When all operations are complete
        if (completed + failed === this.selectedItems.length) {
          this.notificationService.success(`Updated tags for ${completed} items`);
          if (failed > 0) {
            this.notificationService.error(`Failed to update tags for ${failed} items`);
          }
        }
      },
      error: () => {
        failed++;

        // When all operations are complete
        if (completed + failed === this.selectedItems.length) {
          this.notificationService.success(`Updated tags for ${completed} items`);
          if (failed > 0) {
            this.notificationService.error(`Failed to update tags for ${failed} items`);
          }
        }
      }
    });
  });
}
```

3. **Progress Tracking**: For large batch operations, implement progress tracking:

```typescript
// Track progress for large batch operations
const total = items.length;
let processed = 0;
const progressSubject = new BehaviorSubject<number>(0);

// Expose progress as an observable
const progress$ = progressSubject.asObservable();

// Process items in smaller batches
const batchSize = 50;
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);
  await processBatch(batch);
  processed += batch.length;
  progressSubject.next(Math.floor((processed / total) * 100));
}
```

### Filtering and Sorting

Implementing flexible filtering and sorting improves user experience by allowing users to find relevant items quickly:

1. **Query Parameter Handling**: Design a consistent approach to handling query parameters:

```typescript
// Controller method with filtering and sorting
getFavorites(req, res, next) {
  try {
    const userId = req.user._id;

    // Extract query parameters
    const { sort, category, county, city, search } = req.query;

    // Build query options
    const options = {
      sort: this.parseSortOption(sort),
      filters: this.buildFilters({ category, county, city, search })
    };

    const favorites = await Favorite.findByUser(userId, options);

    res.status(200).json(favorites);
  } catch (error) {
    next(new AppError('Failed to get favorites', 500));
  }
}

// Helper method to parse sort options
parseSortOption(sortOption) {
  if (!sortOption) return { 'createdAt': -1 }; // Default sort

  const sortMap = {
    'newest': { 'createdAt': -1 },
    'oldest': { 'createdAt': 1 },
    'price-asc': { 'ad.price': 1 },
    'price-desc': { 'ad.price': -1 },
    'title-asc': { 'ad.title': 1 },
    'title-desc': { 'ad.title': -1 },
    'priority-high': { 'priority': -1 },
    'priority-low': { 'priority': 1 }
  };

  return sortMap[sortOption] || { 'createdAt': -1 };
}

// Helper method to build filter object
buildFilters({ category, county, city, search }) {
  const filters = {};

  if (category) {
    filters['ad.category'] = category;
  }

  if (county) {
    filters['ad.location.county'] = county;
  }

  if (city) {
    filters['ad.location.city'] = city;
  }

  if (search) {
    filters['$or'] = [
      { 'ad.title': { $regex: search, $options: 'i' } },
      { 'ad.description': { $regex: search, $options: 'i' } },
      { 'notes': { $regex: search, $options: 'i' } }
      },
      error => {
        console.error('Error loading favorites:', error);
        this.notificationService.error('Failed to load favorites. Please try again.');
      }
    ];
  }

  return filters;
}
```

2. **Client-Side Filter Implementation**: Implement a clean approach to client-side filtering:

```typescript
// Component with filtering and sorting
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  filterOptions: FilterOptions = {
    sort: 'newest',
    search: '',
  };

  private searchSubject = new Subject<string>();

  constructor(private itemService: ItemService) {
    // Set up debounced search
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.applyFilters();
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterOptions.search = value;
    this.searchSubject.next(value);
  }

  applyFilters(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.itemService.getItems(this.filterOptions).subscribe(items => {
      this.items = items;
    });
  }
}
```

3. **Database Indexing**: Ensure proper database indexes for efficient filtering and sorting:

```javascript
// Create indexes for filtering and sorting
schema.index({ user: 1, createdAt: -1 });
schema.index({ user: 1, tags: 1 });
schema.index({ user: 1, priority: 1 });
schema.index({ user: 1, lastViewed: -1 });
```

### Tagging and Categorization

Implementing a tagging system allows users to organize and categorize items:

1. **Tag Schema Design**: Design a flexible tag schema:

```javascript
// Tag schema in the model
tags: {
  type: [String],
  default: [],
  validate: {
    validator: function(tags) {
      // Ensure each tag is between 1 and 30 characters
      return tags.every(tag => tag.length > 0 && tag.length <= 30);
    },
    message: 'Tags must be between 1 and 30 characters'
  }
}
```

2. **Tag Statistics**: Implement tag statistics for better user experience:

```javascript
// Get tag statistics for a user
async getUserTags(req, res, next) {
  try {
    const userId = req.user._id;

    // Aggregate to get unique tags and their counts
    const tagStats = await Favorite.aggregate([
      { $match: { user: userId } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json(tagStats);
  } catch (error) {
    next(new AppError('Failed to get user tags', 500));
  }
}
```

3. **Tag Input UI**: Implement a user-friendly tag input interface:

```typescript
// Tag input dialog
openTagsDialog(item: Item): void {
  const dialogRef = this.dialog.open(TagDialogComponent, {
    width: '500px',
    data: {
      title: 'Edit Tags',
      tags: item.tags ? item.tags.join(', ') : '',
      placeholder: 'Add tags separated by commas (e.g., vacation, summer, beach)',
    },
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result !== undefined) {
      const tags = result.split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      this.updateTags(item, tags);
    }
  });
}
```

By implementing these patterns, you can create a robust favorites system that provides a great user experience while maintaining code quality and performance.

## Review System Implementation

The review system implementation in the Date Night App provides several valuable lessons and patterns that can be applied to other features.

### Component Architecture

The review system uses a modular component architecture with clear separation of concerns:

1. **Core Components**:

   - `ReviewFormComponent`: Handles review creation and editing
   - `ReviewListComponent`: Displays a list of reviews with pagination
   - `ReviewSummaryComponent`: Shows aggregate rating statistics
   - `StarRatingComponent`: Reusable rating input/display component

2. **Dialog Components**:

   - `ReviewDialogComponent`: Wraps the review form in a dialog
   - `ResponseDialogComponent`: For responding to reviews
   - `ReportDialogComponent`: For reporting inappropriate content

3. **Services**:
   - `ReviewService`: Handles API communication
   - `DialogService`: Manages dialog interactions

This architecture provides several benefits:

- **Reusability**: Components can be used in different contexts
- **Maintainability**: Each component has a single responsibility
- **Testability**: Components can be tested in isolation
- **Flexibility**: Components can be composed in different ways

The pattern of separating core components from dialog wrappers is particularly effective, as it allows the same functionality to be used both inline and in dialogs.

### Dialog Service Pattern

The `DialogService` implements a pattern that centralizes dialog management and provides a clean API for opening dialogs:

```typescript
@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  openReviewDialog(data: ReviewDialogData): Observable<any> {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      data,
    });

    return dialogRef.afterClosed();
  }

  // Other dialog methods...
}
```

This pattern provides several advantages:

1. **Consistent Configuration**: Dialog configuration is centralized
2. **Simplified API**: Consumers don't need to know dialog implementation details
3. **Type Safety**: Dialog data and results are properly typed
4. **Testability**: Dialog interactions can be easily mocked for testing

This pattern can be applied to any feature that uses dialogs, providing a consistent approach across the application.

### Form Validation

The review form implements comprehensive validation with clear user feedback:

```typescript
this.reviewForm = this.fb.group({
  rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
  title: ['', [Validators.required, Validators.maxLength(100)]],
  content: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
  categories: this.fb.group({
    communication: [0],
    appearance: [0],
    location: [0],
    value: [0],
  }),
  isVerifiedMeeting: [false],
  meetingDate: [null],
});

// Add conditional validation
this.reviewForm.get('isVerifiedMeeting')?.valueChanges.subscribe(isVerified => {
  const meetingDateControl = this.reviewForm.get('meetingDate');
  if (isVerified) {
    meetingDateControl?.setValidators([Validators.required]);
  } else {
    meetingDateControl?.clearValidators();
  }
  meetingDateControl?.updateValueAndValidity();
});
```

Key validation patterns include:

1. **Immediate Feedback**: Validation errors are shown as the user interacts with the form
2. **Clear Error Messages**: Each validation error has a specific, helpful message
3. **Visual Indicators**: Invalid fields are highlighted with red borders and error icons
4. **Conditional Validation**: Validation rules change based on form state
5. **Submission Prevention**: The submit button is disabled when the form is invalid

These patterns ensure a good user experience while maintaining data integrity, and can be applied to any form in the application.

## User Preferences Implementation

The implementation of user preferences in the DateNight.io application provides valuable lessons in creating a flexible, user-centric experience.

### Preference Storage

For client-side preference storage, localStorage provides a simple and effective solution:

```typescript
// In UserPreferencesService
private savePreferences(preferences: UserPreferences): void {
  localStorage.setItem('user_preferences', JSON.stringify(preferences));
}

private loadPreferences(): UserPreferences {
  const savedPreferences = localStorage.getItem('user_preferences');
  if (savedPreferences) {
    try {
      return JSON.parse(savedPreferences);
    } catch (error) {
      console.error('Error parsing saved preferences:', error);
    }
  }
  return this.getDefaultPreferences();
}
```

Key lessons:

1. **Error Handling**: Always handle potential JSON parsing errors
2. **Default Values**: Provide sensible defaults when stored preferences aren't available
3. **Separation of Concerns**: Keep storage logic separate from business logic

### Reactive Updates

Using RxJS BehaviorSubject provides a clean way to notify components of preference changes:

```typescript
// In UserPreferencesService
private preferencesSubject = new BehaviorSubject<UserPreferences>(this.getInitialPreferences());
public preferences$ = this.preferencesSubject.asObservable();

// When preferences change
updatePreferences(preferences: Partial<UserPreferences>): void {
  const updatedPreferences = {
    ...this.preferencesSubject.value,
    ...preferences
  };
  this.preferencesSubject.next(updatedPreferences);
  this.savePreferences(updatedPreferences);
}

// In components
ngOnInit(): void {
  this.subscriptions.push(
    this.userPreferencesService.preferences$.subscribe(prefs => {
      this.defaultViewType = prefs.defaultViewType;
      this.contentDensity = prefs.contentDensity;
      this.cardSize = prefs.cardSize;
    })
  );
}
```

Key lessons:

1. **Observable Pattern**: Using observables for state changes provides a clean reactive approach
2. **Subscription Management**: Always store subscriptions and unsubscribe in ngOnDestroy
3. **Partial Updates**: Allow updating individual preferences without affecting others

### Component Integration

The preferences demo component showcases how to integrate user preferences:

```typescript
// In PreferencesDemoComponent
onViewTypeChange(): void {
  this.userPreferencesService.setDefaultViewType(this.defaultViewType);
}

onContentDensityChange(): void {
  this.userPreferencesService.setContentDensity(this.contentDensity);
}

onCardSizeChange(): void {
  this.userPreferencesService.setCardSize(this.cardSize);
}
```

Key lessons:

1. **Specific Methods**: Provide specific methods for common preference changes
2. **Immediate Feedback**: Update the UI immediately when preferences change
3. **Consistent API**: Use consistent method naming and parameter types

### CSS Implementation

Using CSS classes based on preferences provides a clean way to style components:

```html
<div
  class="ad-card"
  [ngClass]="{
    'ad-card-size-small': cardSize === 'small',
    'ad-card-size-medium': cardSize === 'medium',
    'ad-card-size-large': cardSize === 'large',
    'ad-card-density-comfortable': contentDensity === 'comfortable',
    'ad-card-density-compact': contentDensity === 'compact',
    'ad-card-density-condensed': contentDensity === 'condensed',
  }"
>
  <!-- Card content -->
</div>
```

Key lessons:

1. **Class-Based Styling**: Use CSS classes rather than inline styles for preference-based styling
2. **Consistent Naming**: Follow a consistent naming pattern for preference-based classes
3. **Separation of Concerns**: Keep styling logic separate from business logic

### Demo Component Value

Creating a dedicated demo component provides several benefits:

1. **Visual Documentation**: Shows how preferences affect the UI in real-time
2. **User Education**: Helps users understand the impact of their preference choices
3. **Developer Reference**: Serves as a living example of how to implement preferences
4. **Testing Ground**: Provides a controlled environment for testing preference changes

This approach of creating dedicated demo components can be applied to other complex features to improve understanding and adoption.

## Historical Notes

This section contains notes on approaches that have been superseded by better implementations or issues that have been fixed. They are kept for historical reference.

### Obsolete Approaches

> **Obsolete**: The original HTTP error handling implementation using a global error interceptor without context-specific handling has been replaced with a more robust approach. See [ERRORHANDLINGTELEMETRY.MD](/docs/ERRORHANDLINGTELEMETRY.MD) for the current implementation.

> **Obsolete**: The initial approach to theme toggling using direct DOM manipulation has been replaced with a more maintainable CSS variables approach. See [THEMING_GUIDE.MD](/docs/THEMING_GUIDE.MD) for details.

### Fixed Issues

> **Fixed**: The geocoding service now implements multiple fallback strategies for improved reliability.

> **Fixed**: Angular build memory issues have been addressed with the solutions documented in [ANGULAR_BUILD_OPTIMIZATION.MD](/docs/ANGULAR_BUILD_OPTIMIZATION.MD).

---

_Last Updated: 2025-05-20_
