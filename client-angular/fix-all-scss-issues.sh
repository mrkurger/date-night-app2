#!/bin/bash

# This script fixes all remaining SCSS issues

echo "Fixing all remaining SCSS issues..."

# Fix spacing-utilities.scss wildcard issues
SPACING_FILE="src/app/core/design/spacing-utilities.scss"
if [ -f "$SPACING_FILE" ]; then
  echo "Fixing spacing-utilities.scss..."
  sed -i '' 's/\$\*\.\$spacing-0/\$spacing-0/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-1/\$spacing-1/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-2/\$spacing-2/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-3/\$spacing-3/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-4/\$spacing-4/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-5/\$spacing-5/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-6/\$spacing-6/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-8/\$spacing-8/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-10/\$spacing-10/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-12/\$spacing-12/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-16/\$spacing-16/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-20/\$spacing-20/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-24/\$spacing-24/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-32/\$spacing-32/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-40/\$spacing-40/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-48/\$spacing-48/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-56/\$spacing-56/g' "$SPACING_FILE"
  sed -i '' 's/\$\*\.\$spacing-64/\$spacing-64/g' "$SPACING_FILE"
fi

# Fix netflix-view.component.scss
NETFLIX_FILE="src/app/features/netflix-view/netflix-view.component.scss"
if [ -f "$NETFLIX_FILE" ]; then
  echo "Fixing netflix-view.component.scss..."
  sed -i '' 's/tokens\.1\.7/1.7/g' "$NETFLIX_FILE"
fi

# Fix tinder.component.scss
TINDER_FILE="src/app/features/tinder/tinder.component.scss"
if [ -f "$TINDER_FILE" ]; then
  echo "Fixing tinder.component.scss..."
  sed -i '' '2d' "$TINDER_FILE" # Remove duplicate sass:color import
fi

# Fix ad-card.component.scss
AD_CARD_FILE="src/app/shared/components/ad-card/ad-card.component.scss"
if [ -f "$AD_CARD_FILE" ]; then
  echo "Fixing ad-card.component.scss..."
  sed -i '' '1s/^/@use '\''..\/..\/..\/core\/design\/design-tokens'\'' as tokens;\n/' "$AD_CARD_FILE"
  sed -i '' 's/\$line-height-normal/1.5/g' "$AD_CARD_FILE"
fi

# Fix info-panel.component.scss
INFO_PANEL_FILE="src/app/shared/emerald/components/info-panel/info-panel.component.scss"
if [ -f "$INFO_PANEL_FILE" ]; then
  echo "Fixing info-panel.component.scss..."
  sed -i '' 's/color\.adjust(emerald\.\$color-primary-dark, \$lightness: -10%): #1d4ed8;/\/\/ Define primary darker color\n\$primary-darker: color\.adjust(emerald\.\$color-primary-dark, \$lightness: -10%);/g' "$INFO_PANEL_FILE"
  sed -i '' 's/color\.adjust(emerald\.\$color-primary, \$lightness: 35%): #dbeafe;/\/\/ Define primary light color\n\$primary-light: color\.adjust(emerald\.\$color-primary, \$lightness: 35%);/g' "$INFO_PANEL_FILE"
fi

# Fix pager.component.scss
PAGER_FILE="src/app/shared/emerald/components/pager/pager.component.scss"
if [ -f "$PAGER_FILE" ]; then
  echo "Fixing pager.component.scss..."
  sed -i '' 's/\$font-size-sm/0.875rem/g' "$PAGER_FILE"
fi

# Fix page-header.component.scss
PAGE_HEADER_FILE="src/app/shared/emerald/components/page-header/page-header.component.scss"
if [ -f "$PAGE_HEADER_FILE" ]; then
  echo "Fixing page-header.component.scss..."
  sed -i '' 's/\$font-size-sm/0.875rem/g' "$PAGE_HEADER_FILE"
fi

# Fix toggle.component.scss
TOGGLE_FILE="src/app/shared/emerald/components/toggle/toggle.component.scss"
if [ -f "$TOGGLE_FILE" ]; then
  echo "Fixing toggle.component.scss..."
  sed -i '' 's/\$font-size-sm/0.875rem/g' "$TOGGLE_FILE"
fi

# Fix card-grid.component.scss
CARD_GRID_FILE="src/app/shared/emerald/components/card-grid/card-grid.component.scss"
if [ -f "$CARD_GRID_FILE" ]; then
  echo "Fixing card-grid.component.scss..."
  sed -i '' 's/\$breakpoint-lg/1024px/g' "$CARD_GRID_FILE"
fi

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/\$transition-normal/0.3s/g' "$FAB_FILE"
  sed -i '' 's/\$transition-ease/ease/g' "$FAB_FILE"
fi

# Fix onboarding.component.scss
ONBOARDING_FILE="src/app/shared/components/onboarding/onboarding.component.scss"
if [ -f "$ONBOARDING_FILE" ]; then
  echo "Fixing onboarding.component.scss..."
  sed -i '' 's/\$neutral-100/white/g' "$ONBOARDING_FILE"
fi

# Fix feature-tour.component.scss
FEATURE_TOUR_FILE="src/app/shared/components/feature-tour/feature-tour.component.scss"
if [ -f "$FEATURE_TOUR_FILE" ]; then
  echo "Fixing feature-tour.component.scss..."
  sed -i '' 's/\$border-radius-lg/0.5rem/g' "$FEATURE_TOUR_FILE"
fi

# Fix contextual-help.component.scss
CONTEXTUAL_HELP_FILE="src/app/shared/components/contextual-help/contextual-help.component.scss"
if [ -f "$CONTEXTUAL_HELP_FILE" ]; then
  echo "Fixing contextual-help.component.scss..."
  sed -i '' 's/\$neutral-100/white/g' "$CONTEXTUAL_HELP_FILE"
fi

# Fix typography mixins in shared components
find src/app/shared/components -name "*.scss" -type f | while read -r file; do
  if grep -q "@include ds\.body-large" "$file"; then
    echo "Fixing body-large mixin in $file..."
    sed -i '' 's/@include ds\.body-large;/@include typography.body-default;/g' "$file"
  fi
done

echo "All SCSS issues fixed!"