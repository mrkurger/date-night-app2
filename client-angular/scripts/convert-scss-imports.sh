#!/usr/bin/env bash
# Script to migrate SCSS @import for design tokens to @use

set -eo pipefail

# Directories to process
DIRS=("src/app" "src/styles")

echo "Migrating SCSS @import to @use..."

for DIR in "${DIRS[@]}"; do
  find "$DIR" -type f -name "*.scss" -print0 | while IFS= read -r -d '' FILE; do
    echo "Processing $FILE"
    cp "$FILE" "$FILE.bak"
    # Replace design-tokens imports
    sed -i '' -E "s#@import ['\"][^'\"]*design-tokens\.scss['\"];#@use 'design-tokens' as dt;#g" "$FILE"
    # Replace any remaining @import of Nebular themes with @use
    sed -i '' -E "s#@import ['\"][^'\"]*@theme/styles/themes['\"];#@use '@nebular/theme/styles/theming' as *;#g" "$FILE"
    # Remove any duplicate or empty import lines
    sed -i '' -E "/^@import .+;/d" "$FILE"
  done
done

echo "SCSS migration complete. Review *.bak files for manual adjustments." 