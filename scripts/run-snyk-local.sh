#!/bin/bash

# Run Snyk security scan locally and generate reports
# This script helps test the Snyk integration before the GitHub Action runs

# Check if Snyk CLI is installed
if ! command -v snyk &> /dev/null; then
    echo "Snyk CLI is not installed. Installing..."
    npm install -g snyk
fi

# Check if user is authenticated with Snyk
if ! snyk auth &> /dev/null; then
    echo "Please authenticate with Snyk:"
    snyk auth
fi

echo "Running Snyk security scan..."

# Create output directory
mkdir -p docs/snyk-reports

# Run scans for root project
echo "Scanning root project..."
snyk test --json > snyk-root-results.json || true

# Run scans for server project
echo "Scanning server project..."
cd server && snyk test --json > ../snyk-server-results.json || true
cd ..

# Run scans for client project
echo "Scanning client-angular project..."
cd client-angular && snyk test --json > ../snyk-client-results.json || true
cd ..

# Generate dependency trees
echo "Generating dependency trees..."
npm ls --json > npm-root-deps-tree.json || true
cd server && npm ls --json > ../npm-server-deps-tree.json || true
cd ../client-angular && npm ls --json > ../npm-client-deps-tree.json || true
cd ..

# Get upgrade recommendations
echo "Getting upgrade recommendations..."
snyk test --json --dev --severity-threshold=low --print-deps > snyk-root-upgrade-paths.json || true
cd server && snyk test --json --dev --severity-threshold=low --print-deps > ../snyk-server-upgrade-paths.json || true
cd ../client-angular && snyk test --json --dev --severity-threshold=low --print-deps > ../snyk-client-upgrade-paths.json || true
cd ..

# Generate reports
echo "Generating reports..."
node .github/scripts/generate-snyk-task-list.js

echo "Snyk scan complete. Reports are available in docs/snyk-reports/"
echo "- Summary: docs/snyk-reports/issues-summary.md"
echo "- Detailed issues: docs/snyk-reports/prioritized-issues.md"
echo "- Vulnerable dependencies: docs/snyk-reports/vulnerable-dependencies.md"