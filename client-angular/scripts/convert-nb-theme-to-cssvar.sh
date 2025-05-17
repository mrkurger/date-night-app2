#!/usr/bin/env bash
# Script to migrate nb-theme SCSS function calls to CSS variable references

set -eo pipefail

# Directories to process
DIRS=("src")

echo "Migrating nb-theme() calls to CSS var references..."

for DIR in "${DIRS[@]}"; do
  find "$DIR" -type f -name "*.scss" -print0 | while IFS= read -r -d '' FILE; do
    echo "Processing $FILE"
    cp "$FILE" "$FILE.bak"
    # Replace nb-theme() calls
    sed -i '' -E "s/nb-theme\(([^)]+)\)/var(--\1)/g" "$FILE"
    # Replace theming.nb-theme() calls
    sed -i '' -E "s/theming\.nb-theme\(([^)]+)\)/var(--\1)/g" "$FILE"
  done
done 