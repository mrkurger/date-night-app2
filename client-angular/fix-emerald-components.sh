#!/bin/bash

# This script fixes issues in emerald components

echo "Fixing emerald components..."

# Add emerald tokens to components that need them
find src/app/shared/emerald/components -name "*.scss" -type f | while read -r file; do
  echo "Processing $file..."
  
  # Check if the file already has tokens import
  if ! grep -q "@use 'sass:color'" "$file"; then
    sed -i '' '1s/^/@use '\''sass:color'\'';\n/' "$file"
  fi
  
  # Add emerald tokens import if not present
  if ! grep -q "@use '.*emerald-tokens'" "$file"; then
    sed -i '' '1s/^/@use '\''..\/..\/..\/..\/core\/design\/emerald-tokens'\'' as emerald;\n/' "$file"
  fi
  
  # Replace undefined variables with emerald tokens
  sed -i '' 's/\$primary-500/emerald.\$color-primary/g' "$file"
  sed -i '' 's/\$primary-600/emerald.\$color-primary-dark/g' "$file"
  sed -i '' 's/\$primary-700/color.adjust(emerald.\$color-primary-dark, \$lightness: -10%)/g' "$file"
  sed -i '' 's/\$primary-100/color.adjust(emerald.\$color-primary, \$lightness: 35%)/g' "$file"
  sed -i '' 's/\$primary-200/color.adjust(emerald.\$color-primary, \$lightness: 25%)/g' "$file"
  sed -i '' 's/\$primary-300/color.adjust(emerald.\$color-primary, \$lightness: 15%)/g' "$file"
  sed -i '' 's/\$primary-400/color.adjust(emerald.\$color-primary, \$lightness: 5%)/g' "$file"
  
  sed -i '' 's/\$neutral-100/emerald.\$color-white/g' "$file"
  sed -i '' 's/\$neutral-200/emerald.\$color-light-gray-1/g' "$file"
  sed -i '' 's/\$neutral-300/emerald.\$color-light-gray-2/g' "$file"
  sed -i '' 's/\$neutral-400/emerald.\$color-medium-gray-1/g' "$file"
  sed -i '' 's/\$neutral-500/emerald.\$color-medium-gray-2/g' "$file"
  sed -i '' 's/\$neutral-600/emerald.\$color-dark-gray-1/g' "$file"
  sed -i '' 's/\$neutral-700/emerald.\$color-dark-gray-2/g' "$file"
  sed -i '' 's/\$neutral-800/emerald.\$color-dark-gray-3/g' "$file"
  sed -i '' 's/\$neutral-900/emerald.\$color-black/g' "$file"
  
  sed -i '' 's/\$success/emerald.\$color-success/g' "$file"
  sed -i '' 's/\$warning/emerald.\$color-warning/g' "$file"
  sed -i '' 's/\$error/emerald.\$color-error/g' "$file"
  sed -i '' 's/\$info/emerald.\$color-info/g' "$file"
  
  sed -i '' 's/\$spacing-1/emerald.\$spacing-1/g' "$file"
  sed -i '' 's/\$spacing-2/emerald.\$spacing-2/g' "$file"
  sed -i '' 's/\$spacing-3/emerald.\$spacing-3/g' "$file"
  sed -i '' 's/\$spacing-4/emerald.\$spacing-4/g' "$file"
  sed -i '' 's/\$spacing-5/emerald.\$spacing-5/g' "$file"
  sed -i '' 's/\$spacing-6/emerald.\$spacing-6/g' "$file"
  sed -i '' 's/\$spacing-8/emerald.\$spacing-8/g' "$file"
  sed -i '' 's/\$spacing-10/emerald.\$spacing-10/g' "$file"
  sed -i '' 's/\$spacing-12/emerald.\$spacing-12/g' "$file"
  sed -i '' 's/\$spacing-16/emerald.\$spacing-16/g' "$file"
  
  sed -i '' 's/\$z-index-10/10/g' "$file"
  sed -i '' 's/\$z-index-20/20/g' "$file"
  sed -i '' 's/\$z-index-30/30/g' "$file"
  sed -i '' 's/\$z-index-40/40/g' "$file"
  sed -i '' 's/\$z-index-50/50/g' "$file"
  sed -i '' 's/\$z-index-100/100/g' "$file"
  sed -i '' 's/\$z-index-1000/1000/g' "$file"
done

# Fix shared components that use ds mixins
find src/app/shared/components -name "*.scss" -type f | while read -r file; do
  echo "Processing shared component $file..."
  
  # Add typography mixins import if not present
  if ! grep -q "@use '.*typography-mixins'" "$file" && grep -q "@include ds\."; then
    sed -i '' '1s/^/@use '\''..\/..\/..\/core\/design\/typography-mixins'\'' as typography;\n/' "$file"
    
    # Replace ds mixins with typography mixins
    sed -i '' 's/@include ds\.label;/@include typography.label;/g' "$file"
    sed -i '' 's/@include ds\.body-default;/@include typography.body-default;/g' "$file"
    sed -i '' 's/@include ds\.body-small;/@include typography.body-small;/g' "$file"
    sed -i '' 's/@include ds\.body-xs;/@include typography.body-xs;/g' "$file"
    sed -i '' 's/@include ds\.heading-1;/@include typography.heading-1;/g' "$file"
    sed -i '' 's/@include ds\.heading-2;/@include typography.heading-2;/g' "$file"
    sed -i '' 's/@include ds\.heading-3;/@include typography.heading-3;/g' "$file"
    sed -i '' 's/@include ds\.heading-4;/@include typography.heading-4;/g' "$file"
    sed -i '' 's/@include ds\.heading-5;/@include typography.heading-5;/g' "$file"
    sed -i '' 's/@include ds\.heading-6;/@include typography.heading-6;/g' "$file"
    sed -i '' 's/@include ds\.button-text;/@include typography.button-text;/g' "$file"
    sed -i '' 's/@include ds\.button-text-small;/@include typography.button-text-small;/g' "$file"
    sed -i '' 's/@include ds\.button-text-large;/@include typography.button-text-large;/g' "$file"
  fi
done

# Fix ad-card.component.scss
AD_CARD_FILE="src/app/shared/components/ad-card/ad-card.component.scss"
if [ -f "$AD_CARD_FILE" ]; then
  echo "Fixing ad-card.component.scss..."
  sed -i '' 's/-tokens\.\$spacing-8/tokens.\$spacing-8/g' "$AD_CARD_FILE"
fi

# Fix netflix-view.component.scss
NETFLIX_FILE="src/app/features/netflix-view/netflix-view.component.scss"
if [ -f "$NETFLIX_FILE" ]; then
  echo "Fixing netflix-view.component.scss..."
  sed -i '' 's/\$line-height-relaxed/tokens.\$line-height-relaxed/g' "$NETFLIX_FILE"
fi

# Fix tinder.component.scss
TINDER_FILE="src/app/features/tinder/tinder.component.scss"
if [ -f "$TINDER_FILE" ]; then
  echo "Fixing tinder.component.scss..."
  sed -i '' 's/vars\.\$primary/vars.\$primary-color/g' "$TINDER_FILE"
  sed -i '' 's/vars\.\$secondary/vars.\$secondary-color/g' "$TINDER_FILE"
fi

echo "All emerald components fixed!"