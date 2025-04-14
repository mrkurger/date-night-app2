# Emerald.js Components

This directory contains Angular wrapper components for the Emerald.js UI library. These components provide a consistent and responsive user interface for the DateNight.io application.

## Available Components

- **AppCard**: Displays an advertiser card with various layouts and features
- **Avatar**: Displays a user avatar with optional dropdown menu
- **Label**: Displays a label with various styles and variants
- **Carousel**: Displays a carousel of images or other content
- **InfoPanel**: Displays information in a structured panel format
- **PageHeader**: Displays a page header with title, breadcrumbs, and actions
- **SkeletonLoader**: Displays a loading skeleton for content
- **Toggle**: Displays a toggle switch for boolean values

## Usage

All components are implemented as standalone Angular components, which means they can be imported and used individually without the need for a module.

```typescript
import { AppCardComponent } from '../../shared/emerald/components/app-card/app-card.component';
// or
import { AppCardComponent } from '../../shared/emerald'; // Using the index.ts barrel file
```

Then, add the component to your component's imports array:

```typescript
@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss'],
  standalone: true,
  imports: [CommonModule, AppCardComponent]
})
export class MyComponent { }
```

## Documentation

For detailed documentation on each component, refer to the [Emerald Components Documentation](/docs/emerald-components.md).

## Design Tokens

The components use design tokens defined in `/client-angular/src/app/core/design/design-tokens.scss`. These tokens provide a consistent look and feel across the application.

## External Resources

- [Emerald.js Documentation](https://docs-emerald.condorlabs.io/)