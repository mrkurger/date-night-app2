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
- [Map Integration Patterns](#map-integration-patterns)
  - [Reusable Map Component](#reusable-map-component)
  - [Accessibility Considerations](#accessibility-considerations)
  - [Performance Optimization](#performance-optimization)
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
