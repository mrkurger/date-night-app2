#!/bin/bash

# Path to the file
FILE="client-angular/src/app/features/favorites/favorites-page/favorites-page.component.ts"

# Create a backup
cp "$FILE" "${FILE}.bak"

# Replace all instances of favorite.ad._id with getAdIdAsString(favorite.ad._id)
# but only when it's used as a function parameter
sed -i '' 's/\(([^)]*\)favorite\.ad\._id\([^)]*)\)/\1getAdIdAsString(favorite.ad._id)\2/g' "$FILE"

# Replace all instances where favorite.ad._id is used in includes()
sed -i '' 's/includes(favorite\.ad\._id)/includes(getAdIdAsString(favorite.ad._id))/g' "$FILE"

# Replace this.selectedFavorites assignment
sed -i '' 's/this\.selectedFavorites = this\.favorites\.map(f => f\.ad\._id);/this.selectedFavorites = this.favorites.map(f => getAdIdAsString(f.ad._id));/g' "$FILE"

echo "Replacements completed"
