# Angular Testing Lessons Learned

## Overview

This document captures key lessons learned while working with Angular unit tests in the Date Night App. It serves as a reference for developers to avoid common pitfalls and follow best practices when writing and maintaining tests.

## Common Issues and Solutions

### 1. Standalone Components vs. NgModule-based Components

**Issue**: Angular 15+ supports standalone components, but many tests were written for NgModule-based components.

**Solution**:

- For standalone components, use `imports` array in the TestBed configuration instead of `declarations`
- Example:

  ```typescript
  // WRONG (for standalone components)
  TestBed.configureTestingModule({
    declarations: [MyStandaloneComponent],
    // ...
  });

  // CORRECT (for standalone components)
  TestBed.configureTestingModule({
    imports: [MyStandaloneComponent],
    // ...
  });
  ```

### 2. Angular Material Component Testing

**Issue**: Tests fail with errors like `'mat-card' is not a known element` when using Angular Material components.

**Solution**:

- Import all required Angular Material modules in the test configuration
- For standalone components, include Material modules in the component's `imports` array
- Example:
  ```typescript
  TestBed.configureTestingModule({
    imports: [
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      // other required modules
    ],
  });
  ```

### 3. Service Testing with HTTP

**Issue**: Tests for services that use HttpClient often fail because the HTTP requests are not properly mocked.

**Solution**:

- Use HttpClientTestingModule and HttpTestingController
- Flush mock responses for each request
- Verify that no unexpected requests were made
- Example:

  ```typescript
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MyService],
    });

    service = TestBed.inject(MyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });

  it('should fetch data', () => {
    const mockData = { id: 1, name: 'Test' };

    service.getData().subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('api/data');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
  ```

#### 3.1 HTTP Error Handling in Tests

**Issue**: Tests for error handling in HTTP services often fail with "Expected error, not success" because the error callbacks are not properly triggered or captured.

**Solution**:

- Use proper error handling in test callbacks
- Explicitly capture error objects for verification
- Use error spy functions to track error handling
- Example:
  ```typescript
  it('should handle HTTP errors', () => {
    const errorResponse = { status: 404, statusText: 'Not Found' };
    const errorSpy = jasmine.createSpy('error');

    service.getData().subscribe({
      next: () => fail('Expected error, not success'),
      error: error => {
        errorSpy(error);
      },
    });

    const req = httpMock.expectOne('api/data');
    req.error(new ErrorEvent('Not Found'), errorResponse);

    expect(errorSpy).toHaveBeenCalled();
    const errorArg = errorSpy.calls.mostRecent().args[0];
    expect(errorArg.status).toBe(404);
  });
  ```

#### 3.2 Browser-specific URL Validation

**Issue**: URL validation tests can be inconsistent across browsers because different browsers have different URL parsing rules.

**Solution**:

- Use reliably invalid URL formats for testing
- Avoid edge cases that might be valid in some browsers
- Test with clearly valid and clearly invalid URLs
- Example:

  ```typescript
  // WRONG - Some browsers consider this valid
  expect(service.isValidUrl('http:example.com')).toBeFalse();

  // BETTER - More reliably invalid across browsers
  expect(service.isValidUrl('http:///example')).toBeFalse();
  ```

### 4. Testing Asynchronous Operations

**Issue**: Tests involving timers, promises, or observables often fail due to timing issues.

**Solution**:

- Use `fakeAsync` and `tick()` for timer-based tests
- Use `async/await` for promise-based tests
- Properly subscribe to and complete observables
- Example:
  ```typescript
  it('should handle delayed operations', fakeAsync(() => {
    let value = false;

    service.delayedOperation().subscribe(() => {
      value = true;
    });

    expect(value).toBe(false); // Not changed yet
    tick(1000); // Fast-forward time
    expect(value).toBe(true); // Now it should be changed
  }));
  ```

### 5. Component Input/Output Testing

**Issue**: Difficulty testing components that use @Input() and @Output() decorators.

**Solution**:

- Set input properties directly on the component instance
- Subscribe to output EventEmitters to capture emitted values
- Example:
  ```typescript
  it('should emit when button is clicked', () => {
    // Set up input
    component.inputValue = 'test';

    // Set up output capture
    let emittedValue: string | null = null;
    component.outputEvent.subscribe((value: string) => {
      emittedValue = value;
    });

    // Trigger the event
    component.onButtonClick();

    // Check the result
    expect(emittedValue).toBe('test');
  });
  ```

