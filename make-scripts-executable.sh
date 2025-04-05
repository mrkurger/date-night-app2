#!/bin/bash

# Make all shell scripts executable
chmod +x /Users/oivindlund/date-night-app/*.sh
echo "Made all shell scripts in root directory executable"

# Make all JavaScript files in the scripts directory executable
chmod +x /Users/oivindlund/date-night-app/scripts/*.js
echo "Made scripts in /scripts executable"

# Make all JavaScript files in the server/scripts directory executable
chmod +x /Users/oivindlund/date-night-app/server/scripts/*.js
echo "Made scripts in /server/scripts executable"

echo "All scripts are now executable"