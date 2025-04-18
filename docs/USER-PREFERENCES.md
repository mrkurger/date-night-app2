# User Preferences Implementation

This document outlines the implementation of user preferences in the DateNight.io application, focusing on display settings such as view type, content density, and card size.

## Table of Contents

1. [Overview](#overview)
2. [User Preferences Service](#user-preferences-service)
3. [Components Using User Preferences](#components-using-user-preferences)
4. [User Settings Component](#user-settings-component)
5. [Preferences Demo Component](#preferences-demo-component)
6. [Implementation Details](#implementation-details)
7. [Testing](#testing)
8. [Future Enhancements](#future-enhancements)

## Overview

The user preferences system allows users to customize their browsing experience by setting preferences for:

- **Default View Type**: Choose between Netflix-style, Tinder-style, or List view
- **Content Density**: Adjust how compact content appears (Comfortable, Compact, Condensed)
- **Card Size**: Set the size of profile cards (Small, Medium, Large)

These preferences are stored in the browser's localStorage and are applied consistently across the application.

## User Preferences Service

The `UserPreferencesService` is the central service for managing user preferences:

- **Location**: `/client-angular/src/app/core/services/user-preferences.service.ts`
- **Responsibilities**:
  - Store and retrieve user preferences
  - Provide methods to update preferences
  - Emit events when preferences change
  - Provide default values for preferences

### Key Methods

```typescript
// Get current preferences
getPreferences(): UserPreferences

// Update preferences
updatePreferences(preferences: Partial<UserPreferences>): void

// Set specific preferences
setDefaultViewType(viewType: 'netflix' | 'tinder' | 'list'): void
setContentDensity(density: 'comfortable' | 'compact' | 'condensed'): void
setCardSize(size: 'small' | 'medium' | 'large'): void

// Reset preferences to defaults
resetPreferences(): void
```

### UserPreferences Interface

```typescript
export interface UserPreferences {
  defaultViewType: 'netflix' | 'tinder' | 'list';
  contentDensity: 'comfortable' | 'compact' | 'condensed';
  cardSize: 'small' | 'medium' | 'large';
  savedFilters: {
    [key: string]: any;
  };
  recentlyViewed: string[];
  favorites: string[];
}
```

## Components Using User Preferences

The following components have been updated to use the user preferences service:

1. **Browse Component**

   - Uses the default view type preference
   - Updates the preference when the user changes the view

2. **Gallery Component**

   - Uses the default view type preference
   - Provides a toggle between grid and list views

3. **Ad Card Component**
   - Uses the content density and card size preferences
   - Adjusts the appearance of cards based on these preferences

## User Settings Component

The User Settings component provides a UI for users to manage their preferences:

- **Location**: `/client-angular/src/app/features/user-settings/user-settings.component.ts`
- **Features**:
  - Form controls for all preference settings
  - Preview of how settings will look
  - Reset to defaults option
  - Automatic saving of preferences

## Preferences Demo Component

A dedicated demo component has been created to showcase the user preferences in action:

- **Location**: `/client-angular/src/app/features/preferences-demo/preferences-demo.component.ts`
- **Features**:
  - Interactive controls for all preference settings
  - Real-time preview of how settings affect the UI
  - Sample ad cards to demonstrate the effects
  - Reset to defaults option

## Implementation Details

### Persistence

User preferences are stored in the browser's localStorage under the key `user_preferences`. This ensures that preferences persist across sessions.

### Reactive Updates

The service uses RxJS BehaviorSubject to emit events when preferences change, allowing components to react to preference changes in real-time.

```typescript
// In UserPreferencesService
private preferencesSubject = new BehaviorSubject<UserPreferences>(this.getInitialPreferences());
public preferences$ = this.preferencesSubject.asObservable();

// In components
this.userPreferencesService.preferences$.subscribe(prefs => {
  // Update component based on new preferences
});
```

### CSS Implementation

The Ad Card component uses CSS classes to apply different styles based on the user's preferences:

```html
<div
  class="ad-card"
  [ngClass]="{
    'ad-card-size-small': cardSize === 'small',
    'ad-card-size-medium': cardSize === 'medium',
    'ad-card-size-large': cardSize === 'large',
    'ad-card-density-comfortable': contentDensity === 'comfortable',
    'ad-card-density-compact': contentDensity === 'compact',
    'ad-card-density-condensed': contentDensity === 'condensed',
  }"
>
  <!-- Card content -->
</div>
```

## Testing

### Unit Tests

Unit tests for the UserPreferencesService cover:

- Loading preferences from localStorage
- Saving preferences to localStorage
- Updating individual preferences
- Resetting preferences to defaults

### Integration Tests

Integration tests verify that:

- Components correctly subscribe to preference changes
- UI updates when preferences change
- Preferences persist across page refreshes

## Future Enhancements

1. **Server-Side Storage**

   - Store preferences on the server for logged-in users
   - Sync preferences across devices

2. **Additional Preferences**

   - Font size preferences
   - Color scheme customization
   - Animation preferences (reduced motion)

3. **Preference Profiles**

   - Allow users to save and switch between different preference profiles
   - Create context-specific preferences (e.g., different settings for browsing vs. managing ads)

4. **Accessibility Improvements**

   - Add preferences specifically for accessibility needs
   - Implement WCAG compliance options

5. **Analytics**
   - Track which preferences are most commonly used
   - Use preference data to improve default settings
