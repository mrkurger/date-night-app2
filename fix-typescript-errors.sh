#!/bin/bash

# Fix TypeScript Errors Script
# This script runs both the basic and advanced TypeScript error fixers

set -e

# Directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if ts-morph is installed
if ! npm list ts-morph --depth=0 >/dev/null 2>&1; then
  echo "Installing ts-morph..."
  npm install --no-save ts-morph
fi

# Run the basic fixer first
echo "Running basic TypeScript error fixer..."
node scripts/fix-typescript-errors.js

# Run the advanced fixer
echo "Running advanced TypeScript error fixer..."
node scripts/fix-typescript-errors-advanced.js

# Make the scripts executable
chmod +x scripts/fix-typescript-errors.js
chmod +x scripts/fix-typescript-errors-advanced.js

echo "TypeScript error fixing complete!"
echo "Please run 'cd client-angular && npm run build' to verify the fixes."