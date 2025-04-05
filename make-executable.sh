#!/bin/bash

# Make the fix-project.sh script executable
chmod +x /Users/oivindlund/date-night-app/fix-project.sh
echo "Made fix-project.sh executable"

# Make all JavaScript files in the scripts directory executable
chmod +x /Users/oivindlund/date-night-app/scripts/*.js
echo "Made scripts in /scripts executable"

# Make all JavaScript files in the server/scripts directory executable
chmod +x /Users/oivindlund/date-night-app/server/scripts/*.js
echo "Made scripts in /server/scripts executable"

echo "All scripts are now executable"