#!/bin/bash

# Find all TypeScript component files
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.component.ts" | while read file; do
  # Check if the file uses Nebular components
  if grep -q "nb-" "$file" || grep -q "NbModule" "$file" || grep -q "from '@nebular/theme'" "$file"; then
    # Add CUSTOM_ELEMENTS_SCHEMA if not already present
    if ! grep -q "CUSTOM_ELEMENTS_SCHEMA" "$file"; then
      # Add import for CUSTOM_ELEMENTS_SCHEMA
      sed -i '' '/import.*Component.*from.*@angular\/core/s/import { \(.*\) } from '\''@angular\/core'\'';/import { \1, CUSTOM_ELEMENTS_SCHEMA } from '\''@angular\/core'\'';/' "$file"
      
      # Add schemas to @Component decorator
      sed -i '' '/@Component/,/})/ s/standalone: true,/standalone: true,\n  schemas: [CUSTOM_ELEMENTS_SCHEMA],/' "$file"
      
      echo "Added CUSTOM_ELEMENTS_SCHEMA to $file"
    fi
  fi
done

echo "Added CUSTOM_ELEMENTS_SCHEMA to all components using Nebular elements!"