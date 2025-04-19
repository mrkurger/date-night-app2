# Date Night App Testing Guide

## Overview

This guide explains the testing strategy and setup for the Date Night App. The testing framework is designed to ensure code quality, performance, and security across both the server and client components of the application.

## Testing Structure

The testing framework is organized into several categories:

### Server-side Testing

1. **Unit Tests**

   - Location: `server/tests/unit/`
   - Purpose: Test individual functions, methods, and classes in isolation
   - Tools: Jest

2. **Integration Tests**

   - Location: `server/tests/integration/`
   - Purpose: Test interactions between components and API endpoints
   - Tools: Jest, Supertest

3. **Performance Tests**
   - Location: `server/tests/performance/`
   - Purpose: Measure and ensure API response times and system performance
   - Tools: Jest, custom timing utilities

### Client-side Testing

1. **Unit Tests**

   - Location: `client-angular/src/app/**/*.spec.ts`
   - Purpose: Test individual Angular components, services, and pipes
   - Tools: Jasmine, Karma

2. **End-to-End Tests**
   - Location: `client-angular/e2e/`
   - Purpose: Test the full application flow from the user's perspective
   - Tools: Protractor (or Cypress if migrated)

## Running Tests

### Server Tests

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

### Client Tests

```bash
# Run all client tests
npm run test:client

# Run client tests with coverage
npm run test:client:coverage
```

### All Tests

```bash
# Run all tests (server and client)
npm run test:all

# Run tests in CI mode with JUnit reporter
npm run test:ci
```

## Test Configuration

### Jest Configuration

The Jest configuration is defined in `jest.config.js` at the root of the project. It includes:

- Different test environments for different types of tests
- Coverage thresholds to maintain code quality
- Custom reporters for CI integration
- Timeouts adjusted for different test types

### Karma Configuration

Angular tests use Karma, which is configured in `client-angular/karma.conf.js`.

## Writing Tests

### Server-side Test Guidelines

1. **Unit Tests**

   - Test one function or method at a time
   - Mock all external dependencies
   - Use the test helpers in `server/tests/helpers.js`
   - Follow the AAA pattern: Arrange, Act, Assert

2. **Integration Tests**

   - Use the in-memory MongoDB database provided by `server/tests/setup.js`
   - Test complete API flows
   - Verify both successful and error responses

3. **Performance Tests**
   - Define clear performance thresholds
   - Test both single requests and concurrent loads
   - Measure response times and resource usage

### Client-side Test Guidelines

1. **Component Tests**

   - Test component initialization
   - Test form validation
   - Test user interactions
   - Test component state changes
   - Test navigation using Angular Router instead of direct window.location.href manipulation

2. **Service Tests**
   - Test API interactions
   - Test state management
   - Test error handling

> **Note:** For detailed Angular testing patterns, common issues, and solutions, refer to [UNITTESTINGLESSONS.MD](./UnitTestingLessons.md)

## Test Helpers and Utilities

### Server Test Helpers

- `server/tests/setup.js`: Database setup and teardown
- `server/tests/helpers.js`: Common test utilities

### Client Test Helpers

- Angular Testing Utilities
- Custom test helpers for common patterns

## Continuous Integration

Tests are integrated into the CI pipeline with:

- Automatic test runs on pull requests
- Coverage reports
- Performance benchmarks

## Performance Analysis

Performance tests help identify:

- Slow API endpoints
- Database query bottlenecks
- Client-side rendering issues

Use `npm run analyze:performance` to run performance tests and generate reports.

## Security Testing

Security tests verify:

- Authentication and authorization
- Input validation
- Content Security Policy
- Protection against common vulnerabilities

Use `npm run analyze:security` to run security audits.

## Troubleshooting Tests

Common issues and solutions:

1. **Tests timing out**

   - Increase timeout in Jest configuration
   - Check for infinite loops or unresolved promises

2. **Database connection issues**

   - Verify MongoDB is running for integration tests
   - Check that the in-memory database is properly configured

3. **Mock failures**
   - Ensure all external dependencies are properly mocked
   - Check mock implementation matches actual behavior

## Best Practices

1. **Test Coverage**

   - Aim for at least 70% code coverage
   - Focus on critical business logic and security features

2. **Test Maintenance**

   - Update tests when changing functionality
   - Refactor tests to reduce duplication
   - Keep tests fast and reliable

3. **Test-Driven Development**
   - Write tests before implementing features
   - Use tests to define requirements
   - Refactor with confidence

## Conclusion

A comprehensive testing strategy is essential for maintaining code quality, performance, and security in the Date Night App. By following this guide, developers can ensure that their code meets the project's standards and provides a reliable experience for users.
