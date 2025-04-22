#!/bin/bash

# This script fixes the final remaining SCSS issues

echo "Fixing final remaining SCSS issues..."

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/\$border-radius-md/0.375rem/g' "$FAB_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  sed -i '' 's/    mg-2;/    margin-bottom: 0.5rem;/g' "$DESIGN_SYSTEM_DEMO_FILE"
fi

echo "All final remaining SCSS issues fixed!"