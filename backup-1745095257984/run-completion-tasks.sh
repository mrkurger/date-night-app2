#!/bin/bash

# Make the scripts executable
chmod +x scripts/populate-accounts.js
chmod +x scripts/complete-ui-tasks.js

# Run the UI/UX completion script
echo "Running UI/UX completion tasks..."
node scripts/complete-ui-tasks.js

echo "All tasks completed!"