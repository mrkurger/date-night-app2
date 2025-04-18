# Unit Testing Lessons Learned

## Table of Contents

- [Angular Component Testing](#angular-component-testing)
  - [SCSS Import Issues](#1-scss-import-issues)
  - [Component Dependencies](#2-component-dependencies)
  - [Interface Updates](#3-interface-updates)
  - [Service Mocking](#4-service-mocking)
  - [Testing Asynchronous Code](#5-testing-asynchronous-code)
- [Lessons from Current Testing Effort](#lessons-from-current-testing-effort)

## Angular Component Testing

### 1. SCSS Import Issues

When testing Angular components that use SCSS imports, we encountered issues with the SCSS imports not being resolved correctly. This is because the test environment doesn't process SCSS imports the same way as the build environment.

**Solution:**
- Create mock SCSS files in the correct locations
- Update import paths to match the project structure
- Consider using a more modular approach to SCSS imports

### 2. Component Dependencies

When testing components that depend on other components, we need to properly mock those dependencies to avoid errors.

**Example:**
```typescript
// Mock MainLayoutComponent
@Component({
  selector: 'app-main-layout',
  template: '<ng-content></ng-content>'
})
class MockMainLayoutComponent {
  @Input() activeView: 'netflix' | 'tinder' | 'list' = 'tinder';
}

// Add to TestBed configuration
TestBed.configureTestingModule({
  declarations: [
    MockMainLayoutComponent
  ],
  // ...
});
```

### 3. Interface Updates

When updating interfaces, we need to update all mock data in tests to match the new interface.

**Example:**
```typescript
// Old mock data
const mockAds = [
  {
    _id: '1',
    title: 'Test Ad 1',
    description: 'Test description 1',
    price: 100,
    location: 'Oslo',
    category: 'Dinner',
    media: [
      { url: '/assets/images/test-image-1.jpg', type: 'image' }
    ],
    user: {
      _id: 'user1',
      name: 'Test User 1',
      profileImage: '/assets/images/default-profile.jpg'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Updated mock data to match new interface
const mockAds = [
  {
    _id: '1',
    title: 'Test Ad 1',
    description: 'Test description 1',
    price: 100,
    location: 'Oslo',
    category: 'Dinner',
    media: [
      { url: '/assets/images/test-image-1.jpg', type: 'image' }
    ],
    images: ['/assets/images/test-image-1.jpg'],
    advertiser: 'Test User 1',
    userId: 'user1',
    isActive: true,
    isFeatured: false,
    isTrending: false,
    isTouring: false,
    viewCount: 0,
    clickCount: 0,
    inquiryCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['tag1', 'tag2']
  }
];
```

### 4. Service Mocking

When testing components that use services, we need to properly mock those services to avoid making actual API calls.

**Example:**
```typescript
class MockAdService {
  getSwipeAds() {
    return of(mockAds);
  }
  
  likeAd() {
    return of({ success: true });
  }
  
  dislikeAd() {
    return of({ success: true });
  }
}

// Add to TestBed configuration
TestBed.configureTestingModule({
  providers: [
    { provide: AdService, useClass: MockAdService }
  ],
  // ...
});
```

### 5. Testing Asynchronous Code

When testing asynchronous code, we need to use `fakeAsync` and `tick` to properly test the code.

**Example:**
```typescript
it('should load ads on init', fakeAsync(() => {
  spyOn(adService, 'getSwipeAds').and.returnValue(of(mockAds));
  component.ngOnInit();
  tick();
  expect(component.ads).toEqual(mockAds);
  expect(component.loading).toBeFalse();
}));
```

## Lessons from Current Testing Effort

1. **Interface Changes**: When updating interfaces, we need to update all mock data in tests to match the new interface. This includes adding new properties and removing deprecated ones.

2. **Component Dependencies**: Components that use other components need proper mocking to avoid errors. This is especially important for layout components that are used across the application.

3. **SCSS Issues**: SCSS imports can cause issues in tests. We need to ensure that all SCSS files are properly mocked or available in the test environment.

4. **Build Issues**: The build process can reveal issues that aren't caught by individual component tests. It's important to run a full build periodically to catch these issues.

5. **Missing Dependencies**: Missing dependencies like `angularx-qrcode` can cause build failures. We need to ensure that all dependencies are properly installed and imported.