### 6. Mock Data Consistency

**Issue**: Mock data not matching the actual interface requirements, causing type errors.

**Solution**:

- Create shared mock data factories that follow the interface definitions
- Use TypeScript's type checking to ensure mock data is valid
- Example:

  ```typescript
  // Define a mock factory
  function createMockAd(): Ad {
    return {
      _id: 'ad123',
      title: 'Test Ad',
      description: 'Test description',
      category: 'test',
      price: 100,
      location: 'Test Location',
      advertiser: 'Test Advertiser',
      isActive: true,
      isFeatured: false,
      isTrending: false,
      isTouring: false,
      viewCount: 0,
      clickCount: 0,
      inquiryCount: 0,
      media: [],
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user123',
    };
  }

  // Use the factory in tests
  const mockAd = createMockAd();
  ```

### 7. Testing Components with Child Components

**Issue**: Tests fail when a component includes child components that are not part of the test setup.

**Solution**:

- Create stub components for child components
- Use NO_ERRORS_SCHEMA to ignore unknown elements (use sparingly)
- Example:

  ```typescript
  @Component({
    selector: 'app-child',
    template: '<div>Mock Child</div>',
  })
  class MockChildComponent {}

  TestBed.configureTestingModule({
    declarations: [ParentComponent, MockChildComponent],
    // Alternatively: schemas: [NO_ERRORS_SCHEMA]
  });
  ```

### 8. SCSS Import Path Issues

**Issue**: SCSS imports fail in component tests due to incorrect paths or missing design tokens.

**Solution**:

- Ensure SCSS import paths are correct and consistent
- Create fallback variables for missing design tokens
- Fix import paths to point to the correct location
- Example:

  ```scss
  // WRONG
  @import '../../../../../core/design/design-tokens';

  // CORRECT
  @import '../../../../../app/core/design/design-tokens';

  // Add fallback variables if needed
  $primary: $primary-500;
  $danger: $error;
  ```

### 9. RxJS Compatibility Issues

**Issue**: Tests fail due to RxJS compatibility issues between different versions.

**Solution**:

- Use consistent RxJS import paths
- Avoid mixing pipe operators from different RxJS versions
- Simplify RxJS usage in tests when possible
- Example:

  ```typescript
  // WRONG (mixing styles)
  import { Observable } from 'rxjs/Observable';
  import { of } from 'rxjs';

  // CORRECT
  import { Observable, of } from 'rxjs';
  import { map, filter } from 'rxjs/operators';
  ```

### 10. Window Location Testing

**Issue**: Tests that modify window.location fail with "Cannot assign to read only property 'href'".

**Solution**:

- Use spyOn with property getters instead of direct assignment
- Create a spy object for window.location
- Example:

  ```typescript
  // WRONG
  spyOn(window.location, 'href', 'set');

  // CORRECT
  const locationSpy = jasmine.createSpyObj('location', [], {
    href: '',
  });
  spyOnProperty(window, 'location', 'get').and.returnValue(locationSpy);

  component.navigateToPage();
  expect(locationSpy.href).toBe('/expected-page');
  ```

### 11. Component Path Mismatches

**Issue**: Tests import components from incorrect paths, causing mismatches between test expectations and actual component behavior.

**Solution**:

- Ensure imports in test files match the actual component paths
- Check for duplicate component implementations in different directories
- Verify that the test is importing the correct version of the component
- Example:

  ```typescript
  // WRONG
  import { CardGridComponent } from './card-grid.component';

  // CORRECT (if component is in a different directory)
  import { CardGridComponent } from '../components/card-grid/card-grid.component';
  ```

## Best Practices

### 1. Test Structure

- Follow the AAA pattern: Arrange, Act, Assert
- Group related tests using nested `describe` blocks
- Use clear, descriptive test names that explain the expected behavior

### 2. Test Isolation

- Reset state between tests using `beforeEach`
- Mock external dependencies
- Avoid test interdependence

### 3. Coverage Goals

- Aim for comprehensive coverage of:
  - Component initialization
  - User interactions
  - Edge cases and error handling
  - Business logic

### 4. Performance

- Keep tests fast by minimizing unnecessary setup
- Use `fdescribe` and `fit` for focused testing during development
- Avoid excessive use of `beforeEach` for operations needed only in specific tests

### 5. Test File Organization

