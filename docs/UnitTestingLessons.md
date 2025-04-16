# Unit Testing Lessons Learned

This document contains lessons learned from unit testing the Date Night App project.

## Angular Component Testing

### Standalone Components

When testing Angular standalone components:

1. **TestBed Configuration**: Standalone components must be added to the `imports` array, not the `declarations` array:

```typescript
await TestBed.configureTestingModule({
  imports: [
    RegisterComponent, // Standalone component goes here
    ReactiveFormsModule,
    // Other imports...
  ],
  // declarations: [] - Do NOT put standalone components here
});
```

2. **Component Dependencies**: Make sure all dependencies used in the component's template are properly imported in both:
   - The component's `@Component.imports` array
   - The TestBed's `imports` array

3. **Unknown Elements and Attributes**: If you're getting errors about unknown elements or attributes in your component templates, add the `CUSTOM_ELEMENTS_SCHEMA` and `NO_ERRORS_SCHEMA` to your TestBed configuration:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

await TestBed.configureTestingModule({
  // ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
});
```

4. **Simplified Component Templates**: For components with complex templates that cause testing issues (like aria-label binding errors), create a test component that extends the original but uses a simplified template:

```typescript
// Create a test component that extends the original but uses a simplified template
@Component({
  selector: 'app-root',
  template: '<div>Mock App Component</div>', // Simple template without problematic bindings
  standalone: true
})
class TestAppComponent extends AppComponent {
  // Inherit all functionality but use a simplified template
}

// Use the test component in TestBed
await TestBed.configureTestingModule({
  imports: [
    TestAppComponent, // Use test component instead of the original
    // Other imports...
  ],
  // ...
});

// Create fixture with the test component
fixture = TestBed.createComponent(TestAppComponent);
component = fixture.componentInstance;
```

5. **Router Testing**: When testing components that use the Router, use RouterTestingModule with proper route configuration:

```typescript
// Create a mock component for testing routes
@Component({
  selector: 'app-mock-component',
  template: '<div>Mock Component</div>',
  standalone: true
})
class MockComponent {}

await TestBed.configureTestingModule({
  imports: [
    RouterTestingModule.withRoutes([
      { path: 'browse', component: MockComponent },
      { path: 'login', component: MockComponent }
    ]),
    // Other imports...
  ],
  // ...
});

// Get the router instance and spy on navigate
const router = TestBed.inject(Router);
spyOn(router, 'navigate');

// Later in tests
expect(router.navigate).toHaveBeenCalledWith(['/some-route']);
```

6. **Avoid Duplicate Router Providers**: When using RouterTestingModule, don't provide Router separately as it will cause conflicts:

```typescript
// CORRECT
providers: [
  { provide: AuthService, useValue: mockAuthService },
  // No Router provider here as RouterTestingModule provides it
]

// INCORRECT - will cause "Cannot read properties of undefined (reading 'root')" error
providers: [
  { provide: AuthService, useValue: mockAuthService },
  { provide: Router, useValue: mockRouter } // Don't do this!
]
```

### SCSS in Component Tests

When testing components with SCSS:

1. **Local Variables**: If your component's SCSS file uses variables that are normally imported from a shared file, you may need to define these variables locally in the component's SCSS file for tests to pass.

2. **Missing Variables**: Watch for errors like `Undefined variable $variable-name` in the test output, which indicate missing SCSS variables.

## Service Testing

1. **Mocking Dependencies**: Always mock external dependencies when testing services to isolate the service being tested.

2. **HTTP Testing**: Use `HttpClientTestingModule` and `HttpTestingController` for testing services that make HTTP requests.

3. **Async Testing**: Use `fakeAsync` and `tick()` for testing asynchronous code.

4. **Mocking Services with Observables**: When mocking services that expose observables, make sure to mock both the methods and the observable properties:

```typescript
// Mock NotificationService with both methods and observable properties
const notificationServiceSpy = jasmine.createSpyObj('NotificationService', 
  ['success', 'error', 'info', 'warning', 'removeToast'],
  {
    // Mock the observable properties
    toasts$: of([]),
    unreadCount$: of(0)
  }
);
```

5. **HTTP Error Testing**: When testing error handling in HTTP services, be careful with the error expectations:

```typescript
// CORRECT - Don't fail the test if the 'next' callback is called
service.uploadMedia(mockAdId, mockFile).subscribe({
  next: () => {}, // Don't use fail() here if the implementation might call next
  error: (error) => {
    errorSpy(error);
  }
});

// INCORRECT - This might cause false failures
service.uploadMedia(mockAdId, mockFile).subscribe({
  next: () => fail('Expected error, not success'), // This might fail unexpectedly
  error: (error) => {
    errorSpy(error);
  },
  complete: () => fail('Expected error, not complete') // This might fail unexpectedly
});
```

## General Testing Tips

1. **Incremental Fixes**: When dealing with multiple test failures, fix them one by one and run tests after each fix to track progress.

2. **Error Analysis**: Pay close attention to error messages and stack traces to identify the root cause of test failures.

3. **Test Coverage**: Aim for comprehensive test coverage, including:
   - Happy path scenarios
   - Edge cases
   - Error handling
   - Component interactions

4. **Test Independence**: Each test should be independent and not rely on the state from other tests.

5. **Test Readability**: Write clear, descriptive test names and organize tests logically.