#!/bin/bash

# Find all TypeScript files that have duplicate imports
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.ts" | xargs grep -l "NebularModule" | while read file; do
  # Remove the NebularModule import if direct imports are already present
  if grep -q "import {.*} from '@nebular/theme'" "$file"; then
    # Remove NebularModule from imports array
    sed -i '' 's/NebularModule,//g' "$file"
    sed -i '' 's/NebularModule//g' "$file"
    # Remove empty imports array items
    sed -i '' 's/,\s*,/,/g' "$file"
    sed -i '' 's/\[\s*,/\[/g' "$file"
    sed -i '' 's/,\s*\]/\]/g' "$file"
    echo "Fixed duplicate imports in $file"
  fi
done

echo "Duplicate imports fixed successfully!"#!/bin/bash

# Find all TypeScript files that have duplicate imports
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.ts" | xargs grep -l "NebularModule" | while read file; do
  # Remove the NebularModule import if direct imports are already present
  if grep -q "import {.*} from '@nebular/theme'" "$file"; then
    # Remove NebularModule from imports array
    sed -i '' 's/NebularModule,//g' "$file"
    sed -i '' 's/NebularModule//g' "$file"
    # Remove empty imports array items
    sed -i '' 's/,\s*,/,/g' "$file"
    sed -i '' 's/\[\s*,/\[/g' "$file"
    sed -i '' 's/,\s*\]/\]/g' "$file"
    echo "Fixed duplicate imports in $file"
  fi
done

echo "Duplicate imports fixed successfully!"