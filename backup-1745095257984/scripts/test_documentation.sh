#!/bin/bash
# ===================================================
# CUSTOMIZABLE SETTINGS IN THIS FILE
# ===================================================
# This file contains settings for the documentation testing script
# 
# COMMON CUSTOMIZATIONS:
# - MAX_BROKEN_LINKS: Maximum number of broken links allowed (default: 0)
# - SCRIPTS_DIR: Directory containing the documentation scripts
# - DOCS_DIR: Directory containing the documentation files
# ===================================================

# Configuration
MAX_BROKEN_LINKS=0
SCRIPTS_DIR="$(dirname "$0")"
DOCS_DIR="$(dirname "$SCRIPTS_DIR")/docs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Print header
echo -e "${YELLOW}=======================================${NC}"
echo -e "${YELLOW}     Documentation Testing Script      ${NC}"
echo -e "${YELLOW}=======================================${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed.${NC}"
    exit 1
fi

# Run the documentation link checker
echo -e "\n${YELLOW}Running documentation link checker...${NC}"
python3 "$SCRIPTS_DIR/check_documentation_links.py"
LINK_CHECK_EXIT_CODE=$?

# Get the number of broken links
if [ -f "$DOCS_DIR/documentation-link-check-report.md" ]; then
    BROKEN_LINKS=$(grep -o "Broken links: [0-9]*" "$DOCS_DIR/documentation-link-check-report.md" | awk '{print $3}')
    echo -e "${YELLOW}Found $BROKEN_LINKS broken links.${NC}"
else
    echo -e "${RED}Error: Documentation link check report not found.${NC}"
    BROKEN_LINKS=999
fi

# Check if the number of broken links is acceptable
if [ "$BROKEN_LINKS" -gt "$MAX_BROKEN_LINKS" ]; then
    echo -e "${RED}Error: Too many broken links. Maximum allowed: $MAX_BROKEN_LINKS, Found: $BROKEN_LINKS${NC}"
    echo -e "${YELLOW}See $DOCS_DIR/documentation-link-check-report.md for details.${NC}"
    echo -e "${YELLOW}Run 'python3 $SCRIPTS_DIR/fix_documentation_links.py' to fix common broken link patterns.${NC}"
    LINK_CHECK_PASS=false
else
    echo -e "${GREEN}Link check passed. Found $BROKEN_LINKS broken links, maximum allowed: $MAX_BROKEN_LINKS${NC}"
    LINK_CHECK_PASS=true
fi

# Check for missing documentation files
echo -e "\n${YELLOW}Checking for missing documentation files...${NC}"
MISSING_FILES=0

# List of required documentation files
REQUIRED_FILES=(
    "README.md"
    "docs/ChangeLog.md"
    "docs/requirements.md"
    "docs/ARCHITECTURE.md"
    "docs/DEPRECATED.md"
    "docs/DUPLICATES.md"
    "docs/documentation-improvements.md"
    "docs/DOCUMENTATION_INDEX.md"
    "docs/DOCUMENTATION_STYLE_GUIDE.md"
)

# Check if each required file exists
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$(dirname "$SCRIPTS_DIR")/$file" ]; then
        echo -e "${RED}Missing required documentation file: $file${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

# Check if any required files are missing
if [ "$MISSING_FILES" -gt 0 ]; then
    echo -e "${RED}Error: $MISSING_FILES required documentation files are missing.${NC}"
    FILE_CHECK_PASS=false
else
    echo -e "${GREEN}All required documentation files are present.${NC}"
    FILE_CHECK_PASS=true
fi

# Check for documentation style guide compliance
echo -e "\n${YELLOW}Checking for documentation style guide compliance...${NC}"
STYLE_VIOLATIONS=0

# Check if each Markdown file has a title (# Title)
echo -e "${YELLOW}Checking for titles in Markdown files...${NC}"
for file in $(find "$(dirname "$SCRIPTS_DIR")" -name "*.md"); do
    if ! grep -q "^# " "$file"; then
        echo -e "${RED}Missing title in $file${NC}"
        STYLE_VIOLATIONS=$((STYLE_VIOLATIONS + 1))
    fi
done

# Check if each Markdown file has a table of contents
echo -e "${YELLOW}Checking for table of contents in Markdown files...${NC}"
for file in $(find "$(dirname "$SCRIPTS_DIR")" -name "*.md"); do
    # Skip small files (less than 50 lines)
    if [ $(wc -l < "$file") -lt 50 ]; then
        continue
    fi
    
    if ! grep -q "^## Table of Contents" "$file" && ! grep -q "^## Contents" "$file"; then
        echo -e "${RED}Missing table of contents in $file${NC}"
        STYLE_VIOLATIONS=$((STYLE_VIOLATIONS + 1))
    fi
done

# Check if the style violations are acceptable
if [ "$STYLE_VIOLATIONS" -gt 0 ]; then
    echo -e "${RED}Error: $STYLE_VIOLATIONS documentation style guide violations found.${NC}"
    echo -e "${YELLOW}See docs/DOCUMENTATION_STYLE_GUIDE.md for guidelines.${NC}"
    STYLE_CHECK_PASS=false
else
    echo -e "${GREEN}Documentation style guide compliance check passed.${NC}"
    STYLE_CHECK_PASS=true
fi

# Print summary
echo -e "\n${YELLOW}=======================================${NC}"
echo -e "${YELLOW}            Test Summary              ${NC}"
echo -e "${YELLOW}=======================================${NC}"
echo -e "Link Check: $([ "$LINK_CHECK_PASS" = true ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo -e "File Check: $([ "$FILE_CHECK_PASS" = true ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo -e "Style Check: $([ "$STYLE_CHECK_PASS" = true ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo -e "${YELLOW}=======================================${NC}"

# Exit with appropriate code
if [ "$LINK_CHECK_PASS" = true ] && [ "$FILE_CHECK_PASS" = true ] && [ "$STYLE_CHECK_PASS" = true ]; then
    echo -e "${GREEN}All documentation tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Documentation tests failed.${NC}"
    exit 1
fi