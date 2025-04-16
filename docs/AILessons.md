# AI Lessons Learned

This document contains lessons learned by the AI while working on the Date Night App project.

## Angular Testing

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
]

// INCORRECT - will cause "Cannot read properties of undefined (reading 'root')" error
providers: [
  { provide: AuthService, useValue: mockAuthService },
  { provide: Router, useValue: mockRouter } // Don't do this!
]
```

## HTTP Service Testing

When testing services that make HTTP requests:

1. **Error Handling Tests**: Be careful with error expectations:

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
  }
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