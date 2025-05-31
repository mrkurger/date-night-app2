# Playwright MCP Workflows for Carousely Testing

This document provides specific Playwright MCP commands and workflows for testing the Carousely component.

## Setup

1. Ensure the MCP configuration file is in place:
   ```json
   {
     "mcpServers": {
       "playwright": {
         "command": "npx",
         "args": ["@playwright/mcp@latest"]
       }
     }
   }
   ```

2. Start the development server:
   ```bash
   cd /Users/oivindlund/date-night-app/client_angular2
   npm run dev
   ```

## Common Test Workflows

### 1. Basic Rendering Test

```
browser_navigate to http://localhost:3000/carousely

# Wait for page to load
browser_wait_for text="Find Your Match"

# Capture page structure
browser_snapshot

# Take a screenshot
browser_take_screenshot filename="carousely-rendering.png"
```

### 2. Carousel Interaction Test

```
browser_navigate to http://localhost:3000/carousely

# Wait for loading to complete
browser_wait_for textGone="Loading..."

# Capture the carousel structure
browser_snapshot

# Click and drag to rotate carousel
browser_drag start={x: 400, y: 400} end={x: 500, y: 400}

# Wait for animation to complete
browser_wait_for time=0.5

# Take screenshot of carousel after rotation
browser_take_screenshot filename="carousel-after-rotation.png"
```

### 3. Like/Dislike Button Test

```
browser_navigate to http://localhost:3000/carousely

# Wait for loading to complete
browser_wait_for textGone="Loading..."

# Click the like button
browser_click element="[data-testid='like-button']"

# Verify the toast notification appears
browser_wait_for text="It's a match!"

# Take screenshot of the result
browser_take_screenshot filename="after-like-action.png"
```

### 4. PWA Feature Tests

```
browser_navigate to http://localhost:3000/carousely

# Check for service worker registration
browser_evaluate script="'serviceWorker' in navigator && navigator.serviceWorker.getRegistrations().then(regs => regs.length > 0)"

# Check for manifest link
browser_snapshot

# Click geolocation button
browser_click element="[data-testid='geolocation-button']"

# Permission will be asked in a dialog
browser_handle_dialog accept=true
```

### 5. Responsive Testing

```
# Test mobile view
browser_resize width=375 height=667
browser_navigate to http://localhost:3000/carousely
browser_wait_for text="Find Your Match"
browser_take_screenshot filename="mobile-view.png"

# Test tablet view
browser_resize width=768 height=1024
browser_navigate to http://localhost:3000/carousely
browser_take_screenshot filename="tablet-view.png"

# Test desktop view
browser_resize width=1280 height=800
browser_navigate to http://localhost:3000/carousely
browser_take_screenshot filename="desktop-view.png"
```

### 6. Network Analysis

```
browser_navigate to http://localhost:3000/carousely

# Monitor network requests
browser_network_requests

# Check console for errors
browser_console_messages
```

### 7. Auto-Generate Tests

1. Navigate to the page:
   ```
   browser_navigate to http://localhost:3000/carousely
   ```

2. Perform a sequence of actions:
   ```
   browser_wait_for text="Find Your Match"
   browser_wait_for textGone="Loading..."
   browser_click element="[data-testid='like-button']"
   browser_wait_for text="It's a match!"
   ```

3. Generate the test code:
   ```
   browser_generate_playwright_test
   ```

## Using Vision Mode

For complex UI testing where accessibility tree is insufficient:

```
# First start MCP with vision mode
# npx @playwright/mcp@latest --vision

# Take a visual screenshot
browser_screen_capture

# Perform clicks based on visual elements
browser_screen_click x=400 y=400

# Drag visually
browser_screen_drag startX=400 startY=400 endX=500 endY=400

# Move mouse over elements
browser_screen_move_mouse x=300 y=300
```

## Recording Full Test Sessions

To record a complete test session:

```
# Start MCP with tracing enabled
# npx @playwright/mcp@latest --save-trace

# Perform your test steps
browser_navigate to http://localhost:3000/carousely
browser_wait_for text="Find Your Match"
browser_click element="[data-testid='like-button']"

# Export the recorded test
browser_generate_playwright_test
```

## Best Practices for MCP Testing

1. Always use `browser_snapshot` before attempting to locate elements
2. Use descriptive selectors like `[data-testid='like-button']` 
3. Wait for text to appear/disappear rather than using fixed timeouts
4. Save screenshots at key testing points for visual verification
5. Monitor console messages to catch errors during testing

## Example: Complete Carousely Test Flow

```
# Navigate to page
browser_navigate to http://localhost:3000/carousely

# Wait for page to load
browser_wait_for text="Find Your Match"

# Check initial page structure
browser_snapshot

# Wait for carousel to load
browser_wait_for textGone="Loading..."

# Test carousel rotation
browser_drag start={x: 400, y: 400} end={x: 500, y: 400}
browser_wait_for time=0.5

# Test like button
browser_click element="[data-testid='like-button']"
browser_wait_for text="It's a match!"

# Test geolocation
browser_click element="[data-testid='geolocation-button']"
browser_handle_dialog accept=true
browser_wait_for text="Location enabled"

# Check for errors
browser_console_messages

# Generate full test
browser_generate_playwright_test
```
