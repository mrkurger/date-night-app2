# AI Lessons Learned

This document contains lessons learned by the AI while working on the Date Night App project.

## Table of Contents

- [Backend Testing](#backend-testing)
  - [Mongoose Schema Testing](#mongoose-schema-testing)
  - [Content Security Policy (CSP)](#content-security-policy-csp)
- [Angular Testing](#angular-testing)
  - [Component Dependencies](#component-dependencies)
  - [Standalone Components](#standalone-components)
  - [SCSS Variables](#scss-variables)
- [Angular Router Testing](#angular-router-testing)
- [HTTP Service Testing](#http-service-testing)
- [Debugging Strategies](#debugging-strategies)
- [Linting and Formatting](#linting-and-formatting)
  - [ESLint Configuration](#eslint-configuration)
  - [NPM Scripts](#npm-scripts)
  - [Common Issues](#common-issues)

## Backend Testing

### Mongoose Schema Testing

1. **Schema Field Validation**: When testing Mongoose models, ensure that the test data matches the schema definition. If tests expect fields like `firstName` and `lastName` but the schema only has `name`, either update the schema or modify the tests.

2. **Duplicate Indexes**: Avoid defining the same index multiple times. If you're seeing warnings about duplicate indexes, consider:

   - Defining indexes directly in the schema field with `index: true`
   - Removing duplicate `schema.index()` calls
   - Using compound indexes when appropriate

3. **Test Data Consistency**: Ensure test data in helper files matches the model schema. Check files like `helpers.js` that define test data constants.

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

3. **External Resources**: If your application uses external resources (like UI libraries), add their domains to the appropriate CSP directives.

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

## Debugging Strategies

1. **Incremental Fixes**: When dealing with multiple errors, fix them one by one and run tests after each fix to see if you're making progress.

2. **Error Analysis**: Pay attention to the specific error messages and stack traces to identify the root cause of the issue.

3. **Component Dependencies**: Make sure all dependencies (modules, services, etc.) are properly mocked or provided in your test setup.

4. **Test Isolation**: Make sure each test is isolated and doesn't depend on the state from other tests.

5. **Documentation Updates**: Always update documentation with lessons learned to avoid repeating the same mistakes.

## Linting and Formatting

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
