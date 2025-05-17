#!/bin/bash

# Script to remove Emerald UI components and references
echo "Starting Emerald UI cleanup..."

# Remove Emerald directory
if [ -d "src/app/shared/emerald" ]; then
  echo "Removing Emerald directory..."
  rm -rf src/app/shared/emerald
fi

# Remove Emerald references from styles
echo "Removing Emerald references from styles..."
find src -type f -name "*.scss" -exec sed -i '' 's/@use.*emerald-tokens.*;//g' {} +
find src -type f -name "*.scss" -exec sed -i '' 's/\.emerald-/\.nb-/g' {} +

# Remove Emerald imports from TypeScript files
echo "Removing Emerald imports from TypeScript files..."
find src -type f -name "*.ts" -exec sed -i '' 's/import.*from.*emerald.*;//g' {} +
find src -type f -name "*.ts" -exec sed -i '' 's/emeraldComponent/nbComponent/g' {} +

# Remove Emerald classes from HTML files
echo "Removing Emerald classes from HTML files..."
find src -type f -name "*.html" -exec sed -i '' 's/class="emerald-/class="nb-/g' {} +
find src -type f -name "*.html" -exec sed -i '' 's/\[class.emerald-/\[class.nb-/g' {} +

# Update CSP config to remove Emerald domains
echo "Updating CSP configuration..."
if [ -f "server/config/csp.config.js" ]; then
  sed -i '' 's/https:\/\/docs-emerald\.condorlabs\.io//g' server/config/csp.config.js
fi

# Clean up any backup files created by sed
find . -name "*.bak" -type f -delete

echo "Emerald UI cleanup complete!" 