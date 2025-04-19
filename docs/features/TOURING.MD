# Travel Itinerary Feature

## Overview

The Travel Itinerary feature allows service providers to create and manage travel schedules, enabling them to announce when they will be visiting different locations. This feature helps service providers expand their reach beyond their home location and allows users to discover services that will be available in their area in the future.

## User Experience

Service providers interact with the Travel Itinerary feature through several interfaces:

- **Itinerary Creation**: Service providers can create travel plans with destination, dates, and optional accommodation details
- **Itinerary Management**: Service providers can view, edit, and cancel their travel plans
- **Itinerary Visibility**: Service providers can control the visibility of their travel plans and accommodation details

Users interact with the Travel Itinerary feature through:

- **Discover Traveling Providers**: Users can see which service providers will be visiting their area
- **Search by Date**: Users can search for services available in a specific location during a particular time period
- **Notifications**: Users can opt to receive notifications when service providers announce travel to their area

## Architecture

### Client-Side Components

#### Components

1. **TravelItineraryListComponent** (`client-angular/src/app/features/travel/travel-itinerary-list/travel-itinerary-list.component.ts`)

   - Displays a list of travel itineraries for a service provider
   - Supports filtering by status (upcoming, active, past)
   - Provides actions for managing itineraries

2. **TravelItineraryFormComponent** (`client-angular/src/app/features/travel/travel-itinerary-form/travel-itinerary-form.component.ts`)

   - Form for creating and editing travel itineraries
   - Includes location selection, date range picker, and accommodation details
   - Implements validation for required fields and date ranges

3. **TravelItineraryDetailComponent** (`client-angular/src/app/features/travel/travel-itinerary-detail/travel-itinerary-detail.component.ts`)

   - Displays detailed information about a specific travel itinerary
   - Shows map with destination location
   - Provides actions for editing and canceling the itinerary

4. **TravelMapComponent** (`client-angular/src/app/features/travel/travel-map/travel-map.component.ts`)

   - Interactive map showing travel destinations
   - Supports clustering for multiple destinations
   - Provides filtering by date range

5. **TravelCalendarComponent** (`client-angular/src/app/features/travel/travel-calendar/travel-calendar.component.ts`)
   - Calendar view of travel itineraries
   - Highlights dates when service providers will be in specific locations
   - Supports filtering by location and service provider

#### Services

1. **TravelService** (`client-angular/src/app/features/travel/services/travel.service.ts`)

   - Handles API communication for travel itineraries
   - Methods for CRUD operations on travel itineraries
   - Implements caching for frequently accessed data

2. **TravelStateService** (`client-angular/src/app/features/travel/services/travel-state.service.ts`)

   - Manages state for travel itineraries
   - Implements Observable pattern for reactive updates
   - Handles filtering and sorting of itineraries

3. **LocationService** (`client-angular/src/app/core/services/location.service.ts`)
   - Provides location data and geocoding functionality
   - Used for location selection in travel itinerary form
   - Implements autocomplete for location search

#### State Management

1. **TravelState** (`client-angular/src/app/features/travel/store/travel.state.ts`)

   - NgRx state for travel itineraries
   - Stores list of itineraries, loading status, and error messages
   - Implements selectors for filtered views

2. **TravelActions** (`client-angular/src/app/features/travel/store/travel.actions.ts`)

   - NgRx actions for travel itineraries
   - Includes actions for loading, creating, updating, and deleting itineraries
   - Implements error handling actions

3. **TravelEffects** (`client-angular/src/app/features/travel/store/travel.effects.ts`)

   - NgRx effects for travel itineraries
   - Handles asynchronous operations with the TravelService
   - Implements optimistic updates for better user experience

4. **TravelReducer** (`client-angular/src/app/features/travel/store/travel.reducer.ts`)
   - NgRx reducer for travel itineraries
   - Updates state based on dispatched actions
   - Implements error handling and loading states

### Server-Side Components

#### Models

