# Travel Itinerary Feature

## Overview

The Travel Itinerary feature allows service providers to create, manage, and track their travel plans within the DateNight.io platform. This feature is particularly useful for touring service providers who visit multiple locations and need to inform potential clients about their upcoming travel schedule.

## User Experience

Service providers interact with the Travel Itinerary feature through the following interfaces:

- **Itinerary Creation**: Providers can create detailed travel plans with arrival and departure dates
- **Itinerary Management**: Providers can view, edit, and cancel existing travel plans
- **Map Visualization**: Interactive map showing all planned travel destinations
- **Location Tracking**: Optional real-time location tracking for updating current position
- **Accommodation Details**: Ability to include accommodation information for each destination

## Architecture

### Client-Side Components

| Component                  | Path                                                                                            | Description                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `TravelItineraryComponent` | `/client-angular/src/app/features/ad-management/travel-itinerary/travel-itinerary.component.ts` | Main component for managing travel itineraries         |
| `MapComponent`             | `/client-angular/src/app/shared/components/map/map.component.ts`                                | Reusable map component for displaying travel locations |

### Client-Side Services

| Service            | Path                                                         | Description                            |
| ------------------ | ------------------------------------------------------------ | -------------------------------------- |
| `TravelService`    | `/client-angular/src/app/core/services/travel.service.ts`    | Handles travel itinerary API calls     |
| `LocationService`  | `/client-angular/src/app/core/services/location.service.ts`  | Provides location data and coordinates |
| `GeocodingService` | `/client-angular/src/app/core/services/geocoding.service.ts` | Converts addresses to coordinates      |

### Server-Side Controllers

| Controller         | Path                                             | Description                           |
| ------------------ | ------------------------------------------------ | ------------------------------------- |
| `TravelController` | `/server/components/travel/travel.controller.js` | Handles travel itinerary API requests |

### Server-Side Services

| Service         | Path                                 | Description                                |
| --------------- | ------------------------------------ | ------------------------------------------ |
| `TravelService` | `/server/services/travel.service.js` | Implements travel itinerary business logic |

### Models

| Model             | Path                                                  | Description                            |
| ----------------- | ----------------------------------------------------- | -------------------------------------- |
| `TravelItinerary` | `/server/components/travel/travel-itinerary.model.js` | Mongoose schema for travel itineraries |

## API Endpoints

| Endpoint                                | Method | Description                   | Request Body     | Response                   |
| --------------------------------------- | ------ | ----------------------------- | ---------------- | -------------------------- |
| `/api/ads/:adId/itineraries`            | GET    | Get all itineraries for an ad | N/A              | Array of itinerary objects |
| `/api/ads/:adId/itineraries`            | POST   | Create new itinerary          | Itinerary object | Created itinerary object   |
| `/api/ads/:adId/itineraries/:id`        | GET    | Get itinerary by ID           | N/A              | Itinerary object           |
| `/api/ads/:adId/itineraries/:id`        | PUT    | Update itinerary              | Itinerary object | Updated itinerary object   |
| `/api/ads/:adId/itineraries/:id/cancel` | PATCH  | Cancel itinerary              | N/A              | Updated itinerary object   |
| `/api/ads/:adId/itineraries/:id`        | DELETE | Delete itinerary              | N/A              | Success message            |

## Data Flow

The travel itinerary feature follows this data flow:

1. **Itinerary Creation**:

   - Provider enters destination, dates, and optional accommodation details
   - Component validates the form data
   - TravelService sends a POST request to the server
   - TravelController validates the request and calls TravelService.addItinerary()
   - Itinerary is saved to the database and returned to the client

2. **Itinerary Listing**:

   - Provider accesses the travel itinerary management interface
   - TravelService requests itineraries for the specific ad
   - TravelController retrieves the itineraries and returns them
   - Component displays the itineraries in both list and map views

3. **Itinerary Update**:

   - Provider selects an existing itinerary to edit
   - Component populates the form with existing data
   - Provider makes changes and submits the form
   - TravelService sends a PUT request to the server
   - TravelController validates and updates the itinerary

4. **Itinerary Cancellation**:
   - Provider selects an itinerary to cancel
   - After confirmation, TravelService sends a PATCH request
   - TravelController updates the itinerary status to "cancelled"
   - Component refreshes the itinerary list and map

