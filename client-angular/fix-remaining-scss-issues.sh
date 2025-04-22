#!/bin/bash

# This script fixes all remaining SCSS issues

echo "Fixing remaining SCSS issues..."

# Fix typography-mixins.scss
TYPOGRAPHY_FILE="src/app/core/design/typography-mixins.scss"
if [ -f "$TYPOGRAPHY_FILE" ]; then
  echo "Fixing typography-mixins.scss..."
  sed -i '' 's/\$ \* \.\$/\$/g' "$TYPOGRAPHY_FILE"
fi

# Fix paths in chat components
CHAT_MESSAGE_FILE="src/app/shared/components/chat-message/chat-message.component.scss"
if [ -f "$CHAT_MESSAGE_FILE" ]; then
  echo "Fixing chat-message.component.scss..."
  sed -i '' 's/@use '\''..\/..\/..\/styles\/mixins'\'' as mix/@use '\''..\/..\/..\/core\/design\/typography-mixins'\'' as typography/g' "$CHAT_MESSAGE_FILE"
fi

CHAT_SETTINGS_FILE="src/app/shared/components/chat-settings/chat-settings.component.scss"
if [ -f "$CHAT_SETTINGS_FILE" ]; then
  echo "Fixing chat-settings.component.scss..."
  sed -i '' 's/@use '\''..\/..\/..\/styles\/mixins'\'' as mix/@use '\''..\/..\/..\/core\/design\/typography-mixins'\'' as typography/g' "$CHAT_SETTINGS_FILE"
fi

# Fix emerald components with incorrect variable assignments
find src/app/shared/emerald/components -name "*.scss" -type f | while read -r file; do
  echo "Fixing emerald component $file..."
  
  # Fix incorrect variable assignments
  sed -i '' 's/emerald\.\$color-primary-dark: color\.adjust(emerald\.\$color-primary, \$lightness: -10%);/\/\/ Define primary dark color\n\$primary-dark: color\.adjust(emerald\.\$color-primary, \$lightness: -10%);/g' "$file"
  sed -i '' 's/color\.adjust(emerald\.\$color-primary-dark, \$lightness: -10%): color\.adjust(emerald\.\$color-primary, \$lightness: -10%);/\/\/ Define primary darker color\n\$primary-darker: color\.adjust(emerald\.\$color-primary, \$lightness: -20%);/g' "$file"
  sed -i '' 's/color\.adjust(emerald\.\$color-primary, \$lightness: 35%): #dbeafe;/\/\/ Define primary light color\n\$primary-light: color\.adjust(emerald\.\$color-primary, \$lightness: 35%);/g' "$file"
  
  # Fix emerald.$color-success-100 assignment
  sed -i '' 's/emerald\.\$color-success-100: color\.adjust(emerald\.\$color-success, \$lightness: 40%);/\/\/ Define success light color\n\$success-light: color\.adjust(emerald\.\$color-success, \$lightness: 40%);/g' "$file"
  
  # Add font variables
  if grep -q "\$font-primary" "$file"; then
    sed -i '' '/^@use/a\\n\/\/ Font variables\n\$font-primary: emerald.\$font-family-base;\n\$font-size-md: 1rem;\n\$font-weight-semibold: 600;' "$file"
  fi
  
  # Add shadow variables
  if grep -q "\$shadow-" "$file"; then
    sed -i '' '/^@use/a\\n\/\/ Shadow variables\n\$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);\n\$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);\n\$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);' "$file"
  fi
  
  # Add border radius variables
  if grep -q "\$border-radius-" "$file"; then
    sed -i '' '/^@use/a\\n\/\/ Border radius variables\n\$border-radius-sm: 0.25rem;\n\$border-radius-md: 0.375rem;\n\$border-radius-lg: 0.5rem;\n\$border-radius-full: 9999px;' "$file"
  fi
done

# Fix shared components with typography mixins
find src/app/shared/components -name "*.scss" -type f | while read -r file; do
  if grep -q "@include ds\." "$file"; then
    echo "Fixing typography mixins in $file..."
    
    # Add typography mixins import if not present
    if ! grep -q "@use '.*typography-mixins'" "$file"; then
      sed -i '' '1s/^/@use '\''..\/..\/..\/core\/design\/typography-mixins'\'' as typography;\n/' "$file"
    fi
    
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

# Fix contextual-help.component.scss
CONTEXTUAL_HELP_FILE="src/app/shared/components/contextual-help/contextual-help.component.scss"
if [ -f "$CONTEXTUAL_HELP_FILE" ]; then
  echo "Fixing contextual-help.component.scss..."
  sed -i '' 's/\$spacing-2/tokens.\$spacing-2/g' "$CONTEXTUAL_HELP_FILE"
fi

# Fix feature-tour.component.scss and onboarding.component.scss
FEATURE_TOUR_FILE="src/app/shared/components/feature-tour/feature-tour.component.scss"
if [ -f "$FEATURE_TOUR_FILE" ]; then
  echo "Fixing feature-tour.component.scss..."
  sed -i '' 's/rgba(\$neutral-900, 0.7)/rgba(0, 0, 0, 0.7)/g' "$FEATURE_TOUR_FILE"
fi

ONBOARDING_FILE="src/app/shared/components/onboarding/onboarding.component.scss"
if [ -f "$ONBOARDING_FILE" ]; then
  echo "Fixing onboarding.component.scss..."
  sed -i '' 's/rgba(\$neutral-900, 0.8)/rgba(0, 0, 0, 0.8)/g' "$ONBOARDING_FILE"
fi

# Fix ad-card.component.scss
AD_CARD_FILE="src/app/shared/components/ad-card/ad-card.component.scss"
if [ -f "$AD_CARD_FILE" ]; then
  echo "Fixing ad-card.component.scss..."
  sed -i '' 's/\$line-height-tight/tokens.\$line-height-tight/g' "$AD_CARD_FILE"
fi

# Fix list-view.component.scss
LIST_VIEW_FILE="src/app/features/list-view/list-view.component.scss"
if [ -f "$LIST_VIEW_FILE" ]; then
  echo "Fixing list-view.component.scss..."
  sed -i '' 's/\$font-size-md/1rem/g' "$LIST_VIEW_FILE"
fi

# Fix netflix-view.component.scss
NETFLIX_FILE="src/app/features/netflix-view/netflix-view.component.scss"
if [ -f "$NETFLIX_FILE" ]; then
  echo "Fixing netflix-view.component.scss..."
  sed -i '' 's/\$font-primary/tokens.\$font-family-base/g' "$NETFLIX_FILE"
  sed -i '' 's/\$line-height-relaxed/1.7/g' "$NETFLIX_FILE"
fi

# Fix tinder.component.scss
TINDER_FILE="src/app/features/tinder/tinder.component.scss"
if [ -f "$TINDER_FILE" ]; then
  echo "Fixing tinder.component.scss..."
  sed -i '' '1s/^/@use '\''sass:color'\'';\n/' "$TINDER_FILE"
  sed -i '' 's/vars\.\$primary-color/tokens.\$color-primary/g' "$TINDER_FILE"
  sed -i '' 's/vars\.\$secondary-color/tokens.\$color-secondary/g' "$TINDER_FILE"
fi

echo "All remaining SCSS issues fixed!"