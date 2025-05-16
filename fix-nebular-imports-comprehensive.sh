#!/bin/bash

# Step 1: Fix duplicate imports in files that have both NebularModule and direct @nebular/theme imports
echo "Step 1: Fixing duplicate imports..."
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

# Step 2: Fix duplicate module declarations in imports array
echo "Step 2: Fixing duplicate module declarations..."
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.ts" | xargs grep -l "NbCardModule.*NbCardModule\|NbButtonModule.*NbButtonModule\|NbInputModule.*NbInputModule\|NbFormFieldModule.*NbFormFieldModule\|NbIconModule.*NbIconModule\|NbSpinnerModule.*NbSpinnerModule\|NbAlertModule.*NbAlertModule\|NbTooltipModule.*NbTooltipModule\|NbLayoutModule.*NbLayoutModule\|NbBadgeModule.*NbBadgeModule\|NbTagModule.*NbTagModule\|NbSelectModule.*NbSelectModule" | while read file; do
  # Create a temporary file with unique module imports
  awk '
  BEGIN { in_imports = 0; imports_array = ""; }
  /imports: \[/ { in_imports = 1; print; next; }
  /\],/ { 
    if (in_imports) {
      # Process the imports array to remove duplicates
      split(imports_array, modules, ",");
      unique_modules = "";
      for (i in modules) {
        module = modules[i];
        gsub(/^[ \t]+|[ \t]+$/, "", module); # Trim whitespace
        if (module != "" && index(unique_modules, module) == 0) {
          if (unique_modules != "") unique_modules = unique_modules ", ";
          unique_modules = unique_modules module;
        }
      }
      print "    " unique_modules;
      in_imports = 0;
      imports_array = "";
    }
    print;
    next;
  }
  {
    if (in_imports) {
      # Collect all imports
      imports_array = imports_array "," $0;
    } else {
      print;
    }
  }
  ' "$file" > "$file.tmp"
  
  # Replace the original file with the temporary file
  mv "$file.tmp" "$file"
  echo "Fixed duplicate module declarations in $file"
done

# Step 3: Fix import statements for NebularModule
echo "Step 3: Fixing NebularModule import paths..."
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.ts" | xargs grep -l "import { NebularModule } from" | while read file; do
  # Get the relative path to the shared directory
  rel_path=$(dirname "$file" | sed "s|/Users/oivindlund/date-night-app/client-angular/src/app/features/||g" | tr "/" "\n" | wc -l)
  
  # Calculate the correct import path
  if [ "$rel_path" -eq 1 ]; then
    # Direct child of features directory
    sed -i '' 's|import { NebularModule } from.*|import { NebularModule } from "../shared/nebular.module";|g' "$file"
  elif [ "$rel_path" -eq 2 ]; then
    # Two levels deep
    sed -i '' 's|import { NebularModule } from.*|import { NebularModule } from "../../shared/nebular.module";|g' "$file"
  elif [ "$rel_path" -eq 3 ]; then
    # Three levels deep
    sed -i '' 's|import { NebularModule } from.*|import { NebularModule } from "../../../shared/nebular.module";|g' "$file"
  else
    # More than three levels deep
    dots=$(printf '../%.0s' $(seq 1 "$rel_path"))
    sed -i '' "s|import { NebularModule } from.*|import { NebularModule } from \"${dots}shared/nebular.module\";|g" "$file"
  fi
  
  echo "Fixed NebularModule import path in $file"
done

echo "All Nebular import issues fixed successfully!"