# Emerald.js Components Documentation

This document provides detailed information about the Emerald.js UI components implemented in the DateNight.io application. These components are Angular wrappers for the Emerald.js UI library.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Components](#components)
   - [AppCard](#appcard)
   - [Avatar](#avatar)
   - [Label](#label)
   - [Carousel](#carousel)
   - [InfoPanel](#infopanel)
   - [PageHeader](#pageheader)
   - [SkeletonLoader](#skeletonloader)
   - [Toggle](#toggle)
   - [CardGrid](#cardgrid)
   - [Pager](#pager)
   - [FloatingActionButton](#floatingactionbutton)
4. [Usage Examples](#usage-examples)
5. [Customization](#customization)
6. [Accessibility](#accessibility)
7. [Troubleshooting](#troubleshooting)

## Overview

Emerald.js is a UI component library that provides a set of reusable UI components for building modern web applications. The DateNight.io application uses Angular wrappers for these components to ensure a consistent and responsive user interface.

All components are implemented as standalone Angular components, which means they can be imported and used individually without the need for a module. However, they are also available through the EmeraldModule for backward compatibility.

## Installation

The Emerald.js components are already installed in the DateNight.io application. To use them in your components, you have two options:

### Option 1: Import Standalone Components

```typescript
import { AppCardComponent } from '../../shared/emerald/components/app-card/app-card.component';
// or
import { AppCardComponent } from '../../shared/emerald'; // Using the index.ts barrel file
```

Then add them to your component's imports:

```typescript
@Component({
  // ...
  imports: [CommonModule, AppCardComponent]
})
```

### Option 2: Import EmeraldModule

```typescript
import { EmeraldModule } from '../../shared/emerald/emerald.module';
```

Then add it to your module's imports:

```typescript
@NgModule({
  // ...
  imports: [CommonModule, EmeraldModule]
})
```

## Components

### AppCard

The AppCard component displays an advertiser card with various layouts and features.

**Selector:** `emerald-app-card`

**Inputs:**

- `ad: Ad` - The advertiser data to display
- `layout: 'tinder' | 'netflix' | 'list'` - The layout style (default: 'netflix')
- `showActions: boolean` - Whether to show action buttons (default: true)
- `showDescription: boolean` - Whether to show the description (default: true)
- `isOnline: boolean` - Whether the advertiser is online or offline (default: false)

**Outputs:**

- `viewDetails: EventEmitter<string>` - Emitted when the user clicks to view details
- `like: EventEmitter<string>` - Emitted when the user likes the ad
- `chat: EventEmitter<string>` - Emitted when the user wants to chat
- `share: EventEmitter<string>` - Emitted when the user shares the ad
- `swiped: EventEmitter<{ direction: 'left' | 'right', adId: string }>` - Emitted when the user swipes the card

**Example:**

```html
<emerald-app-card
  [ad]="adItem"
  layout="netflix"
  [isOnline]="adItem.isOnline"
  (viewDetails)="onViewDetails($event)"
  (like)="onLike($event)"
  (chat)="onChat($event)"
  (share)="onShare($event)"
>
</emerald-app-card>
```

### Avatar

The Avatar component displays a user avatar with optional dropdown menu.

**Selector:** `emerald-avatar`

**Inputs:**

- `imageUrl: string` - The URL of the avatar image (default: '/assets/img/default-profile.jpg')
- `name: string` - The user's name, used for initials fallback (default: '')
- `size: 'small' | 'medium' | 'large'` - The size of the avatar (default: 'medium')
- `isOnline: boolean` - Whether the user is online or offline (default: false)
- `showDropdown: boolean` - Whether to show a dropdown menu (default: false)
- `dropdownItems: DropdownItem[]` - The items to display in the dropdown menu (default: [])

**Outputs:**

- `avatarClick: EventEmitter<void>` - Emitted when the avatar is clicked
- `itemClick: EventEmitter<DropdownItem>` - Emitted when a dropdown item is clicked

**Example:**

```html
<emerald-avatar
  [imageUrl]="user.profileImage"
  [name]="user.name"
  [isOnline]="user.isOnline"
  [showDropdown]="true"
  [dropdownItems]="userMenuItems"
  (itemClick)="onMenuItemClick($event)"
>
</emerald-avatar>
```

### Label

The Label component displays a label with various styles and variants.

**Selector:** `emerald-label`

**Inputs:**

- `text: string` - The text to display (default: '')
- `variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'` - The color variant (default: 'primary')
- `size: 'small' | 'medium' | 'large'` - The size of the label (default: 'medium')
- `icon?: string` - An optional icon class (e.g., 'fas fa-circle')
- `rounded: boolean` - Whether to use rounded corners (default: false)
- `outlined: boolean` - Whether to use an outlined style (default: false)
- `pill: boolean` - Whether to use a pill shape (default: false)

**Example:**

```html
<emerald-label text="Online" variant="success" [pill]="true" icon="fas fa-circle"> </emerald-label>
```

### Carousel

The Carousel component displays a carousel of images or other content.

**Selector:** `emerald-carousel`

**Inputs:**

- `items: CarouselItem[]` - The items to display in the carousel (default: [])
- `showDots: boolean` - Whether to show navigation dots (default: true)
- `showArrows: boolean` - Whether to show navigation arrows (default: true)
- `autoPlay: boolean` - Whether to auto-play the carousel (default: false)
- `autoPlayInterval: number` - The interval for auto-play in milliseconds (default: 5000)
- `aspectRatio: '1:1' | '4:3' | '16:9' | '21:9'` - The aspect ratio of the carousel (default: '16:9')
- `thumbnails: boolean` - Whether to show thumbnails (default: false)

**Outputs:**

- `itemChange: EventEmitter<number>` - Emitted when the current item changes

**Example:**

```html
<emerald-carousel
  [items]="adImages"
  [showDots]="true"
  [showArrows]="true"
  [aspectRatio]="'16:9'"
  [thumbnails]="true"
  (itemChange)="onImageChange($event)"
>
</emerald-carousel>
```

### InfoPanel

The InfoPanel component displays information in a structured panel format.

**Selector:** `emerald-info-panel`

**Inputs:**

- `title: string` - The panel title (default: '')
- `subtitle?: string` - An optional subtitle
- `items: InfoPanelItem[]` - The items to display in the panel (default: [])
- `variant: 'default' | 'bordered' | 'shadowed'` - The panel style variant (default: 'default')
- `collapsible: boolean` - Whether the panel can be collapsed (default: false)
- `initiallyCollapsed: boolean` - Whether the panel is initially collapsed (default: false)

**Example:**

```html
<emerald-info-panel
  title="Advertiser Details"
  subtitle="Personal information"
  [items]="advertiserDetails"
  variant="bordered"
  [collapsible]="true"
>
</emerald-info-panel>
```

### PageHeader

The PageHeader component displays a page header with title, breadcrumbs, and actions.

**Selector:** `emerald-page-header`

**Inputs:**

- `title: string` - The page title (default: '')
- `subtitle?: string` - An optional subtitle
- `breadcrumbs: Breadcrumb[]` - The breadcrumb navigation items (default: [])
- `actions: HeaderAction[]` - The action buttons to display (default: [])
- `backLink?: string` - An optional back navigation link
- `backgroundImage?: string` - An optional background image URL
- `avatarUrl?: string` - An optional avatar image URL
- `avatarName?: string` - An optional avatar name (for initials fallback)
- `avatarIsOnline?: boolean` - Whether the avatar user is online

**Outputs:**

- `actionClick: EventEmitter<HeaderAction>` - Emitted when an action button is clicked

**Example:**

```html
<emerald-page-header
  title="Advertiser Profile"
  [subtitle]="ad.title"
  [breadcrumbs]="breadcrumbs"
  [actions]="profileActions"
  [backgroundImage]="ad.images[0]"
  [avatarUrl]="ad.advertiserImage"
  [avatarName]="ad.advertiserName"
  [avatarIsOnline]="ad.isAdvertiserOnline"
  (actionClick)="onActionClick($event)"
>
</emerald-page-header>
```

### SkeletonLoader

The SkeletonLoader component displays a loading skeleton for content.

**Selector:** `emerald-skeleton-loader`

**Inputs:**

- `type: 'text' | 'circle' | 'rectangle' | 'card' | 'profile' | 'list'` - The type of skeleton (default: 'text')
- `width?: string` - An optional width (e.g., '100%', '200px')
- `height?: string` - An optional height (e.g., '20px', '100px')
- `borderRadius?: string` - An optional border radius (e.g., '4px', '50%')
- `count: number` - The number of skeleton items to display (default: 1)
- `animated: boolean` - Whether to animate the skeleton (default: true)

**Example:**

```html
<emerald-skeleton-loader type="card" [count]="3" [animated]="true"> </emerald-skeleton-loader>
```

### Toggle

The Toggle component displays a toggle switch for boolean values.

**Selector:** `emerald-toggle`

**Inputs:**

- `label?: string` - An optional label
- `labelPosition: 'left' | 'right'` - The position of the label (default: 'right')
- `size: 'small' | 'medium' | 'large'` - The size of the toggle (default: 'medium')
- `color: 'primary' | 'success' | 'warning' | 'danger' | 'info'` - The color of the toggle (default: 'primary')
- `disabled: boolean` - Whether the toggle is disabled (default: false)
- `name?: string` - An optional name for the input
- `id?: string` - An optional ID for the input
- `required: boolean` - Whether the toggle is required (default: false)
- `ariaLabel?: string` - An optional ARIA label

**Outputs:**

- `change: EventEmitter<boolean>` - Emitted when the toggle value changes

**Example:**

```html
<emerald-toggle
  label="Dark Mode"
  labelPosition="right"
  color="primary"
  [value]="isDarkMode"
  (change)="onThemeChange($event)"
>
</emerald-toggle>
```

### CardGrid

The CardGrid component displays a grid of cards with various layouts and features.

**Selector:** `emerald-card-grid`

**Inputs:**

- `items: any[]` - The items to display in the grid (default: [])
- `columns: number | null` - The number of columns in the grid (default: null - responsive)
- `gap: number` - The gap between grid items in pixels (default: 16)
- `minItemWidth: number` - The minimum width of each grid item in pixels (default: 280)
- `loading: boolean` - Whether to show a loading skeleton (default: false)
- `skeletonCount: number` - The number of skeleton items to show when loading (default: 6)
- `animated: boolean` - Whether to animate the grid items when they appear (default: true)
- `layout: 'grid' | 'masonry' | 'netflix'` - The layout style for the grid (default: 'grid')

**Outputs:**

- `itemClick: EventEmitter<any>` - Emitted when an item is clicked

**Content Projection:**

- `itemTemplate` - A custom template for rendering grid items

**Example:**

```html
<emerald-card-grid
  [items]="ads"
  [columns]="3"
  [gap]="16"
  [loading]="isLoading"
  layout="grid"
  (itemClick)="onAdClick($event)"
>
  <ng-template #itemTemplate let-ad>
    <emerald-app-card [ad]="ad" layout="netflix"></emerald-app-card>
  </ng-template>
</emerald-card-grid>
```

### Pager

The Pager component displays pagination controls for navigating through pages of results.

**Selector:** `emerald-pager`

**Inputs:**

- `currentPage: number` - The current page number (1-based) (default: 1)
- `totalPages: number` - The total number of pages (default: 1)
- `maxVisiblePages: number` - The maximum number of page buttons to show (default: 5)
- `showFirstLast: boolean` - Whether to show first/last page buttons (default: true)
- `showPrevNext: boolean` - Whether to show previous/next page buttons (default: true)
- `showPageSize: boolean` - Whether to show the page size selector (default: false)
- `pageSizes: number[]` - The available page sizes (default: [10, 25, 50, 100])
- `pageSize: number` - The current page size (default: 10)
- `style: 'default' | 'simple' | 'compact'` - The style of the pager (default: 'default')
- `size: 'small' | 'medium' | 'large'` - The size of the pager (default: 'medium')
- `align: 'left' | 'center' | 'right'` - The alignment of the pager (default: 'center')

**Outputs:**

- `pageChange: EventEmitter<number>` - Emitted when the page changes
- `pageSizeChange: EventEmitter<number>` - Emitted when the page size changes

**Example:**

```html
<emerald-pager
  [currentPage]="currentPage"
  [totalPages]="totalPages"
  [showPageSize]="true"
  [pageSize]="pageSize"
  style="default"
  size="medium"
  align="center"
  (pageChange)="onPageChange($event)"
  (pageSizeChange)="onPageSizeChange($event)"
>
</emerald-pager>
```

### FloatingActionButton

The FloatingActionButton component displays a floating action button for primary actions.

**Selector:** `emerald-floating-action-button`

**Inputs:**

- `icon: string` - The icon to display in the button (default: 'fa-plus')
- `label: string` - The label for the button (for accessibility) (default: 'Action')
- `color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'` - The color variant (default: 'primary')
- `size: 'small' | 'medium' | 'large'` - The size of the button (default: 'medium')
- `position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'` - The position of the button (default: 'bottom-right')
- `showTooltip: boolean` - Whether to show a tooltip on hover (default: false)
- `tooltipText: string` - The text to display in the tooltip (default: '')
- `disabled: boolean` - Whether the button is disabled (default: false)
- `hasMenu: boolean` - Whether to show a menu of actions when clicked (default: false)
- `menuItems: { icon: string; label: string; action?: string }[]` - The menu items to display (default: [])
- `menuOpen: boolean` - Whether the menu is currently open (default: false)

**Outputs:**

- `buttonClick: EventEmitter<void>` - Emitted when the button is clicked
- `menuItemClick: EventEmitter<{ icon: string; label: string; action?: string }>` - Emitted when a menu item is clicked

**Example:**

```html
<emerald-floating-action-button
  icon="fa-plus"
  label="Add New Ad"
  color="primary"
  size="large"
  position="bottom-right"
  [showTooltip]="true"
  tooltipText="Create a new advertisement"
  [hasMenu]="true"
  [menuItems]="fabMenuItems"
  (buttonClick)="onFabClick()"
  (menuItemClick)="onFabMenuItemClick($event)"
>
</emerald-floating-action-button>
```

## Usage Examples

### Netflix View with CardGrid and AppCard

```html
<emerald-card-grid
  [items]="featuredAds"
  layout="netflix"
  [gap]="16"
  (itemClick)="viewAdDetails($event._id)"
>
  <ng-template #itemTemplate let-ad>
    <emerald-app-card
      [ad]="ad"
      layout="netflix"
      [isOnline]="ad.isAdvertiserOnline"
      (viewDetails)="viewAdDetails($event)"
      (like)="likeAd($event)"
      (chat)="startChat($event)"
    >
    </emerald-app-card>
  </ng-template>
</emerald-card-grid>
```

### Tinder View with AppCard

```html
<div class="tinder-container">
  <emerald-app-card
    [ad]="currentAd"
    layout="tinder"
    [isOnline]="currentAd.isAdvertiserOnline"
    (swiped)="onCardSwiped($event)"
    (viewDetails)="viewAdDetails($event)"
    (chat)="startChat($event)"
  >
  </emerald-app-card>
</div>
```

### List View with CardGrid and Pager

```html
<emerald-card-grid
  [items]="ads"
  layout="grid"
  [columns]="1"
  [gap]="16"
  [loading]="isLoading"
  (itemClick)="viewAdDetails($event._id)"
>
  <ng-template #itemTemplate let-ad>
    <emerald-app-card
      [ad]="ad"
      layout="list"
      [isOnline]="ad.isAdvertiserOnline"
      (viewDetails)="viewAdDetails($event)"
      (like)="likeAd($event)"
      (chat)="startChat($event)"
    >
    </emerald-app-card>
  </ng-template>
</emerald-card-grid>

<emerald-pager
  [currentPage]="currentPage"
  [totalPages]="totalPages"
  [showPageSize]="true"
  [pageSize]="pageSize"
  (pageChange)="onPageChange($event)"
  (pageSizeChange)="onPageSizeChange($event)"
>
</emerald-pager>
```

### Profile Page with Emerald Components

```html
<emerald-page-header
  [title]="ad.title"
  [breadcrumbs]="breadcrumbs"
  [actions]="profileActions"
  [backgroundImage]="ad.images[0]"
  (actionClick)="onActionClick($event)"
>
</emerald-page-header>

<div class="profile-container">
  <div class="profile-media">
    <emerald-carousel
      [items]="carouselItems"
      [showDots]="true"
      [showArrows]="true"
      [aspectRatio]="'16:9'"
      [thumbnails]="true"
    >
    </emerald-carousel>
  </div>

  <div class="profile-info">
    <emerald-info-panel title="Advertiser Details" [items]="advertiserDetails" variant="bordered">
    </emerald-info-panel>

    <emerald-info-panel
      title="Services"
      [items]="serviceItems"
      variant="bordered"
      [collapsible]="true"
    >
    </emerald-info-panel>
  </div>
</div>

<emerald-floating-action-button
  icon="fa-comment"
  label="Chat with Advertiser"
  color="primary"
  (buttonClick)="startChat(ad._id)"
>
</emerald-floating-action-button>
```

## Customization

The Emerald.js components can be customized using CSS variables. These variables are defined in the design tokens file at `/client-angular/src/app/core/design/design-tokens.scss`.

To customize a component, you can override these variables in your component's SCSS file:

```scss
:host {
  --primary: #ff6b93;
  --primary-light: #ff8fab;
  --primary-dark: #e6365f;
}
```

You can also customize the components by adding custom CSS classes:

```html
<emerald-app-card class="custom-card" [ad]="ad"></emerald-app-card>
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

## Accessibility

All Emerald.js components are designed with accessibility in mind. They include:

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

To ensure your implementation is accessible:

1. Always provide meaningful labels for interactive elements
2. Ensure sufficient color contrast
3. Test with keyboard navigation
4. Use semantic HTML elements
5. Provide alternative text for images

## Troubleshooting

### Common Issues

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

For more help, refer to the Emerald.js documentation at https://docs-emerald.condorlabs.io/
