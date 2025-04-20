# Travel Module Documentation

The Travel Module provides functionality for managing travel itineraries for advertisers in the DateNight.io platform. This module allows advertisers to create, update, and cancel travel plans, and allows users to find advertisers based on their current or planned locations.

## Features

- **Travel Itinerary Management**: Create, update, and cancel travel plans
- **Location Tracking**: Update and track advertiser's current location
- **Location-Based Search**: Find advertisers based on location
- **Upcoming Tours**: Find advertisers with upcoming travel plans
- **Notifications**: Notify followers about travel updates

## API Endpoints

### Travel Itinerary Management

#### Get Itineraries

```
GET /api/v1/travel/ad/:adId
```

Retrieves all travel itineraries for a specific ad.

**Parameters:**
- `adId` (path): ID of the ad

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "itinerary-id",
      "destination": {
        "city": "Oslo",
        "county": "Oslo",
        "country": "Norway",
        "location": {
          "type": "Point",
          "coordinates": [10.7522, 59.9139]
        }
      },
      "arrivalDate": "2023-06-15T12:00:00.000Z",
      "departureDate": "2023-06-20T12:00:00.000Z",
      "accommodation": {
        "name": "Grand Hotel",
        "address": "Karl Johans gate 31, 0159 Oslo",
        "showAccommodation": true
      },
      "availability": [
        {
          "dayOfWeek": 1,
          "startTime": "10:00",
          "endTime": "22:00"
        }
      ],
      "notes": "Available for outcalls only",
      "status": "planned"
    }
  ]
}
```

#### Add Itinerary

```
POST /api/v1/travel/ad/:adId
```

Adds a new travel itinerary to an ad.

**Parameters:**
- `adId` (path): ID of the ad

**Request Body:**
```json
{
  "destination": {
    "city": "Oslo",
    "county": "Oslo",
    "country": "Norway"
  },
  "arrivalDate": "2023-06-15T12:00:00.000Z",
  "departureDate": "2023-06-20T12:00:00.000Z",
  "accommodation": {
    "name": "Grand Hotel",
    "address": "Karl Johans gate 31, 0159 Oslo",
    "showAccommodation": true
  },
  "availability": [
    {
      "dayOfWeek": 1,
      "startTime": "10:00",
      "endTime": "22:00"
    }
  ],
  "notes": "Available for outcalls only"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "itinerary-id",
      "destination": {
        "city": "Oslo",
        "county": "Oslo",
        "country": "Norway",
        "location": {
          "type": "Point",
          "coordinates": [10.7522, 59.9139]
        }
      },
      "arrivalDate": "2023-06-15T12:00:00.000Z",
      "departureDate": "2023-06-20T12:00:00.000Z",
      "accommodation": {
        "name": "Grand Hotel",
        "address": "Karl Johans gate 31, 0159 Oslo",
        "showAccommodation": true
      },
      "availability": [
        {
          "dayOfWeek": 1,
          "startTime": "10:00",
          "endTime": "22:00"
        }
      ],
      "notes": "Available for outcalls only",
      "status": "planned"
    }
  ]
}
```

#### Update Itinerary

```
PUT /api/v1/travel/ad/:adId/itinerary/:itineraryId
```

Updates an existing travel itinerary.

**Parameters:**
- `adId` (path): ID of the ad
- `itineraryId` (path): ID of the itinerary

**Request Body:**
```json
{
  "destination": {
    "city": "Bergen",
    "county": "Vestland"
  },
  "arrivalDate": "2023-07-01T12:00:00.000Z",
  "departureDate": "2023-07-05T12:00:00.000Z",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "itinerary-id",
    "destination": {
      "city": "Bergen",
      "county": "Vestland",
      "country": "Norway",
      "location": {
        "type": "Point",
        "coordinates": [5.3221, 60.3913]
      }
    },
    "arrivalDate": "2023-07-01T12:00:00.000Z",
    "departureDate": "2023-07-05T12:00:00.000Z",
    "status": "active"
  }
}
```

#### Cancel Itinerary

```
DELETE /api/v1/travel/ad/:adId/itinerary/:itineraryId
```

Cancels a travel itinerary.

**Parameters:**
- `adId` (path): ID of the ad
- `itineraryId` (path): ID of the itinerary

**Response:**
```json
{
  "success": true,
  "message": "Travel itinerary cancelled successfully"
}
```

### Location Management

#### Update Location

```
PUT /api/v1/travel/ad/:adId/location
```

Updates the current location of an advertiser.

**Parameters:**
- `adId` (path): ID of the ad

**Request Body:**
```json
{
  "longitude": 10.7522,
  "latitude": 59.9139
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentLocation": {
      "type": "Point",
      "coordinates": [10.7522, 59.9139]
    },
    "isTouring": true
  }
}
```

### Search and Discovery

#### Get Touring Advertisers

```
GET /api/v1/travel/touring
```

Retrieves all advertisers who are currently touring.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "ad-id-1",
      "title": "Ad Title",
      "advertiser": {
        "_id": "user-id",
        "username": "username",
        "profileImage": "profile-image-url"
      },
      "category": "Escort",
      "county": "Oslo",
      "city": "Oslo",
      "profileImage": "profile-image-url",
      "travelItinerary": [...],
      "isTouring": true,
      "currentLocation": {
        "type": "Point",
        "coordinates": [10.7522, 59.9139]
      }
    }
  ]
}
```

