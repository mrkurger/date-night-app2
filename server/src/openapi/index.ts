import {
  OpenAPIRegistry,
  OpenApiGeneratorV3 as OpenAPIGenerator,
} from '@asteasolutions/zod-to-openapi';
import { UserSchema } from '../schemas/user.js';
import { AdSchema } from '../schemas/ad.js';
import { ErrorSchema } from '../schemas/base.js';

// Create OpenAPI registry
const registry = new OpenAPIRegistry();

// Register common schemas
registry.register('Error', ErrorSchema);
registry.register('User', UserSchema);
registry.register('Ad', AdSchema);

// Define servers
const servers = [
  {
    url: process.env.API_URL || 'http://localhost:3000',
    description: 'Development Server',
  },
  {
    url: 'https://api.datenight.io',
    description: 'Production Server',
  },
];

// Define security schemes
const securitySchemes = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  },
};

// Generate OpenAPI document
const document = new OpenAPIGenerator(registry.definitions).generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'DateNight.io API',
    version: '1.0.0',
    description: 'API documentation for the DateNight.io platform',
    license: { name: 'Proprietary', url: 'https://datenight.io/terms' },
    contact: {
      name: 'DateNight.io Support',
      url: 'https://datenight.io/support',
      email: 'support@datenight.io',
    },
  },
  servers,
  security: [{ bearerAuth: [] }],
  components: { securitySchemes },
});

export { registry };
export default document;
