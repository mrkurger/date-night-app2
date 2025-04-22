#!/bin/bash

# This script fixes the really final SCSS issues

echo "Fixing really final SCSS issues..."

# Fix floating-action-button.component.scss
FAB_FILE="src/app/shared/emerald/components/floating-action-button/floating-action-button.component.scss"
if [ -f "$FAB_FILE" ]; then
  echo "Fixing floating-action-button.component.scss..."
  sed -i '' 's/box-shadow: \$shadow-xl;/box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);/g' "$FAB_FILE"
fi

# Fix design-system-demo.component.scss
DESIGN_SYSTEM_DEMO_FILE="src/app/features/design-system-demo/design-system-demo.component.scss"
if [ -f "$DESIGN_SYSTEM_DEMO_FILE" ]; then
  echo "Fixing design-system-demo.component.scss..."
  sed -i '' 's/bottom: -ds\.\$spacing-3;/bottom: -0.75rem;/g' "$DESIGN_SYSTEM_DEMO_FILE"
  
  # Fix the Sass deprecation warnings by moving the declarations
  sed -i '' '/margin-bottom: 1.5rem;/d' "$DESIGN_SYSTEM_DEMO_FILE"
  sed -i '' '/position: relative;/d' "$DESIGN_SYSTEM_DEMO_FILE"
  sed -i '' '/&__section-title {/a\\n    margin-bottom: 1.5rem;\n    position: relative;' "$DESIGN_SYSTEM_DEMO_FILE"
fi

echo "All really final SCSS issues fixed!"