# Advertisement Platform

## Overview

The Advertisement Platform is a core feature of DateNight.io that allows service providers to create, manage, and promote their services, while users can browse and search for services that meet their needs. The platform supports multiple viewing modes (List, Grid, Tinder-style, Netflix-style) and provides comprehensive filtering and search capabilities.

## User Experience

Users interact with the Advertisement Platform through several interfaces:

- **Ad Browsing**: Users can browse ads in different view modes (list, grid, tinder-style swipe, netflix-style carousel)
- **Ad Details**: Users can view detailed information about a specific ad
- **Ad Creation/Management**: Service providers can create, edit, and manage their ads
- **Search & Filtering**: Users can search for ads by location, category, price range, and keywords
- **Swipe Interface**: Users can quickly browse ads in a Tinder-style interface, swiping right for interest and left to skip

## Architecture

### Client-Side Components

| Component               | Path                                                                               | Description                                 |
| ----------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| `AdsModule`             | `/client-angular/src/app/features/ads/ads.module.ts`                               | Main module for ads feature                 |
| `AdListComponent`       | `/client-angular/src/app/features/ads/components/ad-list/ad-list.component.ts`     | Displays a list of ads                      |
| `AdDetailComponent`     | `/client-angular/src/app/features/ads/components/ad-detail/ad-detail.component.ts` | Displays detailed view of an ad             |
| `AdCreateComponent`     | `/client-angular/src/app/features/ads/components/ad-create/ad-create.component.ts` | Form for creating new ads                   |
| `AdManagementComponent` | `/client-angular/src/app/features/ad-management/ad-management.component.ts`        | Dashboard for managing ads                  |
| `AdFormComponent`       | `/client-angular/src/app/features/ad-management/ad-form/ad-form.component.ts`      | Reusable form for creating/editing ads      |
| `AdStatsComponent`      | `/client-angular/src/app/features/ad-management/ad-stats/ad-stats.component.ts`    | Displays ad performance statistics          |
| `AdBrowserComponent`    | `/client-angular/src/app/features/ad-browser/ad-browser.component.ts`              | Main component for browsing ads             |
| `AdDetailsComponent`    | `/client-angular/src/app/features/ad-details/ad-details.component.ts`              | Standalone component for viewing ad details |

### Client-Side Services

| Service     | Path                                                  | Description                      |
| ----------- | ----------------------------------------------------- | -------------------------------- |
| `AdService` | `/client-angular/src/app/core/services/ad.service.ts` | Handles all ad-related API calls |

### Server-Side Controllers

| Controller     | Path                                      | Description                         |
| -------------- | ----------------------------------------- | ----------------------------------- |
| `AdController` | `/server/components/ads/ad.controller.js` | Handles all ad-related API requests |

### Server-Side Services

| Service     | Path                             | Description                  |
| ----------- | -------------------------------- | ---------------------------- |
| `AdService` | `/server/services/ad.service.js` | Implements ad business logic |

### Models

| Model | Path                                 | Description             |
| ----- | ------------------------------------ | ----------------------- |
| `Ad`  | `/server/components/ads/ad.model.js` | Mongoose schema for ads |

## API Endpoints

| Endpoint                      | Method | Description                               | Request Body                                | Response                          |
| ----------------------------- | ------ | ----------------------------------------- | ------------------------------------------- | --------------------------------- |
| `/api/ads`                    | GET    | Get all ads with pagination and filtering | N/A                                         | Paginated array of ad objects     |
| `/api/ads/:adId`              | GET    | Get ad by ID                              | N/A                                         | Ad object                         |
| `/api/ads`                    | POST   | Create new ad                             | Ad object                                   | Created ad object                 |
| `/api/ads/swipe`              | GET    | Get random ads for swipe interface        | N/A                                         | Array of ad objects               |
| `/api/ads/categories`         | GET    | Get all ad categories                     | N/A                                         | Array of category strings         |
| `/api/ads/category/:category` | GET    | Get ads by category                       | N/A                                         | Array of ad objects               |
| `/api/ads/swipes`             | POST   | Record a swipe action                     | `{adId, direction}`                         | Success message                   |
| `/api/ads/nearby`             | GET    | Get ads near a location                   | `{longitude, latitude, radius}`             | Array of ad objects with distance |
| `/api/ads/trending`           | GET    | Get trending ads                          | N/A                                         | Array of ad objects               |
| `/api/ads/featured`           | GET    | Get featured ads                          | N/A                                         | Array of ad objects               |
| `/api/ads/search`             | GET    | Search ads by keyword                     | `{q: searchTerm}`                           | Array of ad objects               |
| `/api/ads/:id/report`         | POST   | Report an ad                              | `{reason}`                                  | Success message                   |
| `/api/ads/:id/status`         | PATCH  | Toggle ad active status                   | `{isActive}`                                | Success message                   |
| `/api/ads/location-search`    | GET    | Search ads by location                    | `{longitude, latitude, radius, categories}` | Array of ad objects with distance |

## Data Flow

The advertisement platform follows this data flow:

1. **Ad Creation**:

   - User submits ad data through the AdCreateComponent
   - AdService sends a POST request to the server
   - AdController validates the request and calls AdService.createAd()
   - Ad is saved to the database and returned to the client

