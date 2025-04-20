# API Documentation

## Overview

DateNight.io provides a comprehensive RESTful API that allows developers to interact with the platform programmatically. The API is documented using the OpenAPI 3.0 specification and is accessible through Swagger UI.

## Accessing the API Documentation

The API documentation is available at the following endpoints:

- **Swagger UI**: `/api-docs`
- **OpenAPI JSON**: `/swagger.json`

## Authentication

Most API endpoints require authentication using JSON Web Tokens (JWT). To authenticate:

1. Obtain a token by calling the `/api/v1/auth/login` endpoint with valid credentials
2. Include the token in the `Authorization` header of subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

## Rate Limiting

To ensure fair usage and system stability, the API implements rate limiting:

- **General API endpoints**: 100 requests per 15 minutes per IP address
- **Authentication endpoints**: 10 requests per 15 minutes per IP address
- **Ad creation endpoints**: 20 requests per hour per user
- **Media upload endpoints**: 50 requests per hour per user

## API Versioning

The API uses URL versioning. All endpoints are prefixed with `/api/v1/`.

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error code",
  "message": "Detailed error message"
}
```

## API Resources

The API provides access to the following resources:

### Advertisements

Endpoints for creating, retrieving, updating, and deleting advertisements.

- `GET /api/v1/ads`: Get all ads with pagination and filtering
- `GET /api/v1/ads/:adId`: Get ad by ID
- `POST /api/v1/ads`: Create a new ad
- `PUT /api/v1/ads/:adId`: Update an existing ad
- `DELETE /api/v1/ads/:adId`: Delete an ad
- `GET /api/v1/ads/swipe`: Get ads for swipe interface
- `GET /api/v1/ads/categories`: Get all ad categories
- `GET /api/v1/ads/category/:category`: Get ads by category
- `POST /api/v1/ads/swipes`: Record a swipe action

### Authentication

Endpoints for user authentication and authorization.

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login and get access token
- `POST /api/v1/auth/refresh`: Refresh access token
- `POST /api/v1/auth/logout`: Logout and invalidate token
- `POST /api/v1/auth/forgot-password`: Request password reset
- `POST /api/v1/auth/reset-password`: Reset password with token

### Users

Endpoints for user management.

- `GET /api/v1/users/me`: Get current user profile
- `PUT /api/v1/users/me`: Update current user profile
- `GET /api/v1/users/:userId`: Get user by ID
- `PUT /api/v1/users/:userId/settings`: Update user settings

### Chat

Endpoints for messaging between users.

- `GET /api/v1/chat/rooms`: Get all chat rooms for current user
- `POST /api/v1/chat/rooms`: Create a new chat room
- `GET /api/v1/chat/rooms/:roomId`: Get chat room by ID
- `GET /api/v1/chat/rooms/:roomId/messages`: Get messages in a chat room
- `POST /api/v1/chat/rooms/:roomId/messages`: Send a message to a chat room

### Travel Itineraries

Endpoints for managing travel itineraries.

- `GET /api/v1/travel/ads/:adId/itineraries`: Get all itineraries for an ad
- `POST /api/v1/travel/ads/:adId/itineraries`: Create a new itinerary
- `GET /api/v1/travel/ads/:adId/itineraries/:id`: Get itinerary by ID
- `PUT /api/v1/travel/ads/:adId/itineraries/:id`: Update an itinerary
- `PATCH /api/v1/travel/ads/:adId/itineraries/:id/cancel`: Cancel an itinerary
- `DELETE /api/v1/travel/ads/:adId/itineraries/:id`: Delete an itinerary

### Wallet

Endpoints for managing user wallets and transactions.

- `GET /api/v1/wallet`: Get wallet details
- `POST /api/v1/wallet/deposit`: Deposit funds
- `POST /api/v1/wallet/withdraw`: Withdraw funds
- `POST /api/v1/wallet/transfer`: Transfer funds
- `GET /api/v1/wallet/transactions`: Get transaction history

### Media

Endpoints for managing media files.

- `POST /api/v1/media/upload`: Upload media files
- `DELETE /api/v1/media/:mediaId`: Delete a media file
- `PATCH /api/v1/media/:mediaId/moderate`: Moderate a media file

## Implementing Swagger Documentation

To document new API endpoints, add JSDoc-style comments to your route files. Here's an example:

```javascript
/**
 * @swagger
 * /api/v1/resource:
 *   get:
 *     summary: Get resources
 *     description: Retrieve a list of resources
 *     tags: [ResourceTag]
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 */
router.get('/', resourceController.getResources);
```

## Adding New Schemas

To add new schemas to the Swagger documentation, update the `server/config/swagger.js` file:

```javascript
// Add to components.schemas object
MyNewResource: {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: '60d21b4667d0d8992e610c85',
    },
    name: {
      type: 'string',
      example: 'Resource name',
    },
    // Add other properties
  },
},
```

## Best Practices

1. **Keep documentation up-to-date**: Update the Swagger documentation whenever you change an API endpoint
2. **Use meaningful descriptions**: Provide clear and concise descriptions for endpoints, parameters, and responses
3. **Include examples**: Add examples for request bodies and responses to make the documentation more useful
4. **Document error responses**: Include documentation for possible error responses and their meanings
5. **Group related endpoints**: Use tags to group related endpoints together

## Related Documentation

- [IMPLEMENTATION_SUMMARY.MD](/docs/IMPLEMENTATION_SUMMARY.MD)
- [SECURITY_CONSIDERATIONS.MD](/docs/SECURITY_CONSIDERATIONS.MD)
- [DEVELOPMENT_GUIDE.MD](/docs/DEVELOPMENT_GUIDE.MD)
