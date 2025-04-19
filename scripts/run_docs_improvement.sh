#!/bin/bash

# Documentation Improvement Script
# This script automates the initial steps of the documentation improvement process.

# Set the root directory
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs"
SCRIPTS_DIR="$ROOT_DIR/scripts"

# Print header
echo "====================================================="
echo "DateNight.io Documentation Improvement Process"
echo "====================================================="
echo

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if required tools are installed
echo "Checking required tools..."
if ! command_exists node; then
  echo "Error: Node.js is required but not installed."
  exit 1
fi

if ! command_exists python3; then
  echo "Warning: Python 3 is required for some steps but not installed."
  PYTHON_AVAILABLE=false
else
  PYTHON_AVAILABLE=true
fi

echo "All required tools are available."
echo

# Create required directories if they don't exist
if [ ! -d "$DOCS_DIR/outdated" ]; then
  echo "Creating outdated directory..."
  mkdir -p "$DOCS_DIR/outdated"
  echo "Created $DOCS_DIR/outdated"
  
  # Create README.md in outdated directory
  cat > "$DOCS_DIR/outdated/README.md" << EOF
# Outdated Documentation

This directory contains documentation that is no longer current but is preserved for historical reference.

Files in this directory:

- Are not actively maintained
- May contain obsolete information
- Are kept for historical context only

Please refer to the main documentation in the parent directory for current information.
EOF
  
  echo "Created $DOCS_DIR/outdated/README.md"
fi

# Create features directory if it doesn't exist
if [ ! -d "$DOCS_DIR/features" ]; then
  echo "Creating features directory..."
  mkdir -p "$DOCS_DIR/features"
  echo "Created $DOCS_DIR/features"
  
  # Create README.md in features directory
  cat > "$DOCS_DIR/features/README.md" << EOF
# Feature Documentation

This directory contains detailed documentation for each major feature of the DateNight.io application.

Each feature document includes:

- Overview and purpose
- Architecture (client and server components)
- API endpoints
- Data flow
- State management
- Key algorithms and logic
- Security considerations
- Testing approach

For a high-level overview of all features, see [IMPLEMENTATION_SUMMARY.MD](/docs/IMPLEMENTATION_SUMMARY.MD).
EOF
  
  echo "Created $DOCS_DIR/features/README.md"
fi

# Run the documentation improvement helper to generate a status report
echo "Generating documentation status report..."
node "$SCRIPTS_DIR/docs_improvement_helper.js" --report
echo "Status report generated at $DOCS_DIR/DOCUMENTATION_STATUS_REPORT.md"
echo

# Update configuration index if Python is available
if $PYTHON_AVAILABLE; then
  echo "Updating configuration index..."
  if [ -f "$SCRIPTS_DIR/update_config_index.py" ]; then
    python3 "$SCRIPTS_DIR/update_config_index.py"
    echo "Configuration index updated."
  else
    echo "Warning: update_config_index.py script not found. Skipping configuration index update."
  fi
  
  echo "Updating customization headers..."
  if [ -f "$SCRIPTS_DIR/update_customization_headers.py" ]; then
    python3 "$SCRIPTS_DIR/update_customization_headers.py"
    echo "Customization headers updated."
  else
    echo "Warning: update_customization_headers.py script not found. Skipping customization headers update."
  fi
  echo
fi

# Generate feature documentation
echo "Generating feature documentation..."
node "$SCRIPTS_DIR/generate_feature_docs.js"
echo

# Perform a dry run of the file renaming
echo "Performing a dry run of documentation file renaming..."
node "$SCRIPTS_DIR/rename_docs_to_uppercase.js" --dry-run
echo

# Ask if the user wants to proceed with the renaming
read -p "Do you want to proceed with renaming the documentation files to UPPERCASE.md format? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Renaming documentation files..."
  node "$SCRIPTS_DIR/rename_docs_to_uppercase.js"
  echo "Documentation files renamed."
else
  echo "Skipping file renaming."
fi

# Print next steps
echo
echo "====================================================="
echo "Next Steps:"
echo "====================================================="
echo "1. Review the documentation status report at $DOCS_DIR/DOCUMENTATION_STATUS_REPORT.md"
echo "2. Follow the Documentation Improvement Action Plan at $DOCS_DIR/DOCUMENTATION_IMPROVEMENT_ACTION_PLAN.md"
echo "3. Use the Documentation Improvement Checklist at $DOCS_DIR/DOCUMENTATION_IMPROVEMENT_CHECKLIST.md to track progress"
echo "4. Complete the manual steps outlined in the action plan"
echo
echo "For more information, see the Documentation Improvement Summary at $DOCS_DIR/DOCUMENTATION_IMPROVEMENT_SUMMARY.md"
echo "====================================================="