2. **Ad Browsing**:

   - User accesses the ad browsing interface
   - AdService requests ads with filters from the server
   - AdController processes the request, applies filters, and returns paginated results
   - Client displays the ads in the selected view mode

3. **Ad Detail View**:

   - User clicks on an ad
   - AdService requests the specific ad by ID
   - AdController retrieves the ad and increments the view count
   - Client displays the detailed ad information

4. **Swipe Interface**:

   - User accesses the swipe interface
   - AdService requests random ads from the server
   - User swipes on ads (left/right)
   - Each swipe is recorded via the AdService to the server
   - Swipe data is used for analytics and recommendations

5. **Ad Management**:
   - Service provider accesses their ad management dashboard
   - AdService retrieves their ads
   - Provider can edit, delete, or create new ads
   - Changes are sent to the server and saved to the database

## State Management

The advertisement platform uses a combination of service-based state management and local component state:

- **AdService**: Maintains cached ad data and handles API communication
- **Local Component State**: Each component maintains its own UI state (sorting, filtering, pagination)
- **URL Parameters**: Search filters and pagination state are stored in URL parameters for shareable links

## Key Algorithms and Logic

1. **Ad Filtering and Search**:

   - Server-side filtering based on multiple criteria (category, location, price range, keywords)
   - Full-text search across title and description fields
   - Pagination with customizable page size

2. **Location-Based Matching**:

   - Geospatial queries using MongoDB's 2dsphere index
   - Distance calculation using the Haversine formula
   - Radius-based search with configurable distance units

3. **Ad Recommendation Engine**:

   - Engagement score calculation based on views, likes, and right swipes
   - Weighted scoring system to prioritize user interactions
   - Category and tag-based similarity matching

4. **Swipe Interface Logic**:
   - Random ad selection with category and location filtering
   - Swipe data recording for analytics and recommendations
   - Client-side caching to improve performance

## Security Considerations

1. **Authorization**:

   - Only authenticated users can create ads
   - Users can only edit/delete their own ads
   - Admin users can moderate all ads

2. **Data Validation**:

   - Server-side validation of all ad data
   - Image validation for size, type, and content
   - Rate limiting for ad creation and reporting

3. **Content Moderation**:
   - Media moderation workflow with approval states
   - Reporting system for inappropriate content
   - Automated content filtering for prohibited terms

## Testing

### Unit Tests

| Test File                     | Path                                                                                    | Description                   |
| ----------------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| `ad.service.spec.ts`          | `/client-angular/src/app/core/services/ad.service.spec.ts`                              | Tests for ad service          |
| `ad-list.component.spec.ts`   | `/client-angular/src/app/features/ads/components/ad-list/ad-list.component.spec.ts`     | Tests for ad list component   |
| `ad-detail.component.spec.ts` | `/client-angular/src/app/features/ads/components/ad-detail/ad-detail.component.spec.ts` | Tests for ad detail component |

### Integration Tests

| Test File               | Path                                                  | Description               |
| ----------------------- | ----------------------------------------------------- | ------------------------- |
| `ad.controller.test.js` | `/server/tests/integration/ads/ad.controller.test.js` | API integration tests     |
| `ad.service.test.js`    | `/server/tests/integration/ads/ad.service.test.js`    | Service integration tests |

## Configuration Options

The advertisement platform supports several configuration options:

- **Page Size**: Configurable number of ads per page
- **Image Limits**: Maximum number of images per ad
- **Featured Ad Slots**: Number of featured ads to display
- **Cache Duration**: TTL for cached ad data
- **Moderation Settings**: Auto-approval thresholds and moderation rules

## Known Limitations

1. **Performance**:

   - Large result sets may cause performance issues
   - Image-heavy ads may load slowly on poor connections

2. **Search Limitations**:

   - Basic text search without advanced NLP capabilities
   - Limited fuzzy matching for misspelled search terms

3. **Mobile Responsiveness**:
   - Some advanced filtering options may be difficult to use on small screens
   - Image upload from mobile devices may be limited by browser capabilities

## Future Enhancements

1. **Advanced Search**:

   - Implement Elasticsearch for better full-text search
   - Add semantic search capabilities
   - Support for more complex filtering combinations

2. **Media Improvements**:

   - Video support with transcoding
   - 360° image viewing
   - Image recognition for automatic tagging

3. **Analytics Dashboard**:

   - Detailed performance metrics for advertisers
   - Conversion tracking
   - A/B testing for ad variations

4. **Recommendation Engine**:
   - Machine learning-based recommendations
   - Personalized ad suggestions based on user behavior
   - Collaborative filtering for similar ads

## Related Documentation

- [AD-BROWSER.MD](/docs/features/AD-BROWSER.MD)
- [AD-DETAILS.MD](/docs/features/AD-DETAILS.MD)
- [AD-MANAGEMENT.MD](/docs/features/AD-MANAGEMENT.MD)
- [LOCATION-MATCHING.MD](/docs/features/LOCATION-MATCHING.MD)
- [API_DOCUMENTATION.MD](/docs/API_DOCUMENTATION.MD)
