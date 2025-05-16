#!/bin/bash

# Update import paths in all files in the features directory
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.ts" -exec sed -i '' 's|import { NebularModule } from '\''../../../shared/nebular.module'\''|import { NebularModule } from '\''../shared/nebular.module'\''|g' {} \;

# For files in subdirectories (one level deep), adjust the path accordingly
find /Users/oivindlund/date-night-app/client-angular/src/app/features/*/components -type f -name "*.ts" -exec sed -i '' 's|import { NebularModule } from '\''../../../shared/nebular.module'\''|import { NebularModule } from '\''../../shared/nebular.module'\''|g' {} \;

# For files in deeper subdirectories (two levels deep)
find /Users/oivindlund/date-night-app/client-angular/src/app/features/*/*/components -type f -name "*.ts" 2>/dev/null | while read file; do
  sed -i '' 's|import { NebularModule } from '\''../../../shared/nebular.module'\''|import { NebularModule } from '\''../../../shared/nebular.module'\''|g' "$file"
done

# For auth module components
find /Users/oivindlund/date-night-app/client-angular/src/app/features/auth/components -type f -name "*.ts" -exec sed -i '' 's|import { NebularModule } from '\''../../../shared/nebular.module'\''|import { NebularModule } from '\''../../shared/nebular.module'\''|g' {} \;

# For auth module itself
find /Users/oivindlund/date-night-app/client-angular/src/app/features/auth -type f -name "auth.module.ts" -exec sed -i '' 's|import { NebularModule } from '\''../../../shared/nebular.module'\''|import { NebularModule } from '\''../shared/nebular.module'\''|g' {} \;

echo "Import paths updated successfully!"