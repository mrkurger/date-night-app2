# Server Tests

This directory contains tests for the server-side components of the Date Night App.

## Directory Structure

- `unit/`: Unit tests for individual components
  - `models/`: Tests for database models
  - `middleware/`: Tests for Express middleware
  - `services/`: Tests for business logic services
  - `utils/`: Tests for utility functions
- `integration/`: Integration tests for API endpoints and component interactions
  - `controllers/`: Tests for API controllers
  - `routes/`: Tests for API routes
  - `services/`: Tests for service integrations
- `performance/`: Performance tests for API endpoints and critical operations
- `setup.js`: Common setup for database and test environment
- `helpers.js`: Shared test utilities and helper functions

## Running Tests

From the project root:

```bash
# Run all server tests
npm run test:server

# Run only unit tests
npm run test:server:unit

# Run only integration tests
npm run test:server:integration

# Run performance tests
npm run test:server:performance

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Unit Tests

Unit tests should:
- Test a single function or method in isolation
- Mock all external dependencies
- Be fast and deterministic
- Focus on edge cases and error handling

Example:
```javascript
describe('UserModel', () => {
  it('should validate email format', async () => {
    const userWithInvalidEmail = new User({
      ...validUserData,
      email: 'invalid-email'
    });
    
    await expect(userWithInvalidEmail.save()).rejects.toThrow();
  });
});
```

### Integration Tests

Integration tests should:
- Test the interaction between components
- Use the in-memory database
- Test complete API flows
- Verify both successful and error responses

Example:
```javascript
describe('POST /api/v1/auth/login', () => {
  it('should return 401 with incorrect password', async () => {
    await createTestUser();
    
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(401);
  });
});
```

### Performance Tests

Performance tests should:
- Define clear performance thresholds
- Test both single requests and concurrent loads
- Measure response times and resource usage

Example:
```javascript
it('should login within performance threshold', async () => {
  const startTime = Date.now();
  
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      username: 'testuser',
      password: 'password123'
    });
  
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  expect(res.statusCode).toBe(200);
  expect(responseTime).toBeLessThan(200); // 200ms threshold
});
```

## Test Helpers

The `helpers.js` file provides common utilities:

- `createTestUser()`: Create a user for testing
- `generateTestToken()`: Generate a JWT token for authentication
- `authenticatedRequest()`: Add authentication headers to a request

## Database Setup

The `setup.js` file provides:

- `setupTestDB()`: Initialize the in-memory MongoDB server
- `teardownTestDB()`: Clean up after tests
- `clearDatabase()`: Reset the database between tests

## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from other tests
2. **Cleanup**: Always clean up resources after tests
3. **Mocking**: Use mocks for external services and dependencies
4. **Coverage**: Aim for high test coverage, especially for critical paths
5. **Performance**: Keep tests fast to encourage frequent running