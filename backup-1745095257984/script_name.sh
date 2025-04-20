#!/bin/bash

# === Date Night App Documentation Improvement Script ===
#
# This script automates file operations based on DOCS_IMPROVEMENT_PLAN.md.
# WARNING: Performs potentially destructive actions (git rm).
#          Ensure your work is committed and consider creating a backup branch.
#          Manual content merging, curation, link/TOC updates are required after running.
#
# Run this script from the project root: /Users/oivindlund/date-night-app/

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting Documentation Improvement Script..."
echo "Project Root: $(pwd)"
echo "---------------------------------------------"

# --- Phase 1: Foundational Cleanup & Accuracy ---
echo "Phase 1: Foundational Cleanup & Accuracy"

# 1. Fix Test Report Generation (Rename only)
echo "  1. Renaming test report file..."
if [ -f "downloaded-reports/testing/coverage-summary.md" ]; then
  git mv "downloaded-reports/testing/coverage-summary.md" "downloaded-reports/testing/COVERAGE-SUMMARY.md" || echo "  Warning: Failed to rename coverage-summary.md"
else
  echo "  Skipping: downloaded-reports/testing/coverage-summary.md not found."
fi
echo "     Reminder: Manually verify/update scripts/combine-test-reports.js."

# 2. Update All READMEs (Add placeholder reminder)
echo "  2. Adding placeholders to READMEs (Manual editing required)..."
echo -e "\n\n<!-- TODO: Enhance with project overview, tech stack, links, setup (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> README.md
echo -e "\n\n<!-- TODO: Enhance with detailed setup, build, test, run instructions, env vars (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> client-angular/README.md
echo -e "\n\n<!-- TODO: Enhance with detailed setup, build, test, run instructions, env vars, API docs link (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> server/README.md

# 3. Identify & Archive Outdated Documentation
echo "  3. Archiving outdated documentation..."
mkdir -p docs/outdated

# List of files to archive (based on plan and previous analysis)
outdated_files=(
  "docs/CHANGELOG_REPORTS_MIGRATION.md"
  "docs/Example_UnitStrat.md"
  "docs/UnitTestLessons.md"
  "docs/HTTP_ERROR_HANDLING.md"
  "docs/DEPENDENCY_UPDATE_SUMMARY.md"
  "docs/AILessons-security-fixes.md"
  "docs/AILessons-theme-toggle.md"
  "docs/documentation-improvements.md" # Assuming exists
  "docs/ui-ux-completion-report.md"    # Assuming exists
  "docs/emerald-implementation-report.md" # Assuming exists
)

for file in "${outdated_files[@]}"; do
  if [ -f "$file" ]; then
    echo "     Archiving $file..."
    # Use plain mv first in case git mv fails if file not tracked
    mv "$file" "docs/outdated/" 2>/dev/null || git mv "$file" "docs/outdated/" || echo "     Warning: Failed to move $file"
  else
    echo "     Skipping: $file not found."
  fi
done

# Create README for outdated docs
echo "# Outdated Documentation

This directory contains documentation files that are considered outdated, superseded,
or purely historical. They are kept for reference but should not be considered
current representations of the project.
" > docs/outdated/README.md
echo "     Created docs/outdated/README.md"

# 4. Reframe Historical Docs (Add Preamble)
echo "  4. Adding preambles to historical plan documents..."
PREAMBLE="### HISTORICAL DOCUMENT ###\nThis document describes a plan or state that is no longer current. It is kept for historical reference.\n##########################\n\n"
historical_plans=(
  "docs/ui-ux-implementation-plan.md"
  "docs/ui-ux-roadmap.md"
  "docs/completion-plan-2024.md"
  "docs/migration-completion-plan.md"
  "docs/implementation-plan.md"
  "docs/emerald-implementation-plan.md"
)

for file in "${historical_plans[@]}"; do
  if [ -f "$file" ]; then
    echo "     Adding preamble to $file..."
    # Create temp file, add preamble, append original, replace original
    echo -e "$PREAMBLE$(cat "$file")" > "$file.tmp" && mv "$file.tmp" "$file"
  else
     echo "     Skipping: $file not found."
  fi
done

# 5. Review & Curate AILessons.md (Add reminder)
echo "  5. Preparing AILessons.md (Manual curation required)..."
if [ -f "docs/AILessons.md" ]; then
    echo -e "\n\n<!-- TODO: Manually review and curate this file. Extract stable patterns, archive obsolete sections (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/AILessons.md
