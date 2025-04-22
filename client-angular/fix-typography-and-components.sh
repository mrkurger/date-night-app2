#!/bin/bash

# This script fixes typography mixins and component issues

echo "Fixing typography mixins and component issues..."

# Add typography import to components that use typography mixins
find src/app/shared/components -name "*.scss" -type f | while read -r file; do
  if grep -q "@include ds\." "$file" && ! grep -q "@use '.*typography-mixins'" "$file"; then
    echo "Adding typography import to $file..."
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

# Fix avatar.component.scss
AVATAR_FILE="src/app/shared/emerald/components/avatar/avatar.component.scss"
if [ -f "$AVATAR_FILE" ]; then
  echo "Fixing avatar.component.scss..."
  if ! grep -q "\$shadow-sm" "$AVATAR_FILE"; then
    sed -i '' '/^@use/a\\
// Shadow variables\\
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);\\
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\\
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);' "$AVATAR_FILE"
  fi
fi

# Fix feature-tour.component.scss
FEATURE_TOUR_FILE="src/app/shared/components/feature-tour/feature-tour.component.scss"
if [ -f "$FEATURE_TOUR_FILE" ]; then
  echo "Fixing feature-tour.component.scss..."
  sed -i '' 's/rgba(\$neutral-900, 0.7)/rgba(0, 0, 0, 0.7)/g' "$FEATURE_TOUR_FILE"
fi

# Fix onboarding.component.scss
ONBOARDING_FILE="src/app/shared/components/onboarding/onboarding.component.scss"
if [ -f "$ONBOARDING_FILE" ]; then
  echo "Fixing onboarding.component.scss..."
  sed -i '' 's/rgba(\$neutral-900, 0.8)/rgba(0, 0, 0, 0.8)/g' "$ONBOARDING_FILE"
fi

echo "All typography and component issues fixed!"