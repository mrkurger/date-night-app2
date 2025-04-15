# Emerald.js Components

This directory contains Angular wrappers for the Emerald.js UI component library. These components provide a consistent and responsive user interface for the DateNight.io application.

## Overview

Emerald.js is a UI component library that provides a set of reusable UI components for building modern web applications. The DateNight.io application uses Angular wrappers for these components to ensure a consistent and responsive user interface.

## Available Components

- **AppCard**: Card component for displaying ads in various layouts
- **Avatar**: Avatar component for user profiles with online status
- **Carousel**: Carousel component for image galleries
- **InfoPanel**: Panel component for structured information display
- **Label**: Label component for displaying status and categories
- **PageHeader**: Header component with breadcrumbs and actions
- **SkeletonLoader**: Loading skeleton for content placeholders
- **Toggle**: Toggle switch for boolean settings
- **CardGrid**: Grid layout for displaying multiple cards
- **Pager**: Pagination component for navigating through results
- **FloatingActionButton**: Floating action button for primary actions

## Usage

All components are implemented as standalone Angular components, which means they can be imported and used individually without the need for a module. However, they are also available through the EmeraldModule for backward compatibility.

### Option 1: Import Standalone Components

```typescript
import { AppCardComponent } from '../../shared/emerald/components/app-card/app-card.component';
// or
import { AppCardComponent } from '../../shared/emerald'; // Using the index.ts barrel file
```

Then add them to your component's imports:

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

### Option 2: Import EmeraldModule

```typescript
import { EmeraldModule } from '../../shared/emerald/emerald.module';
```

Then add it to your module's imports:

```typescript
@NgModule({
  declarations: [MyComponent],
  imports: [CommonModule, EmeraldModule]
})
export class MyModule { }
```

## Documentation

For detailed documentation on each component, see the [COMPONENTS.md](./COMPONENTS.md) file.

## Design Tokens

The Emerald.js components use design tokens defined in the design tokens file at `/client-angular/src/app/core/design/design-tokens.scss`. These tokens provide a consistent design language across the application.

## External Documentation

For more information on the Emerald.js UI library, visit the [Emerald.js Documentation](https://docs-emerald.condorlabs.io/)