else
    echo "     Skipping: docs/AILessons.md not found."
fi

# 6. Verify & Update Core Guides (Add reminder)
echo "  6. Preparing Core Guides (Manual update required)..."
core_guides=(
  "docs/ARCHITECTURE.md"
  "docs/SETUP.md"
  "docs/nodejs-installation-guide.md"
  "docs/specific-version-installation-guide.md"
  "docs/MONGODB_TROUBLESHOOTING.md"
  "docs/ANGULAR_BUILD_OPTIMIZATION.md"
  "docs/CODE_FORMATTING.md"
)
for file in "${core_guides[@]}"; do
  if [ -f "$file" ]; then
    echo -e "\n\n<!-- TODO: Manually review and update content for current state, tech stack (Angular ~19, Node ~22) (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> "$file"
  else
     echo "     Skipping: $file not found."
  fi
done

# 7. Verify/Regenerate Configuration Docs (Add reminder)
echo "  7. Preparing Configuration Docs (Manual script execution/review required)..."
config_files=(
  "docs/CONFIG_INDEX.md"
  "docs/CUSTOMIZATION_GUIDE.md"
)
if [ -f "docs/CONFIG_INDEX.md" ]; then
    echo -e "\n\n<!-- TODO: Manually verify scripts/update_config_index.py and run it. Add CI check. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/CONFIG_INDEX.md
else
    echo "     Skipping: docs/CONFIG_INDEX.md not found."
fi
if [ -f "docs/CUSTOMIZATION_GUIDE.md" ]; then
    echo -e "\n\n<!-- TODO: Manually review process accuracy. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/CUSTOMIZATION_GUIDE.md
else
    echo "     Skipping: docs/CUSTOMIZATION_GUIDE.md not found."
fi

# 8. Review Meta-Docs (Add reminder)
echo "  8. Preparing Meta-Docs (Manual update required)..."
meta_docs=(
  "docs/DEPRECATED.md"
  "docs/DUPLICATES.md"
  "docs/DOCUMENTATION_INDEX.md"
  "docs/DOCUMENTATION_STYLE_GUIDE.md"
)
if [ -f "docs/DEPRECATED.md" ]; then
    echo -e "\n\n<!-- TODO: Manually review timelines, ensure dependency info moved. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/DEPRECATED.md
else
    echo "     Skipping: docs/DEPRECATED.md not found."
fi
if [ -f "docs/DUPLICATES.md" ]; then
    echo -e "\n\n<!-- TODO: Manually update status based on refactoring progress. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/DUPLICATES.md
else
    echo "     Skipping: docs/DUPLICATES.md not found."
fi
if [ -f "docs/DOCUMENTATION_INDEX.md" ]; then
    echo -e "\n\n<!-- TODO: Manually update index after all changes, ensure uppercase filenames. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/DOCUMENTATION_INDEX.md
else
    echo "     Skipping: docs/DOCUMENTATION_INDEX.md not found."
fi
if [ -f "docs/DOCUMENTATION_STYLE_GUIDE.md" ]; then
    echo -e "\n\n<!-- TODO: Manually ensure consistency, add uppercase filename rule. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/DOCUMENTATION_STYLE_GUIDE.md
else
    echo "     Skipping: docs/DOCUMENTATION_STYLE_GUIDE.md not found."
fi

# --- Phase 2: Consolidation & Core Content Creation ---
echo "Phase 2: Consolidation & Core Content Creation"

# 1. Consolidate Overlapping Information (Prepare files, delete sources)
echo "  1. Consolidating overlapping documentation (Manual merging required)..."

# Function to prepare consolidation target
prepare_consolidation() {
  local target="$1"
  shift
  local sources=("$@")
  local target_upper="docs/$(basename "$target" .md | tr '[:lower:]' '[:upper:]').md" # Target will be renamed later

  echo "     Creating $target_upper (placeholder for manual merge)..."
  echo "# $(basename "$target_upper" .md | tr '_' ' ' | sed -e 's/\b\(.\)/\u\1/g') (Manual Merge Required)" > "$target_upper"
  echo "" >> "$target_upper"
  echo "<!-- TODO: Manually merge content from the following source files into this document, then remove this comment. -->" >> "$target_upper"

  for source in "${sources[@]}"; do
    echo "<!-- Source: $source -->" >> "$target_upper"
    if [ -f "$source" ]; then
      echo -e "\n\n## Content from $source\n" >> "$target_upper"
      cat "$source" >> "$target_upper"
      echo "     Deleting source file: $source"
      git rm "$source" || echo "     Warning: Failed to git rm $source"
    else
      echo "     Warning: Source file $source not found for merging into $target_upper."
    fi
  done
}

