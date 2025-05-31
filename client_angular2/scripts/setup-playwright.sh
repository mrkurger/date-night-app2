#!/bin/zsh

# Setup script for Playwright testing

echo "🔧 Setting up Playwright for testing the Carousely component..."

# Ensure we're in the correct directory
cd "$(dirname "$0")"
cd ..

# Check if we're in the client_angular2 directory
if [[ ! -f "package.json" ]]; then
  echo "❌ Error: Not in the client_angular2 directory."
  echo "Please run this script from the client_angular2 directory."
  exit 1
fi

echo "📦 Installing Playwright dependencies..."
npm install -D @playwright/test @playwright/mcp

echo "🌐 Installing browser binaries..."
npx playwright install --with-deps

echo "📂 Creating test directories if they don't exist..."
mkdir -p tests/carousely tests/pwa

echo "📄 Setting up configuration files..."
if [[ ! -f ".mcp-config.json" ]]; then
  echo '{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chrome",
        "--viewport-size", "1280,720",
        "--save-trace"
      ]
    }
  }
}' > .mcp-config.json
  echo "✅ Created .mcp-config.json"
else
  echo "⏩ .mcp-config.json already exists, skipping"
fi

# Create a basic test directory structure readme if it doesn't exist
if [[ ! -f "tests/README.md" ]]; then
  echo '# Playwright Tests for Carousely

This directory contains Playwright tests for the Carousely component.

## Directory Structure

- `/carousely` - Tests for the main carousel component
- `/pwa` - Tests for PWA features

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in headed mode
npm run test:headed
```

For more information, see the complete testing documentation in `/docs/TESTING_GUIDE.md`
' > tests/README.md
  echo "✅ Created tests/README.md"
else
  echo "⏩ tests/README.md already exists, skipping"
fi

echo "🔄 Updating package.json scripts..."
# Check if jq is installed, otherwise use sed
if command -v jq &> /dev/null; then
  # Create a temporary file with the updated content
  jq '.scripts += {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report"
  }' package.json > package.json.tmp && mv package.json.tmp package.json
  echo "✅ Updated package.json scripts with jq"
else
  echo "⚠️ jq not found, skipping automatic package.json update."
  echo "Please add the following scripts to your package.json manually:"
  echo '"test": "playwright test",'
  echo '"test:ui": "playwright test --ui",'
  echo '"test:headed": "playwright test --headed",'
  echo '"test:debug": "playwright test --debug",'
  echo '"test:report": "playwright show-report"'
fi

echo "✨ Setup complete! You can now run Playwright tests."
echo ""
echo "📚 For more information, check the documentation in docs/TESTING_GUIDE.md"
echo "🎮 To start testing, run: npm test"
echo ""
echo "Example commands:"
echo "  - Run tests with UI: npm run test:ui"
echo "  - Run tests in headed mode: npm run test:headed"
echo "  - Start MCP server: npx @playwright/mcp"
echo ""
