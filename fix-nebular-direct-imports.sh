#!/bin/bash

# Find all TypeScript files that use Nebular modules directly
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.ts" | xargs grep -l "NbCardModule\|NbButtonModule\|NbInputModule\|NbFormFieldModule\|NbIconModule\|NbSpinnerModule\|NbAlertModule\|NbTooltipModule\|NbLayoutModule\|NbBadgeModule\|NbTagModule\|NbSelectModule" | while read file; do
  # Check if the file imports NebularModule but doesn't import directly from @nebular/theme
  if grep -q "import { NebularModule } from" "$file" && ! grep -q "import {.*} from '@nebular/theme'" "$file"; then
    # Add direct imports from @nebular/theme
    sed -i '' 's|import { NebularModule } from.*|import {\n  NbCardModule,\n  NbButtonModule,\n  NbInputModule,\n  NbFormFieldModule,\n  NbIconModule,\n  NbSpinnerModule,\n  NbAlertModule,\n  NbTooltipModule,\n  NbLayoutModule,\n  NbBadgeModule,\n  NbTagModule,\n  NbSelectModule\n} from '"'@nebular/theme'"';|' "$file"
    echo "Fixed imports in $file"
  fi
done

echo "Direct imports fixed successfully!"