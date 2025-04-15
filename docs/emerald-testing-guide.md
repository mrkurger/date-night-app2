# Emerald.js Testing Guide

This guide provides instructions and best practices for testing Emerald.js components in the Date Night App.

## Table of Contents

1. [Introduction](#introduction)
2. [Testing Strategy](#testing-strategy)
3. [Unit Testing Components](#unit-testing-components)
4. [Integration Testing](#integration-testing)
5. [Test Examples](#test-examples)
6. [Best Practices](#best-practices)

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

import { MyComponent } from './my-component.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
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
    <emerald-parent>
      <emerald-child [input]="value" (output)="handleOutput($event)"></emerald-child>
    </emerald-parent>
  `
})
class TestHostComponent {
  value = 'test';
  outputValue: any;
  
  handleOutput(value: any) {
    this.outputValue = value;
  }
}

describe('Component Interaction', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [ParentComponent, ChildComponent]
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
```

Key aspects of this test:

- Testing different layout variations
- Testing conditional rendering (avatar, tags, etc.)
- Testing event emissions
- Testing accessibility attributes

### CardGrid Component Test

The CardGrid component test demonstrates how to test a component that manages a collection of items:

```typescript
// See client-angular/src/app/shared/emerald/card-grid/card-grid.component.spec.ts
```

Key aspects of this test:

- Using a test host component to simulate real usage
- Testing responsive behavior
- Testing different layout variations
- Testing item rendering and interactions

### Netflix View Component Test

The Netflix view component test demonstrates how to test a feature component that uses multiple Emerald components:

```typescript
// See client-angular/src/app/features/netflix-view/netflix-view.component.spec.ts
```

Key aspects of this test:

- Mocking services
- Testing component initialization
- Testing user interactions
- Testing error handling

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on testing what the component does, not how it does it.
2. **Isolate Tests**: Each test should be independent and not rely on the state of other tests.
3. **Mock Dependencies**: Use mock services and components to isolate the component being tested.
4. **Test Edge Cases**: Test how the component behaves with empty data, errors, and other edge cases.
5. **Test Accessibility**: Ensure components have appropriate ARIA attributes and keyboard navigation.
6. **Keep Tests Simple**: Each test should test one specific aspect of the component.
7. **Use Descriptive Test Names**: Test names should clearly describe what is being tested.
8. **Organize Tests Logically**: Group related tests using describe blocks.
9. **Test Responsive Behavior**: Verify components work correctly at different screen sizes.
10. **Test Performance**: Ensure components perform well, especially with large data sets.

By following these guidelines, you can ensure that Emerald components are thoroughly tested and maintain their functionality over time.