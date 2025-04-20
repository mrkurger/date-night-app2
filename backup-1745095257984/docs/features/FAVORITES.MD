# Favorites System

## Overview

The Favorites System allows users to save ads they're interested in for later viewing. It supports tagging, prioritization, notes, and notification preferences for each favorite. This feature helps users organize and track ads they're interested in, making it easier to compare options and make decisions.

## User Experience

Users interact with the Favorites System through several interfaces:

- **Favorites List**: Displays all favorited ads with filtering and sorting options
- **Favorite Button**: Appears on ad cards and detail pages for quick favoriting
- **Favorite Details**: Allows users to add notes, tags, and set priority for each favorite
- **Notification Settings**: Controls which favorites trigger notifications when updated

## Architecture

### Client-Side Components

| Component                 | Path                                                                                      | Description                          |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| `FavoritesModule`         | `/client-angular/src/app/features/favorites/favorites.module.ts`                          | Main module for favorites feature    |
| `FavoritesListComponent`  | `/client-angular/src/app/features/favorites/favorites-list/favorites-list.component.ts`   | Displays list of favorited ads       |
| `FavoriteCardComponent`   | `/client-angular/src/app/features/favorites/favorite-card/favorite-card.component.ts`     | Card view for a favorited ad         |
| `FavoriteButtonComponent` | `/client-angular/src/app/shared/components/favorite-button/favorite-button.component.ts`  | Button for adding/removing favorites |
| `FavoriteDialogComponent` | `/client-angular/src/app/shared/components/favorite-dialog/favorite-dialog.component.ts`  | Dialog for adding notes and tags     |
| `FavoriteFilterComponent` | `/client-angular/src/app/features/favorites/favorite-filter/favorite-filter.component.ts` | Filters for favorites list           |
| `TagManagerComponent`     | `/client-angular/src/app/features/favorites/tag-manager/tag-manager.component.ts`         | Manages favorite tags                |

### Client-Side Services

| Service               | Path                                                            | Description                          |
| --------------------- | --------------------------------------------------------------- | ------------------------------------ |
| `FavoriteService`     | `/client-angular/src/app/core/services/favorite.service.ts`     | Manages favorite data and operations |
| `DialogService`       | `/client-angular/src/app/core/services/dialog.service.ts`       | Handles favorite dialogs             |
| `NotificationService` | `/client-angular/src/app/core/services/notification.service.ts` | Manages favorite notifications       |

### Server-Side Controllers

| Controller           | Path                                         | Description                            |
| -------------------- | -------------------------------------------- | -------------------------------------- |
| `FavoriteController` | `/server/controllers/favorite.controller.js` | Handles favorite-related HTTP requests |

### Server-Side Models

| Model      | Path                               | Description                   |
| ---------- | ---------------------------------- | ----------------------------- |
| `Favorite` | `/server/models/favorite.model.js` | Mongoose schema for favorites |

## API Endpoints

| Endpoint                             | Method | Description                   | Request Body              | Response                    |
| ------------------------------------ | ------ | ----------------------------- | ------------------------- | --------------------------- |
| `/api/favorites`                     | GET    | Get all user favorites        | N/A                       | Array of favorite objects   |
| `/api/favorites/ids`                 | GET    | Get favorite ad IDs           | N/A                       | Array of ad IDs             |
| `/api/favorites/tags`                | GET    | Get user's favorite tags      | N/A                       | Array of tag objects        |
| `/api/favorites/check/:adId`         | GET    | Check if ad is favorited      | N/A                       | Boolean                     |
| `/api/favorites/:adId`               | POST   | Add ad to favorites           | `{notes, tags, priority}` | Success message             |
| `/api/favorites/batch`               | POST   | Add multiple ads to favorites | `{adIds, notes, tags}`    | Success message             |
| `/api/favorites/:adId`               | DELETE | Remove ad from favorites      | N/A                       | Success message             |
| `/api/favorites/batch`               | DELETE | Remove multiple favorites     | `{adIds}`                 | Success message             |
| `/api/favorites/:adId/notes`         | PATCH  | Update favorite notes         | `{notes}`                 | Success message             |
| `/api/favorites/:adId/tags`          | PATCH  | Update favorite tags          | `{tags}`                  | Success message             |
| `/api/favorites/:adId/priority`      | PATCH  | Update favorite priority      | `{priority}`              | Success message             |
| `/api/favorites/:adId/notifications` | PATCH  | Toggle notifications          | N/A                       | Updated notification status |

## Data Flow

The favorites system follows these data flows:

