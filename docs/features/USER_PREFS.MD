# User Preferences System

## Overview

The User Preferences System allows users to customize their experience within the application. It manages display preferences, saved filters, recently viewed items, and favorites. This feature enhances user experience by providing personalization options that persist across sessions.

## User Experience

Users interact with the User Preferences System through several interfaces:

- **Preferences Demo**: Showcases available customization options
- **View Type Selection**: Allows switching between different content layouts (Netflix, Tinder, List)
- **Content Density Controls**: Adjusts the spacing and density of UI elements
- **Card Size Options**: Changes the size of content cards for optimal viewing

## Architecture

### Client-Side Components

| Component                  | Path                                                                              | Description                      |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| `PreferencesDemoComponent` | `/client-angular/src/app/features/preferences-demo/preferences-demo.component.ts` | Demo UI for user preferences     |
| `UserSettingsComponent`    | `/client-angular/src/app/features/user-settings/user-settings.component.ts`       | Settings UI for user preferences |

### Client-Side Services

| Service                  | Path                                                                | Description               |
| ------------------------ | ------------------------------------------------------------------- | ------------------------- |
| `UserPreferencesService` | `/client-angular/src/app/core/services/user-preferences.service.ts` | Manages user preferences  |
| `ThemeService`           | `/client-angular/src/app/core/services/theme.service.ts`            | Handles theme preferences |

### Client-Side Models

| Interface/Type    | Path                                                                | Description                 |
| ----------------- | ------------------------------------------------------------------- | --------------------------- |
| `UserPreferences` | `/client-angular/src/app/core/services/user-preferences.service.ts` | User preferences data model |
| `ContentDensity`  | `/client-angular/src/app/core/services/user-preferences.service.ts` | Content density options     |
| `CardSize`        | `/client-angular/src/app/core/services/user-preferences.service.ts` | Card size options           |

## Data Flow

The user preferences system follows these data flows:

1. **Loading Preferences**:

   - When the application starts, UserPreferencesService initializes
   - The service checks localStorage for saved preferences
   - If found, it loads the saved preferences
   - If not found, it uses default preferences
   - The preferences are emitted through the preferences$ observable

2. **Updating Preferences**:

   - User interacts with preference controls (e.g., selects a different view type)
   - The component calls the appropriate method on UserPreferencesService
   - The service updates the preferences in memory
   - The service saves the updated preferences to localStorage
   - The updated preferences are emitted through the preferences$ observable
   - Components subscribed to preferences$ receive the update and reflect the changes

3. **Using Preferences**:
   - Components like BrowseComponent check the current preferences
   - They adjust their layout and behavior based on the preferences
   - For example, they might switch between grid and list views based on defaultViewType

## State Management

The user preferences system uses a combination of service-based state management and local storage:

- **BehaviorSubject**: UserPreferencesService uses a BehaviorSubject to maintain the current state of preferences
- **Observable**: Components subscribe to the preferences$ observable to react to changes
- **localStorage**: Preferences are persisted to localStorage to survive page refreshes and browser restarts

## Data Model

The UserPreferences interface defines the structure of user preferences:

```typescript
interface UserPreferences {
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

Default preferences are defined as:

```typescript
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultViewType: 'netflix',
  contentDensity: 'comfortable',
  cardSize: 'medium',
  savedFilters: {},
  recentlyViewed: [],
  favorites: [],
};
```

## Key Features

1. **View Type Customization**:

   - Netflix-style grid view
   - Tinder-style card view
   - List view for detailed information

2. **Content Density Options**:

   - Comfortable: More spacing between elements
   - Compact: Reduced spacing for more content
   - Condensed: Minimal spacing for maximum content density

3. **Card Size Options**:

   - Small: Compact cards for viewing many items
   - Medium: Balanced size for most screens
   - Large: Detailed cards for better readability

4. **Filter Management**:

   - Save frequently used filters
   - Retrieve saved filters by name
   - Delete unused filters

5. **Recently Viewed Tracking**:

   - Automatically track recently viewed items
   - Limit the number of items tracked
   - Access history of viewed items

6. **Favorites Management**:
   - Add/remove items from favorites
   - Check if an item is in favorites
   - Access list of favorite items

## Implementation Details

### UserPreferencesService Methods

| Method                  | Description                          | Parameters                                           |
| ----------------------- | ------------------------------------ | ---------------------------------------------------- |
| `getPreferences()`      | Returns current preferences          | None                                                 |
| `updatePreferences()`   | Updates multiple preferences at once | `preferences: Partial<UserPreferences>`              |
| `setDefaultViewType()`  | Sets the default view type           | `viewType: 'netflix' \| 'tinder' \| 'list'`          |
| `setContentDensity()`   | Sets the content density             | `density: 'comfortable' \| 'compact' \| 'condensed'` |
| `setCardSize()`         | Sets the card size                   | `size: 'small' \| 'medium' \| 'large'`               |
| `saveFilter()`          | Saves a filter with a name           | `name: string, filter: any`                          |
| `getSavedFilter()`      | Gets a saved filter by name          | `name: string`                                       |
| `deleteSavedFilter()`   | Deletes a saved filter               | `name: string`                                       |
| `addToRecentlyViewed()` | Adds an item to recently viewed      | `id: string, maxItems: number = 10`                  |
| `toggleFavorite()`      | Toggles an item in favorites         | `id: string`                                         |
| `isFavorite()`          | Checks if an item is in favorites    | `id: string`                                         |
| `resetPreferences()`    | Resets preferences to defaults       | None                                                 |

### Storage

Preferences are stored in localStorage using the key 'user_preferences'. The data is stored as a JSON string and parsed when retrieved.

## Integration with Other Features

1. **Browse Feature**:

   - Uses defaultViewType to determine the initial view
   - Applies content density and card size settings

2. **Theme System**:

   - Coordinates with ThemeService for dark/light mode preferences
   - Ensures consistent visual experience

3. **Filter System**:

   - Saves and retrieves filter configurations
   - Enhances search experience with personalized filters

4. **Favorites Feature**:
   - Provides client-side favorites tracking
   - Syncs with server-side favorites when authenticated

## Testing

### Unit Tests

| Test File                            | Path                                                                                   | Description                   |
| ------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------- |
| `user-preferences.service.spec.ts`   | `/client-angular/src/app/core/services/user-preferences.service.spec.ts`               | Tests for preferences service |
| `preferences-demo.component.spec.ts` | `/client-angular/src/app/features/preferences-demo/preferences-demo.component.spec.ts` | Tests for preferences demo UI |

## Performance Considerations

1. **Minimal Storage Footprint**:

   - Preferences are stored efficiently in localStorage
   - Only essential data is persisted

2. **Reactive Updates**:

   - Observable pattern ensures efficient updates
   - Components only re-render when necessary

3. **Lazy Loading**:
   - PreferencesDemoComponent is lazy-loaded
   - Only loaded when explicitly requested

## Future Enhancements

1. **Server-Side Preferences**:

   - Store preferences on the server for logged-in users
   - Sync preferences across devices

2. **Advanced Customization**:

   - Add more customizable aspects (font size, animations)
   - Create preset combinations of preferences

3. **Accessibility Preferences**:

   - High contrast mode
   - Text-to-speech preferences
   - Motion reduction settings

4. **Analytics Integration**:
   - Track preference usage patterns
   - Recommend optimal settings based on usage
