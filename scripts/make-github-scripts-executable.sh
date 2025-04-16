#!/bin/bash

# Make GitHub integration scripts executable
chmod +x scripts/generate-test-report.js
chmod +x scripts/combine-test-reports.js

# Make GitHub workflow scripts executable
if [ -d ".github/scripts" ]; then
  echo "Making GitHub workflow scripts executable..."
  find .github/scripts -type f -name "*.js" -exec chmod +x {} \;
  find .github/scripts -type f -name "*.sh" -exec chmod +x {} \;
fi

# Make Snyk script executable
if [ -f ".github/scripts/generate-snyk-task-list.js" ]; then
  echo "Making Snyk task list generator executable..."
  chmod +x .github/scripts/generate-snyk-task-list.js
fi

echo "GitHub integration and workflow scripts are now executable."