1. **TravelItinerary** (`server/models/travel-itinerary.model.js`)

   ```javascript
   const travelItinerarySchema = new mongoose.Schema({
     adId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Ad',
       required: true,
     },
     destination: {
       city: { type: String, required: true },
       county: { type: String, required: true },
       country: { type: String, default: 'Norway' },
       location: {
         type: { type: String, enum: ['Point'], default: 'Point' },
         coordinates: { type: [Number], required: true },
       },
     },
     arrivalDate: { type: Date, required: true },
     departureDate: { type: Date, required: true },
     accommodation: {
       name: String,
       address: String,
       location: {
         type: { type: String, enum: ['Point'], default: 'Point' },
         coordinates: [Number],
       },
       showAccommodation: { type: Boolean, default: false },
     },
     notes: String,
     status: {
       type: String,
       enum: ['planned', 'active', 'completed', 'cancelled'],
       default: 'planned',
     },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now },
   });

   // Indexes for efficient querying
   travelItinerarySchema.index({ 'destination.location': '2dsphere' });
   travelItinerarySchema.index({ arrivalDate: 1, departureDate: 1 });
   travelItinerarySchema.index({ adId: 1 });
   travelItinerarySchema.index({ 'destination.city': 1 });
   travelItinerarySchema.index({ 'destination.county': 1 });
   travelItinerarySchema.index({ status: 1 });
   ```

#### Controllers

1. **TravelController** (`server/controllers/travel.controller.js`)
   - Handles API requests for travel itineraries
   - Implements CRUD operations
   - Includes validation and error handling
   - Methods:
     - `createItinerary`: Creates a new travel itinerary
     - `getItineraries`: Retrieves itineraries with filtering options
     - `getItineraryById`: Retrieves a specific itinerary by ID
     - `updateItinerary`: Updates an existing itinerary
     - `deleteItinerary`: Deletes an itinerary
     - `cancelItinerary`: Changes itinerary status to cancelled
     - `searchItineraries`: Searches for itineraries by location and date range

#### Services

1. **TravelService** (`server/services/travel.service.js`)
   - Implements business logic for travel itineraries
   - Handles complex queries and data transformations
   - Methods:
     - `createItinerary`: Creates a new travel itinerary with validation
     - `findItineraries`: Retrieves itineraries with filtering and pagination
     - `findItineraryById`: Retrieves a specific itinerary by ID
     - `updateItinerary`: Updates an existing itinerary with validation
     - `deleteItinerary`: Deletes an itinerary with permission checks
     - `cancelItinerary`: Changes itinerary status to cancelled
     - `searchItineraries`: Searches for itineraries by location and date range
     - `updateItineraryStatus`: Automatically updates itinerary status based on dates

#### Routes

1. **TravelRoutes** (`server/routes/travel.routes.js`)

   ```javascript
   const express = require('express');
   const router = express.Router();
   const travelController = require('../controllers/travel.controller');
   const { authenticateToken } = require('../middleware/authenticateToken');
   const { travelValidator } = require('../middleware/validators/travel.validator');

   // Get all itineraries for an ad
   router.get('/ads/:adId/itineraries', travelController.getItineraries);

   // Get a specific itinerary
   router.get('/ads/:adId/itineraries/:id', travelController.getItineraryById);

   // Create a new itinerary (requires authentication)
   router.post(
     '/ads/:adId/itineraries',
     authenticateToken,
     travelValidator.create,
     travelController.createItinerary
   );

   // Update an itinerary (requires authentication)
   router.put(
     '/ads/:adId/itineraries/:id',
     authenticateToken,
     travelValidator.update,
     travelController.updateItinerary
   );

   // Delete an itinerary (requires authentication)
   router.delete('/ads/:adId/itineraries/:id', authenticateToken, travelController.deleteItinerary);

   // Cancel an itinerary (requires authentication)
   router.patch(
     '/ads/:adId/itineraries/:id/cancel',
     authenticateToken,
     travelController.cancelItinerary
   );

   // Search for itineraries by location and date
   router.get('/search', travelController.searchItineraries);

   module.exports = router;
   ```

## Data Flow

1. **Creating a Travel Itinerary**:

   - User fills out the TravelItineraryFormComponent
   - Component validates input and dispatches a createItinerary action
   - TravelEffects intercepts the action and calls TravelService.createItinerary()
   - TravelService sends a POST request to the server API
   - Server validates the request and creates a new itinerary in the database
   - Server returns the created itinerary
   - TravelEffects dispatches a createItinerarySuccess action
   - TravelReducer updates the state with the new itinerary
   - TravelItineraryListComponent reflects the updated state

2. **Searching for Travel Itineraries**:

   - User selects location and date range in the search form
   - Component dispatches a searchItineraries action
   - TravelEffects intercepts the action and calls TravelService.searchItineraries()
   - TravelService sends a GET request to the server API with query parameters
   - Server performs a geospatial query to find itineraries in the specified location and date range
   - Server returns the matching itineraries
   - TravelEffects dispatches a searchItinerariesSuccess action
   - TravelReducer updates the state with the search results
   - TravelMapComponent and TravelCalendarComponent reflect the updated state

