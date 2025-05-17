#!/bin/bash

# Find all TypeScript files with duplicate Nebular module imports
find /Users/oivindlund/date-night-app/client-angular/src/app/features -type f -name "*.ts" | while read file; do
  # Check if the file has duplicate module imports
  if grep -q "NbCardModule.*NbCardModule\|NbButtonModule.*NbButtonModule\|NbInputModule.*NbInputModule\|NbFormFieldModule.*NbFormFieldModule\|NbIconModule.*NbIconModule\|NbSpinnerModule.*NbSpinnerModule\|NbAlertModule.*NbAlertModule\|NbTooltipModule.*NbTooltipModule\|NbLayoutModule.*NbLayoutModule\|NbBadgeModule.*NbBadgeModule\|NbTagModule.*NbTagModule\|NbSelectModule.*NbSelectModule" "$file"; then
    # Create a temporary file with unique module imports
    awk '
    BEGIN { 
      in_imports = 0; 
      imports_array = ""; 
      modules_seen[""] = 1;  # Initialize with empty string
      delete modules_seen[""];  # Remove empty string
    }
    
    # Detect start of imports array
    /imports: \[/ { 
      in_imports = 1; 
      print; 
      next; 
    }
    
    # Detect end of imports array
    /\],/ { 
      if (in_imports) {
        # Process the collected imports
        gsub(/\n/, "", imports_array);  # Remove newlines
        gsub(/,[ \t]*,/, ",", imports_array);  # Remove empty entries
        
        # Split by commas and process each module
        split(imports_array, modules, ",");
        unique_modules = "";
        
        for (i in modules) {
          module = modules[i];
          gsub(/^[ \t]+|[ \t]+$/, "", module);  # Trim whitespace
          
          if (module != "" && !(module in modules_seen)) {
            if (unique_modules != "") unique_modules = unique_modules ",\n    ";
            unique_modules = unique_modules module;
            modules_seen[module] = 1;
          }
        }
        
        if (unique_modules != "") {
          print "    " unique_modules;
        }
        
        in_imports = 0;
        imports_array = "";
        next;
      }
      print;
      next;
    }
    
    # Collect all imports between the array brackets
    {
      if (in_imports) {
        imports_array = imports_array "," $0;
      } else {
        print;
      }
    }
    ' "$file" > "$file.tmp"
    
    # Check if the temporary file is different from the original
    if ! cmp -s "$file" "$file.tmp"; then
      mv "$file.tmp" "$file"
      echo "Fixed duplicate module imports in $file"
    else
      rm "$file.tmp"
    fi
  fi
done

echo "All duplicate module imports fixed successfully!"