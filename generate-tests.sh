#!/bin/bash

# Script to generate Playwright tests using Playwright MCP
# filepath: /Users/oivindlund/date-night-app/generate-tests.sh

set -e # Exit on error

# Check if the app is running
echo "Checking if application is running..."
if ! curl -s http://localhost:3002 > /dev/null; then
  echo "Application is not running. Please start it with 'cd client_angular2 && npm run dev'"
  exit 1
fi

# Directory for generated tests
GENERATED_DIR="tests/e2e/generated"
mkdir -p "$GENERATED_DIR"

echo "Starting Playwright MCP for test generation..."
echo "Please follow the interactive prompts to generate tests."
echo ""
echo "Instructions:"
echo "1. Type 'browser_navigate http://localhost:3002' to open the app"
echo "2. Use 'browser_snapshot' to analyze the page structure"
echo "3. Interact with the page using commands like 'browser_click'"
echo "4. When ready, use 'browser_generate_playwright_test' to create a test script"
echo "5. Type 'exit' to quit"
echo ""
echo "Starting Playwright MCP now..."

# Run the MCP tool in interactive mode
npx @playwright/mcp@latest --browser chrome --viewport-size 1280,720 --save-trace

echo "Test generation completed."
echo ""
echo "If you generated a test, it should be available in the console output above."
echo "You can save it to a file in $GENERATED_DIR."
echo ""
echo "Example to manually save:"
echo "1. Copy the generated test code"
echo "2. Create a new file: touch $GENERATED_DIR/my-test.spec.ts"
echo "3. Open in editor and paste: code $GENERATED_DIR/my-test.spec.ts"

# Provide instructions for next steps
echo ""
echo "Next steps:"
echo "1. Review and refine generated tests"
echo "2. Move them to the appropriate test category"
echo "3. Incorporate them into your Page Object Model structure"