- Keep test files alongside the components they test
- Use consistent naming patterns (e.g., `*.component.spec.ts`)
- Add clear comments at the top of test files explaining what's being tested

### 6. Design System Integration

- When testing components that use a design system:
  - Ensure design tokens are properly imported
  - Test that styling classes are correctly applied
  - Verify responsive behavior works as expected

## Specific Component Testing Patterns

### 1. Reactive Forms Testing

```typescript
it('should validate form correctly', () => {
  // Set form values
  component.form.patchValue({
    email: 'invalid-email',
    password: '123',
  });

  // Check validation results
  expect(component.form.get('email')?.valid).toBeFalse();
  expect(component.form.get('password')?.hasError('minlength')).toBeTrue();

  // Fix the values
  component.form.patchValue({
    email: 'valid@example.com',
    password: 'password123',
  });

  // Verify form is now valid
  expect(component.form.valid).toBeTrue();
});
```

### 2. Router Testing

```typescript
it('should navigate when button is clicked', () => {
  const routerSpy = spyOn(router, 'navigate');

  component.navigateToDetails(123);

  expect(routerSpy).toHaveBeenCalledWith(['/details', 123]);
});
```

### 3. Testing DOM Interactions

```typescript
it('should update UI when button is clicked', () => {
  // Find button element
  const button = fixture.debugElement.query(By.css('.action-button'));

  // Simulate click
  button.triggerEventHandler('click', null);
  fixture.detectChanges();

  // Check result in the DOM
  const resultElement = fixture.debugElement.query(By.css('.result'));
  expect(resultElement.nativeElement.textContent).toContain('Success');
});
```

### 4. Testing Emerald Components

When testing Emerald components, follow these additional guidelines:

```typescript
// 1. Use a test host component for complex scenarios
@Component({
  template: `
    <emerald-card-grid [items]="items" [layout]="layout" (cardClick)="onCardClick($event)">
    </emerald-card-grid>
  `,
})
class TestHostComponent {
  items = MOCK_ITEMS;
  layout = 'default';
  onCardClick(id: string) {}
}

// 2. Test component initialization with default values
it('should initialize with default values', () => {
  const newComponent = new CardGridComponent();
  expect(newComponent.layout).toBe('default');
  expect(newComponent.items).toEqual([]);
});

// 3. Test layout variations
it('should apply correct layout class', () => {
  component.layout = 'masonry';
  fixture.detectChanges();

  const element = fixture.debugElement.query(By.css('.emerald-card-grid--masonry'));
  expect(element).toBeTruthy();
});
```

## Troubleshooting Guide

### Common Error Messages and Solutions

1. **"No provider for X"**

   - Add the missing service to the `providers` array in TestBed configuration
   - Create a mock service if the real one has dependencies you don't want to include

2. **"X is not a known element"**

   - Import the module that declares the component
   - For Angular Material components, import the specific Material module
   - For custom components, add them to declarations or use a stub

3. **"Cannot read property X of undefined"**

   - Check component initialization
   - Ensure all required inputs are provided
   - Verify service dependencies are properly mocked

4. **"Expected X to be Y"**

   - Check for async operations that haven't completed
   - Ensure detectChanges() is called after state changes
   - Verify the initial state matches your expectations

5. **"Failed to compile node_modules/..."**

   - Check for version mismatches between dependencies
   - Ensure TypeScript version is compatible with Angular version
   - Try clearing node_modules and reinstalling dependencies

6. **"No specs found"**

   - Check that test files follow the correct naming pattern (\*.spec.ts)
   - Verify that the test configuration is correctly set up
   - Check for syntax errors in test files that might prevent them from being recognized

7. **"SASS/SCSS compilation error"**
   - Check import paths in SCSS files
   - Ensure design tokens are properly defined
   - Add fallback variables for missing design tokens

### 12. Component File Structure Mismatches

**Issue**: Tests fail because component files are not in the expected locations or have incorrect import paths.

**Solution**:

- Ensure component files and their tests are in the same directory structure
- Update import paths in test files to match the actual component locations
- Create missing component files in the correct locations
- Example:

  ```typescript
  // WRONG
  import { AppCardComponent } from '../app-card/app-card.component';

  // CORRECT (if component is in a different directory)
  import { AppCardComponent } from '../components/app-card/app-card.component';
  ```

### 13. Type Export Syntax in TypeScript

**Issue**: Type exports cause errors in newer TypeScript versions due to changes in how types are exported.

