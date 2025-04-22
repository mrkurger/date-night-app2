# Favorites Page Component

The Favorites Page Component provides a comprehensive interface for users to view, filter, sort, and manage their favorite items.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Implementation Details](#implementation-details)
4. [Usage](#usage)
5. [Customization](#customization)
6. [Accessibility](#accessibility)
7. [Performance Considerations](#performance-considerations)

## Overview

The Favorites Page Component is a standalone Angular component that displays a user's favorite items with advanced filtering, sorting, and batch operations capabilities. It provides a rich user interface for managing favorites, including the ability to filter by various criteria, sort by different attributes, and perform batch operations on selected items.

## Features

### Core Features

- **Favorites Display**: Shows a grid or list of favorite items with details
- **Batch Operations**: Select multiple favorites for batch actions (remove, tag, set priority)
- **Advanced Filtering**: Filter favorites by search, tags, category, location, price, and date
- **Sorting Options**: Sort favorites by various criteria (newest, oldest, price, title, priority)
- **Filter Presets**: Save and load filter configurations for quick access
- **Responsive Design**: Adapts to different screen sizes and devices

### User Interface Elements

- **Header Section**: Page title and batch action controls
- **Basic Filters**: Search field, sort dropdown, and tag filters
- **Advanced Filters**: Additional filters for more specific criteria
- **Filter Summary**: Chips showing active filters with ability to remove them
- **Favorites Grid**: Display of favorite items with selection capability
- **Empty State**: Informative display when no favorites are available
- **Loading State**: Visual indication when content is loading

## Implementation Details

### Component Structure

The Favorites Page Component is implemented as a standalone Angular component with the following structure:

- **Template**: Defines the UI structure and layout
- **Component Class**: Implements the component logic and behavior
- **Styles**: Defines the component's visual appearance

### Dependencies

The component has the following dependencies:

- **Angular Material**: For UI components and styling
- **RxJS**: For reactive programming patterns
- **Core Services**: FavoriteService, DialogService, NotificationService

### Data Model

The component works with the following data models:

- **Favorite**: Represents a favorite item with its properties
- **FavoriteFilterOptions**: Defines the filter options for favorites
- **FavoriteTag**: Represents a tag associated with favorites
- **FilterPreset**: Represents a saved filter configuration

## Usage

### Basic Usage

```html
<app-favorites-page></app-favorites-page>
```

### With Router Integration

```html
<app-favorites-page [router]="router"></app-favorites-page>
```

### With Custom Configuration

```html
<app-favorites-page
  [initialSort]="'newest'"
  [showAdvancedFilters]="true"
  [itemsPerPage]="12"
></app-favorites-page>
```

## Customization

### Configurable Properties

The component provides several properties for customization:

- **initialSort**: Sets the initial sort order for favorites
- **showAdvancedFilters**: Controls whether advanced filters are shown by default
- **itemsPerPage**: Sets the number of items to display per page
- **enableBatchOperations**: Enables or disables batch operations
- **enableFilterPresets**: Enables or disables filter preset functionality

### Styling Customization

The component can be styled using CSS variables:

```css
app-favorites-page {
  --favorites-page-background: #f5f5f5;
  --favorites-page-padding: 24px;
  --favorites-card-border-radius: 8px;
  --favorites-card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## Accessibility

The Favorites Page Component is designed with accessibility in mind:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Attributes**: Proper ARIA attributes for screen reader support
- **Focus Management**: Clear focus indicators and logical focus order
- **Color Contrast**: Sufficient color contrast for text and interactive elements
- **Screen Reader Announcements**: Appropriate announcements for dynamic content changes

## Performance Considerations

To ensure optimal performance, the component implements several optimizations:

- **Debounced Search**: Search input is debounced to prevent excessive filtering operations
- **Lazy Loading**: Images are lazy-loaded to improve initial load time
- **Pagination**: Content is paginated to reduce the number of items rendered at once
- **Memoization**: Expensive calculations are memoized to prevent unnecessary recomputation
- **OnPush Change Detection**: Uses OnPush change detection strategy for better performance

---

Last Updated: 2025-06-15
