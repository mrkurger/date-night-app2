#!/bin/bash

# This script fixes SCSS imports in Angular components
# It replaces @use 'src/styles/design-system/index' as ds; with @use '../../../../app/core/design/design-tokens' as ds;

# Find all SCSS files that use the design system
FILES=$(grep -l "@use 'src/styles/design-system/index' as ds;" --include="*.scss" -r src/)

# Process each file
for file in $FILES; do
  echo "Processing $file..."
  
  # Calculate the relative path to the design tokens file
  # Get the directory depth
  depth=$(echo "$file" | tr -cd '/' | wc -c)
  
  # Build the relative path based on depth
  rel_path=""
  for ((i=1; i<depth; i++)); do
    rel_path="${rel_path}../"
  done
  
  # Replace the import
  sed -i '' "s|@use 'src/styles/design-system/index' as ds;|@use '${rel_path}app/core/design/design-tokens' as ds;|g" "$file"
done

echo "All files processed!"