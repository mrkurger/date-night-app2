# API Documentation

This document provides comprehensive documentation for the Date Night App API.

## Table of Contents

- [Authentication](#authentication)
  - [Login](#login)
  - [Register](#register)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
- [User Management](#user-management)
  - [Get User Profile](#get-user-profile)
  - [Update User Profile](#update-user-profile)
  - [Delete User](#delete-user)
- [Advertisement Management](#advertisement-management)
  - [Create Advertisement](#create-advertisement)
  - [Get Advertisements](#get-advertisements)
  - [Get Advertisement by ID](#get-advertisement-by-id)
  - [Update Advertisement](#update-advertisement)
  - [Delete Advertisement](#delete-advertisement)
- [Travel Itinerary](#travel-itinerary)
  - [Add Travel Location](#add-travel-location)
  - [Get Travel Locations](#get-travel-locations)
  - [Update Travel Location](#update-travel-location)
  - [Delete Travel Location](#delete-travel-location)
- [Chat](#chat)
  - [Get Conversations](#get-conversations)
  - [Get Messages](#get-messages)
  - [Send Message](#send-message)
- [Media Management](#media-management)
  - [Upload Media](#upload-media)
  - [Delete Media](#delete-media)
- [Payment](#payment)
  - [Create Payment Intent](#create-payment-intent)
  - [Get Payment Methods](#get-payment-methods)
  - [Add Payment Method](#add-payment-method)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Versioning](#versioning)

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Login

Authenticates a user and returns a JWT token.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid credentials
- 500 Internal Server Error: Server error

### Register

Creates a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body or email already in use
- 500 Internal Server Error: Server error

### Refresh Token

Refreshes an expired JWT token.

**Endpoint:** `POST /api/v1/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Invalid or expired refresh token
- 500 Internal Server Error: Server error

### Logout

Invalidates a refresh token.

**Endpoint:** `POST /api/v1/auth/logout`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 500 Internal Server Error: Server error

## User Management

### Get User Profile

Retrieves the authenticated user's profile.

**Endpoint:** `GET /api/v1/users/profile`

**Authentication Required:** Yes

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2023-04-18T12:00:00.000Z",
  "updatedAt": "2023-04-18T12:00:00.000Z"
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: User not found
- 500 Internal Server Error: Server error

### Update User Profile

Updates the authenticated user's profile.

**Endpoint:** `PUT /api/v1/users/profile`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "email": "john.smith@example.com",
  "name": "John Smith",
  "role": "user",
  "createdAt": "2023-04-18T12:00:00.000Z",
  "updatedAt": "2023-04-18T13:00:00.000Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: User not found
- 500 Internal Server Error: Server error

### Delete User

Deletes the authenticated user's account.

**Endpoint:** `DELETE /api/v1/users/profile`

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: User not found
- 500 Internal Server Error: Server error

## Advertisement Management

### Create Advertisement

Creates a new advertisement.

**Endpoint:** `POST /api/v1/ads`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "title": "Professional Massage Service",
  "description": "Relaxing massage service in Oslo",
  "price": 1500,
  "category": "massage",
  "location": {
    "city": "Oslo",
    "country": "Norway",
    "coordinates": [10.7522, 59.9139]
  },
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["relaxing", "professional", "massage"]
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c86",
  "title": "Professional Massage Service",
  "description": "Relaxing massage service in Oslo",
  "price": 1500,
  "category": "massage",
  "location": {
    "city": "Oslo",
    "country": "Norway",
    "coordinates": [10.7522, 59.9139]
  },
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["relaxing", "professional", "massage"],
  "user": "60d21b4667d0d8992e610c85",
  "createdAt": "2023-04-18T12:00:00.000Z",
  "updatedAt": "2023-04-18T12:00:00.000Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

### Get Advertisements

Retrieves a list of advertisements with optional filtering and pagination.

**Endpoint:** `GET /api/v1/ads`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `category`: Filter by category
- `city`: Filter by city
- `country`: Filter by country
- `minPrice`: Filter by minimum price
- `maxPrice`: Filter by maximum price
- `sort`: Sort by field (default: createdAt)
- `order`: Sort order (asc or desc, default: desc)

**Response:**
```json
{
  "ads": [
    {
      "_id": "60d21b4667d0d8992e610c86",
      "title": "Professional Massage Service",
      "description": "Relaxing massage service in Oslo",
      "price": 1500,
      "category": "massage",
      "location": {
        "city": "Oslo",
        "country": "Norway",
        "coordinates": [10.7522, 59.9139]
      },
      "images": ["image1.jpg", "image2.jpg"],
      "tags": ["relaxing", "professional", "massage"],
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe"
      },
      "createdAt": "2023-04-18T12:00:00.000Z",
      "updatedAt": "2023-04-18T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid query parameters
- 500 Internal Server Error: Server error

### Get Advertisement by ID

Retrieves a specific advertisement by ID.

**Endpoint:** `GET /api/v1/ads/:id`

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c86",
  "title": "Professional Massage Service",
  "description": "Relaxing massage service in Oslo",
  "price": 1500,
  "category": "massage",
  "location": {
    "city": "Oslo",
    "country": "Norway",
    "coordinates": [10.7522, 59.9139]
  },
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["relaxing", "professional", "massage"],
  "user": {
    "_id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "createdAt": "2023-04-18T12:00:00.000Z",
  "updatedAt": "2023-04-18T12:00:00.000Z"
}
```

**Error Responses:**
- 404 Not Found: Advertisement not found
- 500 Internal Server Error: Server error

### Update Advertisement

Updates a specific advertisement.

**Endpoint:** `PUT /api/v1/ads/:id`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "title": "Updated Massage Service",
  "price": 1800
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c86",
  "title": "Updated Massage Service",
  "description": "Relaxing massage service in Oslo",
  "price": 1800,
  "category": "massage",
  "location": {
    "city": "Oslo",
    "country": "Norway",
    "coordinates": [10.7522, 59.9139]
  },
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["relaxing", "professional", "massage"],
  "user": "60d21b4667d0d8992e610c85",
  "createdAt": "2023-04-18T12:00:00.000Z",
  "updatedAt": "2023-04-18T13:00:00.000Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Not authorized to update this advertisement
- 404 Not Found: Advertisement not found
- 500 Internal Server Error: Server error

### Delete Advertisement

Deletes a specific advertisement.

**Endpoint:** `DELETE /api/v1/ads/:id`

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "Advertisement deleted successfully"
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Not authorized to delete this advertisement
- 404 Not Found: Advertisement not found
- 500 Internal Server Error: Server error

## Travel Itinerary

### Add Travel Location

Adds a new travel location to the user's itinerary.

**Endpoint:** `POST /api/v1/travel`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "city": "Bergen",
  "country": "Norway",
  "coordinates": [5.3221, 60.3913],
  "startDate": "2023-05-01T00:00:00.000Z",
  "endDate": "2023-05-07T00:00:00.000Z",
  "notes": "Available for bookings"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c87",
  "city": "Bergen",
  "country": "Norway",
  "coordinates": [5.3221, 60.3913],
  "startDate": "2023-05-01T00:00:00.000Z",
  "endDate": "2023-05-07T00:00:00.000Z",
  "notes": "Available for bookings",
  "user": "60d21b4667d0d8992e610c85",
  "createdAt": "2023-04-18T12:00:00.000Z",
  "updatedAt": "2023-04-18T12:00:00.000Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

### Get Travel Locations

Retrieves the user's travel locations.

**Endpoint:** `GET /api/v1/travel`

**Authentication Required:** Yes

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)
- `sort`: Sort by field (default: startDate)
- `order`: Sort order (asc or desc, default: asc)

**Response:**
```json
{
  "locations": [
    {
      "_id": "60d21b4667d0d8992e610c87",
      "city": "Bergen",
      "country": "Norway",
      "coordinates": [5.3221, 60.3913],
      "startDate": "2023-05-01T00:00:00.000Z",
      "endDate": "2023-05-07T00:00:00.000Z",
      "notes": "Available for bookings",
      "user": "60d21b4667d0d8992e610c85",
      "createdAt": "2023-04-18T12:00:00.000Z",
      "updatedAt": "2023-04-18T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

### Update Travel Location

Updates a specific travel location.

**Endpoint:** `PUT /api/v1/travel/:id`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "endDate": "2023-05-10T00:00:00.000Z",
  "notes": "Extended stay, available for bookings"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c87",
  "city": "Bergen",
  "country": "Norway",
  "coordinates": [5.3221, 60.3913],
  "startDate": "2023-05-01T00:00:00.000Z",
  "endDate": "2023-05-10T00:00:00.000Z",
  "notes": "Extended stay, available for bookings",
  "user": "60d21b4667d0d8992e610c85",
  "createdAt": "2023-04-18T12:00:00.000Z",
  "updatedAt": "2023-04-18T13:00:00.000Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Not authorized to update this location
- 404 Not Found: Location not found
- 500 Internal Server Error: Server error

### Delete Travel Location

Deletes a specific travel location.

**Endpoint:** `DELETE /api/v1/travel/:id`

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "Travel location deleted successfully"
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Not authorized to delete this location
- 404 Not Found: Location not found
- 500 Internal Server Error: Server error

## Chat

### Get Conversations

Retrieves the user's conversations.

**Endpoint:** `GET /api/v1/chat/conversations`

**Authentication Required:** Yes

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)

**Response:**
```json
{
  "conversations": [
    {
      "_id": "60d21b4667d0d8992e610c88",
      "participants": [
        {
          "_id": "60d21b4667d0d8992e610c85",
          "name": "John Doe"
        },
        {
          "_id": "60d21b4667d0d8992e610c89",
          "name": "Jane Smith"
        }
      ],
      "lastMessage": {
        "_id": "60d21b4667d0d8992e610c90",
        "text": "Hello, I'm interested in your service",
        "sender": "60d21b4667d0d8992e610c89",
        "createdAt": "2023-04-18T12:00:00.000Z"
      },
      "unreadCount": 1,
      "createdAt": "2023-04-18T12:00:00.000Z",
      "updatedAt": "2023-04-18T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

### Get Messages

Retrieves messages from a specific conversation.

**Endpoint:** `GET /api/v1/chat/conversations/:id/messages`

**Authentication Required:** Yes

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 20)
- `before`: Get messages before this timestamp

**Response:**
```json
{
  "messages": [
    {
      "_id": "60d21b4667d0d8992e610c90",
      "text": "Hello, I'm interested in your service",
      "sender": {
        "_id": "60d21b4667d0d8992e610c89",
        "name": "Jane Smith"
      },
      "conversation": "60d21b4667d0d8992e610c88",
      "createdAt": "2023-04-18T12:00:00.000Z"
    },
    {
      "_id": "60d21b4667d0d8992e610c91",
      "text": "Hi Jane, thank you for your interest",
      "sender": {
        "_id": "60d21b4667d0d8992e610c85",
        "name": "John Doe"
      },
      "conversation": "60d21b4667d0d8992e610c88",
      "createdAt": "2023-04-18T12:05:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Not authorized to access this conversation
- 404 Not Found: Conversation not found
- 500 Internal Server Error: Server error

### Send Message

Sends a message to a specific conversation.

**Endpoint:** `POST /api/v1/chat/conversations/:id/messages`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "text": "When are you available?"
}
```

**Response:**
```json
{
  "_id": "60d21b4667d0d8992e610c92",
  "text": "When are you available?",
  "sender": {
    "_id": "60d21b4667d0d8992e610c89",
    "name": "Jane Smith"
  },
  "conversation": "60d21b4667d0d8992e610c88",
  "createdAt": "2023-04-18T12:10:00.000Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Not authorized to send messages to this conversation
- 404 Not Found: Conversation not found
- 500 Internal Server Error: Server error

## Media Management

### Upload Media

Uploads media files for advertisements.

**Endpoint:** `POST /api/v1/media/upload`

**Authentication Required:** Yes

**Request Body:**
- Form data with file field named "media"

**Response:**
```json
{
  "files": [
    {
      "filename": "image1.jpg",
      "path": "/uploads/image1.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg"
    }
  ]
}
```

**Error Responses:**
- 400 Bad Request: Invalid file type or size
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

### Delete Media

Deletes a specific media file.

**Endpoint:** `DELETE /api/v1/media/:filename`

**Authentication Required:** Yes

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 403 Forbidden: Not authorized to delete this file
- 404 Not Found: File not found
- 500 Internal Server Error: Server error

## Payment

### Create Payment Intent

Creates a payment intent for Stripe.

**Endpoint:** `POST /api/v1/payments/create-intent`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "amount": 1500,
  "currency": "nok",
  "description": "Payment for advertisement boost"
}
```

**Response:**
```json
{
  "clientSecret": "pi_3NJZ2eKZ6o0CuOZD1gNWgJQu_secret_vCSKqVGrDFMwDtBMVPApjOCiQ",
  "amount": 1500,
  "currency": "nok"
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

### Get Payment Methods

Retrieves the user's saved payment methods.

**Endpoint:** `GET /api/v1/payments/methods`

**Authentication Required:** Yes

**Response:**
```json
{
  "methods": [
    {
      "id": "pm_1NJZ2eKZ6o0CuOZD1gNWgJQu",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      }
    }
  ]
}
```

**Error Responses:**
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

### Add Payment Method

Adds a new payment method for the user.

**Endpoint:** `POST /api/v1/payments/methods`

**Authentication Required:** Yes

**Request Body:**
```json
{
  "paymentMethodId": "pm_1NJZ2eKZ6o0CuOZD1gNWgJQu"
}
```

**Response:**
```json
{
  "method": {
    "id": "pm_1NJZ2eKZ6o0CuOZD1gNWgJQu",
    "type": "card",
    "card": {
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2025
    }
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid request body
- 401 Unauthorized: Missing or invalid token
- 500 Internal Server Error: Server error

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

Common error codes:
- `INVALID_REQUEST`: Invalid request body or parameters
- `AUTHENTICATION_FAILED`: Authentication failed
- `AUTHORIZATION_FAILED`: Authorization failed
- `RESOURCE_NOT_FOUND`: Resource not found
- `VALIDATION_FAILED`: Validation failed
- `INTERNAL_ERROR`: Internal server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum number of requests allowed per minute
- `X-RateLimit-Remaining`: Number of requests remaining in the current minute
- `X-RateLimit-Reset`: Time in seconds until the rate limit resets

When the rate limit is exceeded, the API returns a 429 Too Many Requests response.

## Versioning

The API uses URL versioning:

- Current version: `v1`
- Base URL: `/api/v1`

Future versions will be available at `/api/v2`, `/api/v3`, etc.