# Define consolidations
prepare_consolidation "docs/DEPENDENCY_MANAGEMENT.md" "docs/DEPENDENCY_CLEANUP.md" "docs/DEPENDENCY_UPDATES.md"
prepare_consolidation "docs/CI_CD_GUIDE.md" "docs/AI_GITHUB_ACTIONS.md" "docs/GITHUB_INSIGHTS_WORKFLOW.md" "docs/GITHUB_INTEGRATION.md" "docs/GITHUB_SETUP.md" "docs/GITHUB_WORKFLOW_PERMISSIONS.md" "docs/HUSKY_CI_FIX.md"
prepare_consolidation "docs/THEMING_GUIDE.md" "docs/styling-guide.md" # Assumes theming content from CUSTOMIZATION_GUIDE is manually moved
# Delete styling-guide.md if it wasn't handled by prepare_consolidation
if [ -f "docs/styling-guide.md" ]; then git rm "docs/styling-guide.md"; fi

# Specific merges (Error Handling, Testing, Security) - More complex, just delete sources and remind user
echo "     Preparing for manual merge into ERRORHANDLINGTELEMETRY.md..."
if [ -f "docs/HTTP_ERROR_HANDLING_IMPLEMENTATION.md" ]; then
    git rm "docs/HTTP_ERROR_HANDLING_IMPLEMENTATION.md" || echo "     Warning: Failed to git rm docs/HTTP_ERROR_HANDLING_IMPLEMENTATION.md"
    echo -e "\n\n<!-- TODO: Manually merge content from deleted HTTP_ERROR_HANDLING_IMPLEMENTATION.md into this file. -->" >> docs/ErrorHandlingTelemetry.md
fi

echo "     Preparing for manual merge into TESTING_GUIDE.md..."
testing_sources=("docs/UnitStrat.md" "docs/FRONTEND_TESTING_REVIEW.md" "docs/TESTING_IMPROVEMENTS.md")
for src in "${testing_sources[@]}"; do
    if [ -f "$src" ]; then git rm "$src" || echo "     Warning: Failed to git rm $src"; fi
done
if [ -f "docs/TESTING_GUIDE.md" ]; then
    echo -e "\n\n<!-- TODO: Manually merge relevant content from deleted UnitStrat.md, FRONTEND_TESTING_REVIEW.md, TESTING_IMPROVEMENTS.md into this file. -->" >> docs/TESTING_GUIDE.md
fi

echo "     Preparing for manual merge into ANGULAR_TESTING_LESSONS.md..."
if [ -f "docs/emerald-testing-guide.md" ]; then
    git rm "docs/emerald-testing-guide.md" || echo "     Warning: Failed to git rm docs/emerald-testing-guide.md"
    echo -e "\n\n<!-- TODO: Manually merge relevant content from deleted emerald-testing-guide.md into this file. -->" >> docs/ANGULAR_TESTING_LESSONS.md
fi

echo "     Preparing for manual merge into SECURITY_BEST_PRACTICES.md..."
security_sources=("docs/SNYK_WORKFLOW.md" "docs/SECURITY_REMEDIATION_GUIDE.md")
for src in "${security_sources[@]}"; do
    if [ -f "$src" ]; then git rm "$src" || echo "     Warning: Failed to git rm $src"; fi
done
if [ -f "docs/SECURITY_BEST_PRACTICES.md" ]; then
    echo -e "\n\n<!-- TODO: Manually merge relevant content from deleted SNYK_WORKFLOW.md, SECURITY_REMEDIATION_GUIDE.md into this file. -->" >> docs/SECURITY_BEST_PRACTICES.md
fi

echo "     Reminder: Manually prune docs/AILessons.md and add links to consolidated docs."

