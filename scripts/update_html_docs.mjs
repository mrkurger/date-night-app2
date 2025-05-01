#!/usr/bin/env node

/**
 * Update HTML Documentation Script
 * 
 * This script updates the HTML documentation based on changes to CHANGELOG.md and AILESSONS.md files.
 * It's designed to be run after making changes to these files in component directories.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Run the create_decentralized_docs.mjs script with the --update-html flag
console.log('Updating HTML documentation...');
try {
  execSync('node scripts/create_decentralized_docs.mjs --update-html', { stdio: 'inherit' });
  console.log('HTML documentation updated successfully.');
} catch (error) {
  console.error('Error updating HTML documentation:', error);
  process.exit(1);
}
</script>