#!/bin/bash

# This script fixes the absolutely final SCSS issues

echo "Fixing absolutely final SCSS issues..."

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/emerald\.\$color-info-dark/#1d4ed8/g' "$FAB_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  sed -i '' 's/@include ds\.body-la;/@include ds.body-large;/g' "$DESIGN_SYSTEM_DEMO_FILE"
fi

echo "All absolutely final SCSS issues fixed!"