3. **Automatic Status Updates**:
   - A scheduled job runs daily on the server
   - The job calls TravelService.updateItineraryStatus()
   - The service queries for itineraries that need status updates based on current date
   - Itineraries with arrival date in the past and departure date in the future are updated to 'active'
   - Itineraries with departure date in the past are updated to 'completed'
   - The updated statuses are saved to the database

## Key Algorithms and Logic

1. **Geospatial Search**:

   - Uses MongoDB's $geoNear operator for location-based searches
   - Implements radius-based search with configurable distance
   - Optimizes queries with geospatial indexes

2. **Date Range Filtering**:

   - Implements efficient date range queries using MongoDB's date comparison operators
   - Handles timezone differences for accurate date matching
   - Optimizes queries with compound indexes on date fields

3. **Status Management**:

   - Automatically updates itinerary status based on current date and itinerary dates
   - Implements state machine pattern for status transitions
   - Prevents invalid status transitions (e.g., cannot change from 'cancelled' to 'active')

4. **Conflict Detection**:
   - Detects potential conflicts when creating or updating itineraries
   - Prevents overlapping itineraries for the same service provider
   - Provides warnings for tight scheduling (e.g., back-to-back itineraries in different locations)

## Security Considerations

1. **Authentication and Authorization**:

   - All itinerary creation, update, and deletion operations require authentication
   - Only the owner of an ad can manage its itineraries
   - Implements role-based access control for admin operations

2. **Data Privacy**:

   - Accommodation details are only visible if showAccommodation is true
   - Sensitive location data is protected from unauthorized access
   - Implements data minimization principles in API responses

3. **Input Validation**:

   - All user inputs are validated on both client and server
   - Implements strict validation for dates, locations, and other fields
   - Prevents common security issues like injection attacks

4. **Rate Limiting**:
   - Implements rate limiting for itinerary creation and search operations
   - Prevents abuse of the API
   - Configurable limits based on user role and operation type

## Testing

1. **Unit Tests**:

   - Tests for TravelService methods
   - Tests for TravelController methods
   - Tests for TravelItinerary model validation

2. **Integration Tests**:

   - Tests for API endpoints
   - Tests for database operations
   - Tests for authentication and authorization

3. **End-to-End Tests**:
   - Tests for the complete travel itinerary workflow
   - Tests for the search functionality
   - Tests for the map and calendar components

## Configuration Options

The Travel Itinerary feature can be configured through environment variables and configuration files:

1. **Environment Variables**:

   - `MAX_ITINERARIES_PER_AD`: Maximum number of itineraries allowed per ad (default: 10)
   - `DEFAULT_SEARCH_RADIUS_KM`: Default radius for location-based searches (default: 50)
   - `ITINERARY_AUTO_UPDATE_CRON`: Cron expression for automatic status updates (default: '0 0 \* \* \*')

2. **Configuration Files**:
   - `server/config/travel.config.js`: Server-side configuration
   - `client-angular/src/app/features/travel/travel.config.ts`: Client-side configuration

## Known Limitations

1. **Performance**:

   - Large number of itineraries can slow down the map component
   - Complex geospatial queries can be resource-intensive

2. **Timezone Handling**:

   - Date handling across different timezones can be complex
   - Users may experience confusion with arrival and departure times

3. **Mobile Experience**:
   - Map component may have limited functionality on small screens
   - Calendar view may be difficult to use on mobile devices

## Future Enhancements

1. **Advanced Scheduling**:

   - Support for recurring travel patterns
   - Integration with calendar systems (Google Calendar, iCal)
   - Automatic scheduling suggestions based on historical data

2. **Enhanced Notifications**:

   - Push notifications for users when providers announce travel to their area
   - Email notifications for upcoming travel
   - SMS notifications for urgent changes

3. **Travel Planning**:

   - Route optimization for multiple destinations
   - Integration with travel booking services
   - Cost estimation for travel plans

4. **Analytics**:
   - Heatmaps showing popular travel destinations
   - Demand forecasting for different locations
   - Performance metrics for travel-related bookings

## Related Documentation

- [AD-MANAGEMENT.MD](/docs/features/AD-MANAGEMENT.MD)
- [LOCATION-MATCHING.MD](/docs/features/LOCATION-MATCHING.MD)
- [NOTIFICATION-SYSTEM.MD](/docs/features/NOTIFICATION-SYSTEM.MD)
- [API_DOCUMENTATION.MD](/docs/API_DOCUMENTATION.MD)
