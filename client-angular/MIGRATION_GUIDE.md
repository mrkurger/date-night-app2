# Angular Migration Guide: NgModules to Standalone Components

This guide outlines the ongoing migration from Angular's NgModule-based architecture to the newer standalone components approach in the Date Night App.

## Current Status

The application is in a transition phase:

- The root `AppComponent` has been converted to a standalone component
- New features are being implemented as standalone components
- Legacy features still use NgModules
- Both bootstrapping methods are supported:
  - Modern: `bootstrapApplication()` in `main.ts`
  - Legacy: NgModule-based in `app.module.ts`

## Migration Strategy

### For Developers

When working on the codebase:

1. **New Features**: Always implement as standalone components
   ```typescript
   @Component({
     selector: 'app-new-feature',
     templateUrl: './new-feature.component.html',
     styleUrls: ['./new-feature.component.scss'],
     standalone: true,
     imports: [CommonModule, RouterModule, /* other dependencies */]
   })
   export class NewFeatureComponent { }
   ```

2. **Existing Features**: When making significant changes to an existing feature, consider migrating it to a standalone component

3. **Routing**: Add new routes to `app.routes.ts`, not to `app-routing.module.ts`

### Migration Steps for Existing Components

To migrate an existing component from NgModule-based to standalone:

1. Add the `standalone: true` property to the component decorator
2. Add an `imports` array with all the dependencies
3. Remove the component from its module's `declarations` array
4. Update any routing configurations to use the standalone component

Example:

```typescript
// Before
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent { }

// After
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, /* other dependencies */]
})
export class ExampleComponent { }
```

## Benefits of Standalone Components

- **Simplified Architecture**: No need for NgModules just to use components
- **Better Tree-Shaking**: More efficient bundling and smaller bundle sizes
- **Improved Developer Experience**: Clearer dependencies and easier testing
- **Future-Proof**: Aligns with Angular's strategic direction

## Timeline

- **Current Phase**: Hybrid approach supporting both patterns
- **Next Phase**: Gradually migrate existing features to standalone components
- **Final Phase**: Remove NgModule-based architecture entirely

## References

- [Angular Standalone Components Guide](https://angular.io/guide/standalone-components)
- [Angular Roadmap](https://angular.io/guide/roadmap)