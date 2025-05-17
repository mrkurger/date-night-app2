#!/bin/bash

# Get the project root directory using the script's location
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Make all shell scripts executable
chmod +x "$PROJECT_ROOT"/*.sh
echo "Made all shell scripts in root directory executable"

# Make all JavaScript files in the scripts directory executable
chmod +x "$PROJECT_ROOT"/scripts/*.js
echo "Made scripts in /scripts executable"

# Make all JavaScript files in the server/scripts directory executable
if [ -d "$PROJECT_ROOT/server/scripts" ]; then
  chmod +x "$PROJECT_ROOT"/server/scripts/*.js
  echo "Made scripts in /server/scripts executable"
else
  echo "Warning: server/scripts directory not found"
fi

echo "All scripts are now executable"