1. **Adding a Favorite**:

   - User clicks the favorite button on an ad
   - FavoriteService checks if the ad is already favorited
   - If not, a dialog may appear for adding notes and tags
   - FavoriteService sends a POST request to the server
   - Server creates a new Favorite document
   - UI updates to show the ad is now favorited

2. **Viewing Favorites**:

   - User navigates to the Favorites page
   - FavoriteService loads favorites from the server
   - FavoritesListComponent displays the favorites
   - User can filter, sort, and search their favorites
   - Pagination handles large numbers of favorites

3. **Updating a Favorite**:

   - User can add/edit notes, tags, or priority
   - FavoriteService sends PATCH requests to update specific fields
   - Server updates the Favorite document
   - UI reflects the changes immediately

4. **Removing a Favorite**:
   - User clicks the unfavorite button
   - FavoriteService sends a DELETE request
   - Server removes the Favorite document
   - UI updates to show the ad is no longer favorited

## State Management

The favorites system uses a combination of service-based state management:

- **FavoriteService**: Maintains the current state of favorites
- **BehaviorSubject**: Provides reactive updates to components
- **LocalStorage**: Caches favorite IDs for quick checking

## Data Model

The Favorite model includes:

```typescript
interface Favorite {
  _id: string;
  user: string; // Reference to User
  ad: string; // Reference to Ad
  createdAt: Date; // When the favorite was created
  notes: string; // User notes about the favorite
  notificationsEnabled: boolean; // Whether to notify on updates
  tags: string[]; // User-defined tags for organization
  priority: 'low' | 'normal' | 'high'; // User-defined priority
  lastViewed: Date; // When the user last viewed this favorite
  lastNotified: Date; // When the user was last notified about this favorite
}
```

## Key Features

1. **Tagging System**:

   - Users can add custom tags to favorites
   - Tags can be used for filtering and organization
   - The system tracks tag usage for quick access

2. **Priority Levels**:

   - Favorites can be marked as low, normal, or high priority
   - Priority affects sorting and can be used for filtering
   - Visual indicators show priority level

3. **Notes**:

   - Users can add private notes to favorites
   - Notes support formatting and can be updated at any time
   - Notes are searchable in the favorites list

4. **Notification Preferences**:

   - Users can enable/disable notifications per favorite
   - Notifications can alert users to price changes, new images, etc.
   - The system tracks when notifications were last sent

5. **Batch Operations**:
   - Multiple favorites can be added or removed at once
   - Batch operations improve performance for bulk actions
   - UI provides selection tools for batch operations

## Security Considerations

1. **Access Control**:

   - Favorites are private to each user
   - Authentication is required for all favorite operations
   - Server validates user ownership before operations

2. **Data Validation**:

   - Tags are limited to 30 characters
   - Notes are limited to 500 characters
   - Priority values are restricted to predefined options

3. **Rate Limiting**:
   - API endpoints implement rate limiting to prevent abuse
   - Batch operations have size limits

## Testing

### Unit Tests

| Test File                           | Path                                                                                          | Description                         |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------- |
| `favorite.service.spec.ts`          | `/client-angular/src/app/core/services/favorite.service.spec.ts`                              | Tests for favorite service          |
| `favorite-button.component.spec.ts` | `/client-angular/src/app/shared/components/favorite-button/favorite-button.component.spec.ts` | Tests for favorite button component |
| `favorites-list.component.spec.ts`  | `/client-angular/src/app/features/favorites/favorites-list/favorites-list.component.spec.ts`  | Tests for favorites list component  |

### Integration Tests

| Test File                     | Path                                                             | Description           |
| ----------------------------- | ---------------------------------------------------------------- | --------------------- |
| `favorite.controller.test.js` | `/server/tests/integration/favorite/favorite.controller.test.js` | API integration tests |
| `favorite.model.test.js`      | `/server/tests/integration/favorite/favorite.model.test.js`      | Database model tests  |

## Performance Considerations

1. **Efficient Querying**:

   - Indexes on user, ad, tags, and priority fields
   - Compound index on user and ad for uniqueness
   - Pagination for large favorite collections

2. **Optimistic UI Updates**:

   - UI updates immediately before server confirmation
   - Rollback on error for better user experience

3. **Caching**:
   - Favorite IDs cached client-side for quick checking
   - Favorites list cached with appropriate invalidation

## Future Enhancements

1. **Smart Collections**:

   - Automatically group favorites based on common attributes
   - Suggest tags based on ad content

2. **Comparison Tools**:

   - Side-by-side comparison of multiple favorites
   - Highlight differences between similar favorites

3. **Sharing**:

   - Share favorites lists with other users
   - Collaborative favorites for group decision-making

4. **Advanced Filtering**:
   - Filter by multiple tags simultaneously
   - Custom saved filters for quick access
