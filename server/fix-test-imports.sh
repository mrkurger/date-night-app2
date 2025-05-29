#!/bin/bash

# Fix test import statements to use .ts instead of .js for setup and helpers

echo "Fixing test import statements..."

# Find all test files and fix the imports
find tests -name "*.ts" -type f -exec sed -i '' \
  -e "s|from '../../setup\.js'|from '../../setup.ts'|g" \
  -e "s|from '../../helpers\.js'|from '../../helpers.ts'|g" \
  -e "s|from '../setup\.js'|from '../setup.ts'|g" \
  -e "s|from '../helpers\.js'|from '../helpers.ts'|g" \
  {} \;

echo "Fixed test import statements for setup.ts and helpers.ts"

# Count how many files were affected
echo "Files with setup imports:"
find tests -name "*.ts" -type f -exec grep -l "setup\.ts" {} \; | wc -l

echo "Files with helpers imports:"
find tests -name "*.ts" -type f -exec grep -l "helpers\.ts" {} \; | wc -l
