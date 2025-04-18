# Component Documentation Template

## Component Name

Brief description of the component's purpose and main functionality.

### Import Path

```typescript
import { ComponentNameComponent } from '@app/path/to/component';
```

### Selector

```html
<app-component-name></app-component-name>
```

### Features

- List key features of the component
- Focus on what makes this component useful
- Highlight any special behaviors or capabilities

### Use Cases

- Describe common scenarios where this component should be used
- Explain when to use this component vs. alternatives
- Provide context for the component's role in the application

## API Reference

### Inputs

| Name            | Type      | Default           | Description                                                           |
| --------------- | --------- | ----------------- | --------------------------------------------------------------------- |
| `inputProperty` | `string`  | `''`              | Description of what this input does and how it affects the component. |
| `optionalInput` | `string`  | `'default-value'` | Description of this optional input with its default value.            |
| `isEnabled`     | `boolean` | `false`           | Explanation of what happens when this is true vs false.               |

### Outputs

| Name              | Type                   | Description                                                                 |
| ----------------- | ---------------------- | --------------------------------------------------------------------------- |
| `actionCompleted` | `EventEmitter<string>` | Emitted when the primary action is completed. The emitted value contains... |
| `secondaryAction` | `EventEmitter<void>`   | Emitted when the secondary action is triggered.                             |

### Methods

| Name                    | Parameters | Return Type | Description                                                          |
| ----------------------- | ---------- | ----------- | -------------------------------------------------------------------- |
| `handlePrimaryAction`   | None       | `void`      | Triggers the primary action and emits the `actionCompleted` event.   |
| `handleSecondaryAction` | None       | `void`      | Triggers the secondary action and emits the `secondaryAction` event. |

### Content Projection

| Selector                 | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| Default (`<ng-content>`) | Content projected into the primary content area.                 |
| `[contentSection]`       | Content projected into a specific named section (if applicable). |

## Usage Examples

### Basic Usage

```html
<app-component-name
  inputProperty="Example Value"
  [isEnabled]="true"
  (actionCompleted)="onActionComplete($event)"
>
  Content to project
</app-component-name>
```

### Advanced Usage

```html
<app-component-name
  inputProperty="Advanced Example"
  [optionalInput]="dynamicValue"
  [isEnabled]="isFeatureEnabled"
  (actionCompleted)="onActionComplete($event)"
  (secondaryAction)="onSecondaryAction()"
>
  <div>Primary content</div>
  <div contentSection>Named section content</div>
</app-component-name>
```

```typescript
// Component controller code
export class ExampleComponent {
  dynamicValue = 'Dynamic content';
  isFeatureEnabled = true;

  onActionComplete(result: string) {
    console.log('Action completed with result:', result);
  }

  onSecondaryAction() {
    console.log('Secondary action triggered');
  }
}
```

## Styling

### CSS Custom Properties

| Property                         | Default   | Description                       |
| -------------------------------- | --------- | --------------------------------- |
| `--component-name-background`    | `#ffffff` | Background color of the component |
| `--component-name-border-radius` | `8px`     | Border radius of the component    |
| `--component-name-padding`       | `16px`    | Internal padding of the component |

### CSS Classes

| Class                      | Description                           |
| -------------------------- | ------------------------------------- |
| `.component-name`          | Main component container              |
| `.component-name--enabled` | Applied when the component is enabled |
| `.component-name__header`  | Header section of the component       |
| `.component-name__content` | Content section of the component      |
| `.component-name__actions` | Actions section of the component      |

### Styling Examples

```scss
// Customizing the component
app-component-name {
  --component-name-background: #f5f5f5;
  --component-name-border-radius: 12px;

  // Or using direct class selectors
  .component-name__header {
    border-bottom: 2px solid #e0e0e0;
  }
}
```

## Accessibility

- **ARIA Roles**: Describes any ARIA roles used in the component
- **Keyboard Navigation**: Details how users can navigate the component with a keyboard
- **Screen Reader Considerations**: Notes on how the component works with screen readers
- **Focus Management**: Explains how focus is handled within the component

## Design Guidelines

- **Visual Design**: Notes on the component's visual design principles
- **Layout**: Guidelines for component placement and spacing
- **Responsive Behavior**: How the component adapts to different screen sizes
- **States**: Visual representation of different component states (hover, active, disabled, etc.)

## Best Practices

- Do use the component for its intended purpose
- Do provide all required inputs
- Don't nest this component inside similar components
- Don't use this component when [alternative] would be more appropriate

## Related Components

- [RelatedComponent1] - Used for similar purposes but with different constraints
- [RelatedComponent2] - Often used together with this component
- [ParentComponent] - May contain this component as part of a larger pattern

## Changelog

| Version | Changes                                                   |
| ------- | --------------------------------------------------------- |
| 1.0.0   | Initial release                                           |
| 1.1.0   | Added `newFeature` input property                         |
| 1.2.0   | Improved accessibility with ARIA attributes               |
| 2.0.0   | Breaking change: Renamed `oldOutput` to `actionCompleted` |

---

Last Updated: [Date]

## Contributors

- [Developer Name] - Initial implementation
- [Developer Name] - Added feature X
- [Developer Name] - Accessibility improvements