## State Management

The travel itinerary feature uses the following state management approach:

- **Component State**: The TravelItineraryComponent maintains local state for form data, editing mode, and UI state
- **Service State**: The TravelService handles API communication but doesn't maintain state
- **Form State**: ReactiveFormsModule is used for form state management and validation

## Key Algorithms and Logic

1. **Location Coordinate Mapping**:

   - Two-step process for obtaining coordinates:
     1. First attempt to find coordinates in local database
     2. Fall back to geocoding service if not found locally
   - Coordinates are stored in GeoJSON format (longitude, latitude)

2. **Map Visualization**:

   - Markers are generated for each itinerary with color coding by status
   - Itinerary routes can be visualized on the map
   - Map automatically centers on the most relevant location

3. **Date Validation**:

   - Ensures arrival date is before departure date
   - Prevents overlapping itineraries at the same location
   - Validates dates against current date for logical consistency

4. **Location Tracking**:
   - Uses browser's Geolocation API to track current position
   - Periodically updates position if tracking is enabled
   - Handles various error cases (permission denied, unavailable, timeout)

## Security Considerations

1. **Authorization**:

   - Only the ad owner can create/edit/delete itineraries for their ads
   - Admin users can view all itineraries but can only modify them with special permissions

2. **Data Validation**:

   - Server-side validation of all itinerary data
   - Date range validation to ensure logical consistency
   - Coordinate validation to ensure valid geographic locations

3. **Privacy**:
   - Accommodation details can be marked as private
   - Precise location can be hidden and only general area shown
   - Location tracking requires explicit user permission

## Testing

### Unit Tests

| Test File                            | Path                                                                                                 | Description                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `travel-itinerary.component.spec.ts` | `/client-angular/src/app/features/ad-management/travel-itinerary/travel-itinerary.component.spec.ts` | Tests for travel itinerary component |
| `travel.service.spec.ts`             | `/client-angular/src/app/core/services/travel.service.spec.ts`                                       | Tests for travel service             |

### Integration Tests

| Test File                   | Path                                                         | Description               |
| --------------------------- | ------------------------------------------------------------ | ------------------------- |
| `travel.controller.test.js` | `/server/tests/integration/travel/travel.controller.test.js` | API integration tests     |
| `travel.service.test.js`    | `/server/tests/integration/travel/travel.service.test.js`    | Service integration tests |

## Configuration Options

The travel itinerary feature supports several configuration options:

- **Map Provider**: Configurable map provider (Google Maps, Mapbox, etc.)
- **Default Map Center**: Default center coordinates for the map
- **Default Zoom Level**: Default zoom level for the map
- **Location Tracking Interval**: Frequency of location updates when tracking is enabled
- **Maximum Itineraries**: Maximum number of active itineraries allowed per ad

## Known Limitations

1. **Browser Compatibility**:

   - Geolocation API may not be available in all browsers
   - Map visualization may vary across different browsers and devices

2. **Offline Support**:

   - Limited functionality when offline
   - Changes made offline are not synchronized automatically

3. **Performance**:
   - Map rendering may be slow on low-end devices
   - Large number of itineraries may cause performance issues

## Future Enhancements

1. **Advanced Routing**:

   - Add support for multi-stop itineraries
   - Calculate and display travel routes between destinations
   - Estimate travel times and distances

2. **Calendar Integration**:

   - Sync with external calendars (Google Calendar, iCal)
   - Export itineraries to calendar format
   - Set up reminders for upcoming travel

3. **Client Notifications**:

   - Notify potential clients when a provider will be in their area
   - Allow clients to request visits to their location
   - Send alerts for itinerary changes

4. **Analytics**:
   - Track popular travel destinations
   - Analyze travel patterns and suggest optimizations
   - Provide insights on client engagement based on location

## Related Documentation

- [AD-MANAGEMENT.MD](/docs/features/AD-MANAGEMENT.MD)
- [LOCATION-MATCHING.MD](/docs/features/LOCATION-MATCHING.MD)
- [TOURING.MD](/docs/features/TOURING.MD)
- [API_DOCUMENTATION.MD](/docs/API_DOCUMENTATION.MD)
