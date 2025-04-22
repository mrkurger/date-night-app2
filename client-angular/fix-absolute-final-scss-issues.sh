#!/bin/bash

# This script fixes the absolute final SCSS issues

echo "Fixing absolute final SCSS issues..."

# Fix page-header.component.scss
PAGE_HEADER_FILE="src/app/shared/emerald/components/page-header/page-header.component.scss"
if [ -f "$PAGE_HEADER_FILE" ]; then
  echo "Fixing page-header.component.scss..."
  sed -i '' 's/\$font-size-lg/1.125rem/g' "$PAGE_HEADER_FILE"
fi

# Fix tinder.component.scss
TINDER_FILE="src/app/features/tinder/tinder.component.scss"
if [ -f "$TINDER_FILE" ]; then
  echo "Fixing tinder.component.scss..."
  sed -i '' 's/vars\.\$danger/#ef4444/g' "$TINDER_FILE"
fi

# Fix avatar.component.scss
AVATAR_FILE="src/app/shared/emerald/components/avatar/avatar.component.scss"
if [ -f "$AVATAR_FILE" ]; then
  echo "Fixing avatar.component.scss..."
  sed -i '' 's/\$font-size-sm/0.875rem/g' "$AVATAR_FILE"
fi

# Fix card-grid.component.scss
CARD_GRID_FILE="src/app/shared/emerald/components/card-grid/card-grid.component.scss"
if [ -f "$CARD_GRID_FILE" ]; then
  echo "Fixing card-grid.component.scss..."
  sed -i '' 's/\$font-weight-medium/500/g' "$CARD_GRID_FILE"
fi

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/\$font-size-2xl/1.5rem/g' "$FAB_FILE"
fi

# Fix pager.component.scss
PAGER_FILE="src/app/shared/emerald/components/pager/pager.component.scss"
if [ -f "$PAGER_FILE" ]; then
  echo "Fixing pager.component.scss..."
  sed -i '' 's/\$font-size-xs/0.75rem/g' "$PAGER_FILE"
fi

# Fix info-panel.component.scss
INFO_PANEL_FILE="src/app/shared/emerald/components/info-panel/info-panel.component.scss"
if [ -f "$INFO_PANEL_FILE" ]; then
  echo "Fixing info-panel.component.scss..."
  sed -i '' 's/emerald\.\$color-warning-100: #fef3c7;/\$warning-light: #fef3c7;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-warning-300: #fcd34d;/\$warning-medium: #fcd34d;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-error-100: #fee2e2;/\$error-light: #fee2e2;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-error-300: #fca5a5;/\$error-medium: #fca5a5;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-info-100: #dbeafe;/\$info-light: #dbeafe;/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-info-300: #93c5fd;/\$info-medium: #93c5fd;/g' "$INFO_PANEL_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  sed -i '' 's/ds\.\$spacing-4/1rem/g' "$DESIGN_SYSTEM_DEMO_FILE"
  
  # Fix the Sass deprecation warning by moving the color and margin-bottom declarations above the nested rule
  sed -i '' '/color: #3b82f6;/d' "$DESIGN_SYSTEM_DEMO_FILE"
  sed -i '' '/margin-bottom: 1rem;/d' "$DESIGN_SYSTEM_DEMO_FILE"
  sed -i '' '/\.design-system-demo {/a\\n  color: #3b82f6;\n  margin-bottom: 1rem;' "$DESIGN_SYSTEM_DEMO_FILE"
fi

echo "All absolute final SCSS issues fixed!"