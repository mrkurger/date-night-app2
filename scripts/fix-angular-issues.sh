#!/bin/bash

# Fix Angular Issues Script
# This script runs all the necessary fixes for Angular client issues

# Set the base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$BASE_DIR")"
CLIENT_DIR="$PROJECT_DIR/client-angular"

# Print header
echo "====================================================="
echo "Angular Client Issue Fixer"
echo "====================================================="
echo "This script will fix various issues in the Angular client:"
echo "1. SCSS import paths"
echo "2. Design tokens variables"
echo "====================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Fix SCSS import paths
echo -e "\n🔧 Fixing SCSS import paths..."
node "$BASE_DIR/fix-scss-imports.js"

# Fix design tokens variables
echo -e "\n🔧 Fixing design tokens variables..."
node "$BASE_DIR/fix-tokens-variables.js"

# Success message
echo -e "\n✅ All fixes have been applied successfully!"
echo "Please rebuild your Angular application to see the changes."
echo "You can do this by running: cd $CLIENT_DIR && npm run build"
echo "====================================================="