#!/bin/bash

# Path to the file
FILE="client-angular/src/app/features/favorites/favorites-page/favorites-page.component.ts"

# Create a backup
cp "$FILE" "${FILE}.bak2"

# Replace all instances of getAdIdAsString with this.getAdIdAsString
sed -i '' 's/getAdIdAsString/this.getAdIdAsString/g' "$FILE"

echo "Replacements completed"
