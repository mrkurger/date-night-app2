# Middleware Development Guide

This document provides guidelines for creating and working with middleware in our TypeScript/JavaScript hybrid application.

## Overview

Middleware functions in Express.js are functions that have access to the request, response, and next function in the application's request-response cycle. Our application uses a mix of JavaScript and TypeScript middleware with enhanced compatibility layers to ensure type safety.

## Creating TypeScript-Compatible Middleware

### Basic Middleware Structure

```typescript
import { Request, Response, NextFunction } from 'express';
import { ValidatorFunction } from '../src/types/middleware.js';

export const myMiddleware: ValidatorFunction = (req: Request, res: Response, next: NextFunction) => {
  // Middleware logic
  next();
};
```

### Using Compatibility Helpers

For JavaScript middleware that needs to be used in TypeScript contexts:

```javascript
import { adaptMiddleware } from '../src/utils/express-compatibility.js';

const myJavaScriptMiddleware = (req, res, next) => {
  // Middleware logic
  next();
};

// Use this when applying the middleware to routes
router.get('/my-route', adaptMiddleware(myJavaScriptMiddleware), controller.handler);
```

## Validation Middleware

We provide several options for validation:

### 1. Zod Validation (Recommended)

```typescript
import { validateWithZod } from '../middleware/enhanced-validator.js';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

router.post('/users', validateWithZod(schema), userController.create);
```

### 2. Express-Validator (Legacy)

```javascript
import { body, validationResult } from 'express-validator';

const validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.post('/users', validateUser, userController.create);
```

## Error Handling

Always ensure proper error handling in middleware:

```typescript
export const errorHandlingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Potential error-throwing code
    next();
  } catch (error) {
    next(error); // Forward to global error handler
  }
};
```

For async middleware:

```typescript
export const asyncMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Async operations
    await someAsyncFunction();
    next();
  } catch (error) {
    next(error);
  }
};
```

Or better yet, use our wrapAsync helper:

```typescript
import { wrapAsync } from '../src/utils/express-compatibility.js';

router.get('/data', wrapAsync(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));
```

## Types for Middleware

We provide several useful types in `src/types/middleware.d.ts`:

- `ValidatorFunction`: Type for validation middleware
- `MiddlewareFunction`: Basic middleware type
- `AsyncHandler`: Type for async handlers
- `RequestHandler`: Compatible with Express's RequestHandler

## Testing Middleware

When testing middleware, remember to:

1. Mock request, response, and next function
2. Check that `next()` is called appropriately
3. Verify that appropriate status and json methods are called on the response object
4. Test error cases

Example:

```javascript
describe('myMiddleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });
  
  it('should call next() for valid input', () => {
    req.body.validField = 'value';
    myMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
  
  it('should return error for invalid input', () => {
    myMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
```
