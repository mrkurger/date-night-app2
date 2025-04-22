#!/bin/bash

# This script fixes all SCSS issues in the Angular project
# 1. Replaces @import with @use
# 2. Fixes double namespaces
# 3. Fixes wildcard issues
# 4. Replaces deprecated color functions

echo "Starting SCSS fixes..."

# Find all SCSS files
find src -name "*.scss" -type f | while read -r file; do
  echo "Processing $file..."
  
  # 1. Replace @import with @use for design tokens
  sed -i '' 's/@import '\''.*\/design-tokens'\''/@use '\''..\/..\/..\/app\/core\/design\/design-tokens'\'' as tokens/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/..\/..\/core\/design\/design-tokens'\''/@use '\''..\/..\/..\/core\/design\/design-tokens'\'' as tokens/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/..\/core\/design\/design-tokens'\''/@use '\''..\/..\/core\/design\/design-tokens'\'' as tokens/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/core\/design\/design-tokens'\''/@use '\''..\/core\/design\/design-tokens'\'' as tokens/g' "$file"
  
  # Replace @import with @use for variables
  sed -i '' 's/@import '\''.*\/variables'\''/@use '\''..\/..\/..\/styles\/variables'\'' as vars/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/..\/..\/styles\/variables'\''/@use '\''..\/..\/..\/styles\/variables'\'' as vars/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/..\/styles\/variables'\''/@use '\''..\/..\/styles\/variables'\'' as vars/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/styles\/variables'\''/@use '\''..\/styles\/variables'\'' as vars/g' "$file"
  
  # Replace @import with @use for mixins
  sed -i '' 's/@import '\''.*\/mixins'\''/@use '\''..\/..\/..\/styles\/mixins'\'' as mix/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/..\/..\/styles\/mixins'\''/@use '\''..\/..\/..\/styles\/mixins'\'' as mix/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/..\/styles\/mixins'\''/@use '\''..\/..\/styles\/mixins'\'' as mix/g' "$file"
  sed -i '' 's/@import '\''.*\/..\/styles\/mixins'\''/@use '\''..\/styles\/mixins'\'' as mix/g' "$file"
  
  # 2. Fix double namespaces
  # Replace patterns like tokens.$tokens.$spacing-3 with tokens.$spacing-3
  sed -i '' 's/\$tokens\.\$tokens\.\$/\$tokens\.\$/g' "$file"
  sed -i '' 's/\$tokens\.\$tokens\./\$tokens\./g' "$file"
  sed -i '' 's/\$vars\.\$vars\./\$vars\./g' "$file"
  sed -i '' 's/\$ds\.\$ds\./\$ds\./g' "$file"
  sed -i '' 's/\$mix\.\$mix\./\$mix\./g' "$file"
  
  # Replace triple namespaces
  sed -i '' 's/\$tokens\.\$tokens\.\$tokens\./\$tokens\./g' "$file"
  sed -i '' 's/\$vars\.\$vars\.\$vars\./\$vars\./g' "$file"
  sed -i '' 's/\$ds\.\$ds\.\$ds\./\$ds\./g' "$file"
  sed -i '' 's/\$mix\.\$mix\.\$mix\./\$mix\./g' "$file"
  
  # 3. Fix wildcard issues
  # Replace patterns like $ * .$ * .$color-primary with $color-primary
  sed -i '' 's/\$ \* \.\$ \* \.\$/\$/g' "$file"
  sed -i '' 's/\$ \* \.\$/\$/g' "$file"
  
  # 4. Replace deprecated color functions
  # Replace lighten() with color.adjust()
  sed -i '' 's/lighten(\([^,]*\), \([^)]*\))/color.adjust(\1, $lightness: \2)/g' "$file"
  # Replace darken() with color.adjust()
  sed -i '' 's/darken(\([^,]*\), \([^)]*\))/color.adjust(\1, $lightness: -\2)/g' "$file"
  
  # Add sass:color import if it doesn't exist but color functions are used
  if grep -q "color\.adjust" "$file" && ! grep -q "@use 'sass:color'" "$file"; then
    sed -i '' '1s/^/@use '\''sass:color'\'';\n/' "$file"
  fi
  
  # Fix $ds.color-primary to ds.$color-primary
  sed -i '' 's/\$ds\.\([a-zA-Z-]*\)/ds\.\$\1/g' "$file"
  
  # Fix $tokens.color-primary to tokens.$color-primary
  sed -i '' 's/\$tokens\.\([a-zA-Z-]*\)/tokens\.\$\1/g' "$file"
  
  # Fix $vars.color-primary to vars.$color-primary
  sed -i '' 's/\$vars\.\([a-zA-Z-]*\)/vars\.\$\1/g' "$file"
done

echo "All files processed!"