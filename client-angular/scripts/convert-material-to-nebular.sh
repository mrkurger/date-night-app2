#!/usr/bin/env bash
# Script to migrate Angular Material components and attributes to Nebular equivalents

set -eo pipefail

# Directories to process
DIRS=("src/app")

# Mapping of tags from Angular Material to Nebular
TAG_SRC=(
  "mat-card"
  "mat-card-header"
  "mat-card-content"
  "mat-card-actions"
  "mat-icon"
  "mat-divider"
  "mat-chip-listbox"
  "mat-chip-list"
  "mat-chip"
  "mat-menu"
  "mat-menu-item"
  "mat-slide-toggle"
)
TAG_DEST=(
  "nb-card"
  "nb-card-header"
  "nb-card-body"
  "nb-card-footer"
  "nb-icon"
  "nb-divider"
  "nb-tag-list"
  "nb-tag-list"
  "nb-tag"
  "nb-menu"
  "nb-menu-item"
  "nb-toggle"
)

# Additional attribute replacements
REPLACE_ATTRS=(
  "matMenuTriggerFor nbContextMenu"
  "matTooltip nbTooltip"
)

# Process all HTML and TypeScript template literals
for DIR in "${DIRS[@]}"; do
  find "$DIR" -type f \( -name "*.html" -o -name "*.ts" \) -print0 | while IFS= read -r -d '' FILE; do
    echo "Processing $FILE"
    cp "$FILE" "$FILE.bak"
    # Replace tags
    for i in "${!TAG_SRC[@]}"; do
      MAT="${TAG_SRC[$i]}"
      NEB="${TAG_DEST[$i]}"
      sed -i '' -E "s#<${MAT}([^>]*)>#<${NEB}\1>#g" "$FILE"
      sed -i '' -E "s#</${MAT}>#</${NEB}>#g" "$FILE"
    done
    # Replace attributes
    for PAIR in "${REPLACE_ATTRS[@]}"; do
      MAT=$(echo "$PAIR" | cut -d' ' -f1)
      NB=$(echo "$PAIR" | cut -d' ' -f2)
      sed -i '' -E "s#${MAT}#${NB}#g" "$FILE"
    done
    # Convert <nb-icon>content</nb-icon> to <nb-icon icon="content"></nb-icon>
    sed -i '' -E "s#<nb-icon>([^<]+)</nb-icon>#<nb-icon icon=\"\1\"></nb-icon>#g" "$FILE"
  done
done

echo "Migration complete. Review *.bak files for manual adjustments." 