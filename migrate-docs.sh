#!/bin/bash

# Documentation Migration Helper Script
#
# This script provides commands to help with the manual migration of Markdown documentation to HTML.
#
# Usage:
#   ./migrate-docs.sh create-folder-docs <folder-path>
#   ./migrate-docs.sh convert-md-to-html <markdown-file> <output-html-file>
#   ./migrate-docs.sh update-checklist <markdown-file> <html-file> <status>
#   ./migrate-docs.sh audit-docs
#   ./migrate-docs.sh analyze
#   ./migrate-docs.sh create-missing-docs
#   ./migrate-docs.sh generate-mapping
#   ./migrate-docs.sh prioritize
#   ./migrate-docs.sh execute-migration <markdown-file> <output-html-file>
#   ./migrate-docs.sh enhanced-migrate <feature>
#   ./migrate-docs.sh batch-migrate [priority]
#   ./migrate-docs.sh browse
#   ./migrate-docs.sh install-dependencies

# Set the root directory
ROOT_DIR="$(pwd)"

# Function to create folder documentation
create_folder_docs() {
  if [ -z "$1" ]; then
    echo "Error: Folder path is required"
    echo "Usage: ./migrate-docs.sh create-folder-docs <folder-path>"
    exit 1
  fi
  
  node "$ROOT_DIR/scripts/create_folder_docs.js" "$1"
}

# Function to convert Markdown to HTML
convert_md_to_html() {
  if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Error: Markdown file and output HTML file are required"
    echo "Usage: ./migrate-docs.sh convert-md-to-html <markdown-file> <output-html-file>"
    exit 1
  fi
  
  node "$ROOT_DIR/scripts/markdown_to_html_converter.js" "$1" "$2" --add-tooltips
  
  # Ask if the user wants to update the checklist
  read -p "Do you want to update the migration checklist? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter status (default: Completed): " status
    status=${status:-Completed}
    node "$ROOT_DIR/scripts/update_migration_checklist.js" "$1" "$2" "$status"
  fi
}

# Function to update the migration checklist
update_checklist() {
  if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Error: Markdown file and HTML file are required"
    echo "Usage: ./migrate-docs.sh update-checklist <markdown-file> <html-file> <status>"
    exit 1
  fi
  
  status=${3:-Completed}
  node "$ROOT_DIR/scripts/update_migration_checklist.js" "$1" "$2" "$status"
}

