#!/bin/bash

# This script fixes all remaining SCSS issues

echo "Fixing final SCSS issues..."

# Fix avatar.component.scss
AVATAR_FILE="src/app/shared/emerald/components/avatar/avatar.component.scss"
if [ -f "$AVATAR_FILE" ]; then
  echo "Fixing avatar.component.scss..."
  # Add shadow variables directly in the file
  sed -i '' 's/box-shadow: \$shadow-sm;/box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);/g' "$AVATAR_FILE"
fi

# Fix pager.component.scss
PAGER_FILE="src/app/shared/emerald/components/pager/pager.component.scss"
if [ -f "$PAGER_FILE" ]; then
  echo "Fixing pager.component.scss..."
  sed -i '' 's/border-radius: \$border-radius-md;/border-radius: 0.375rem;/g' "$PAGER_FILE"
fi

# Fix netflix-view.component.scss
NETFLIX_FILE="src/app/features/netflix-view/netflix-view.component.scss"
if [ -f "$NETFLIX_FILE" ]; then
  echo "Fixing netflix-view.component.scss..."
  sed -i '' 's/\$font-size-md/1rem/g' "$NETFLIX_FILE"
fi

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/\$font-size-xl/1.25rem/g' "$FAB_FILE"
fi

# Fix info-panel.component.scss
INFO_PANEL_FILE="src/app/shared/emerald/components/info-panel/info-panel.component.scss"
if [ -f "$INFO_PANEL_FILE" ]; then
  echo "Fixing info-panel.component.scss..."
  sed -i '' 's/emerald\.\$color-success-100: #dcfce7;/\/\/ Success color\n\$success-light: #dcfce7;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-warning-100: #fef9c3;/\/\/ Warning color\n\$warning-light: #fef9c3;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-error-100: #fee2e2;/\/\/ Error color\n\$error-light: #fee2e2;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-info-100: #dbeafe;/\/\/ Info color\n\$info-light: #dbeafe;/g' "$INFO_PANEL_FILE"
fi

# Fix tinder.component.scss
TINDER_FILE="src/app/features/tinder/tinder.component.scss"
if [ -f "$TINDER_FILE" ]; then
  echo "Fixing tinder.component.scss..."
  sed -i '' 's/@use '\''..\/..\/core\/design\/design-tokens'\'' as tokens;/@use '\''..\/..\/core\/design\/emerald-tokens'\'' as emerald;/g' "$TINDER_FILE"
  sed -i '' 's/tokens\.\$color-primary/emerald.\$color-primary/g' "$TINDER_FILE"
  sed -i '' 's/tokens\.\$color-secondary/emerald.\$color-secondary/g' "$TINDER_FILE"
fi

# Fix card-grid.component.scss
CARD_GRID_FILE="src/app/shared/emerald/components/card-grid/card-grid.component.scss"
if [ -f "$CARD_GRID_FILE" ]; then
  echo "Fixing card-grid.component.scss..."
  sed -i '' 's/\$breakpoint-md/768px/g' "$CARD_GRID_FILE"
fi

# Fix ad-card.component.scss
AD_CARD_FILE="src/app/shared/components/ad-card/ad-card.component.scss"
if [ -f "$AD_CARD_FILE" ]; then
  echo "Fixing ad-card.component.scss..."
  # Remove duplicate tokens import
  sed -i '' '2d' "$AD_CARD_FILE"
fi

# Fix page-header.component.scss
PAGE_HEADER_FILE="src/app/shared/emerald/components/page-header/page-header.component.scss"
if [ -f "$PAGE_HEADER_FILE" ]; then
  echo "Fixing page-header.component.scss..."
  sed -i '' 's/\$font-weight-semibold/600/g' "$PAGE_HEADER_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  sed -i '' 's/ds\.\$spacing-8/2rem/g' "$DESIGN_SYSTEM_DEMO_FILE"
fi

# Fix app.component.ts TypeScript errors
APP_COMPONENT_FILE="src/app/app.component.ts"
if [ -f "$APP_COMPONENT_FILE" ]; then
  echo "Fixing app.component.ts..."
  # Fix TypeScript errors by adding type assertion
  sed -i '' 's/this.deferredPrompt.prompt();/(this.deferredPrompt as any).prompt();/g' "$APP_COMPONENT_FILE"
  sed -i '' 's/this.deferredPrompt.userChoice/(this.deferredPrompt as any).userChoice/g' "$APP_COMPONENT_FILE"
fi

echo "All final SCSS issues fixed!"