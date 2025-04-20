#!/bin/bash

# Fix TypeScript Errors Script
# This script runs all three TypeScript error fixers in sequence

set -e

# Directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if ts-morph is installed
if ! npm list ts-morph --depth=0 >/dev/null 2>&1; then
  echo "Installing ts-morph..."
  npm install --no-save ts-morph
fi

# Check if errors.csv exists
if [ ! -f "errors.csv" ]; then
  echo "Error: errors.csv file not found. Please create it first."
  exit 1
fi

# Make the scripts executable
chmod +x scripts/fix-typescript-errors.mjs
chmod +x scripts/fix-typescript-errors-advanced.mjs
chmod +x scripts/fix-all-typescript-errors.mjs

# Run the comprehensive fixer first
echo "Running comprehensive TypeScript error fixer..."
node scripts/fix-all-typescript-errors.mjs

# Run the basic fixer for any remaining issues
echo "Running basic TypeScript error fixer for remaining issues..."
node scripts/fix-typescript-errors.mjs

# Run the advanced fixer for any complex remaining issues
echo "Running advanced TypeScript error fixer for complex remaining issues..."
node scripts/fix-typescript-errors-advanced.mjs

echo "TypeScript error fixing complete!"
echo "Please run 'cd client-angular && npm run build' to verify the fixes."