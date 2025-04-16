# Emerald.js Testing Guide

This guide provides instructions and best practices for testing Emerald.js components in the Date Night App.

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Strategy](#testing-strategy)
3. [Unit Testing Components](#unit-testing-components)
4. [Integration Testing](#integration-testing)
5. [Test Examples](#test-examples)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [Best Practices](#best-practices)

## Introduction

Testing is a critical part of the Emerald.js component library development process. This guide outlines the approach to testing Emerald components to ensure they work correctly and maintain their functionality over time.

## Testing Strategy

Our testing strategy for Emerald components follows these principles:

1. **Component Isolation**: Test each component in isolation to ensure it works correctly on its own.
2. **Integration Testing**: Test components together to ensure they work correctly when combined.
3. **Behavior Testing**: Focus on testing component behavior rather than implementation details.
4. **Accessibility Testing**: Ensure components meet accessibility standards.
5. **Responsive Testing**: Verify components work correctly across different screen sizes.

## Unit Testing Components

### Setting Up Component Tests

To set up a test for an Emerald component, follow these steps:

1. Create a spec file for the component (e.g., `component-name.component.spec.ts`).
2. Import the necessary testing utilities from Angular.
3. Configure the TestBed with the component and any dependencies.
4. Create the component fixture and instance.
5. Write tests for the component's functionality.

Example:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyComponent } from './my-component.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MyComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Additional tests...
});
```

### Testing Component Inputs

Test how the component responds to different input values:

```typescript
it('should display the title', () => {
  component.title = 'Test Title';
  fixture.detectChanges();
  
  const titleElement = fixture.debugElement.query(By.css('.component-title'));
  expect(titleElement.nativeElement.textContent).toContain('Test Title');
});
```

### Testing Component Outputs

Test that the component emits the expected events:

```typescript
it('should emit click event when button is clicked', () => {
  spyOn(component.click, 'emit');
  
  const button = fixture.debugElement.query(By.css('button'));
  button.nativeElement.click();
  
  expect(component.click.emit).toHaveBeenCalled();
});
```

### Testing Component Styling

Test that the component applies the correct classes and styles:

```typescript
it('should apply primary class when primary input is true', () => {
  component.primary = true;
  fixture.detectChanges();
  
  const element = fixture.debugElement.query(By.css('.component'));
  expect(element.nativeElement.classList).toContain('component--primary');
});
```

## Integration Testing

### Testing Component Interactions

To test how components interact with each other, create a test host component:

```typescript
@Component({
  template: `
    <emerald-card-grid
      [items]="items"
      [layout]="layout"
      (cardClick)="onCardClick($event)">
    </emerald-card-grid>
  `,
  standalone: true,
  imports: [CardGridComponent]
})
class TestHostComponent {
  items = MOCK_ITEMS;
  layout = 'default';
  
  onCardClick(id: string) {}
}

describe('Component Interaction', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TestHostComponent,
        CardGridComponent
      ]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should pass input to child component', () => {
    // Test implementation
  });

  it('should handle output from child component', () => {
    // Test implementation
  });
});
```

## Test Examples

### AppCard Component Test

The AppCard component test demonstrates how to test a complex component with multiple inputs, outputs, and styling variations:

```typescript
// See client-angular/src/app/shared/emerald/app-card/app-card.component.spec.ts

describe('AppCardComponent', () => {
  // Setup code...

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      const newComponent = new AppCardComponent();
      expect(newComponent.layout).toBe('default');
      expect(newComponent.title).toBe('');
      // Check other default values...
    });
  });

  describe('Event Handling', () => {
    it('should emit click event when card is clicked', () => {
      spyOn(component.click, 'emit');
      component.handleClick();
      expect(component.click.emit).toHaveBeenCalledWith(mockItem.id);
    });
  });

  describe('Tag Handling', () => {
    it('should limit visible tags based on maxTags property', () => {
      component.maxTags = 2;
      expect(component.visibleTags.length).toBe(2);
    });
  });
});
```

### CardGrid Component Test

The CardGrid component test demonstrates how to test a component that manages a collection of items:

```typescript
// See client-angular/src/app/shared/emerald/card-grid/card-grid.component.spec.ts

