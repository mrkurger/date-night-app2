#!/usr/bin/env bash
# Script to migrate files from nested components directory to parent directory
# All paths are hardcoded for simplicity

set -eo pipefail

echo "Starting component migration..."

# Step 1: List all files in the nested directory
echo "Step 1: Listing all files in nested directory..."
if [ ! -d "/Users/oivindlund/date-night-app/client_angular2/components/components" ]; then
  echo "Error: Nested directory does not exist at /Users/oivindlund/date-night-app/client_angular2/components/components!"
  exit 1
fi

FILES=$(find "/Users/oivindlund/date-night-app/client_angular2/components/components" -type f -not -path "*/\.*" | sort)
FILE_COUNT=$(echo "$FILES" | wc -l | xargs)

echo "Found $FILE_COUNT files in nested directory:"
echo "$FILES" | sed "s|/Users/oivindlund/date-night-app/client_angular2/components/components/||"
echo ""

# Step 2: Create migration plan and check for conflicts
echo "Step 2: Creating migration plan and checking for conflicts..."
CONFLICTS=0
CONFLICT_FILES=""

mkdir -p "/Users/oivindlund/date-night-app/client_angular2/components_backup"

for file in $FILES; do
  filename=$(basename "$file")
  if [ -f "/Users/oivindlund/date-night-app/client_angular2/components/$filename" ]; then
    echo "CONFLICT: $filename already exists in parent directory"
    CONFLICTS=$((CONFLICTS + 1))
    CONFLICT_FILES="$CONFLICT_FILES\n$filename"
    # Backup the conflicting file
    cp "/Users/oivindlund/date-night-app/client_angular2/components/$filename" "/Users/oivindlund/date-night-app/client_angular2/components_backup/$filename.original"
  fi
done

if [ $CONFLICTS -gt 0 ]; then
  echo ""
  echo "Found $CONFLICTS conflicts. Conflicting files have been backed up to /Users/oivindlund/date-night-app/client_angular2/components_backup"
  echo -e "Conflicting files:$CONFLICT_FILES"
  echo ""
  read -p "Do you want to proceed with migration and overwrite files? (y/n): " CONFIRM
  if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "Migration aborted."
    exit 1
  fi
fi

# Step 3: Move each file from nested directory to parent directory
echo ""
echo "Step 3: Moving files from nested directory to parent directory..."
MOVED=0
FAILED=0

for file in $FILES; do
  filename=$(basename "$file")
  echo "Moving $filename..."
  
  # Backup the nested file before moving
  cp "$file" "/Users/oivindlund/date-night-app/client_angular2/components_backup/$filename.nested"
  
  if mv "$file" "/Users/oivindlund/date-night-app/client_angular2/components/"; then
    echo "✓ Successfully moved $filename"
    MOVED=$((MOVED + 1))
  else
    echo "✗ Failed to move $filename"
    FAILED=$((FAILED + 1))
  fi
done

# Step 4: Verify that all files were successfully moved
echo ""
echo "Step 4: Verifying migration..."
echo "Files moved: $MOVED/$FILE_COUNT"
if [ $FAILED -gt 0 ]; then
  echo "Files failed: $FAILED"
fi

# Check if any files remain in the nested directory
REMAINING=$(find "/Users/oivindlund/date-night-app/client_angular2/components/components" -type f -not -path "*/\.*" | wc -l | xargs)
if [ $REMAINING -gt 0 ]; then
  echo "Warning: $REMAINING files still remain in the nested directory!"
else
  echo "Verification successful: No files remain in the nested directory."
fi

# Step 5: Clean up the nested directory
echo ""
echo "Step 5: Cleaning up..."
echo "To remove the now-empty nested directory, run the following command:"
echo "rm -rf \"/Users/oivindlund/date-night-app/client_angular2/components/components\""
echo ""
echo "To restore from backup if needed, files are available in: /Users/oivindlund/date-night-app/client_angular2/components_backup"
echo ""
echo "Migration completed!"