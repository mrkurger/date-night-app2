#!/usr/bin/env node

/**
 * Fix Design Tokens Variables Script
 *
 * This script fixes the design-tokens.scss file to properly forward all variables
 * from emerald-tokens.scss to resolve undefined variable errors.
 *
 * Usage: node fix-tokens-variables.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client-angular');
const designTokensPath = path.join(clientDir, 'src/app/core/design/design-tokens.scss');

// Main function
function main() {
  console.log('🔍 Fixing design tokens variables...');

  try {
    // Read the current content
    const content = fs.readFileSync(designTokensPath, 'utf8');

    // Check if the file already has the correct import
    if (content.includes("@forward 'emerald-tokens';")) {
      console.log('✅ design-tokens.scss already has the correct forward statement.');
      return;
    }

    // Replace the @use with @forward to expose all variables
    const updatedContent = content.replace(
      /@use\s+['"]emerald-tokens['"]\s*;/,
      "@use 'emerald-tokens';\n@forward 'emerald-tokens';"
    );

    if (content !== updatedContent) {
      fs.writeFileSync(designTokensPath, updatedContent, 'utf8');
      console.log(
        '✅ Successfully updated design-tokens.scss to forward emerald-tokens variables.'
      );
    } else {
      console.log('⚠️ No changes needed in design-tokens.scss.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
