# Testing the Carousely Component

This document provides instructions for testing the Carousely component using Playwright.

## Prerequisites

1. Install Node.js dependencies:
   ```bash
   cd /Users/oivindlund/date-night-app/client_angular2
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

## Running Tests

### Start Development Server

Before running tests, ensure the development server is running:

```bash
cd /Users/oivindlund/date-night-app/client_angular2
npm run dev
```

The server will be available at http://localhost:3000.

### Run All Tests

To run all tests in headless mode (default):

```bash
cd /Users/oivindlund/date-night-app/client_angular2
npm test
```

### Test with UI

To run tests with the Playwright UI:

```bash
npm run test:ui
```

### Test in Headed Mode

To run tests in visible browser windows:

```bash
npm run test:headed
```

### Debug Tests

To debug tests with the Playwright inspector:

```bash
npm run test:debug
```

### View Test Reports

After running tests, view detailed reports with:

```bash
npm run test:report
```

## Test Structure

Our test suite includes:

1. **Component Tests** (/tests/carousely/carousely-component.spec.ts)
   - Rendering tests
   - Interaction tests (swiping, button clicks)

2. **PWA Feature Tests** (/tests/pwa/pwa-features.spec.ts)
   - Service worker registration
   - Manifest validation
   - Offline behavior
   - Geolocation functionality

3. **Responsive Design Tests** (/tests/carousely/responsive-design.spec.ts)
   - Multiple screen sizes
   - Adaptive layouts

4. **Performance Tests** (/tests/carousely/performance.spec.ts)
   - Load time metrics
   - Animation performance
   - Lazy loading efficiency

## Using Playwright MCP

For interactive testing and exploration, use Playwright MCP:

1. Start the MCP server:
   ```bash
   npx @playwright/mcp
   ```

2. Connect to it using the MCP client configuration in `.mcp-config.json`

### Key MCP Commands

#### Page Navigation
```
browser_navigate to http://localhost:3000/carousely
```

#### Analyze Page Structure
```
browser_snapshot
```

#### Take Screenshots
```
browser_take_screenshot filename="carousel-view.png"
```

#### Interact with Elements
```
browser_click element="like-button"
```

#### Test Responsive Design
```
browser_resize width=375 height=667
```

## Auto-Generating Tests

Use the browser_generate_playwright_test tool to automatically generate test code:

1. Navigate to the Carousely page:
   ```
   browser_navigate to http://localhost:3000/carousely
   ```

2. Perform the actions you want to test

3. Generate the test code:
   ```
   browser_generate_playwright_test
   ```

4. Copy the generated code to a new test file

## Best Practices

1. Use data-testid attributes for reliable element selection
2. Test both desktop and mobile layouts
3. Check PWA features with both online and offline states
4. Verify smooth animations and transitions
