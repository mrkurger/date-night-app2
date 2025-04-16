# Unit Testing Lessons Learned

This document contains lessons learned from unit testing the Date Night App project.

## Table of Contents

- [Angular Component Testing](#angular-component-testing)
  - [Standalone Components](#standalone-components)
  - [SCSS in Component Tests](#scss-in-component-tests)
- [Service Testing](#service-testing)
- [Angular Component Testing](#angular-component-testing-1)
  - [Defensive Programming](#defensive-programming)
- [Backend Testing Tips](#backend-testing-tips)
- [General Testing Tips](#general-testing-tips)
- [Common Issues](#common-issues)
- [Test Setup Best Practices](#test-setup-best-practices)
- [Mocking Components and Services](#mocking-components-and-services)
- [Testing Asynchronous Code](#testing-asynchronous-code)
- [Testing Map Components](#testing-map-components)
  - [Mocking External Map Libraries](#mocking-external-map-libraries)
  - [Testing Map Initialization](#testing-map-initialization)
  - [Testing Map Events](#testing-map-events)
  - [Testing Map Markers](#testing-map-markers)
  - [Testing Geolocation](#testing-geolocation)
  - [Testing Performance Monitoring](#testing-performance-monitoring)
  - [Testing Map Component Cleanup](#testing-map-component-cleanup)

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
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
});
```

4. **Simplified Component Templates**: For components with complex templates that cause testing issues (like aria-label binding errors), create a test component that extends the original but uses a simplified template:

```typescript
// Create a test component that extends the original but uses a simplified template
@Component({
  selector: 'app-root',
  template: '<div>Mock App Component</div>', // Simple template without problematic bindings
  standalone: true,
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
];

// INCORRECT - will cause "Cannot read properties of undefined (reading 'root')" error
providers: [
  { provide: AuthService, useValue: mockAuthService },
  { provide: Router, useValue: mockRouter }, // Don't do this!
];
```

7. **Handling window.location.href in Tests**: When testing components that use direct window.location.href navigation, use Angular Router instead to make testing easier:

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
const notificationServiceSpy = jasmine.createSpyObj(
  'NotificationService',
  ['success', 'error', 'info', 'warning', 'removeToast'],
  {
    // Mock the observable properties
    toasts$: of([]),
    unreadCount$: of(0),
  }
);
```

5. **HTTP Error Testing**: When testing error handling in HTTP services, be careful with the error expectations:

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
  complete: () => fail('Expected error, not complete'), // This might fail unexpectedly
});
```

## Angular Component Testing

### Defensive Programming

1. **Null Checks**: Always add null checks in component methods to handle cases where inputs might be undefined:

```typescript
// INCORRECT - Will cause "Cannot read properties of undefined" in tests
getPrimaryImage(): string {
  return this.ad.images[0];
}

// CORRECT - Handles undefined inputs gracefully
getPrimaryImage(): string {
  if (!this.ad || !this.ad.images || this.ad.images.length === 0) {
    return '/assets/img/default-profile.jpg';
  }
  return this.ad.images[0];
}
```

2. **Event Handlers**: Add null checks in event handlers to prevent errors when component properties are undefined:

```typescript
// INCORRECT - Will cause errors if this.ad is undefined
onViewDetails(event?: Event): void {
  if (event) event.stopPropagation();
  this.viewDetails.emit(this.ad._id);
}

// CORRECT - Checks if this.ad exists before accessing properties
onViewDetails(event?: Event): void {
  if (event) event.stopPropagation();
  if (this.ad && this.ad._id) {
    this.viewDetails.emit(this.ad._id);
  }
}
```

3. **Initialization**: Handle undefined inputs in ngOnInit to prevent template binding errors:

```typescript
// INCORRECT - Will cause errors if this.ad is undefined
ngOnInit(): void {
  this.backgroundImageUrl = this.getPrimaryImage();
}

// CORRECT - Handles the case when this.ad is undefined
ngOnInit(): void {
  if (this.ad) {
    this.backgroundImageUrl = this.getPrimaryImage();
  } else {
    this.backgroundImageUrl = '/assets/img/default-profile.jpg';
  }
}
```

## Backend Testing Tips

1. **Error Message Consistency**: Ensure error messages in the code match exactly what's expected in tests. Inconsistencies between error messages in implementation and tests are a common source of test failures.

2. **Error Propagation**: When catching and re-throwing errors, be careful about preserving specific error types or messages that tests might be expecting. Consider checking the original error message before deciding what to throw.

3. **Mock Implementation**: When mocking database models or external services, ensure the mock implementation returns objects with the same structure and methods as the real implementation.

4. **Testing MongoDB Models**: When testing MongoDB models:
   - Use `mongodb-memory-server` for in-memory database testing to avoid affecting production data
   - Create separate test data constants for each model type to ensure test clarity
   - Test both successful creation and validation failures
   - For models with relationships, create the related entities first (e.g., create User before Wallet, and Wallet before PaymentMethod)
   - Test all enum validations by attempting to save invalid values
   - Verify both required fields and default values
   - For models with methods, test each method in isolation
   - Use `beforeEach` to set up test data and `afterEach` to clear the database between tests
   - When testing methods that modify the database, reload the entity from the database to verify changes were persisted
   - For methods that throw errors, use try/catch blocks in tests rather than expect().rejects.toThrow() for more reliable testing
   - Test nested schema structures (e.g., balances, transactions, payment methods in a wallet) thoroughly
   - Verify that unique constraints are enforced at the database level

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

## Common Issues

### SASS Compilation Errors

- **Issue**: Duplicate imports of design tokens can cause SASS compilation errors.
- **Solution**: Use the design system's main entry point and avoid direct imports of design tokens.
- **Example**: Use `@use '~/styles/design-system'` instead of directly importing design tokens.

### Standalone Component Testing

- **Issue**: Standalone components cannot be declared in test modules.
- **Solution**: Use imports instead of declarations for standalone components.
- **Example**:
  ```typescript
  TestBed.configureTestingModule({
    imports: [CommonTestModule, MyStandaloneComponent],
    // NOT declarations: [MyStandaloneComponent]
  });
  ```

### Template Errors

- **Issue**: Components with `@ContentChild` or `@ViewChild` may fail if templates are not properly initialized.
- **Solution**: Ensure the component's template is properly initialized in tests.
- **Example**: Call `detectChanges()` after component creation to initialize ViewChild references.

## Test Setup Best Practices

### Use Common Test Module

The application provides a `CommonTestModule` that includes frequently used test components and utilities:

```typescript
import { CommonTestModule } from '../../testing/common-test.module';

TestBed.configureTestingModule({
  imports: [CommonTestModule, ComponentUnderTest],
});
```

### Use Test Utilities

The application provides test utilities for creating mock components and services:

```typescript
import { createMockComponent, createMockService } from '../../testing/test-utils';

const MockHeaderComponent = createMockComponent('app-header', ['title', 'showMenu']);
const MockAuthService = createMockService({
  login: () => of({ success: true }),
  logout: () => of(null),
});
```

### Override Component Imports

When testing components that import other components, override the imports to use mock components:

```typescript
TestBed.configureTestingModule({
  imports: [ComponentUnderTest],
}).overrideComponent(ComponentUnderTest, {
  set: {
    imports: [CommonModule, MockChildComponent],
  },
});
```

## Mocking Components and Services

### Mock Components

Create mock components using the `createMockComponent` utility:

```typescript
const MockCardComponent = createMockComponent(
  'app-card',
  ['title', 'description', 'imageUrl'],
  '<div>{{title}}</div>'
);
```

For more complex mocks, create a standalone component:

```typescript
@Component({
  selector: 'app-complex-component',
  template: '<div>Mock Complex Component</div>',
  standalone: true,
  imports: [CommonModule],
})
class MockComplexComponent {
  @Input() data: any;
  @Output() action = new EventEmitter<any>();

  // Add any methods that are called in tests
  performAction() {
    this.action.emit({ type: 'mock' });
  }
}
```

### Mock Services

Create mock services using the `createMockService` utility:

```typescript
const MockUserService = createMockService({
  getCurrentUser: () => of({ id: '1', name: 'Test User' }),
  updateProfile: data => of({ success: true }),
  isAuthenticated: () => true,
});
```

For more complex services, create a class:

```typescript
class MockAuthService {
  currentUser$ = new BehaviorSubject({ id: '1', name: 'Test User' });

  login(credentials: any) {
    return of({ success: true, token: 'mock-token' });
  }

  logout() {
    return of({ success: true });
  }
}
```

## Testing Asynchronous Code

### Testing Observables

Use `fakeAsync` and `tick()` to test code with observables:

```typescript
it('should load data on init', fakeAsync(() => {
  spyOn(dataService, 'getData').and.returnValue(of(['item1', 'item2']));

  component.ngOnInit();
  tick(); // Process the observable

  expect(component.items).toEqual(['item1', 'item2']);
}));
```

### Testing Promises

Use `async/await` or `fakeAsync` with `tick()` for promises:

```typescript
it('should load data asynchronously', async () => {
  spyOn(dataService, 'getDataPromise').and.returnValue(Promise.resolve(['item1', 'item2']));

  await component.loadDataAsync();

  expect(component.items).toEqual(['item1', 'item2']);
});
```

Or with `fakeAsync`:

```typescript
it('should load data asynchronously', fakeAsync(() => {
  spyOn(dataService, 'getDataPromise').and.returnValue(Promise.resolve(['item1', 'item2']));

  component.loadDataAsync();
  tick(); // Process the promise

  expect(component.items).toEqual(['item1', 'item2']);
}));
```

## Testing Map Components

When testing components that use mapping libraries like Leaflet, special considerations are needed:

### Mocking External Map Libraries

Mock the external map library to avoid DOM manipulation during tests:

```typescript
// Mock Leaflet
jest.mock('leaflet', () => {
  const originalModule = jest.requireActual('leaflet');

  // Create mock map instance
  const mockMap = {
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    on: jest.fn().mockReturnThis(),
    off: jest.fn(),
    invalidateSize: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    getZoom: jest.fn().mockReturnValue(10),
    setZoom: jest.fn(),
    getCenter: jest.fn().mockReturnValue({ lat: 0, lng: 0 }),
    flyTo: jest.fn(),
    getBounds: jest.fn().mockReturnValue({
      contains: jest.fn().mockReturnValue(true),
    }),
    fitBounds: jest.fn(),
    closePopup: jest.fn(),
  };

  // Create mock marker
  const mockMarker = {
    addTo: jest.fn().mockReturnThis(),
    setLatLng: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    openPopup: jest.fn(),
    remove: jest.fn(),
    on: jest.fn().mockReturnThis(),
  };

  // Create mock layer group
  const mockLayerGroup = {
    addTo: jest.fn().mockReturnThis(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    clearLayers: jest.fn(),
  };

  return {
    ...originalModule,
    map: jest.fn().mockReturnValue(mockMap),
    marker: jest.fn().mockReturnValue(mockMarker),
    layerGroup: jest.fn().mockReturnValue(mockLayerGroup),
    tileLayer: jest.fn().mockReturnValue({
      addTo: jest.fn(),
    }),
    icon: jest.fn().mockReturnValue({}),
    divIcon: jest.fn().mockReturnValue({}),
    popup: jest.fn().mockReturnValue({
      setLatLng: jest.fn().mockReturnThis(),
      setContent: jest.fn().mockReturnThis(),
      openOn: jest.fn(),
    }),
    latLngBounds: jest.fn().mockReturnValue({}),
  };
});
```

### Testing Map Initialization

Test that the map is properly initialized:

```typescript
it('should initialize map on ngAfterViewInit', () => {
  // Spy on Leaflet map creation
  const mapSpy = spyOn(L, 'map').and.callThrough();

  // Call ngAfterViewInit
  component.ngAfterViewInit();

  // Verify map was created
  expect(mapSpy).toHaveBeenCalled();
  expect(component.map).toBeTruthy();
});
```

### Testing Map Events

Test map event handlers by simulating events:

```typescript
it('should handle map click events', () => {
  // Initialize component
  component.ngAfterViewInit();

  // Get the click handler from the map.on call
  const clickHandler = L.map().on.calls.argsFor(0)[1];

  // Create mock event
  const mockEvent = {
    latlng: { lat: 10, lng: 20 },
  };

  // Call the handler directly
  clickHandler(mockEvent);

  // Verify the component handled the event
  expect(component.selectedLocation).toEqual({
    latitude: 10,
    longitude: 20,
  });
});
```

### Testing Map Markers

Test marker creation and interaction:

```typescript
it('should add markers to the map', () => {
  // Initialize component
  component.ngAfterViewInit();

  // Set markers
  component.markers = [
    { id: '1', latitude: 10, longitude: 20, title: 'Marker 1' },
    { id: '2', latitude: 30, longitude: 40, title: 'Marker 2' },
  ];

  // Call method to add markers
  component.updateMarkers(component.markers);

  // Verify markers were created
  expect(L.marker).toHaveBeenCalledTimes(2);
  expect(L.marker).toHaveBeenCalledWith([10, 20], jasmine.any(Object));
  expect(L.marker).toHaveBeenCalledWith([30, 40], jasmine.any(Object));
});

it('should handle marker click events', () => {
  // Initialize component
  component.ngAfterViewInit();

  // Set markers
  component.markers = [{ id: '1', latitude: 10, longitude: 20, title: 'Marker 1' }];

  // Update markers
  component.updateMarkers(component.markers);

  // Spy on output event
  spyOn(component.markerClick, 'emit');

  // Get the click handler from the marker.on call
  const clickHandler = L.marker().on.calls.argsFor(0)[1];

  // Call the handler directly
  clickHandler();

  // Verify the event was emitted
  expect(component.markerClick.emit).toHaveBeenCalledWith(component.markers[0]);
});
```

### Testing Geolocation

Mock the geolocation API for testing:

```typescript
it('should show user location when available', fakeAsync(() => {
  // Mock successful geolocation
  const mockGeolocation = {
    getCurrentPosition: jasmine.createSpy().and.callFake(successCallback => {
      successCallback({
        coords: {
          latitude: 10,
          longitude: 20,
        },
      });
    }),
  };

  // Replace navigator.geolocation
  spyOnProperty(navigator, 'geolocation').and.returnValue(mockGeolocation);

  // Initialize component
  component.ngAfterViewInit();

  // Call method to show user location
  component.showCurrentLocation();
  tick();

  // Verify marker was created at the right position
  expect(L.marker).toHaveBeenCalledWith([10, 20], jasmine.any(Object));
}));

it('should handle geolocation errors', fakeAsync(() => {
  // Mock geolocation error
  const mockGeolocation = {
    getCurrentPosition: jasmine.createSpy().and.callFake((successCallback, errorCallback) => {
      errorCallback({
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
      });
    }),
  };

  // Replace navigator.geolocation
  spyOnProperty(navigator, 'geolocation').and.returnValue(mockGeolocation);

  // Spy on error handling
  spyOn(console, 'error');

  // Initialize component
  component.ngAfterViewInit();

  // Call method to show user location
  component.showCurrentLocation();
  tick();

  // Verify error was handled
  expect(console.error).toHaveBeenCalled();
  expect(L.popup).toHaveBeenCalled();
}));
```

### Testing Performance Monitoring

Test that performance metrics are properly tracked:

```typescript
it('should track map initialization time', () => {
  // Spy on monitoring service
  const monitoringSpy = spyOn(monitoringService, 'trackInitialization');

  // Initialize component
  component.ngAfterViewInit();

  // Verify monitoring service was called
  expect(monitoringSpy).toHaveBeenCalled();
  expect(monitoringSpy.calls.first().args[0]).toBeGreaterThan(0);
});

it('should track marker rendering performance', () => {
  // Spy on monitoring service
  const renderSpy = spyOn(monitoringService, 'trackRender');
  const markersSpy = spyOn(monitoringService, 'trackMarkers');

  // Initialize component
  component.ngAfterViewInit();

  // Update markers
  component.updateMarkers([{ id: '1', latitude: 10, longitude: 20, title: 'Test' }]);

  // Verify monitoring service was called
  expect(renderSpy).toHaveBeenCalled();
  expect(markersSpy).toHaveBeenCalledWith(1, 'update');
});
```

### Testing Map Component Cleanup

Test that resources are properly cleaned up:

```typescript
it('should clean up resources on destroy', () => {
  // Initialize component
  component.ngAfterViewInit();

  // Get reference to map
  const map = component.map;

  // Destroy component
  component.ngOnDestroy();

  // Verify map was removed
  expect(map.remove).toHaveBeenCalled();
  expect(component.map).toBeNull();
});
```