describe('CardGridComponent', () => {
  // Setup code...

  describe('Layout Rendering', () => {
    it('should apply default layout class', () => {
      const gridElement = debugElement.query(By.css('.emerald-card-grid--default'));
      expect(gridElement).toBeTruthy();
    });

    it('should apply masonry layout class when layout is set to masonry', () => {
      component.layout = 'masonry';
      fixture.detectChanges();
      
      const gridElement = debugElement.query(By.css('.emerald-card-grid--masonry'));
      expect(gridElement).toBeTruthy();
    });
  });

  describe('Event Handling', () => {
    it('should emit cardClick event when handleCardClick is called', () => {
      spyOn(component.cardClick, 'emit');
      component.handleCardClick('item1');
      expect(component.cardClick.emit).toHaveBeenCalledWith('item1');
    });
  });
});
```

## Common Issues and Solutions

### 1. Component Path Mismatches

**Issue**: Tests import components from incorrect paths, causing mismatches between test expectations and actual component behavior.

**Solution**:
- Ensure imports in test files match the actual component paths
- Check for duplicate component implementations in different directories
- Example:
  ```typescript
  // WRONG
  import { CardGridComponent } from './card-grid.component';
  
  // CORRECT (if component is in a different directory)
  import { CardGridComponent } from '../components/card-grid/card-grid.component';
  ```

### 2. SCSS Import Path Issues

**Issue**: SCSS imports fail in component tests due to incorrect paths or missing design tokens.

**Solution**:
- Ensure SCSS import paths are correct and consistent
- Create fallback variables for missing design tokens
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

### 3. Mock Data Inconsistencies

**Issue**: Mock data not matching the actual interface requirements, causing type errors.

**Solution**:
- Create shared mock data factories that follow the interface definitions
- Use TypeScript's type checking to ensure mock data is valid
- Example:
  ```typescript
  // Define a mock factory for items used in CardGrid
  const MOCK_ITEMS = [
    {
      id: 'item1',
      title: 'Item 1',
      subtitle: 'Subtitle 1',
      description: 'Description for item 1',
      imageUrl: 'https://example.com/image1.jpg',
      tags: ['tag1', 'tag2'],
      actions: [
        { id: 'action1', icon: 'heart', tooltip: 'Like' },
        { id: 'action2', icon: 'comment', tooltip: 'Comment' }
      ]
    },
    // More items...
  ];
  ```

### 4. Component Version Mismatches

**Issue**: Multiple versions of the same component exist in different directories, causing confusion in tests.

**Solution**:
- Identify which version of the component is being used in the application
- Update tests to use the correct component version
- Add comments to clarify which version is being tested
- Example:
  ```typescript
  /**
   * This test is for the AppCardComponent in the shared/emerald/app-card directory,
   * which is the simplified version used for general card displays.
   * 
   * For the ad-specific version, see the tests in shared/emerald/components/app-card.
   */
  describe('AppCardComponent (Basic Version)', () => {
    // Test implementation...
  });
  ```

### 5. Event Emission Testing

**Issue**: Difficulty testing event emissions from nested components.

**Solution**:
- Use a test host component to capture events
- Directly test the component's event emission methods
- Example:
  ```typescript
  // Direct method testing
  it('should emit cardClick event when handleCardClick is called', () => {
    spyOn(component.cardClick, 'emit');
    component.handleCardClick('item1');
    expect(component.cardClick.emit).toHaveBeenCalledWith('item1');
  });
  
  // Host component testing
  it('should propagate cardClick event from host component', () => {
    spyOn(hostComponent, 'onCardClick');
    const cardElements = hostFixture.debugElement.queryAll(By.css('app-card'));
    const firstCard = cardElements[0];
    firstCard.triggerEventHandler('viewDetails', MOCK_ITEMS[0].id);
    expect(hostComponent.onCardClick).toHaveBeenCalledWith(MOCK_ITEMS[0].id);
  });
  ```

## Best Practices

### 1. Component Testing Structure

- **Initialization Tests**: Verify the component creates successfully and initializes with correct default values
- **Input Tests**: Test how the component responds to different input values
- **Output Tests**: Verify that events are emitted correctly
- **UI State Tests**: Check that the UI reflects the component's state
- **Edge Case Tests**: Test empty states, loading states, and error states

### 2. Emerald-Specific Testing Guidelines

- **Test Layout Variations**: Emerald components often support multiple layouts (default, compact, masonry, etc.)
- **Test Responsive Behavior**: Verify that components adapt correctly to different screen sizes
- **Test Accessibility**: Ensure components have appropriate ARIA attributes and keyboard navigation
- **Test Theme Support**: Verify that components apply the correct theme classes
- **Test Animation States**: Check that animations are applied correctly

### 3. Documentation in Tests

- Add a header comment to each test file explaining:
  - What component is being tested
  - Any special considerations for testing this component
  - Related components or dependencies
- Example:
  ```typescript
  // ===================================================
  // CUSTOMIZABLE SETTINGS IN THIS FILE
  // ===================================================
  // This file contains tests for the Emerald CardGrid component
  // 
  // COMMON CUSTOMIZATIONS:
  // - MOCK_ITEMS: Mock items data for testing
  // ===================================================
  ```

### 4. Test Organization

- Group related tests using nested `describe` blocks
- Use clear, descriptive test names that explain the expected behavior
- Organize tests by component feature or behavior
- Example:
  ```typescript
  describe('CardGridComponent', () => {
    // Setup code...
    
    describe('Component Initialization', () => {
      // Tests for component creation and default values
    });
    
    describe('Layout Rendering', () => {
      // Tests for different layout options
    });
    
    describe('Item Rendering', () => {
      // Tests for rendering items correctly
    });
    
    describe('Event Handling', () => {
      // Tests for event emissions
    });
  });
  ```

### 5. Mock Data Management

- Create reusable mock data factories for common data structures
- Keep mock data consistent across tests
- Include all required properties in mock data
- Add optional properties that might affect component behavior

### 6. Testing Utility Methods

- Create helper methods for common testing tasks
- Example:
  ```typescript
  // Helper to find elements by test ID
  function findByTestId(testId: string): DebugElement {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }
  
  // Helper to trigger events
  function triggerClick(element: DebugElement): void {
    element.triggerEventHandler('click', null);
    fixture.detectChanges();
  }
  ```

By following these guidelines, you can ensure that Emerald components are thoroughly tested and maintain their functionality over time.