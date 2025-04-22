#!/bin/bash

# This script fixes the absolute final final SCSS issues

echo "Fixing absolute final final SCSS issues..."

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/emerald\.\$color-warning-dark/#b45309/g' "$FAB_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  # Fix the extra closing brace
  sed -i '' 's/}}/}/g' "$DESIGN_SYSTEM_DEMO_FILE"
fi

# Fix page-header.component.scss
PAGE_HEADER_FILE="src/app/shared/emerald/components/page-header/page-header.component.scss"
if [ -f "$PAGE_HEADER_FILE" ]; then
  echo "Fixing page-header.component.scss..."
  sed -i '' 's/\$breakpoint-sm/640px/g' "$PAGE_HEADER_FILE"
fi

echo "All absolute final final SCSS issues fixed!"