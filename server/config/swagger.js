// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for Swagger/OpenAPI configuration
//
// COMMON CUSTOMIZATIONS:
// - API_VERSION: API version number (default: '1.0.0')
//   Related to: package.json:version
// - API_TITLE: API title (default: 'DateNight.io API')
// - API_DESCRIPTION: API description (default: 'API for DateNight.io platform')
// - API_SERVER_URL: API server URL (default: 'http://localhost:3000')
// ===================================================
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DateNight.io API',
      version: '1.0.0',
      description: 'API documentation for the DateNight.io platform',
      license: {
        name: 'Proprietary',
        url: 'https://datenight.io/terms',
      },
      contact: {
        name: 'DateNight.io Support',
        url: 'https://datenight.io/support',
        email: 'support@datenight.io',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development Server',
      },
      {
        url: 'https://api.datenight.io',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            message: {
              type: 'string',
              example: 'Detailed error message',
            },
          },
        },
        Ad: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85',
            },
            title: {
              type: 'string',
              example: 'Sofia - 25 - Escort',
            },
            description: {
              type: 'string',
              example: 'Professional and discreet service. Available for outcalls and incalls.',
            },
            contact: {
              type: 'string',
              example: '+47 123 45 678',
            },
            location: {
              type: 'string',
              example: 'Oslo',
            },
            datePosted: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-15T12:00:00Z',
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-20T14:30:00Z',
            },
            coordinates: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  example: 'Point',
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number',
                  },
                  example: [10.7522, 59.9139],
                },
              },
            },
            advertiser: {
              type: 'string',
              example: '60d21b4667d0d8992e610c86',
            },
            profileImage: {
              type: 'string',
              example: '/assets/images/profile1.jpg',
            },
            county: {
              type: 'string',
              example: 'Oslo',
            },
            category: {
              type: 'string',
              example: 'Escort',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['GFE', 'Dinner Date', 'Overnight'],
            },
            media: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    example: '/assets/images/profile1.jpg',
                  },
                  type: {
                    type: 'string',
                    enum: ['image', 'video'],
                    example: 'image',
                  },
                  thumbnail: {
                    type: 'string',
                    example: '/assets/images/thumbnail1.jpg',
                  },
                  isApproved: {
                    type: 'boolean',
                    example: true,
                  },
                  moderationStatus: {
                    type: 'string',
                    enum: ['pending', 'approved', 'rejected'],
                    example: 'approved',
                  },
                  moderationNotes: {
                    type: 'string',
                    example: '',
                  },
                  uploadDate: {
                    type: 'string',
                    format: 'date-time',
                    example: '2023-01-15T12:00:00Z',
                  },
                },
              },
            },
            status: {
              type: 'string',
              enum: ['draft', 'pending', 'active', 'rejected', 'inactive'],
              example: 'active',
            },
            viewCount: {
              type: 'number',
              example: 150,
            },
            likeCount: {
              type: 'number',
              example: 25,
            },
            swipeData: {
              type: 'object',
              properties: {
                right: {
                  type: 'number',
                  example: 45,
                },
                left: {
                  type: 'number',
                  example: 15,
                },
              },
            },
            ageRestricted: {
              type: 'boolean',
              example: true,
            },
            privacySettings: {
              type: 'object',
              properties: {
                showLocation: {
                  type: 'boolean',
                  example: true,
                },
                showContact: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
          },
        },
        TravelItinerary: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c87',
            },
            adId: {
              type: 'string',
              example: '60d21b4667d0d8992e610c85',
            },
            destination: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  example: 'Bergen',
                },
                county: {
                  type: 'string',
                  example: 'Vestland',
                },
                country: {
                  type: 'string',
                  example: 'Norway',
                },
                location: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      example: 'Point',
                    },
                    coordinates: {
                      type: 'array',
                      items: {
                        type: 'number',
                      },
                      example: [5.3221, 60.3913],
                    },
                  },
                },
              },
            },
            arrivalDate: {
              type: 'string',
              format: 'date-time',
              example: '2023-02-15T12:00:00Z',
            },
            departureDate: {
              type: 'string',
              format: 'date-time',
              example: '2023-02-20T12:00:00Z',
            },
            accommodation: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Hotel Bristol',
                },
                address: {
                  type: 'string',
                  example: 'Torgallmenningen 11, 5014 Bergen',
                },
                location: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      example: 'Point',
                    },
                    coordinates: {
                      type: 'array',
                      items: {
                        type: 'number',
                      },
                      example: [5.3221, 60.3913],
                    },
                  },
                },
                showAccommodation: {
                  type: 'boolean',
                  example: false,
                },
              },
            },
            notes: {
              type: 'string',
              example: 'Available for dinner dates and overnight stays.',
            },
            status: {
              type: 'string',
              enum: ['planned', 'active', 'completed', 'cancelled'],
              example: 'planned',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-15T12:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-15T12:00:00Z',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '60d21b4667d0d8992e610c86',
            },
            email: {
              type: 'string',
              example: 'user@example.com',
            },
            username: {
              type: 'string',
              example: 'user123',
            },
            role: {
              type: 'string',
              enum: ['user', 'advertiser', 'admin'],
              example: 'advertiser',
            },
            profile: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Sofia',
                },
                bio: {
                  type: 'string',
                  example: 'Professional escort based in Oslo.',
                },
                avatar: {
                  type: 'string',
                  example: '/assets/images/avatar1.jpg',
                },
                location: {
                  type: 'string',
                  example: 'Oslo',
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T12:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-10T14:30:00Z',
            },
          },
        },
      },
    },
  },
  apis: [
    './server/components/**/*.routes.js',
    './server/components/**/*.controller.js',
    './server/routes/**/*.js',
  ],
};

const specs = swaggerJsdoc(options);

export default specs;
