# UI Testing with Playwright

This document outlines the UI testing approach for the Angular frontend application using Playwright.

## Testing Structure

The testing framework follows the Page Object Model (POM) design pattern for maintainability and reusability.

### Directory Structure:

```
tests/e2e/
├── fixtures/          # Test fixtures and custom test objects
├── pages/             # Page object models
├── screenshots/       # Generated screenshots
├── utils/             # Helper functions and utilities
└── *.spec.ts          # Test specification files
```

### Key Components:

1. **Page Objects**: Encapsulate page structure and actions
   - `BasePage`: Core functionality shared across all pages
   - `HomePage`: Home page specific actions
   - `LoginPage`: Login form interactions
   - `NavigationMenu`: Navigation-related actions
   - `ProfilePage`: User profile operations

2. **Test Fixtures**: Custom fixtures for easier test writing
   - Provides pre-configured page objects to tests

3. **Utility Functions**: Common test operations
   - Network monitoring
   - Screenshot capturing
   - Element existence checking
   - Test data generation

4. **Test Specifications**: Organized by functionality
   - `home.spec.ts`: Home page functionality
   - `navigation.spec.ts`: Navigation between sections
   - `responsive.spec.ts`: Responsive design tests
   - `performance.spec.ts`: Performance metrics
   - `accessibility.spec.ts`: Basic accessibility checks

## Running Tests

1. **Run all tests**:
   ```bash
   ./run-tests.sh
   ```

2. **Run specific test file**:
   ```bash
   npx playwright test tests/e2e/home.spec.ts
   ```

3. **Run with specific browser**:
   ```bash
   npx playwright test --project=chromium
   ```

4. **Debug mode with UI**:
   ```bash
   npx playwright test --debug
   ```

## Test Environment

- **Base URL**: http://localhost:3002
- **Supported Browsers**: 
  - Chromium
  - Firefox
  - WebKit

## Test Strategies

1. **Feature Testing**:
   - Verify core functionality works correctly
   - Check navigation flows and user journeys

2. **Responsive Testing**:
   - Test on multiple viewport sizes
   - Ensure mobile-friendly UI

3. **Performance Testing**:
   - Track page load times
   - Monitor API call performance
   - Check DOM size

4. **Accessibility Testing**:
   - Heading structure
   - Image alt text
   - Color contrast
   - Keyboard navigation

## Adding New Tests

1. Create page object in `pages/` directory if needed
2. Add fixture in `test-fixtures.ts` if using a new page object
3. Write test spec in a new or existing spec file
4. Run and verify your tests

## Best Practices

1. Keep page objects focused on their specific pages
2. Use descriptive test names that explain expected behavior
3. Use screenshots for debugging and documentation
4. Avoid tight coupling between tests
5. Use appropriate waiting strategies (network, animations, etc.)

## Maintenance

- Update page objects when UI changes
- Keep test data separate from test logic
- Use explicit assertions to make failures clear
- Group related tests in the same spec file
