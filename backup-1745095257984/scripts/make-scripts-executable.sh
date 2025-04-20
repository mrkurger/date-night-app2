#!/bin/bash

# Make all JavaScript files in the scripts directory executable
chmod +x /Users/oivindlund/date-night-app/scripts/*.js
echo "Made scripts in /scripts executable"

# Make all JavaScript files in the server/scripts directory executable
if [ -d "/Users/oivindlund/date-night-app/server/scripts" ]; then
  chmod +x /Users/oivindlund/date-night-app/server/scripts/*.js
  echo "Made scripts in /server/scripts executable"
fi

echo "All scripts are now executable"