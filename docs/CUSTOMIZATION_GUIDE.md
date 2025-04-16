# Date Night App Customization Guide

## Overview

This guide explains the standardized customization system implemented across the Date Night App codebase. The system is designed to make it easy for developers to locate, understand, and modify configuration settings without having to search through files manually.

## Table of Contents

1. [Key Components](#key-components)
2. [How to Use This System](#how-to-use-this-system)
3. [Header Format Guidelines](#header-format-guidelines)
4. [Best Practices](#best-practices)
5. [Common Customization Scenarios](#common-customization-scenarios)
6. [UI/UX Customization with Emerald.js](#uiux-customization-with-emeraldjs)
7. [Theming](#theming)
8. [Testing Customized Components](#testing-customized-components)
9. [Troubleshooting](#troubleshooting)

## Key Components

### 1. Customization Documentation

- **CUSTOMIZATION_GUIDE.md** (this file): Central documentation explaining how to use the customization system
- **CONFIG_INDEX.md**: A comprehensive catalog of all customizable settings across the codebase
- **emerald-components.md**: Detailed documentation for the Emerald.js UI components
- **emerald-components-changelog.md**: Changelog for Emerald.js component updates

### 2. Standardized Header System

All files containing customizable settings include a standardized header in the following format:

```
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for [module name/purpose]
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// - ANOTHER_SETTING: Description of setting (default: value)
//   Valid values: [list of valid values or range]
// ===================================================
```

### 3. Maintenance Utilities

The following utilities help maintain the customization system:

- **update_customization_headers.py**: Checks and updates headers in files
- **update_config_index.py**: Automatically updates the central index based on file headers

## How to Use This System

### Finding Settings to Customize

1. Start by consulting the **CONFIG_INDEX.md** file, which provides a categorized list of all customizable settings
2. Use the links in the index to navigate directly to the relevant files
3. Each file with customizable settings has a clearly marked header section that explains what can be modified

### Making Customizations

1. Locate the specific setting you want to modify using the CONFIG_INDEX.md
2. Navigate to the file containing the setting
3. Review the header documentation to understand the setting's purpose, default values, and valid options
4. Make your changes following the guidelines provided in the header
5. If the setting is related to other settings (indicated by "Related to:" references), consider whether those need to be updated as well

### Adding New Customizable Settings

When adding new settings that should be customizable:

1. Add the standardized header to the file if it doesn't already have one
2. Document your new setting in the header following the established format
3. Include cross-references to related settings if applicable
4. Run the maintenance utilities to update the CONFIG_INDEX.md

```bash
python3 scripts/update_customization_headers.py
python3 scripts/update_config_index.py
```

## Header Format Guidelines

### For JavaScript/TypeScript Files

```javascript
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for [module name/purpose]
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.js:OTHER_SETTING
// - ANOTHER_SETTING: Description of setting (default: value)
//   Valid values: [list of valid values or range]
// ===================================================
```

### For Python Files

```python
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for [module name/purpose]
# 
# COMMON CUSTOMIZATIONS:
# - SETTING_NAME: Description of setting (default: value)
#   Related to: other_file.py:OTHER_SETTING
# - ANOTHER_SETTING: Description of setting (default: value)
#   Valid values: [list of valid values or range]
# ===================================================
```

### For HTML/CSS Files

```html
<!-- ===================================================
     CUSTOMIZABLE SETTINGS IN THIS FILE
     ===================================================
     This file contains settings for [module name/purpose]
     
     COMMON CUSTOMIZATIONS:
     - SETTING_NAME: Description of setting (default: value)
       Related to: other_file.css:OTHER_SETTING
     - ANOTHER_SETTING: Description of setting (default: value)
       Valid values: [list of valid values or range]
     =================================================== -->
```

## Best Practices

1. **Be Descriptive**: Provide clear, concise descriptions for each setting
2. **Include Defaults**: Always document the default value for each setting
3. **Specify Valid Values**: When applicable, list the valid values or ranges for a setting
4. **Cross-Reference**: Link related settings across different files
5. **Group Related Settings**: Keep related settings together in the same file when possible
6. **Update Documentation**: Run the maintenance utilities after adding or modifying customizable settings

## Common Customization Scenarios

### Changing API Endpoints

1. Navigate to `client-angular/src/environments/environment.ts` for development or `environment.prod.ts` for production
2. Locate the `apiUrl`, `chatWsUrl`, or `socketUrl` settings
3. Update the values as needed

### Modifying Database Connection

1. Navigate to `server/config/database.js`
2. Update the MongoDB connection settings as needed
3. Consider environment-specific settings in `server/config/environment.js`

### Adjusting Content Security Policy

1. Navigate to `server/config/csp.config.js`
2. Modify the directives in either `baseDirectives`, `developmentDirectives`, or `productionDirectives`
3. Be careful to maintain security while making changes

### Changing File Upload Limits

1. Navigate to `client-angular/src/environments/environment.ts`
2. Modify the `maxUploadSize` or `supportedImageTypes` settings
3. Ensure corresponding server-side settings are updated as well

## UI/UX Customization with Emerald.js

DateNight.io uses the Emerald.js component library for its UI. This section explains how to customize the UI using these components.

### Emerald.js Component Library

The Emerald.js component library provides a set of reusable UI components for building the DateNight.io application. These components are designed to be customizable and responsive.

#### Available Components

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

For detailed documentation on each component, see the [emerald-components.md](/docs/emerald-components.md) file.

### Using Emerald.js Components

Emerald.js components can be used in two ways:

#### 1. Standalone Components

```typescript
import { AppCardComponent } from '../../shared/emerald/components/app-card/app-card.component';
// or
import { AppCardComponent } from '../../shared/emerald'; // Using the index.ts barrel file

@Component({
  // ...
  imports: [CommonModule, AppCardComponent]
})
```

#### 2. EmeraldModule

```typescript
import { EmeraldModule } from '../../shared/emerald/emerald.module';

@NgModule({
  // ...
  imports: [CommonModule, EmeraldModule]
})
```

### Customizing Emerald.js Components

Each Emerald.js component can be customized in several ways:

#### 1. Input Properties

Most components have input properties that allow you to customize their behavior and appearance:

```html
<emerald-app-card
  [ad]="adItem"
  layout="netflix"
  [isOnline]="adItem.isOnline"
  [showActions]="true"
  [showDescription]="true"
  (viewDetails)="onViewDetails($event)">
</emerald-app-card>
```

#### 2. CSS Variables

Components use CSS variables for styling, which can be overridden in your component's SCSS file:

```scss
:host {
  --primary-500: #ff6b93;
  --primary-600: #e6365f;
  --primary-700: #c01e45;
}
```

#### 3. Custom CSS Classes

## Testing Customized Components

When customizing components, it's important to ensure that your changes don't break existing functionality. The Date Night App includes a comprehensive testing framework to help you verify your customizations.

### Unit Testing Customized Components

For detailed guidance on testing Angular components, including common issues and solutions, refer to [ANGULAR_TESTING_LESSONS.md](./ANGULAR_TESTING_LESSONS.md).

Key considerations when testing customized components:

1. **Test Input Variations**: Verify that the component behaves correctly with different input values
2. **Test Event Emissions**: Ensure that output events are emitted correctly
3. **Test Styling**: Verify that CSS customizations are applied correctly
4. **Test Edge Cases**: Check behavior with empty, null, or invalid inputs

Example test for a customized Emerald component:

```typescript
describe('CustomizedAppCardComponent', () => {
  let component: AppCardComponent;
  let fixture: ComponentFixture<AppCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        AppCardComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppCardComponent);
    component = fixture.componentInstance;
    
    // Set custom inputs
    component.ad = mockAd;
    component.layout = 'netflix';
    component.showActions = true;
    
    fixture.detectChanges();
  });

  it('should apply custom layout', () => {
    const element = fixture.nativeElement;
    expect(element.querySelector('.netflix-layout')).toBeTruthy();
  });

  it('should emit viewDetails event when clicked', () => {
    spyOn(component.viewDetails, 'emit');
    
    const cardElement = fixture.nativeElement.querySelector('.card-container');
    cardElement.click();
    
    expect(component.viewDetails.emit).toHaveBeenCalledWith(mockAd._id);
  });
});
```

You can add custom CSS classes to components and use them to override the default styles:

```html
<emerald-app-card class="custom-card" [ad]="adItem"></emerald-app-card>
```

```scss
.custom-card {
  ::ng-deep {
    .emerald-app-card {
      border-radius: 16px;
      
      &__title {
        font-size: 1.5rem;
      }
    }
  }
}
```

#### 4. Content Projection

Many components support content projection, allowing you to customize the content displayed within the component:

```html
<emerald-card-grid [items]="ads">
  <ng-template #itemTemplate let-ad>
    <emerald-app-card [ad]="ad" layout="netflix"></emerald-app-card>
  </ng-template>
</emerald-card-grid>
```

### Example: Customizing the Netflix View

```html
<emerald-card-grid
  [items]="featuredAds"
  layout="netflix"
  [gap]="16"
  class="featured-ads"
  (itemClick)="viewAdDetails($event._id)">
  <ng-template #itemTemplate let-ad>
    <emerald-app-card
      [ad]="ad"
      layout="netflix"
      [isOnline]="ad.isAdvertiserOnline"
      (viewDetails)="viewAdDetails($event)"
      (like)="likeAd($event)"
      (chat)="startChat($event)">
    </emerald-app-card>
  </ng-template>
</emerald-card-grid>
```

```scss
.featured-ads {
  margin: $spacing-6 0;
  
  ::ng-deep {
    .emerald-card-grid__netflix-row {
      position: relative;
      
      &::before {
        content: 'Featured';
        position: absolute;
        top: -$spacing-8;
        left: 0;
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $primary-500;
      }
    }
    
    .emerald-app-card {
      &:hover {
        transform: translateY(-8px) scale(1.05);
      }
    }
  }
}
```

## Theming

DateNight.io supports theming through CSS variables and the design tokens system. The design tokens are defined in `/client-angular/src/app/core/design/design-tokens.scss`.

### Design Tokens

The design tokens file contains all the design tokens used throughout the application, including:

- **Colors**: Primary, secondary, neutral, and semantic colors
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Spacing values for margins, paddings, and gaps
- **Borders**: Border radius values
- **Shadows**: Box shadow values
- **Breakpoints**: Screen size breakpoints for responsive design

### Customizing Design Tokens

To customize the design tokens, you can:

1. **Modify the design tokens file directly**: This will affect the entire application.
2. **Override design tokens in component styles**: This will affect only the specific component.

#### Example: Overriding Design Tokens in a Component

```scss
:host {
  --primary-500: #ff6b93;
  --primary-600: #e6365f;
  --primary-700: #c01e45;
  --font-primary: 'Montserrat', sans-serif;
}
```

### Dark Mode

DateNight.io supports dark mode through CSS variables. To implement dark mode:

1. Create a dark theme class that overrides the design tokens:

```scss
.dark-mode {
  --neutral-100: #121212;
  --neutral-200: #1e1e1e;
  --neutral-300: #2a2a2a;
  --neutral-400: #3a3a3a;
  --neutral-500: #5a5a5a;
  --neutral-600: #7a7a7a;
  --neutral-700: #9a9a9a;
  --neutral-800: #bababa;
  --neutral-900: #f5f5f5;
  
  --primary-100: #1a0033;
  --primary-200: #2a0052;
  --primary-300: #3a0070;
  --primary-400: #4a008f;
  --primary-500: #5a00ad;
  --primary-600: #6a00cc;
  --primary-700: #7a00ea;
  --primary-800: #8a00ff;
  --primary-900: #9a1aff;
}
```

2. Add a toggle for dark mode:

```html
<emerald-toggle
  label="Dark Mode"
  labelPosition="right"
  color="primary"
  [value]="isDarkMode"
  (change)="toggleDarkMode($event)">
</emerald-toggle>
```

```typescript
toggleDarkMode(isDarkMode: boolean): void {
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  // Save preference to localStorage
  localStorage.setItem('darkMode', isDarkMode.toString());
}
```

## Troubleshooting

If you encounter issues with the customization system:

1. Verify that you've consulted the most recent version of CONFIG_INDEX.md
2. Check that the file headers are properly formatted
3. Run the maintenance utilities to ensure documentation is up-to-date
4. If settings don't seem to take effect, check for environment variable overrides

### Common UI/UX Issues

1. **Component not displaying correctly**
   - Make sure you've imported the component in your module or component imports array
   - Check the console for any errors
   - Verify that the inputs are correctly bound

2. **Styles not applying**
   - Make sure the component's SCSS file is being included in the build
   - Check for any CSS conflicts in your application
   - Verify that the design tokens are correctly imported

3. **Events not firing**
   - Make sure you've correctly bound the output event
   - Check that the event handler function exists and is correctly implemented
   - Verify that the event is being emitted by the component

4. **Performance issues**
   - Use the `trackBy` function with `*ngFor` directives
   - Implement OnPush change detection for better performance
   - Avoid deep nesting of components
   - Use lazy loading for large lists

For additional help, consult the project's main documentation or contact the development team.