# 2. Create/Enhance docs/ARCHITECTURE.md (Add reminder)
echo "  2. Preparing ARCHITECTURE.md (Manual enhancement required)..."
if [ -f "docs/ARCHITECTURE.md" ]; then
    echo -e "\n\n<!-- TODO: Manually enhance with structure, tech, flows, patterns, diagrams. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/ARCHITECTURE.md
else
    echo "# ARCHITECTURE (Placeholder)" > docs/ARCHITECTURE.md
    echo "<!-- TODO: Manually add content: structure, tech, flows, patterns, diagrams. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/ARCHITECTURE.md
fi

# 3. Implement API Documentation (Create placeholder)
echo "  3. Creating API Documentation placeholder..."
echo "# API Documentation (Placeholder)" > docs/API_DOCUMENTATION.md
echo "" >> docs/API_DOCUMENTATION.md
echo "<!-- TODO: Implement Swagger/OpenAPI generation and link the specification or UI here. Add access instructions to server/README.md. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/API_DOCUMENTATION.md

# 4. Implement Component Library Documentation (Create placeholder)
echo "  4. Creating Component Library Documentation placeholder..."
echo "# Component Library Documentation (Placeholder)" > docs/COMPONENT_LIBRARY.md
echo "" >> docs/COMPONENT_LIBRARY.md
echo "<!-- TODO: Implement Storybook/Compodoc and link it here. Add run/view instructions to client-angular/README.md. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/COMPONENT_LIBRARY.md

# 5. Generate Database Schema Documentation (Create placeholder)
echo "  5. Creating Database Schema Documentation placeholder..."
echo "# Database Schema Detail (Placeholder)" > docs/DATABASE_SCHEMA_DETAIL.md
echo "" >> docs/DATABASE_SCHEMA_DETAIL.md
echo "<!-- TODO: Generate schema documentation from Mongoose models and add content here. Link from ARCHITECTURE.md. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/DATABASE_SCHEMA_DETAIL.md
if [ -f "docs/ARCHITECTURE.md" ]; then
    echo -e "\nSee [Database Schema Detail](DATABASE_SCHEMA_DETAIL.md) for more details." >> docs/ARCHITECTURE.md
fi

# --- Phase 3: Refinement, Feature Docs & Developer Experience ---
echo "Phase 3: Refinement, Feature Docs & Developer Experience"

# 1. Improve Conciseness (Add reminder)
echo "  1. Reminder: Manually improve conciseness of long documents (AILessons, ErrorHandlingTelemetry, etc.)"

# 2. Create Feature Documentation (Create placeholders)
echo "  2. Creating feature documentation placeholders..."
mkdir -p docs/features
feature_files=(
  "ADS.md" "AUTH.md" "CHAT.md" "FAVORITES.md" "PROFILE.md"
  "REVIEWS.md" "WALLET.md" "TOURING.md" "USER_PREFS.md"
)
for feature in "${feature_files[@]}"; do
  feature_name=$(basename "$feature" .md | tr '_' ' ' | sed -e 's/\b\(.\)/\u\1/g')
  echo "# $feature_name Feature (Placeholder)" > "docs/features/$feature"
  echo "" >> "docs/features/$feature"
  echo "<!-- TODO: Manually document client/server components, services, models, API, data flow. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> "docs/features/$feature"
done

# Create/Update IMPLEMENTATION_SUMMARY.md placeholder
echo "  Creating/Updating IMPLEMENTATION_SUMMARY.md placeholder..."
summary_file="docs/IMPLEMENTATION_SUMMARY.md"
echo "# Implementation Summary (Placeholder)" > "$summary_file"
echo "" >> "$summary_file"
echo "<!-- TODO: Manually add summary and links to detailed feature docs in docs/features/. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> "$summary_file"
echo "" >> "$summary_file"
echo "## Feature Documentation Links:" >> "$summary_file"
for feature in "${feature_files[@]}"; do
    feature_name=$(basename "$feature" .md | tr '_' ' ' | sed -e 's/\b\(.\)/\u\1/g')
    echo "- [$feature_name](features/$feature)" >> "$summary_file"
done


