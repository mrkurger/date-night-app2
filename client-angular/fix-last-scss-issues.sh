#!/bin/bash

# This script fixes the last SCSS issues

echo "Fixing last SCSS issues..."

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/\$secondary-600/#7c3aed/g' "$FAB_FILE"
fi

# Fix card-grid.component.scss
CARD_GRID_FILE="src/app/shared/emerald/components/card-grid/card-grid.component.scss"
if [ -f "$CARD_GRID_FILE" ]; then
  echo "Fixing card-grid.component.scss..."
  sed -i '' 's/\$font-size-lg/1.125rem/g' "$CARD_GRID_FILE"
fi

# Fix pager.component.scss
PAGER_FILE="src/app/shared/emerald/components/pager/pager.component.scss"
if [ -f "$PAGER_FILE" ]; then
  echo "Fixing pager.component.scss..."
  sed -i '' 's/\$breakpoint-sm/640px/g' "$PAGER_FILE"
fi

# Fix page-header.component.scss
PAGE_HEADER_FILE="src/app/shared/emerald/components/page-header/page-header.component.scss"
if [ -f "$PAGE_HEADER_FILE" ]; then
  echo "Fixing page-header.component.scss..."
  sed -i '' 's/\$font-size-base/1rem/g' "$PAGE_HEADER_FILE"
fi

# Fix avatar.component.scss
AVATAR_FILE="src/app/shared/emerald/components/avatar/avatar.component.scss"
if [ -f "$AVATAR_FILE" ]; then
  echo "Fixing avatar.component.scss..."
  sed -i '' 's/box-shadow: \$shadow-xs;/box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);/g' "$AVATAR_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  # Fix the missing closing brace
  sed -i '' '211s/}/}}/' "$DESIGN_SYSTEM_DEMO_FILE"
fi

# Fix info-panel.component.scss
INFO_PANEL_FILE="src/app/shared/emerald/components/info-panel/info-panel.component.scss"
if [ -f "$INFO_PANEL_FILE" ]; then
  echo "Fixing info-panel.component.scss..."
  sed -i '' 's/emerald\.\$color-info-100: #e0f2fe;/\$info-light: #e0f2fe;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-info-300: #7dd3fc;/\$info-medium: #7dd3fc;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-info-700: #0369a1;/\$info-dark: #0369a1;/g' "$INFO_PANEL_FILE"
fi

echo "All last SCSS issues fixed!"