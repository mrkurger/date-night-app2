#!/bin/bash

# This script fixes SCSS path issues and double dollar signs
# It's a more targeted approach to fix the remaining issues

echo "Starting SCSS path and dollar sign fixes..."

# Fix path issues in emerald components
find src/app/shared/emerald/components -name "*.scss" -type f | while read -r file; do
  echo "Fixing paths in $file..."
  sed -i '' 's/@use '\''.*\/app\/core\/design\/design-tokens'\'' as tokens/@use '\''..\/..\/..\/..\/core\/design\/design-tokens'\'' as tokens/g' "$file"
done

# Fix path issues in shared components
find src/app/shared/components -name "*.scss" -type f | while read -r file; do
  echo "Fixing paths in $file..."
  sed -i '' 's/@use '\''.*\/app\/core\/design\/design-tokens'\'' as tokens/@use '\''..\/..\/..\/core\/design\/design-tokens'\'' as tokens/g' "$file"
  sed -i '' 's/@use '\''.*\/styles\/variables'\'' as vars/@use '\''..\/..\/..\/styles\/variables'\'' as vars/g' "$file"
  sed -i '' 's/@use '\''.*\/styles\/mixins'\'' as mix/@use '\''..\/..\/..\/styles\/mixins'\'' as mix/g' "$file"
done

# Fix double dollar signs
find src -name "*.scss" -type f | while read -r file; do
  echo "Fixing double dollar signs in $file..."
  sed -i '' 's/\$\$/\$/g' "$file"
  
  # Fix ds.ds.$variable to ds.$variable
  sed -i '' 's/ds\.ds\.\$/ds\.\$/g' "$file"
  
  # Fix tokens.tokens.$variable to tokens.$variable
  sed -i '' 's/tokens\.tokens\.\$/tokens\.\$/g' "$file"
  
  # Fix vars.vars.$variable to vars.$variable
  sed -i '' 's/vars\.vars\.\$/vars\.\$/g' "$file"
  
  # Fix mix.mix.$variable to mix.$variable
  sed -i '' 's/mix\.mix\.\$/mix\.\$/g' "$file"
done

# Fix wildcard issues in app-card.component.scss
APP_CARD_FILE="src/app/shared/emerald/components/app-card/app-card.component.scss"
if [ -f "$APP_CARD_FILE" ]; then
  echo "Fixing wildcard issues in app-card.component.scss..."
  sed -i '' 's/\$\*\.\$/\$/g' "$APP_CARD_FILE"
  sed -i '' 's/\$\*\.\$\*\.\$/\$/g' "$APP_CARD_FILE"
  sed -i '' 's/@media (max-width: \$\*\.\$breakpoint-md)/@media (max-width: \$breakpoint-md)/g' "$APP_CARD_FILE"
fi

# Fix variables.scss
VARIABLES_FILE="src/app/core/design/variables.scss"
if [ -f "$VARIABLES_FILE" ]; then
  echo "Fixing variables.scss..."
  sed -i '' 's/tokens\.\$\$font-weight-light: tokens\.tokens\.\$\$font-weight-light;/\/\/ Re-export font weights/g' "$VARIABLES_FILE"
fi

echo "All files processed!"