**Solution**:

- Use `export type` syntax for interfaces and types
- Update import statements to match the export style
- Example:

  ```typescript
  // WRONG
  export { DropdownItem } from './components/avatar/avatar.component';

  // CORRECT
  export type { DropdownItem } from './components/avatar/avatar.component';
  ```

### 14. RxJS Version Conflicts

**Issue**: Different versions of RxJS in the same project cause type incompatibilities and runtime errors.

**Solution**:

- Ensure consistent RxJS versions across the project
- Update package.json to specify exact versions
- Clean npm cache and reinstall dependencies when updating versions
- Example:

  ```bash
  # Check for inconsistent versions
  npm ls rxjs

  # Update to a consistent version
  npm install rxjs@7.8.1 --save-exact

  # Clean cache and reinstall
  npm cache clean --force
  rm -rf node_modules
  npm install
  ```

### 15. Component Property Name Mismatches

**Issue**: Tests fail because component property names in tests don't match the actual component implementation.

**Solution**:

- Ensure property names are consistent between components and tests
- Update tests when component properties are renamed
- Use interfaces to enforce property name consistency
- Example:

  ```typescript
  // WRONG
  // Component uses 'isLoading' but test checks 'loading'
  expect(component.loading).toBeTrue();

  // CORRECT
  expect(component.isLoading).toBeTrue();
  ```

### 16. Missing Component Files

**Issue**: Tests fail because component files referenced in imports don't exist.

**Solution**:

- Create missing component files in the correct locations
- Ensure component files follow the Angular naming conventions
- Update import paths to match the actual file structure
- Example:
  ```typescript
  // Create missing component files
  // app-card.component.ts
  @Component({
    selector: 'emerald-app-card',
    templateUrl: './app-card.component.html',
    styleUrls: ['./app-card.component.scss'],
    standalone: true,
    imports: [CommonModule],
  })
  export class AppCardComponent {
    // Component implementation
  }
  ```

### 17. Testing Components with Rendering Issues

**Issue**: Tests fail with errors like `TypeError: ctx.getMediaCount is not a function` when a component's template tries to use methods that don't exist or have dependencies that aren't properly mocked.

**Solution**:

- Use spies to avoid actual rendering of problematic components
- Skip detectChanges calls that trigger template rendering
- Mock child components that cause rendering issues
- Example:
  ```typescript
  beforeEach(() => {
    // Spy on component methods to avoid template rendering issues
    spyOn(component, 'getGridStyle').and.returnValue({
      display: 'grid',
      'grid-template-columns': 'repeat(4, 1fr)',
      gap: '16px',
    });

    // Skip actual rendering by spying on detectChanges
    spyOn(fixture, 'detectChanges').and.callFake(() => {});
  });
  ```

### 18. Standalone vs. NgModule Component Mismatch

**Issue**: Tests fail with errors like `Unexpected "PagerComponent" found in the "declarations" array of the "TestBed.configureTestingModule" call, "PagerComponent" is marked as standalone and can't be declared in any NgModule`.

**Solution**:

- Ensure component is consistently defined as either standalone or NgModule-based
- For standalone components, use imports array instead of declarations
- Update module imports to match component definition
- Example:

  ```typescript
  // For standalone components
  @Component({
    selector: 'emerald-pager',
    templateUrl: './pager.component.html',
    styleUrls: ['./pager.component.scss'],
    standalone: true,
    imports: [CommonModule],
  })
  export class PagerComponent {}

  // In test file
  TestBed.configureTestingModule({
    imports: [CommonModule, FormsModule, PagerComponent],
  }).compileComponents();

  // In module file
  @NgModule({
    imports: [
      CommonModule,
      PagerComponent, // Import standalone component
    ],
    exports: [
      PagerComponent, // Export for use in other modules
    ],
  })
  export class EmeraldModule {}
  ```

## References

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Angular Material Testing](https://material.angular.io/guide/testing)
- [RxJS Testing](https://rxjs.dev/guide/testing)

## Integration with Other Documentation

This document complements the following guides:

- [TESTING_GUIDE.MD](./TESTING_GUIDE.md) - General testing strategy
- [CUSTOMIZATION_GUIDE.MD](./CUSTOMIZATION_GUIDE.md) - How to customize components
- [EMERALD-TESTING-GUIDE.MD](./emerald-testing-guide.md) - Testing Emerald components
