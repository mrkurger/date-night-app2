#!/bin/bash

# This script fixes SCSS variables with double namespaces
# It replaces patterns like ds.$ds.$spacing-4 with ds.$spacing-4

# Find all SCSS files
find src -name "*.scss" -type f | while read -r file; do
  echo "Processing $file..."
  
  # Replace double namespaces
  sed -i '' 's/\$ds\.\$ds\.\$/\$ds\.\$/g' "$file"
  sed -i '' 's/\$ds\.\$ds\./\$ds\./g' "$file"
  sed -i '' 's/\$tokens\.\$tokens\./\$tokens\./g' "$file"
  sed -i '' 's/\$vars\.\$vars\./\$vars\./g' "$file"
  
  # Replace triple namespaces
  sed -i '' 's/\$ds\.\$ds\.\$ds\./\$ds\./g' "$file"
  sed -i '' 's/\$tokens\.\$tokens\.\$tokens\./\$tokens\./g' "$file"
  sed -i '' 's/\$vars\.\$vars\.\$vars\./\$vars\./g' "$file"
done

echo "All files processed!"