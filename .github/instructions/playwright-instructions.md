# Playwright MCP Toolset Instructions

## Overview

The Playwright MCP (Model Context Protocol) server provides comprehensive browser automation capabilities for frontend testing, UI assessment, and web interaction. It operates in two modes: **Snapshot Mode** (default) using accessibility trees, and **Vision Mode** using screenshots.

## Installation & Configuration

### Basic Setup

Add to your MCP client configuration:

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

### Advanced Configuration

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chrome",
        "--headless",
        "--viewport-size", "1280,720",
        "--save-trace"
      ]
    }
  }
}
```

### Key Configuration Options

- `--browser <browser>`: chrome, firefox, webkit, msedge
- `--headless`: Run without GUI (default: headed)
- `--device <device>`: Emulate device (e.g., "iPhone 15")
- `--viewport-size <size>`: Set viewport dimensions
- `--vision`: Enable screenshot-based mode
- `--save-trace`: Save Playwright traces for debugging
- `--isolated`: Use temporary profile (no persistence)
- `--user-data-dir <path>`: Custom profile directory

## Core Tools for Frontend Testing

### 1. Page Analysis & Snapshots

#### `browser_snapshot`
**Purpose**: Capture accessibility tree of current page
**Usage**: Primary tool for understanding page structure
```
Use browser_snapshot to analyze the current page structure
```

#### `browser_take_screenshot`
**Purpose**: Visual documentation and debugging
**Parameters**:
- `filename`: Save location
- `element`/`ref`: Screenshot specific element
- `raw`: PNG vs JPEG format

### 2. Navigation & Page Control

#### `browser_navigate`
**Purpose**: Navigate to URLs
```
Navigate to https://example.com/login
```

#### `browser_navigate_back` / `browser_navigate_forward`
**Purpose**: Browser history navigation

#### `browser_resize`
**Purpose**: Test responsive design
**Parameters**: `width`, `height`

### 3. Element Interactions

#### `browser_click`
**Purpose**: Click elements
**Parameters**:
- `element`: Human-readable description
- `ref`: Exact element reference from snapshot

#### `browser_type`
**Purpose**: Input text
**Parameters**:
- `element`: Target element description
- `ref`: Element reference
- `text`: Text to input
- `submit`: Press Enter after typing
- `slowly`: Type character by character

#### `browser_hover`
**Purpose**: Hover interactions for testing tooltips, dropdowns

#### `browser_drag`
**Purpose**: Drag and drop testing
**Parameters**: Start and end element references

### 4. Form Testing

#### `browser_select_option`
**Purpose**: Dropdown selection
**Parameters**:
- `element`/`ref`: Target dropdown
- `values`: Array of values to select

#### `browser_file_upload`
**Purpose**: File upload testing
**Parameters**: `paths` - Array of file paths

### 5. Advanced Interactions

#### `browser_press_key`
**Purpose**: Keyboard interactions
**Parameters**: `key` - Key name (e.g., "ArrowLeft", "Enter", "Escape")

#### `browser_handle_dialog`
**Purpose**: Handle alerts, confirms, prompts
**Parameters**:
- `accept`: Boolean to accept/dismiss
- `promptText`: Text for prompt dialogs

### 6. Waiting & Timing

#### `browser_wait_for`
**Purpose**: Wait for conditions
**Parameters**:
- `time`: Wait duration in seconds
- `text`: Wait for text to appear
- `textGone`: Wait for text to disappear

## Testing Workflows

### 1. Basic UI Testing Flow

```
1. browser_navigate to target URL
2. browser_snapshot to understand page structure
3. browser_click on elements to test interactions
4. browser_type to fill forms
5. browser_take_screenshot for documentation
```

### 2. Form Testing

```
1. browser_navigate to form page
2. browser_snapshot to identify form fields
3. browser_type in each field
4. browser_select_option for dropdowns
5. browser_file_upload for file inputs
6. browser_click submit button
7. browser_wait_for success message
```

### 3. Responsive Design Testing

```
1. browser_resize to mobile dimensions (375x667)
2. browser_snapshot to check mobile layout
3. browser_resize to tablet (768x1024)
4. browser_resize to desktop (1920x1080)
5. browser_take_screenshot at each size
```

### 4. Multi-tab Testing

```
1. browser_tab_list to see current tabs
2. browser_tab_new to open new tab
3. browser_tab_select to switch tabs
4. browser_tab_close to clean up
```

## Advanced Features

### Tab Management

- `browser_tab_list`: List all open tabs
- `browser_tab_new`: Open new tab with optional URL
- `browser_tab_select`: Switch to tab by index
- `browser_tab_close`: Close tab by index

### Network & Console Analysis

- `browser_network_requests`: Analyze network traffic
- `browser_console_messages`: Check for JavaScript errors

### PDF Generation

- `browser_pdf_save`: Generate PDF of current page

### Test Generation

- `browser_generate_playwright_test`: Auto-generate Playwright test code

## Vision Mode vs Snapshot Mode

### Snapshot Mode (Default)
- **Pros**: Fast, reliable, works with accessibility tree
- **Cons**: Limited to accessible elements
- **Best for**: Standard web testing, form validation

### Vision Mode (`--vision` flag)
- **Pros**: Can interact with any visual element
- **Cons**: Slower, requires vision-capable models
- **Best for**: Complex UI testing, visual regression

### Vision Mode Tools
- `browser_screen_capture`: Take screenshot
- `browser_screen_click`: Click at X,Y coordinates
- `browser_screen_move_mouse`: Move mouse to position
- `browser_screen_drag`: Drag between coordinates

## Best Practices

### 1. Element Identification
- Always use `browser_snapshot` first to understand page structure
- Use descriptive `element` parameters for human readability
- Use exact `ref` parameters from snapshots for precision

### 2. Reliable Testing
- Use `browser_wait_for` instead of fixed delays
- Check for text appearance/disappearance
- Handle dialogs promptly with `browser_handle_dialog`

### 3. Performance
- Use Snapshot Mode for most testing scenarios
- Only use Vision Mode when necessary
- Close tabs when done to free resources

### 4. Debugging
- Enable `--save-trace` for detailed debugging
- Use `browser_console_messages` to check for errors
- Take screenshots at key points for documentation

## Common Use Cases

### Login Flow Testing
```
1. Navigate to login page
2. Snapshot to identify form fields
3. Type username and password
4. Click login button
5. Wait for dashboard or success indicator
```

### E-commerce Testing
```
1. Navigate to product page
2. Select product options
3. Add to cart
4. Navigate to checkout
5. Fill shipping/payment forms
6. Complete purchase flow
```

### Accessibility Testing
```
1. Use Snapshot Mode (accessibility tree based)
2. Check for proper ARIA labels
3. Test keyboard navigation with browser_press_key
4. Verify screen reader compatibility
```

### Performance Testing
```
1. Monitor browser_network_requests
2. Check browser_console_messages for errors
3. Measure page load times
4. Test under different viewport sizes
```

## Error Handling

- Use `browser_install` if browser installation fails
- Check `browser_console_messages` for JavaScript errors
- Use `browser_close` to reset browser state
- Handle dialogs immediately to prevent blocking

## Integration Tips

- Combine with CI/CD pipelines for automated testing
- Use isolated mode (`--isolated`) for clean test environments
- Save traces and screenshots for test reports
- Use configuration files for complex setups
