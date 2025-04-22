#!/bin/bash

# This script fixes SCSS variable reference issues
# It fixes patterns like $ds.spacing-6 to ds.$spacing-6

echo "Starting SCSS variable reference fixes..."

# Find all SCSS files
find src -name "*.scss" -type f | while read -r file; do
  echo "Processing $file..."
  
  # Fix $ds.variable to ds.$variable
  sed -i '' 's/\$ds\.\([a-zA-Z0-9-]*\)/ds\.\$\1/g' "$file"
  
  # Fix $tokens.variable to tokens.$variable
  sed -i '' 's/\$tokens\.\([a-zA-Z0-9-]*\)/tokens\.\$\1/g' "$file"
  
  # Fix $vars.variable to vars.$variable
  sed -i '' 's/\$vars\.\([a-zA-Z0-9-]*\)/vars\.\$\1/g' "$file"
  
  # Fix $mix.variable to mix.$variable
  sed -i '' 's/\$mix\.\([a-zA-Z0-9-]*\)/mix\.\$\1/g' "$file"
done

echo "All files processed!"