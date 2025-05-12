#!/usr/bin/env node

/**
 * This script fixes common syntax errors in Angular component files:
 * - Removes erroneous commas in component decorators
 * - Fixes import syntax errors
 * - Fixes component decorator structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client-angular');

// List of files with known issues
const problematicFiles = [
  'src/app/admin/telemetry-dashboard/telemetry-dashboard.component.ts',
  'src/app/shared/emerald/components/page-header/page-header.component.ts',
  'src/shared/components/sort/sort.component.ts',
  'src/app/shared/emerald/components/pager/pager.component.ts',
  'src/app/shared/emerald/components/skeleton-loader/skeleton-loader.component.ts',
  'src/app/shared/emerald/components/toggle/toggle.component.ts',
  'src/app/shared/emerald/tinder-card/tinder-card.component.ts',
];

// Process each file
async function processFiles() {
  console.log('Starting to fix Angular component files...');

  for (const relativeFilePath of problematicFiles) {
    const filePath = path.join(clientDir, relativeFilePath);

    try {
      if (fs.existsSync(filePath)) {
        console.log(`Processing ${relativeFilePath}...`);
        const content = fs.readFileSync(filePath, 'utf8');

        // Apply fixes based on file path
        let fixedContent = content;

        if (relativeFilePath.includes('tinder-card.component.ts')) {
          fixedContent = fixTinderCardComponent(content);
        } else {
          // Generic fix for component decorators
          fixedContent = fixComponentDecorator(content);
        }

        // Write the fixed content back to the file
        if (fixedContent !== content) {
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log(`✅ Fixed ${relativeFilePath}`);
        } else {
          console.log(`⚠️ No changes needed for ${relativeFilePath}`);
        }
      } else {
        console.log(`⚠️ File not found: ${relativeFilePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${relativeFilePath}:`, error);
    }
  }

  console.log('Completed fixing Angular component files.');
}

// Fix component decorator syntax
function fixComponentDecorator(content) {
  // Fix erroneous commas before schemas
  let result = content.replace(/(\],|\},|`,)\s*,\s*(schemas\s*:)/g, '$1\n  $2');

  // Fix standalone component syntax
  result = result.replace(
    /(standalone\s*:\s*true,\s*imports\s*:\s*\[[^\]]*\],)\s*,\s*(schemas\s*:)/g,
    '$1\n  $2',
  );

  return result;
}

// Special fix for tinder-card.component.ts
function fixTinderCardComponent(content) {
  // Fix import statement with erroneous comma
  return content.replace(/(OnDestroy),\s*,\s*(CUSTOM_ELEMENTS_SCHEMA)/g, '$1,\n  $2');
}

// Run the script
processFiles();