# 3. Update Emerald UI / Theming Documentation (Add reminder)
echo "  3. Preparing Emerald UI/Theming Docs (Manual review/update required)..."
emerald_files=(
    "docs/emerald-components.md"
    "docs/emerald-components-changelog.md"
    "docs/THEMING_GUIDE.md" # Created in Phase 2
)
for file in "${emerald_files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "\n\n<!-- TODO: Manually review/update content against current code. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> "$file"
  else
     # Create placeholder if missing
     placeholder_name=$(basename "$file" .md | tr '_' ' ' | sed -e 's/\b\(.\)/\u\1/g')
     echo "# $placeholder_name (Placeholder)" > "$file"
     echo "<!-- TODO: Manually add content. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> "$file"
     echo "     Created placeholder: $file"
  fi
done

# 4. Create CONTRIBUTING.md (Create placeholder)
echo "  4. Creating CONTRIBUTING.md placeholder..."
echo "# Contributing Guidelines (Placeholder)" > CONTRIBUTING.md
echo "" >> CONTRIBUTING.md
echo "<!-- TODO: Manually add details: code style, branch strategy, commits, PR process, testing. Link CODE_FORMATTING.md, TESTING_GUIDE.md. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> CONTRIBUTING.md

# 5. Create docs/DEPLOYMENT.md (Create placeholder)
echo "  5. Creating DEPLOYMENT.md placeholder..."
echo "# Deployment Guide (Placeholder)" > docs/DEPLOYMENT.md
echo "" >> docs/DEPLOYMENT.md
echo "<!-- TODO: Manually add details: environments, steps, env vars, build commands, platform specifics. (as per DOCS_IMPROVEMENT_PLAN.md) -->" >> docs/DEPLOYMENT.md

# 6. Integrate AILessons.md (Add reminder)
echo "  6. Reminder: Manually ensure AILessons.md is pruned and serves as a meta-log."

# --- Final Step: Rename Files to Uppercase ---
echo "Final Step: Renaming documentation files to UPPERCASE..."

# Rename files in docs/ and its subdirectories (excluding outdated and downloaded-reports)
find docs -mindepth 1 -type f -name '*.md' \
  -not -path 'docs/outdated/*' \
  -not -path 'docs/downloaded-reports/*' \
  -print0 | while IFS= read -r -d $'\0' file; do
  dir=$(dirname "$file")
  base=$(basename "$file" .md)
  # Check if already uppercase (simple check)
  if [[ "$base" =~ [a-z] ]]; then
    new_name="${dir}/$(echo "$base" | tr '[:lower:]' '[:upper:]').md"
    if [ "$file" != "$new_name" ]; then
      echo "  Renaming '$file' to '$new_name'"
      git mv "$file" "$new_name" || echo "  Warning: Failed to rename '$file'"
    fi
  fi
done

# Rename files inside docs/outdated/
find docs/outdated -type f -name '*.md' -print0 | while IFS= read -r -d $'\0' file; do
  dir=$(dirname "$file")
  base=$(basename "$file" .md)
   if [[ "$base" =~ [a-z] ]]; then
    new_name="${dir}/$(echo "$base" | tr '[:lower:]' '[:upper:]').md"
    if [ "$file" != "$new_name" ]; then
      echo "  Renaming '$file' to '$new_name'"
      # Use plain mv as these might not be tracked by git yet if just moved
      mv "$file" "$new_name" || echo "  Warning: Failed to rename '$file' in outdated/"
    fi
  fi
done


# Rename root CONTRIBUTING.md
if [ -f "CONTRIBUTING.md" ]; then
  if [[ "$(basename CONTRIBUTING.md .md)" =~ [a-z] ]]; then
    echo "  Renaming 'CONTRIBUTING.md' to 'CONTRIBUTING.md'"
    git mv "CONTRIBUTING.md" "CONTRIBUTING.md" || echo "  Warning: Failed to rename CONTRIBUTING.md"
  fi
fi

echo "---------------------------------------------"
echo "Script finished."
echo "IMPORTANT: Please review the changes made."
echo "Manual steps required:"
echo "  - Merge content into consolidated files (marked with 'Manual Merge Required')."
echo "  - Edit READMEs and other files with 'TODO' comments."
echo "  - Curate AILESSONS.MD."
echo "  - Run Python scripts for config index if applicable."
echo "  - Update all internal documentation links to point to the new UPPERCASE filenames."
echo "  - Update Table of Contents in all modified files."
echo "  - Stage and commit the changes: git add . && git commit -m 'docs: Execute documentation improvement plan'"
echo "---------------------------------------------"

exit 0

