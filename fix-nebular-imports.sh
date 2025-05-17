#!/bin/bash

# Create a copy of the nebular module in the features/shared directory
mkdir -p /Users/oivindlund/date-night-app/client-angular/src/app/features/shared
cp /Users/oivindlund/date-night-app/client-angular/src/app/shared/nebular.module.ts /Users/oivindlund/date-night-app/client-angular/src/app/features/shared/

# Update import paths in all files
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.ts" -exec sed -i '' 's|import { NebularModule } from '\''../../../shared/nebular.module'\''|import { NebularModule } from '\''../shared/nebular.module'\''|g' {} \;

# For files in subdirectories, adjust the path accordingly
find /Users/oivindlund/date-night-app/client-angular/src/app/features/*/components -type f -name "*.ts" -exec sed -i '' 's|import { NebularModule } from '\''../../../shared/nebular.module'\''|import { NebularModule } from '\''../../shared/nebular.module'\''|g' {} \;

# For files in deeper subdirectories
find /Users/oivindlund/date-night-app/client-angular/src/app/features/*/*/components -type f -name "*.ts" -exec sed -i '' 's|import { NebularModule } from '\''../../../shared/nebular.module'\''|import { NebularModule } from '\''../../../shared/nebular.module'\''|g' {} \;

echo "Import paths updated successfully!"