#!/bin/bash

# This script fixes the remaining SCSS issues

echo "Fixing remaining SCSS issues..."

# Fix pager.component.scss
PAGER_FILE="src/app/shared/emerald/components/pager/pager.component.scss"
if [ -f "$PAGER_FILE" ]; then
  echo "Fixing pager.component.scss..."
  sed -i '' 's/\$font-weight-medium/500/g' "$PAGER_FILE"
fi

# Fix avatar.component.scss
AVATAR_FILE="src/app/shared/emerald/components/avatar/avatar.component.scss"
if [ -f "$AVATAR_FILE" ]; then
  echo "Fixing avatar.component.scss..."
  sed -i '' 's/\$font-size-base/1rem/g' "$AVATAR_FILE"
fi

# Fix page-header.component.scss
PAGE_HEADER_FILE="src/app/shared/emerald/components/page-header/page-header.component.scss"
if [ -f "$PAGE_HEADER_FILE" ]; then
  echo "Fixing page-header.component.scss..."
  sed -i '' 's/\$font-size-xl/1.25rem/g' "$PAGE_HEADER_FILE"
fi

# Fix info-panel.component.scss
INFO_PANEL_FILE="src/app/shared/emerald/components/info-panel/info-panel.component.scss"
if [ -f "$INFO_PANEL_FILE" ]; then
  echo "Fixing info-panel.component.scss..."
  sed -i '' 's/emerald\.\$color-warning-700: #b45309;/\$warning-dark: #b45309;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-error-700: #b91c1c;/\$error-dark: #b91c1c;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-info-700: #1d4ed8;/\$info-dark: #1d4ed8;/g' "$INFO_PANEL_FILE"
fi

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/\$secondary-500/#8b5cf6/g' "$FAB_FILE"
fi

# Fix card-grid.component.scss
CARD_GRID_FILE="src/app/shared/emerald/components/card-grid/card-grid.component.scss"
if [ -f "$CARD_GRID_FILE" ]; then
  echo "Fixing card-grid.component.scss..."
  sed -i '' 's/\$font-size-3xl/1.875rem/g' "$CARD_GRID_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  sed -i '' 's/    mg-12;/    margin-bottom: 3rem;/g' "$DESIGN_SYSTEM_DEMO_FILE"
fi

echo "All remaining SCSS issues fixed!"