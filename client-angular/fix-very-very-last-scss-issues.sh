#!/bin/bash

# This script fixes the very very last SCSS issues

echo "Fixing very very last SCSS issues..."

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/emerald\.\$color-success-dark/#15803d/g' "$FAB_FILE"
fi

# Fix avatar.component.scss
AVATAR_FILE="src/app/shared/emerald/components/avatar/avatar.component.scss"
if [ -f "$AVATAR_FILE" ]; then
  echo "Fixing avatar.component.scss..."
  sed -i '' 's/\$border-radius-md/0.375rem/g' "$AVATAR_FILE"
fi

# Fix card-grid.component.scss
CARD_GRID_FILE="src/app/shared/emerald/components/card-grid/card-grid.component.scss"
if [ -f "$CARD_GRID_FILE" ]; then
  echo "Fixing card-grid.component.scss..."
  sed -i '' 's/\$breakpoint-sm/640px/g' "$CARD_GRID_FILE"
fi

# Fix info-panel.component.scss
INFO_PANEL_FILE="src/app/shared/emerald/components/info-panel/info-panel.component.scss"
if [ -f "$INFO_PANEL_FILE" ]; then
  echo "Fixing info-panel.component.scss..."
  sed -i '' 's/emerald\.\$color-success-100/$success-light/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-success-700/$success-dark/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-warning-100/$warning-light/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-warning-700/$warning-dark/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-error-100/$error-light/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-error-700/$error-dark/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-info-100/$info-light/g' "$INFO_PANEL_FILE"
  sed -i '' 's/emerald\.\$color-info-700/$info-dark/g' "$INFO_PANEL_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  sed -i '' 's/ds\.\$spacing-6/1.5rem/g' "$DESIGN_SYSTEM_DEMO_FILE"
  
  # Fix the margin: 0 auto#3b82f6; issue
  sed -i '' 's/margin: 0 auto#3b82f6;/margin: 0 auto;/g' "$DESIGN_SYSTEM_DEMO_FILE"
  
  # Fix the Sass deprecation warnings by moving the declarations
  sed -i '' '/max-width: 800px;/d' "$DESIGN_SYSTEM_DEMO_FILE"
  sed -i '' '/margin: 0 auto;/d' "$DESIGN_SYSTEM_DEMO_FILE"
  sed -i '' '/&__description {/a\\n    max-width: 800px;\n    margin: 0 auto;' "$DESIGN_SYSTEM_DEMO_FILE"
fi

# Fix page-header.component.scss
PAGE_HEADER_FILE="src/app/shared/emerald/components/page-header/page-header.component.scss"
if [ -f "$PAGE_HEADER_FILE" ]; then
  echo "Fixing page-header.component.scss..."
  sed -i '' 's/\$border-radius-md/0.375rem/g' "$PAGE_HEADER_FILE"
fi

echo "All very very last SCSS issues fixed!"