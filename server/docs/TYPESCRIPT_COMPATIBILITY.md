# TypeScript Compatibility Guide

## Overview

This document explains how to work with TypeScript and JavaScript code in the date-night-app server codebase. 
We've implemented a compatibility layer that allows for gradual migration from JavaScript to TypeScript
while maintaining full functionality.

## Key Components

### Middleware Compatibility

We've created compatibility helpers to ensure middleware functions properly with TypeScript:

- `adaptMiddleware`: Adapts middleware functions for TypeScript compatibility
- `wrapController` (alias: `wrapAsync`): Wraps controller functions for proper async error handling
- `assertRequestHandler`: Ensures TypeScript typing for request handlers

```typescript
// Example usage
import { wrapAsync, adaptMiddleware } from '../src/utils/express-compatibility.js';

router.post(
  '/ad/:adId/itinerary',
  isAdvertiser,
  adaptMiddleware(TravelValidator.validateAdId),
  wrapAsync(travelController.addItinerary)
);
```

### Validation Compatibility

Our validation system supports both TypeScript and JavaScript code:

- `legacyValidateWithZod`: Original validation function, renamed for clarity
- `enhancedValidateWithZod`: Enhanced validation with TypeScript support
- `validateWithZod`: Alias that points to the appropriate implementation

```javascript
// JavaScript usage
import { validateWithZod } from '../middleware/validator.js';

export const UserValidator = {
  validateRegistration: validateWithZod(
    z.object({
      body: z.object({
        email: emailSchema,
        password: passwordSchema,
      })
    })
  )
};
```

```typescript
// TypeScript usage with enhanced features
import { validateWithZod } from '../middleware/enhanced-validator.js';

export const TravelValidator = {
  validateLocationUpdate: validateWithZod(
    z.object({ body: TravelSchemas.locationUpdate }),
    'body',  // validate only body
    { stripUnknown: true }
  )
};
```

## Building the Project

Use the appropriate build scripts:

- `npm run build:ts-full`: Full TypeScript-compatible build (recommended)
- `npm run build:compat`: Creates just the compatibility layer
- `npm run build:validators`: Fixes validator compatibility issues 

## Adding TypeScript Support to Existing Files

When migrating from JavaScript to TypeScript:

1. Rename the file from `.js` to `.ts`
2. Add proper type definitions
3. Use the compatibility helpers for middleware functions
4. Update imports to reference `.js` files (TypeScript still emits `.js` files)

For example, when migrating a controller:

```typescript
// Before: controller.js
const myController = {
  getItems: async (req, res) => {
    // implementation
  }
};

// After: controller.ts
import { Request, Response } from 'express';
import { MyController } from './controller.d.ts';

const myController: MyController = {
  getItems: async (req: Request, res: Response) => {
    // implementation
  }
};
```

## Troubleshooting

If you encounter validation errors:

1. Check if you're using the correct validation import
2. Make sure middleware compatibility helpers are in use
3. Run `npm run build:validators` to fix validator compatibility issues

Error with imports: Use the `adaptMiddleware` function to wrap middleware functions.

## Future Improvements

We plan to fully migrate all code to TypeScript. The compatibility layer allows
us to do this gradually while maintaining functionality.
