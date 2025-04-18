#!/bin/bash

# Fix husky issues
echo "Fixing husky issues..."

# Create .huskyrc file to disable husky in CI environments
echo 'export HUSKY=0' > .huskyrc
chmod +x .huskyrc

# Make sure husky is installed
npm install husky --save-dev

# Initialize husky
npx husky init

# Create a pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged
EOF

chmod +x .husky/pre-commit

echo "Husky setup completed successfully!"