#### Get Upcoming Tours

```
GET /api/v1/travel/upcoming
```

Retrieves advertisers with upcoming travel plans.

**Query Parameters:**
- `city` (optional): Filter by city
- `county` (optional): Filter by county
- `days` (optional): Number of days ahead to look (default: 30)

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "ad-id-1",
      "title": "Ad Title",
      "advertiser": {
        "_id": "user-id",
        "username": "username",
        "profileImage": "profile-image-url"
      },
      "category": "Escort",
      "county": "Oslo",
      "city": "Oslo",
      "profileImage": "profile-image-url",
      "travelItinerary": [...],
      "isTouring": true
    }
  ]
}
```

#### Get Ads by Location

```
GET /api/v1/travel/location
```

Retrieves ads based on location, including touring advertisers.

**Query Parameters:**
- `longitude` (required): Longitude coordinate
- `latitude` (required): Latitude coordinate
- `distance` (optional): Maximum distance in meters (default: 10000)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "ad-id-1",
      "title": "Ad Title",
      "advertiser": {
        "_id": "user-id",
        "username": "username",
        "profileImage": "profile-image-url"
      },
      "category": "Escort",
      "county": "Oslo",
      "city": "Oslo",
      "profileImage": "profile-image-url",
      "travelItinerary": [...],
      "isTouring": true,
      "currentLocation": {
        "type": "Point",
        "coordinates": [10.7522, 59.9139]
      }
    }
  ]
}
```

## Data Models

### Travel Itinerary Schema

```javascript
{
  destination: {
    city: {
      type: String,
      required: true
    },
    county: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'Norway'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  arrivalDate: {
    type: Date,
    required: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  accommodation: {
    name: String,
    address: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      }
    },
    showAccommodation: {
      type: Boolean,
      default: false
    }
  },
  availability: [{
    dayOfWeek: {
      type: Number, // 0-6 (Sunday-Saturday)
      required: true
    },
    startTime: {
      type: String, // HH:MM format
      required: true
    },
    endTime: {
      type: String, // HH:MM format
      required: true
    }
  }],
  notes: String,
  status: {
    type: String,
    enum: ['planned', 'active', 'completed', 'cancelled'],
    default: 'planned'
  }
}
```

## Implementation Details

### Caching Strategy

The travel module implements a caching strategy to improve performance:

- **Itineraries Cache**: Caches travel itineraries for each ad with a 5-minute TTL
- **Touring Advertisers Cache**: Caches the list of touring advertisers with a 1-minute TTL
- **Upcoming Tours Cache**: Caches upcoming tours with a 5-minute TTL
- **Location-Based Cache**: Caches location-based search results with a 1-minute TTL

Cache invalidation occurs when:
- An itinerary is added, updated, or cancelled
- An advertiser's location is updated

### Notification System

The travel module includes a notification system that:

- Notifies followers when an advertiser adds or updates a travel itinerary
- Notifies followers when an advertiser cancels a travel itinerary
- Uses WebSockets for real-time notifications

### Geolocation

The module includes geolocation features:

- Geocoding of city and county names to coordinates
- Validation of coordinates
- Location-based search using MongoDB's geospatial queries

## Error Handling

The travel module implements comprehensive error handling:

- Input validation using express-validator
- Proper error responses with appropriate HTTP status codes
- Detailed error logging
- Graceful handling of database errors

## Security

Security measures in the travel module include:

- Authentication and authorization checks for protected routes
- Input validation to prevent injection attacks
- Rate limiting to prevent abuse
- CSRF protection for all routes

## Performance Considerations

To ensure optimal performance, the travel module:

- Uses caching to reduce database load
- Implements efficient MongoDB queries with proper indexing
- Uses pagination for large result sets
- Optimizes WebSocket communication for notifications