#!/bin/bash

# Get the project root directory using the script's location
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Running fix-project.sh from $PROJECT_ROOT"

# 1. Make scripts executable
echo "Making scripts executable..."
chmod +x "$PROJECT_ROOT"/*.sh
chmod +x "$PROJECT_ROOT"/scripts/*.js
if [ -d "$PROJECT_ROOT/server/scripts" ]; then
  chmod +x "$PROJECT_ROOT"/server/scripts/*.js
  echo "Made scripts in /server/scripts executable"
else
  echo "Warning: server/scripts directory not found"
fi

# 2. Fix husky issues
echo "Fixing Husky issues..."
echo 'export HUSKY=0' > "$PROJECT_ROOT/.huskyrc"
chmod +x "$PROJECT_ROOT/.huskyrc"
node "$PROJECT_ROOT/scripts/disable-husky-in-ci.js"

# 3. Check for missing dependencies
echo "Checking for missing dependencies..."
node "$PROJECT_ROOT/scripts/install-missing-deps.js"

# 4. Fix ESLint dependency conflicts
echo "Fixing ESLint dependency conflicts..."
if [ -f "$PROJECT_ROOT/scripts/fix-eslint-dependencies.js" ]; then
  node "$PROJECT_ROOT/scripts/fix-eslint-dependencies.js"
else
  echo "Warning: fix-eslint-dependencies.js not found"
fi

# 5. Fix CSP issues
echo "Fixing CSP issues..."
node "$PROJECT_ROOT/scripts/fix-csp-issues.js"

# 6. Check MongoDB setup
echo "Checking MongoDB setup..."
node "$PROJECT_ROOT/scripts/check-mongodb-permissions.js"
node "$PROJECT_ROOT/scripts/fix-mongodb-issues.js"

# 7. Fix test-related issues
echo "Fixing test-related issues..."
npm run fix-tests

# 8. Fix any remaining issues
echo "Fixing any remaining issues..."
if [ -f "$PROJECT_ROOT/scripts/fix-workflow-issues.js" ]; then
  node "$PROJECT_ROOT/scripts/fix-workflow-issues.js"
else
  echo "Warning: fix-workflow-issues.js not found"
fi

echo "All fixes applied. The project should now be ready to run."