# Function to audit documentation
audit_docs() {
  echo "Auditing documentation..."
  
  # Count Markdown files in /docs
  md_count=$(find "$ROOT_DIR/docs" -name "*.md" -o -name "*.MD" | wc -l)
  echo "Found $md_count Markdown files in /docs"
  
  # List Markdown files
  echo "Markdown files:"
  find "$ROOT_DIR/docs" -name "*.md" -o -name "*.MD" | sort
  
  # Count HTML files in code folders
  html_count=$(find "$ROOT_DIR/client-angular/src/app" "$ROOT_DIR/server" -name "*.html" | wc -l)
  echo "Found $html_count HTML documentation files in code folders"
  
  # Check for missing documentation files
  echo "Checking for missing documentation files..."
  
  # Check Angular features
  for feature_dir in "$ROOT_DIR/client-angular/src/app/features"/*; do
    if [ -d "$feature_dir" ]; then
      for doc_file in "index.html" "CHANGELOG.html" "AILESSONS.html" "GLOSSARY.html"; do
        if [ ! -f "$feature_dir/$doc_file" ]; then
          echo "Missing $doc_file in $(basename "$feature_dir")"
        fi
      done
    fi
  done
  
  # Check shared components
  for component_dir in "$ROOT_DIR/client-angular/src/app/shared/components"/*; do
    if [ -d "$component_dir" ]; then
      for doc_file in "index.html" "CHANGELOG.html" "AILESSONS.html" "GLOSSARY.html"; do
        if [ ! -f "$component_dir/$doc_file" ]; then
          echo "Missing $doc_file in $(basename "$component_dir")"
        fi
      done
    fi
  done
  
  # Check server components
  for server_dir in "$ROOT_DIR/server/components"/*; do
    if [ -d "$server_dir" ]; then
      for doc_file in "index.html" "CHANGELOG.html" "AILESSONS.html" "GLOSSARY.html"; do
        if [ ! -f "$server_dir/$doc_file" ]; then
          echo "Missing $doc_file in $(basename "$server_dir")"
        fi
      done
    fi
  done
  
  echo "Audit complete"
}

# Function to analyze the codebase
analyze() {
  node "$ROOT_DIR/scripts/doc_migration_analyzer.js" analyze
}

# Function to create missing documentation files
create_missing_docs() {
  node "$ROOT_DIR/scripts/doc_migration_analyzer.js" create-missing-docs
}

# Function to generate mapping
generate_mapping() {
  node "$ROOT_DIR/scripts/doc_migration_analyzer.js" generate-mapping
}

# Function to prioritize files to migrate
prioritize() {
  node "$ROOT_DIR/scripts/doc_migration_analyzer.js" prioritize
}

# Function to execute migration
execute_migration() {
  if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Error: Markdown file and output HTML file are required"
    echo "Usage: ./migrate-docs.sh execute-migration <markdown-file> <output-html-file>"
    exit 1
  fi
  
  node "$ROOT_DIR/scripts/doc_migration_executor.js" "$1" "$2"
}

# Function to run enhanced migration for a feature
enhanced_migrate() {
  if [ -z "$1" ]; then
    echo "Error: Feature name is required"
    echo "Usage: ./migrate-docs.sh enhanced-migrate <feature>"
    exit 1
  fi
  
  node "$ROOT_DIR/scripts/enhanced_doc_migration.js" --feature "$1" --verbose
}

# Function to run batch migration
batch_migrate() {
  priority=${1:-"all"}
  node "$ROOT_DIR/scripts/batch_doc_migration.js" --priority "$priority" --verbose
}

# Function to start the documentation browser
browse_docs() {
  node "$ROOT_DIR/browse-docs.js"
}

# Function to install dependencies
install_dependencies() {
  node "$ROOT_DIR/scripts/install_doc_dependencies.js"
}

# Main script
case "$1" in
  create-folder-docs)
    create_folder_docs "$2"
    ;;
  convert-md-to-html)
    convert_md_to_html "$2" "$3"
    ;;
  update-checklist)
    update_checklist "$2" "$3" "$4"
    ;;
  audit-docs)
    audit_docs
    ;;
  analyze)
    analyze
    ;;
  create-missing-docs)
    create_missing_docs
    ;;
  generate-mapping)
    generate_mapping
    ;;
  prioritize)
    prioritize
    ;;
  execute-migration)
    execute_migration "$2" "$3"
    ;;
  enhanced-migrate)
    enhanced_migrate "$2"
    ;;
  batch-migrate)
    batch_migrate "$2"
    ;;
  browse)
    browse_docs
    ;;
  install-dependencies)
    install_dependencies
    ;;
  *)
    echo "Documentation Migration Helper Script"
    echo
    echo "Usage:"
    echo "  ./migrate-docs.sh create-folder-docs <folder-path>"
    echo "  ./migrate-docs.sh convert-md-to-html <markdown-file> <output-html-file>"
    echo "  ./migrate-docs.sh update-checklist <markdown-file> <html-file> <status>"
    echo "  ./migrate-docs.sh audit-docs"
    echo "  ./migrate-docs.sh analyze"
    echo "  ./migrate-docs.sh create-missing-docs"
    echo "  ./migrate-docs.sh generate-mapping"
    echo "  ./migrate-docs.sh prioritize"
    echo "  ./migrate-docs.sh execute-migration <markdown-file> <output-html-file>"
    echo "  ./migrate-docs.sh enhanced-migrate <feature>"
    echo "  ./migrate-docs.sh batch-migrate [priority]"
    echo "  ./migrate-docs.sh browse"
    echo "  ./migrate-docs.sh install-dependencies"
    exit 1
    ;;
esac

exit 0